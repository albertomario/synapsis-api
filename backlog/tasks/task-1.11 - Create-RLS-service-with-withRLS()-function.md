---
id: task-1.11
title: Create RLS service with withRLS() function
status: Done
assignee: []
created_date: '2025-11-22 12:42'
updated_date: '2025-11-22 13:47'
labels:
  - rls
  - security
dependencies: []
parent_task_id: task-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement RLS service with RLSQueryBuilder class, student/teacher/parent rules, audit logging, and can() permission helper. Files: app/services/db_service.ts
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented RLS service in `app/services/rls_service.ts`:

**Core function:** `withRLS(query, user, options)`

**Role-specific filtering:**
- **Student:** Can only see own data + public student profiles
- **Teacher:** Can see students and assignments for their classes
- **Parent:** Can only see children's data (via parental consent)
- **Admin:** Can see everything + soft-deleted records

**Helper functions:**
- `canAccess(user, model, recordId)` - Check single record access
- `withRLSOrFail(query, user, options)` - Throw 403 if no access

**Features:**
- GDPR-aware (respects allowSearch preferences)
- Supports soft-delete filtering
- Admin override capability
- Type-safe with generics
<!-- SECTION:NOTES:END -->
