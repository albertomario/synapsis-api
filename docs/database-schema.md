# Database Schema Documentation

## Overview

Snap SIS uses **PostgreSQL 16** with **Lucid ORM** (AdonisJS v6). All dates are stored in UTC and converted to local EU timezones on the frontend. The schema is designed with GDPR compliance as a primary concern, including Row Level Security (RLS) and audit logging.

## Connection Configuration

```typescript
// config/database.ts
{
  client: 'pg',
  connection: {
    host: env.get('DB_HOST'),      // Default: localhost
    port: env.get('DB_PORT'),       // Default: 5432
    user: env.get('DB_USER'),       // Default: root
    password: env.get('DB_PASSWORD'), // Default: root
    database: env.get('DB_DATABASE')  // Default: app
  }
}
```

## Core Tables

### 1. `users`
The central authentication table supporting multiple user types (students, teachers, parents, admins).

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  handle VARCHAR(50) UNIQUE NOT NULL, -- e.g., @alex_z
  user_type ENUM('student', 'teacher', 'parent', 'admin') NOT NULL,
  date_of_birth DATE NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  timezone VARCHAR(50) DEFAULT 'Europe/Brussels',
  locale VARCHAR(10) DEFAULT 'en-EU',
  
  -- GDPR Compliance
  consent_given_at TIMESTAMPTZ,
  data_processing_consent BOOLEAN DEFAULT FALSE,
  gdpr_preferences JSONB DEFAULT '{
    "showGrades": true,
    "allowSearch": true,
    "shareWithParents": true,
    "marketingEmails": false
  }',
  scheduled_deletion_at TIMESTAMPTZ, -- "Forget Me Upon Graduation"
  
  -- Security
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft deletes
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_handle ON users(handle);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_scheduled_deletion ON users(scheduled_deletion_at) WHERE scheduled_deletion_at IS NOT NULL;
```

**Lucid Model**: `app/models/user.ts`

### 2. `students`
Extended profile for student-specific data.

```sql
CREATE TABLE students (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id VARCHAR(20) UNIQUE NOT NULL, -- School-issued ID
  enrollment_date DATE NOT NULL,
  graduation_date DATE,
  grade_level INTEGER NOT NULL, -- 1-12
  section VARCHAR(10), -- e.g., "A", "B"
  
  -- Academic Status
  academic_status ENUM('active', 'suspended', 'graduated', 'expelled') DEFAULT 'active',
  
  -- Privacy (under 16 requires parental consent)
  requires_parental_consent BOOLEAN GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, (SELECT date_of_birth FROM users WHERE id = user_id))) < 16
  ) STORED,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_grade_level ON students(grade_level);
CREATE INDEX idx_students_academic_status ON students(academic_status);
```

**Lucid Model**: `app/models/student.ts`

### 3. `teachers`
Extended profile for teaching staff.

```sql
CREATE TABLE teachers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id VARCHAR(20) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL, -- e.g., "Mathematics", "Science"
  hire_date DATE NOT NULL,
  bio TEXT,
  office_location VARCHAR(100),
  office_hours JSONB, -- {"monday": "14:00-16:00", "wednesday": "10:00-12:00"}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_department ON teachers(department);
