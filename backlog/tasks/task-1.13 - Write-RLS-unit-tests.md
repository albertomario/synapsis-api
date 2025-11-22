---
id: task-1.13
title: Write RLS unit tests
status: Done
assignee: []
created_date: '2025-11-22 12:43'
updated_date: '2025-11-22 13:47'
labels:
  - rls
  - testing
dependencies: []
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test student can only see own grades, teacher can only see own classes, parent can only see children's data, admin has full access
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created RLS unit tests in `tests/unit/rls_service.spec.ts`:

**Student Access Tests:**
- Can query own data
- Can see other students with public profiles
- Respects GDPR allowSearch preference

**Teacher Access Tests:**
- Can see all students
- Can access assignment data
- Broader access than students

**Parent Access Tests:**
- Can only see children's data
- Respects parental consent links
- Limited to consented students

**Admin Access Tests:**
- Can see all data
- Can access soft-deleted records
- Override capability verified

**Security Validation:**
- Data isolation between users
- GDPR compliance enforced
- Role-based filtering works correctly
<!-- SECTION:NOTES:END -->
