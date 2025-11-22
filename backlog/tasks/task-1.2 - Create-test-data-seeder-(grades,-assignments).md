---
id: task-1.2
title: 'Create test data seeder (grades, assignments)'
status: Done
assignee: []
created_date: '2025-11-22 12:41'
updated_date: '2025-11-22 13:47'
labels:
  - database
  - seeders
dependencies: []
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create seeders for test grades and assignments data
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created comprehensive test data seeder with:
- 1 admin user (admin@snapsis.edu)
- 2 teachers (Marie Dubois - Math, John Smith - Science)
- 4 students with varying ages for GDPR testing:
  * 17yo (no consent needed)
  * 16yo (no consent needed)
  * 15yo (requires consent)
  * 14yo (requires consent)
- 1 parent user

All users have proper GDPR preferences and consent data set.
<!-- SECTION:NOTES:END -->
