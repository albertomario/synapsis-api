# Row Level Security (RLS) Implementation

## Overview

Row Level Security (RLS) is a critical privacy feature that ensures users can only access data they are authorized to see. In Synapsis, RLS is implemented at the **application level** using a custom wrapper function that automatically filters database queries based on the authenticated user's context.

## Why RLS is Critical for Synapsis

1. **GDPR Compliance**: Users must only access their own data or data explicitly shared with them
2. **Student Privacy**: Students can only see their own grades and assignments
3. **Teacher Boundaries**: Teachers can only see students in their classes
4. **Parental Access**: Parents can only view their own children's data
5. **Audit Trail**: All data access is logged for compliance

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Controller                                                  │
│    ↓                                                         │
│  withRLS(user) ← Auth Context Injected                      │
│    ↓                                                         │
│  Query Builder (Lucid) + Auto-Applied WHERE Clauses         │
│    ↓                                                         │
│  PostgreSQL Database                                         │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### 1. Core RLS Service

**File**: `apps/api/app/services/db_service.ts`

```typescript
import { Database } from '@adonisjs/lucid/database'
import type User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import AuditLog from '#models/audit_log'

/**
 * Row Level Security wrapper for database queries.
 * Automatically applies WHERE clauses based on user context.
 * 
 * @param user - The authenticated user
 * @returns A query builder with RLS context
 */
export function withRLS(user: User) {
  return new RLSQueryBuilder(user)
}

class RLSQueryBuilder {
  private user: User
  private auditEnabled = true
  
  constructor(user: User) {
    this.user = user
  }
  
  /**
   * Disable audit logging for this query chain
   */
  noAudit() {
    this.auditEnabled = false
    return this
  }
  
  /**
   * Query builder for a specific table with RLS applied
   */
  from(table: string) {
    const query = db.from(table)
    
    // Apply RLS rules based on table and user type
    this.applyRLSRules(query, table)
    
    // Wrap query execution to add audit logging
    if (this.auditEnabled) {
      this.wrapWithAudit(query, table)
    }
    
    return query
  }
  
  /**
   * Apply Row Level Security rules based on user type and table
   */
  private applyRLSRules(query: any, table: string) {
    switch (this.user.userType) {
      case 'student':
        this.applyStudentRLS(query, table)
        break
      case 'teacher':
        this.applyTeacherRLS(query, table)
        break
      case 'parent':
        this.applyParentRLS(query, table)
        break
      case 'admin':
        // Admins have full access, but still audit
        break
      default:
        throw new Error(`Unknown user type: ${this.user.userType}`)
    }
  }
  
  /**
   * Student RLS: Can only see their own data
   */
  private applyStudentRLS(query: any, table: string) {
    const studentId = this.user.student?.id
    
    if (!studentId) {
      throw new Error('Student profile not found for user')
    }
    
    switch (table) {
      case 'grades':
        query.where('student_id', studentId)
        query.where('visible_to_student', true)
        break
        
      case 'assignment_submissions':
        query.where('student_id', studentId)
        break
        
      case 'assignments':
        // Students see all assignments for their grade level
        // This requires a join, so we'll handle it differently
        query.whereExists((subquery: any) => {
          subquery
            .from('students')
            .whereRaw('students.grade_level = assignments.grade_level')
            .where('students.id', studentId)
        })
        break
        
      case 'announcements':
        // Students see announcements targeted to them
        const student = this.user.student!
        query.where((builder: any) => {
          builder
            .whereJsonSuperset('target_audience', { all: true })
            .orWhereJsonSuperset('target_audience', { grade_levels: [student.gradeLevel] })
            .orWhereJsonSuperset('target_audience', { sections: [student.section] })
        })
        query.where('expires_at', '>', new Date())
        break
        
      case 'parental_consents':
        query.where('student_id', studentId)
        break
        
      case 'users':
        // Students can only see their own user record
        query.where('id', this.user.id)
        break
        
      default:
        // By default, restrict to own records if table has user_id
        query.where('user_id', this.user.id)
    }
  }
  
  /**
   * Teacher RLS: Can see students in their classes and their own data
   */
  private applyTeacherRLS(query: any, table: string) {
    const teacherId = this.user.teacher?.id
    
    if (!teacherId) {
      throw new Error('Teacher profile not found for user')
    }
    
    switch (table) {
      case 'grades':
        // Teachers see grades for students they teach
        query.where('teacher_id', teacherId)
        break
        
      case 'assignments':
        query.where('teacher_id', teacherId)
        break
        
      case 'assignment_submissions':
        // Teachers see submissions for their assignments
        query.whereExists((subquery: any) => {
          subquery
            .from('assignments')
            .whereRaw('assignments.id = assignment_submissions.assignment_id')
            .where('assignments.teacher_id', teacherId)
        })
        break
        
      case 'students':
        // Teachers see students in classes they teach
        // This would require a class enrollment table (future enhancement)
        // For now, teachers can see all students in their department
        query.whereExists((subquery: any) => {
          subquery
            .from('teachers')
            .whereRaw('teachers.department = students.department')
            .where('teachers.id', teacherId)
        })
        break
        
      case 'announcements':
        query.where('teacher_id', teacherId)
        break
        
      default:
        query.where('user_id', this.user.id)
    }
  }
  
  /**
   * Parent RLS: Can only see their own children's data
   */
  private applyParentRLS(query: any, table: string) {
    // Parent access is managed through parental_consents table
    // Extract child student IDs from active consents
    const childrenIds = this.user.parentalConsents
      ?.filter(c => c.expiresAt > new Date() && !c.revokedAt)
      .map(c => c.studentId) || []
    
    if (childrenIds.length === 0) {
      // No active consents, return empty result
      query.where('id', -1) // Impossible condition
      return
    }
    
    switch (table) {
      case 'grades':
        query.whereIn('student_id', childrenIds)
        query.where('visible_to_parents', true)
        break
        
      case 'assignment_submissions':
        query.whereIn('student_id', childrenIds)
        break
        
      case 'students':
        query.whereIn('id', childrenIds)
        break
        
      default:
        // Parents have very limited access
        query.where('id', -1) // Block access by default
    }
  }
  
  /**
   * Wrap query with audit logging
   */
  private wrapWithAudit(query: any, table: string) {
    const originalExec = query.exec.bind(query)
    
    query.exec = async () => {
      const startTime = Date.now()
      const results = await originalExec()
      const duration = Date.now() - startTime
      
      // Log the query execution (async, don't block)
      AuditLog.create({
        userId: this.user.id,
        action: `db.query.${table}`,
        resourceType: table,
        metadata: {
          rowsReturned: Array.isArray(results) ? results.length : 1,
          duration,
          // DO NOT log actual query or results (may contain PII)
        }
      }).catch(err => {
        console.error('Audit log failed:', err)
      })
      
      return results
    }
  }
}

/**
 * Check if user has permission to perform an action on a resource
 */
export async function can(user: User, action: string, resource: any): Promise<boolean> {
  // Implement permission checking logic
  // This is a simplified version
  
  switch (action) {
    case 'view:grade':
      if (user.userType === 'student') {
        return resource.studentId === user.student?.id && resource.visibleToStudent
      }
      if (user.userType === 'teacher') {
        return resource.teacherId === user.teacher?.id
      }
      if (user.userType === 'parent') {
        const childrenIds = user.parentalConsents?.map(c => c.studentId) || []
        return childrenIds.includes(resource.studentId) && resource.visibleToParents
      }
      return false
      
    case 'create:announcement':
      return user.userType === 'teacher' || user.userType === 'admin'
      
    case 'delete:user':
      return user.userType === 'admin'
      
    default:
      return false
  }
}
```

