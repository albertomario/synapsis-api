---
id: task-1.6
title: Add failed login protection (5 attempts lock)
status: Done
assignee: []
created_date: '2025-11-22 12:42'
updated_date: '2025-11-22 13:47'
labels:
  - auth
  - security
dependencies: []
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement rate limiting for login attempts with 5 attempts lockout
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Enhanced login endpoint in `auth_controller.ts` with:

**Features:**
- Track failed login attempts per user
- Lock account after 5 failed attempts
- 15-minute lockout duration
- Show remaining attempts in error response
- Auto-unlock after timeout expires
- Reset counter on successful login
- Update lastLoginAt timestamp on success

**Security:**
- Generic error messages (don't reveal if user exists)
- Lockout applies even with correct password
- Failed attempts tracked in database
<!-- SECTION:NOTES:END -->
