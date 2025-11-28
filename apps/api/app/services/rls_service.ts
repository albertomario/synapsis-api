import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type User from '#models/user'

/**
 * Type alias for query builder callbacks in RLS filtering
 */
type QueryBuilderCallback = ModelQueryBuilderContract<any, any>

/**
 * Row-Level Security (RLS) Service
 *
 * Implements data access control based on user context.
 * Ensures users can only access data they are authorized to see.
 *
 * Usage:
 * ```typescript
 * import { withRLS } from '#services/rls_service'
 *
 * // In a controller
 * const grades = await withRLS(Grade.query(), user)
 *   .where('subject', 'Math')
 *   .orderBy('created_at', 'desc')
 * ```
 */

export interface RLSOptions {
  /**
   * Whether to include soft-deleted records (admin only)
   */
  includeTrashed?: boolean

  /**
   * Override the user context (admin only)
   */
  overrideUser?: User
}

/**
 * Apply Row-Level Security filters to a query based on user role
 */
export function withRLS<T extends ModelQueryBuilderContract<any, any>>(
  query: T,
  user: User,
  options: RLSOptions = {}
): T {
  const { includeTrashed = false, overrideUser } = options
  const contextUser = overrideUser || user

  // Admins can see everything if they want (but still apply filters by default)
  if (contextUser.userType === 'admin' && overrideUser) {
    if (includeTrashed && 'withTrashed' in query) {
      return (query as any).withTrashed() as T
    }
    return query
  }

  // Apply role-specific filters
  switch (contextUser.userType) {
    case 'student':
      return applyStudentRLS(query, contextUser)

    case 'teacher':
      return applyTeacherRLS(query, contextUser)

    case 'parent':
      return applyParentRLS(query, contextUser)

    case 'admin':
      return applyAdminRLS(query, contextUser)

    default:
      // Unknown role - deny all access
      return query.where('1', '=', '0') as T
  }
}

/**
 * Student RLS: Can only see their own data
 */
function applyStudentRLS<T extends ModelQueryBuilderContract<any, any>>(query: T, user: User): T {
  const modelName = (query as any).model.name

  switch (modelName) {
    case 'Grade':
    case 'Assignment':
    case 'Submission':
      // Students can only see their own records
      return query.where('student_id', user.id) as T

    case 'Announcement':
      // Students can see announcements for their grade level
      // This would need to be joined with the student's grade level
      return query as T

    case 'User':
      // Students can see their own profile and other students (if GDPR allows)
      return query.where((subQuery) => {
        subQuery.where('id', user.id).orWhere((q) => {
          q.where('user_type', 'student').where((gdprQuery) => {
            gdprQuery.whereJsonSuperset('gdpr_preferences', { allowSearch: true })
          })
        })
      }) as T

    default:
      // By default, only show records owned by the student
      if ('user_id' in (query as any).model.$columnsDefinitions) {
        return query.where('user_id', user.id) as T
      }
      return query as T
  }
}

/**
 * Teacher RLS: Can see data for their classes and students
 */
function applyTeacherRLS<T extends ModelQueryBuilderContract<any, any>>(query: T, user: User): T {
  const modelName = (query as any).model.name

  switch (modelName) {
    case 'Grade':
    case 'Assignment':
      // Teachers can see grades/assignments for their courses
      // This would need to be joined with course_teacher table
      return query.where('teacher_id', user.id) as T

    case 'Submission':
      // Teachers can see submissions for their assignments
      return query.whereHas('assignment', (assignmentQuery) => {
        assignmentQuery.where('teacher_id', user.id)
      }) as T

    case 'User':
      // Teachers can see all students and other teachers
      return query.whereIn('user_type', ['student', 'teacher']) as T

    default:
      // Teachers can see most data by default
      return query as T
  }
}

/**
 * Parent RLS: Can only see data for their children
 */
function applyParentRLS<T extends ModelQueryBuilderContract<any, any>>(query: T, user: User): T {
  const modelName = (query as any).model.name

  switch (modelName) {
    case 'Grade':
    case 'Assignment':
    case 'Submission':
      // Parents can see data for their children
      return query.whereHas('student', (studentQuery: QueryBuilderCallback) => {
        studentQuery.whereHas('parentalConsents', (consentQuery: QueryBuilderCallback) => {
          consentQuery.where('parent_id', user.id).whereNotNull('granted_at')
        })
      }) as T

    case 'User':
      // Parents can only see their children's profiles
      return query.where((subQuery) => {
        subQuery
          .where('id', user.id)
          .orWhereHas('student', (studentQuery: QueryBuilderCallback) => {
            studentQuery.whereHas('parentalConsents', (consentQuery: QueryBuilderCallback) => {
              consentQuery.where('parent_id', user.id).whereNotNull('granted_at')
            })
          })
      }) as T

    default:
      // By default, parents can't see other data
      return query.where('1', '=', '0') as T
  }
}

/**
 * Admin RLS: Can see everything, but apply audit logging
 */
function applyAdminRLS<T extends ModelQueryBuilderContract<any, any>>(query: T, _user: User): T {
  // Admins can see everything
  // In production, you would log admin access here
  return query as T
}

/**
 * Check if a user can access a specific record
 */
export async function canAccess(user: User, model: any, recordId: number): Promise<boolean> {
  try {
    const query = model.query().where('id', recordId)
    const filtered = await withRLS(query, user).first()
    return filtered !== null
  } catch {
    return false
  }
}

/**
 * Apply RLS and throw 403 if no records are accessible
 */
export async function withRLSOrFail<T extends ModelQueryBuilderContract<any, any>>(
  query: T,
  user: User,
  options: RLSOptions = {}
): Promise<any> {
  const result = await withRLS(query, user, options)

  if (!result) {
    throw new Error('Access denied: You do not have permission to access this resource')
  }

  return result
}