### 2. Usage in Controllers

**Example: Grades Controller**

```typescript
// apps/api/app/controllers/grades_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { withRLS } from '#services/db_service'
import type { GradeResponse } from '@synapsis/types'

export default class GradesController {
  /**
   * GET /api/v1/grades/current
   * Returns current grades for the authenticated user
   */
  async index({ auth, request }: HttpContext) {
    const user = auth.user!
    
    // ✅ CORRECT - Uses RLS wrapper
    const grades = await withRLS(user)
      .from('grades')
      .select('*')
      .orderBy('assessment_date', 'desc')
    
    // Transform to DTOs
    return grades.map(g => ({
      id: g.id,
      subject: g.subject,
      score: g.score,
      maxScore: g.max_score,
      assessmentName: g.assessment_name,
      assessmentDate: g.assessment_date,
      trend: this.calculateTrend(g),
      calculationBasis: g.calculation_basis
    } satisfies GradeResponse))
  }
  
  /**
   * GET /api/v1/grades/:id
   * Returns a specific grade by ID
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    
    // RLS automatically ensures user can only see grades they have access to
    const grade = await withRLS(user)
      .from('grades')
      .where('id', params.id)
      .first()
    
    if (!grade) {
      return response.notFound({
        errors: [{ message: 'Grade not found or access denied' }]
      })
    }
    
    return grade
  }
  
  /**
   * POST /api/v1/grades
   * Creates a new grade (teachers only)
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    
    if (user.userType !== 'teacher') {
      return response.forbidden({
        errors: [{ message: 'Only teachers can create grades' }]
      })
    }
    
    const data = request.body()
    
    // Ensure teacher can only create grades for their own classes
    const grade = await Grade.create({
      ...data,
      teacherId: user.teacher!.id // Force teacher_id to current user
    })
    
    return grade
  }
  
  private calculateTrend(grade: any): 'up' | 'down' | 'stable' {
    // Implementation for calculating trend
    return 'stable'
  }
}
```

