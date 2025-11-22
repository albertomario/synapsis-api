---
id: task-1.5
title: Create PasswordValidator with complexity rules
status: Done
assignee: []
created_date: '2025-11-22 12:42'
updated_date: '2025-11-22 13:47'
labels:
  - auth
  - validation
dependencies: []
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement password complexity validation rules using VineJS
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented comprehensive password validation in `app/validators/password.ts`:

**Requirements:**
- Minimum 8 characters (max 128 to prevent DoS)
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common passwords (password, 123456, etc.)
- No sequential characters (abc, 123, etc.)
- No repeated characters (aaa, 111, etc.)

**Additional features:**
- Password confirmation matching
- Password strength checker function
- Change password validator (requires current password)
- Custom VineJS rule for integration

Updated auth validator to use password complexity rules.
<!-- SECTION:NOTES:END -->
