---
id: task-1.14
title: 'Create GradeDTO, AssignmentDTO, AnnouncementDTO interfaces'
status: Done
assignee: []
created_date: '2025-11-22 12:43'
updated_date: '2025-11-22 13:47'
labels:
  - types
  - shared
dependencies: []
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Complete the types package with all necessary DTO interfaces and build the package
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created comprehensive DTOs in `packages/types/src/index.ts`:

**User Types:**
- User, UserType, GDPRPreferences

**Grade Types:**
- GradeDTO, CreateGradeDTO, UpdateGradeDTO
- GradeType, CalculationBasis enums

**Assignment Types:**
- AssignmentDTO, CreateAssignmentDTO, UpdateAssignmentDTO
- SubmissionDTO, CreateSubmissionDTO
- AssignmentType, AssignmentStatus, SubmissionStatus enums

**Announcement Types:**
- AnnouncementDTO, CreateAnnouncementDTO, UpdateAnnouncementDTO
- AnnouncementType, AnnouncementAudience enums

**API Response Types:**
- ApiResponse<T>, ApiError, PaginatedResponse<T>

**GDPR Types:**
- GDPRExportDTO

Package built successfully with TypeScript.
<!-- SECTION:NOTES:END -->
