---
id: task-1.3
title: Configure database indexes
status: Done
assignee: []
created_date: '2025-11-22 12:41'
updated_date: '2025-11-22 13:47'
labels:
  - database
  - performance
dependencies: []
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add indexes for frequently queried columns, composite indexes for RLS queries, and test query performance
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added comprehensive composite indexes:

**Users table:**
- user_type + deleted_at (RLS filtering)
- scheduled_deletion_at + deleted_at (GDPR cleanup)
- account_locked_until + failed_login_attempts (security)
- email_verified_at + deleted_at (active users)

**Students table:**
- grade_level + section + academic_status
- requires_parental_consent + academic_status
- graduation_date + academic_status

**Teachers table:**
- department + hire_date

**Parental consents table:**
- student_id + consent_type + revoked_at
- granted_at + revoked_at + expires_at
- parent_email + revoked_at

**Audit logs table:**
- user_id + action + created_at
- resource_type + resource_id + created_at
- created_at + action

**Access tokens table:**
- expires_at + created_at
- tokenable_id + expires_at
<!-- SECTION:NOTES:END -->
