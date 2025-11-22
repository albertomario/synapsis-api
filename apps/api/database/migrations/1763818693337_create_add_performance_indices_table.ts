import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Performance Indexes Migration
 *
 * Adds composite and performance indexes for:
 * - RLS (Row-Level Security) queries
 * - GDPR compliance queries
 * - Common query patterns
 */
export default class extends BaseSchema {
  async up() {
    // Users table - composite indexes for RLS and GDPR
    this.schema.alterTable('users', (table) => {
      // Composite index for RLS filtering by user_type and deletion status
      table.index(['user_type', 'deleted_at'], 'idx_users_type_deleted')

      // Index for GDPR scheduled deletions
      table.index(['scheduled_deletion_at', 'deleted_at'], 'idx_users_scheduled_deletion_status')

      // Index for account lockout queries
      table.index(['account_locked_until', 'failed_login_attempts'], 'idx_users_lockout')

      // Index for active users (not deleted, email verified)
      table.index(['email_verified_at', 'deleted_at'], 'idx_users_active')
    })

    // Students table - composite indexes for grade queries
    this.schema.alterTable('students', (table) => {
      // Composite index for grade-level and section queries
      table.index(['grade_level', 'section', 'academic_status'], 'idx_students_grade_section')

      // Index for parental consent filtering
      table.index(['requires_parental_consent', 'academic_status'], 'idx_students_consent_status')

      // Index for graduation tracking
      table.index(['graduation_date', 'academic_status'], 'idx_students_graduation')
    })

    // Teachers table - composite indexes
    this.schema.alterTable('teachers', (table) => {
      // Composite index for department queries
      table.index(['department', 'hire_date'], 'idx_teachers_dept_hire')
    })

    // Parental consents table - indexes for RLS
    this.schema.alterTable('parental_consents', (table) => {
      // Composite index for consent validation (most common query)
      table.index(['student_id', 'consent_type', 'revoked_at'], 'idx_parental_consent_validation')

      // Index for active consents
      table.index(['granted_at', 'revoked_at', 'expires_at'], 'idx_parental_active')

      // Index for parent email lookups
      table.index(['parent_email', 'revoked_at'], 'idx_parental_email_lookup')
    })

    // Audit logs table - composite indexes for querying
    this.schema.alterTable('audit_logs', (table) => {
      // Composite index for user activity queries
      table.index(['user_id', 'action', 'created_at'], 'idx_audit_user_activity')

      // Composite index for resource tracking
      table.index(['resource_type', 'resource_id', 'created_at'], 'idx_audit_resource_tracking')

      // Index for time-based queries (last 24h, last week, etc.)
      table.index(['created_at', 'action'], 'idx_audit_time_action')
    })

    // Access tokens table - indexes for token lookups
    this.schema.alterTable('access_tokens', (table) => {
      // Index for token expiration cleanup
      table.index(['expires_at', 'created_at'], 'idx_tokens_expiration')

      // Composite index for user session management
      table.index(['tokenable_id', 'expires_at'], 'idx_tokens_user_sessions')
    })
  }

  async down() {
    // Drop indexes in reverse order
    this.schema.alterTable('access_tokens', (table) => {
      table.dropIndex([], 'idx_tokens_expiration')
      table.dropIndex([], 'idx_tokens_user_sessions')
    })

    this.schema.alterTable('audit_logs', (table) => {
      table.dropIndex([], 'idx_audit_user_activity')
      table.dropIndex([], 'idx_audit_resource_tracking')
      table.dropIndex([], 'idx_audit_time_action')
    })

    this.schema.alterTable('parental_consents', (table) => {
      table.dropIndex([], 'idx_parental_consent_validation')
      table.dropIndex([], 'idx_parental_active')
      table.dropIndex([], 'idx_parental_email_lookup')
    })

    this.schema.alterTable('teachers', (table) => {
      table.dropIndex([], 'idx_teachers_dept_hire')
    })

    this.schema.alterTable('students', (table) => {
      table.dropIndex([], 'idx_students_grade_section')
      table.dropIndex([], 'idx_students_consent_status')
      table.dropIndex([], 'idx_students_graduation')
    })

    this.schema.alterTable('users', (table) => {
      table.dropIndex([], 'idx_users_type_deleted')
      table.dropIndex([], 'idx_users_scheduled_deletion_status')
      table.dropIndex([], 'idx_users_lockout')
      table.dropIndex([], 'idx_users_active')
    })
  }
}