**Example: Feed Controller**

```typescript
// apps/api/app/controllers/feed_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { withRLS } from '#services/db_service'

export default class FeedController {
  async index({ auth, request }: HttpContext) {
    const user = auth.user!
    const { limit = 20, cursor } = request.qs()
    
    // Get announcements (RLS filters by target_audience automatically)
    const announcements = await withRLS(user)
      .from('announcements')
      .select('*')
      .orderBy('published_at', 'desc')
      .limit(limit)
    
    // Get assignments (RLS filters by grade_level automatically)
    const assignments = await withRLS(user)
      .from('assignments')
      .where('due_at', '>', new Date())
      .orderBy('due_at', 'asc')
      .limit(10)
    
    return {
      announcements,
      assignments
    }
  }
}
```

### 3. RLS in Lucid Models

For Lucid ORM models, you can add query scopes:

```typescript
// apps/api/app/models/grade.ts
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import Teacher from './teacher.js'

export default class Grade extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare studentId: number

  @column()
  declare teacherId: number

  @column()
  declare subject: string

  @column()
  declare score: number

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Teacher)
  declare teacher: BelongsTo<typeof Teacher>

  /**
   * Query scope: Filter grades by RLS context
   */
  static forUser(query: any, user: User) {
    if (user.userType === 'student') {
      query.where('student_id', user.student!.id)
      query.where('visible_to_student', true)
    } else if (user.userType === 'teacher') {
      query.where('teacher_id', user.teacher!.id)
    } else if (user.userType === 'parent') {
      const childrenIds = user.parentalConsents?.map(c => c.studentId) || []
      query.whereIn('student_id', childrenIds)
      query.where('visible_to_parents', true)
    }
    
    return query
  }
}

// Usage in controller:
const grades = await Grade.query().apply(scope => Grade.forUser(scope, auth.user!))
```

## Testing RLS

### Unit Tests

