---
id: task-1.7
title: Test auth endpoints with Postman/Insomnia
status: Done
assignee: []
created_date: '2025-11-22 12:42'
updated_date: '2025-11-22 13:47'
labels:
  - auth
  - testing
dependencies: []
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create comprehensive API tests for all authentication endpoints
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created comprehensive auth tests in `tests/functional/auth/password_lockout.spec.ts`:

**Password Validation Tests:**
- Reject password without uppercase
- Reject password without lowercase
- Reject password without number
- Reject password without special character
- Accept strong password

**Account Lockout Tests:**
- Lock account after 5 failed attempts
- Show 403 Forbidden on lockout
- Reset attempts on successful login
- Verify counter reset to 0

**Security Tests:**
- Generic error messages
- Attempt tracking
- Timeout mechanism
<!-- SECTION:NOTES:END -->
