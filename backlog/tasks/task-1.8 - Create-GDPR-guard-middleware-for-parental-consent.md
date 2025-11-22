---
id: task-1.8
title: Create GDPR guard middleware for parental consent
status: Done
assignee: []
created_date: '2025-11-22 12:42'
updated_date: '2025-11-22 13:47'
labels:
  - auth
  - middleware
  - gdpr
dependencies: []
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement middleware to check parental consent for users under 16
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented GDPR guard middleware in `app/middleware/gdpr_guard_middleware.ts`:

**Features:**
- Check if user requires parental consent (under 16)
- Validate active parental consent exists
- Check consent expiration dates
- Verify consent not revoked
- Validate data processing consent

**Error responses:**
- PARENTAL_CONSENT_REQUIRED code for minors
- DATA_CONSENT_REQUIRED for missing consent
- Includes reason and date of birth in response
<!-- SECTION:NOTES:END -->