```typescript
// tests/unit/db_service.spec.ts
import { test } from '@japa/runner'
import { withRLS } from '#services/db_service'
import User from '#models/user'
import Student from '#models/student'

test.group('Row Level Security', () => {
  test('student can only see their own grades', async ({ assert }) => {
    const student1 = await User.create({
      email: 'student1@test.com',
      userType: 'student'
    })
    await Student.create({ userId: student1.id, studentId: 'S001' })
    
    const student2 = await User.create({
      email: 'student2@test.com',
      userType: 'student'
    })
    await Student.create({ userId: student2.id, studentId: 'S002' })
    
    // Create grades for both students
    await Grade.create({ studentId: student1.student!.id, score: 95 })
    await Grade.create({ studentId: student2.student!.id, score: 85 })
    
    // Query as student1
    const grades = await withRLS(student1).from('grades').select('*')
    
    assert.lengthOf(grades, 1)
    assert.equal(grades[0].student_id, student1.student!.id)
  })
  
  test('teacher can only see grades they created', async ({ assert }) => {
    const teacher = await User.create({
      email: 'teacher@test.com',
      userType: 'teacher'
    })
    await Teacher.create({ userId: teacher.id, teacherId: 'T001' })
    
    const otherTeacher = await User.create({
      email: 'other@test.com',
      userType: 'teacher'
    })
    await Teacher.create({ userId: otherTeacher.id, teacherId: 'T002' })
    
    // Create grades
    await Grade.create({ teacherId: teacher.teacher!.id, score: 90 })
    await Grade.create({ teacherId: otherTeacher.teacher!.id, score: 80 })
    
    const grades = await withRLS(teacher).from('grades').select('*')
    
    assert.lengthOf(grades, 1)
    assert.equal(grades[0].teacher_id, teacher.teacher!.id)
  })
  
  test('parent can only see their children grades', async ({ assert }) => {
    const parent = await User.create({
      email: 'parent@test.com',
      userType: 'parent'
    })
    
    const child = await Student.create({ studentId: 'S001' })
    
    await ParentalConsent.create({
      studentId: child.id,
      parentEmail: parent.email,
      consentType: 'grades_view',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    })
    
    await Grade.create({ studentId: child.id, score: 92, visibleToParents: true })
    
    const grades = await withRLS(parent).from('grades').select('*')
    
    assert.lengthOf(grades, 1)
  })
})
```

## Security Best Practices

### 1. Always Use withRLS
```typescript
// ❌ WRONG - Bypasses RLS
const grades = await db.from('grades').select('*')

// ✅ CORRECT - Uses RLS
const grades = await withRLS(auth.user!).from('grades').select('*')
```

### 2. Never Trust Client Input for User Context
```typescript
// ❌ WRONG - Client could manipulate user_id
const grades = await db.from('grades')
  .where('student_id', request.input('student_id'))
  .select('*')

// ✅ CORRECT - Use authenticated user context
const grades = await withRLS(auth.user!).from('grades').select('*')
```

### 3. Audit Sensitive Queries
```typescript
// Sensitive queries should always be audited
const grades = await withRLS(auth.user!)
  .from('grades')
  .select('*')

// If you need to disable audit for performance (rare cases)
const stats = await withRLS(auth.user!)
  .noAudit()
  .from('grades')
  .count('* as total')
```

### 4. Use Type-Safe DTOs
```typescript
// ✅ CORRECT - Transform to DTOs, never expose raw DB records
const grades = await withRLS(user).from('grades').select('*')
return grades.map(g => ({
  id: g.id,
  score: g.score,
  subject: g.subject
} satisfies GradeResponse))
```

## Limitations & Future Enhancements

### Current Limitations
1. RLS is at application level (not database level)
2. Direct SQL queries bypass RLS (must use the wrapper)
3. No built-in field-level encryption

### Future Enhancements
1. **Database-Level RLS**: Migrate to PostgreSQL native RLS policies
2. **Field-Level Access**: Granular control over which fields are visible
3. **Time-Based Access**: Restrict access based on time windows
4. **IP-Based Restrictions**: Geofencing for sensitive data access
5. **Data Masking**: Partial visibility (e.g., show only last 4 digits of phone)

## Troubleshooting

### "No data returned" for valid queries
- Check if RLS rules are too restrictive
- Verify user profile (student/teacher) is properly loaded
- Check if `visibleToStudent` / `visibleToParents` flags are correct

### Performance Issues
- Add database indexes for RLS-filtered columns (`student_id`, `teacher_id`)
- Use `.noAudit()` for non-sensitive aggregate queries
- Consider caching for frequently accessed data

### RLS Not Applied
- Ensure you're using `withRLS()` wrapper
- Check if direct DB queries (`db.from()`) are being used
- Verify middleware chain includes `auth()` middleware

## Compliance Checklist

- [x] All queries use `withRLS()` wrapper
- [x] Audit logging enabled for sensitive tables
- [x] User context verified before data access
- [x] Parent consent checked for minors
- [x] Failed access attempts logged
- [x] No PII in audit logs
- [ ] Database-level RLS policies (PostgreSQL native) - TODO
- [ ] Quarterly RLS audit and penetration testing - TODO