```

**Lucid Model**: `app/models/teacher.ts`

### 4. `parental_consents`
Tracks parental consent for minors (<16 years old).

```sql
CREATE TABLE parental_consents (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_email VARCHAR(255) NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  consent_token VARCHAR(64) UNIQUE NOT NULL, -- Used in X-Parent-Consent-Token header
  consent_type ENUM('general', 'grades_view', 'data_export', 'external_links') NOT NULL,
  
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- Typically 1 year from granted_at
  revoked_at TIMESTAMPTZ,
  
  -- Audit trail
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parental_consents_student_id ON parental_consents(student_id);
CREATE INDEX idx_parental_consents_token ON parental_consents(consent_token);
CREATE INDEX idx_parental_consents_expires ON parental_consents(expires_at);
```

**Lucid Model**: `app/models/parental_consent.ts`

### 5. `access_tokens`
API authentication tokens (AdonisJS Auth).

```sql
CREATE TABLE access_tokens (
  id BIGSERIAL PRIMARY KEY,
  tokenable_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'auth_token',
  name VARCHAR(255), -- Device/client name
  hash VARCHAR(255) NOT NULL,
  abilities TEXT NOT NULL DEFAULT '["*"]', -- JSON string, NOT JSONB (AdonisJS handles serialization)
  
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_access_tokens_tokenable_id ON access_tokens(tokenable_id);
CREATE INDEX idx_access_tokens_hash ON access_tokens(hash);
CREATE INDEX idx_access_tokens_expires ON access_tokens(expires_at);
```

**Managed by**: `@adonisjs/auth` package

**Important**: The `abilities` column MUST be TEXT, not JSON/JSONB. The `DbAccessTokensProvider` handles JSON serialization internally. Using JSON/JSONB causes parse errors because PostgreSQL interferes with the provider's serialization logic.

### 6. `grades`
Academic performance records.

```sql
CREATE TABLE grades (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id BIGINT NOT NULL REFERENCES teachers(id) ON DELETE SET NULL,
  subject VARCHAR(100) NOT NULL, -- e.g., "Mathematics", "Physics"
  
  -- Grade Details
  grade_type ENUM('exam', 'homework', 'project', 'participation') NOT NULL,
  score DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00
  max_score DECIMAL(5,2) DEFAULT 100.00,
  weight DECIMAL(3,2) DEFAULT 1.00, -- For weighted averages
  
  -- Metadata
  assessment_name VARCHAR(255), -- e.g., "Midterm Exam", "Chapter 5 Quiz"
  assessment_date DATE NOT NULL,
  notes TEXT,
  
  -- Explainability (GDPR Right to Explanation)
  calculation_basis TEXT, -- "Weighted average: Exams 60%, Homework 40%"
  
  -- Privacy
  visible_to_student BOOLEAN DEFAULT TRUE,
  visible_to_parents BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_teacher_id ON grades(teacher_id);
CREATE INDEX idx_grades_subject ON grades(subject);
CREATE INDEX idx_grades_assessment_date ON grades(assessment_date);
```

**Lucid Model**: `app/models/grade.ts`

### 7. `assignments`
Homework and project tracking.

```sql
CREATE TABLE assignments (
  id BIGSERIAL PRIMARY KEY,
  teacher_id BIGINT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  
  -- Assignment Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignment_type ENUM('homework', 'project', 'reading', 'lab') NOT NULL,
  
  -- Deadlines
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ NOT NULL,
  
  -- Content
  attachments JSONB DEFAULT '[]', -- [{url, name, type}]
  external_links JSONB DEFAULT '[]', -- Filtered for <16 users
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX idx_assignments_due_at ON assignments(due_at);
CREATE INDEX idx_assignments_subject ON assignments(subject);
```

**Lucid Model**: `app/models/assignment.ts`

### 8. `assignment_submissions`
Student submission tracking.

```sql
CREATE TABLE assignment_submissions (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  status ENUM('pending', 'submitted', 'late', 'graded', 'dismissed') DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  content TEXT,
  attachments JSONB DEFAULT '[]',
  
  -- Grading
  grade_id BIGINT REFERENCES grades(id) ON DELETE SET NULL,
  teacher_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(status);
```

**Lucid Model**: `app/models/assignment_submission.ts`

### 9. `announcements`
Teacher announcements (Story Feed).

```sql
CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  teacher_id BIGINT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  
  -- Content
  content_type ENUM('text', 'video', 'image', 'mixed') NOT NULL,
  text_content TEXT,
  media_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  
  -- Targeting
  target_audience JSONB DEFAULT '{"all": true}', -- {"grade_levels": [9, 10], "sections": ["A"]}
  
  -- Story-style expiration
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- Typically 24 hours
  
  -- Engagement
  views_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_teacher_id ON announcements(teacher_id);
CREATE INDEX idx_announcements_published_at ON announcements(published_at);
CREATE INDEX idx_announcements_expires_at ON announcements(expires_at);
```

**Lucid Model**: `app/models/announcement.ts`

### 10. `audit_logs`
GDPR-compliant audit trail.

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  
  -- Event Details
  action VARCHAR(100) NOT NULL, -- e.g., "grade.viewed", "profile.updated"
  resource_type VARCHAR(50), -- e.g., "Grade", "User"
  resource_id BIGINT,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Additional context (sanitized, no PII)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

**Lucid Model**: `app/models/audit_log.ts`

## Relationships

```
users (1) ----< (1) students
users (1) ----< (1) teachers

students (1) ----< (*) grades
teachers (1) ----< (*) grades

students (1) ----< (*) parental_consents

teachers (1) ----< (*) assignments
assignments (1) ----< (*) assignment_submissions
students (1) ----< (*) assignment_submissions

teachers (1) ----< (*) announcements

users (1) ----< (*) access_tokens
users (1) ----< (*) audit_logs
```

## Migration Commands

```bash
# Create a new migration
node ace make:migration create_users_table

# Run pending migrations
node ace migration:run

# Rollback last batch
node ace migration:rollback

# Check migration status
node ace migration:status

# Refresh database (drop all + migrate)
node ace migration:refresh

# Reset database (rollback all + migrate)
node ace migration:reset
```

## Seeding Data

```bash
# Create a seeder
node ace make:seeder user

# Run all seeders
node ace db:seed

# Run specific seeder
node ace db:seed --files=database/seeders/user_seeder.ts
```

## Query Examples with RLS

All database queries must use the `withRLS` wrapper:

```typescript
// ✅ CORRECT - Uses RLS wrapper
import { withRLS } from '#services/db'

const grades = await withRLS(auth.user!)
  .from('grades')
  .where('student_id', studentId)
  .select('*')

// ❌ WRONG - Direct query bypasses RLS
const grades = await db.from('grades').select('*')
```

See `docs/row-level-security.md` for implementation details.

## Backup & Maintenance

```bash
# Backup database
pg_dump -U root -d app > backup_$(date +%Y%m%d).sql

# Restore database
psql -U root -d app < backup_20251121.sql

# Vacuum (cleanup and optimize)
VACUUM ANALYZE;
```

## GDPR Data Export

Users can request their data via `POST /api/v1/gdpr/export`:

```typescript
// Returns JSON with all user data
{
  "user": {...},
  "grades": [...],
  "assignments": [...],
  "audit_logs": [...],
  "consents": [...]
}
```

Implementation: `app/services/gdpr_service.ts`

## Scheduled Tasks

- **Daily**: Delete soft-deleted users past 30 days
- **Daily**: Expire old announcements (>24 hours)
- **Weekly**: Vacuum database
- **Monthly**: Archive old audit logs (>6 months)
