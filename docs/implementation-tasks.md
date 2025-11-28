# Synapsis - Implementation Tasks

> **📋 NOTE**: This project now uses [Backlog.md](https://github.com/MrLesk/Backlog.md) for active task management. This document serves as a reference for the original task breakdown. For current task status and management, use:
>
> ```bash
> backlog board          # View Kanban board
> backlog browser        # Open web interface
> backlog task list      # List all tasks
> ```
>
> See **[docs/backlog-setup.md](./backlog-setup.md)** for complete setup and usage instructions.

## Overview

This document provides a step-by-step implementation guide for building the Synapsis MVP. Tasks are organized into phases with dependencies clearly marked. Estimated effort is provided in hours.

## Phase 1: Foundation & Infrastructure (Week 1)

### 1.1 Database Setup
- [x] **Task 1.1.1**: Create database migrations (8h)
  - [x] Create `users` table migration
  - [x] Create `students` table migration
  - [x] Create `teachers` table migration
  - [x] Create `parental_consents` table migration
  - [x] Create `access_tokens` table migration
  - [x] Create `audit_logs` table migration
  - [x] Run migrations and verify schema
  - **Command**: `node ace make:migration create_users_table`
  - **Files**: `database/migrations/TIMESTAMP_create_users_table.ts`

- [x] **Task 1.1.2**: Create database seeders (4h)
  - [x] Create user seeder (students, teachers, admins)
  - [x] Create test data seeder (grades, assignments)
  - [x] Run seeders in development environment
  - **Command**: `node ace make:seeder user && node ace db:seed`
  - **Files**: `database/seeders/user_seeder.ts`

- [x] **Task 1.1.3**: Configure database indexes (2h)
  - [x] Add indexes for frequently queried columns
  - [x] Add composite indexes for RLS queries
  - [x] Test query performance with `EXPLAIN ANALYZE`
  - **Files**: Update migration files with indexes

**Dependencies**: None  
**Total Effort**: 14h  
**Documentation**: `docs/database-schema.md`

### 1.2 Authentication System
- [x] **Task 1.2.1**: Install and configure AdonisJS Auth (2h)
  - [x] Install `@adonisjs/auth` package
  - [x] Configure auth provider in `adonisrc.ts`
  - [x] Create `config/auth.ts` configuration
  - **Command**: `pnpm add @adonisjs/auth && node ace configure @adonisjs/auth`
  - **Files**: `config/auth.ts`, `adonisrc.ts`

- [x] **Task 1.2.2**: Create User and related models (6h)
  - [x] Create `User` Lucid model
  - [x] Create `Student` Lucid model with relationships
  - [x] Create `Teacher` Lucid model with relationships
  - [x] Create `ParentalConsent` Lucid model
  - [x] Add model relationships (belongsTo, hasOne, hasMany)
  - **Command**: `node ace make:model User && node ace make:model Student`
  - **Files**: `app/models/user.ts`, `app/models/student.ts`, `app/models/teacher.ts`

- [x] **Task 1.2.3**: Create authentication validators (3h)
  - [x] Create `LoginValidator` with VineJS
  - [x] Create `RegisterValidator` with VineJS
  - [x] Create `PasswordValidator` with complexity rules
  - [x] Test validators with edge cases
  - **Files**: `app/validators/login_validator.ts`, `app/validators/register_validator.ts`

- [x] **Task 1.2.4**: Build AuthController (8h)
  - [x] Implement `login()` method with consent tracking
  - [x] Implement `register()` method with validation
  - [x] Implement `logout()` method with token revocation
  - [x] Implement `me()` method to get current user
  - [x] Add failed login protection (5 attempts lock)
  - [x] Test all endpoints with Postman/Insomnia
  - **Files**: `app/controllers/auth_controller.ts`
  - **Routes**: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`

- [x] **Task 1.2.5**: Create authentication middleware (4h)
  - [x] Create `auth` middleware (uses AdonisJS built-in)
  - [x] Create `gdpr_guard` middleware for parental consent
  - [x] Create `role_guard` middleware for RBAC
  - [x] Test middleware chain with protected routes
  - **Files**: `app/middleware/gdpr_guard.ts`, `app/middleware/role_guard.ts`

**Dependencies**: Task 1.1 (Database)  
**Total Effort**: 23h  
**Documentation**: `docs/authentication-strategy.md`

### 1.3 Row Level Security (RLS)
- [x] **Task 1.3.1**: Create RLS service (10h)
  - [x] Create `db_service.ts` with `withRLS()` function
  - [x] Implement `RLSQueryBuilder` class
  - [x] Add student RLS rules
  - [x] Add teacher RLS rules
  - [x] Add parent RLS rules
  - [x] Add audit logging wrapper
  - [x] Create `can()` permission helper
  - **Files**: `app/services/rls_service.ts`

- [x] **Task 1.3.2**: Create AuditLog model (2h)
  - [x] Create `audit_logs` table migration
  - [x] Create `AuditLog` Lucid model
  - [x] Test audit log creation
  - **Command**: `node ace make:migration create_audit_logs_table`
  - **Files**: `app/models/audit_log.ts`

- [x] **Task 1.3.3**: Write RLS unit tests (6h)
  - [x] Test student can only see own grades
  - [x] Test teacher can only see own classes
  - [x] Test parent can only see children's data
  - [x] Test admin has full access
  - [x] Test audit log creation
  - **Command**: `node ace test`
  - **Files**: `tests/unit/rls_service.spec.ts`

**Dependencies**: Task 1.1 (Database), Task 1.2 (Auth)  
**Total Effort**: 18h  
**Documentation**: `docs/row-level-security.md`

### 1.4 Shared Types Package
- [x] **Task 1.4.1**: Create DTO interfaces (4h)
  - [x] Create `UserDTO` interface
  - [x] Create `GradeDTO` interface
  - [x] Create `AssignmentDTO` interface
  - [x] Create `AnnouncementDTO` interface
  - [x] Export all types from `index.ts`
  - [x] Build types package
  - **Command**: `cd packages/types && pnpm build`
  - **Files**: `packages/types/src/index.ts`

**Dependencies**: None  
**Total Effort**: 4h  
**Documentation**: README in `packages/types/`

---

## Phase 2: Backend API Development (Week 2)

### 2.1 Grades Module
- [ ] **Task 2.1.1**: Create Grade model (3h)
  - [ ] Create `grades` table migration
  - [ ] Create `Grade` Lucid model with relationships
  - [ ] Add RLS scope to model
  - [ ] Add calculated fields (trend, percentage)
  - **Command**: `node ace make:model Grade`
  - **Files**: `app/models/grade.ts`

- [x] **Task 2.1.2**: Build GradebookController (8h)
  - [x] Implement `index()` - list grades with RLS
  - [x] Implement `show()` - get single grade
  - [x] Implement `store()` - create grade (teachers only)
  - [x] Implement `update()` - update grade (teachers only)
  - [x] Implement `dashboard()` - summary with trends
  - [ ] Add calculation_basis field for explainability
  - [ ] Test all endpoints
  - **Files**: `app/controllers/gradebook_controller.ts`
  - **Routes**: `GET /api/v1/grades`, `GET /api/v1/grades/:id`, `POST /api/v1/grades`

- [ ] **Task 2.1.3**: Create grade validators (2h)
  - [ ] Create `CreateGradeValidator`
  - [ ] Create `UpdateGradeValidator`
  - [ ] Test validation rules
  - **Files**: `app/validators/grade_validator.ts`

**Dependencies**: Task 1.1, 1.2, 1.3  
**Total Effort**: 13h

### 2.2 Assignments Module
- [ ] **Task 2.2.1**: Create Assignment models (4h)
  - [ ] Create `assignments` table migration
  - [ ] Create `assignment_submissions` table migration
  - [ ] Create `Assignment` Lucid model
  - [ ] Create `AssignmentSubmission` Lucid model
  - [ ] Add relationships between models
  - **Command**: `node ace make:model Assignment && node ace make:model AssignmentSubmission`
  - **Files**: `app/models/assignment.ts`, `app/models/assignment_submission.ts`

- [x] **Task 2.2.2**: Build AssignmentsController (10h)
  - [x] Implement `index()` - list assignments with RLS
  - [x] Implement `show()` - get single assignment
  - [x] Implement `store()` - create assignment (teachers)
  - [x] Implement `complete()` - mark assignment done (students)
  - [ ] Implement `submit()` - submit assignment (students)
  - [ ] Filter external links for users <16
  - [ ] Test all endpoints
  - **Files**: `app/controllers/assignments_controller.ts`
  - **Routes**: `GET /api/v1/assignments`, `POST /api/v1/assignments`, `POST /api/v1/assignments/:id/complete`

**Dependencies**: Task 1.1, 1.2, 1.3  
**Total Effort**: 14h

### 2.3 Feed Module (Announcements)
- [ ] **Task 2.3.1**: Create Announcement model (3h)
  - [ ] Create `announcements` table migration
  - [ ] Create `Announcement` Lucid model
  - [ ] Add target_audience JSONB filtering
  - [ ] Add expiration logic (24-hour stories)
  - **Command**: `node ace make:model Announcement`
  - **Files**: `app/models/announcement.ts`

- [x] **Task 2.3.2**: Build FeedController (6h)
  - [x] Implement `index()` - timeline feed with RLS
  - [x] Implement `store()` - create announcement (teachers)
  - [ ] Filter by target_audience (grade_level, section)
  - [ ] Add pagination with cursor
  - [ ] Test feed filtering
  - **Files**: `app/controllers/feed_controller.ts`
  - **Routes**: `GET /api/v1/feed/timeline`, `POST /api/v1/announcements`

**Dependencies**: Task 1.1, 1.2, 1.3  
**Total Effort**: 9h

### 2.4 GDPR Module
- [ ] **Task 2.4.1**: Create GdprService (8h)
  - [ ] Implement `exportUserData()` method
  - [ ] Collect data from all tables (grades, assignments, etc.)
  - [ ] Generate JSON export
  - [ ] Create zip file for download
  - [ ] Implement streaming response
  - **Files**: `app/services/gdpr_service.ts`

- [x] **Task 2.4.2**: Build VaultController (6h)
  - [x] Implement `export()` - trigger data export
  - [x] Implement `updatePreferences()` - update GDPR settings
  - [x] Implement `scheduleDelete()` - "Forget Me" feature
  - [ ] Test export functionality
  - **Files**: `app/controllers/vault_controller.ts`
  - **Routes**: `POST /api/v1/gdpr/export`, `PATCH /api/v1/gdpr/preferences`

**Dependencies**: Task 1.1, 1.2, 1.3  
**Total Effort**: 14h

---

## Phase 3: Frontend Development (Week 3)

### 3.1 Frontend Foundation
- [ ] **Task 3.1.1**: Install dependencies (1h)
  - [ ] Install TanStack Query: `pnpm add @tanstack/react-query`
  - [ ] Install Zustand: `pnpm add zustand`
  - [ ] Install Framer Motion: `pnpm add framer-motion`
  - [ ] Install React Hook Form + Zod: `pnpm add react-hook-form @hookform/resolvers/zod zod`
  - [ ] Install Recharts: `pnpm add recharts`
  - **Directory**: `apps/web/`

- [ ] **Task 3.1.2**: Setup API client (3h)
  - [ ] Create `lib/api.ts` with fetch wrapper
  - [ ] Create `hooks/useSynapsisQuery.ts` custom hook
  - [ ] Add 401/403 error handling
  - [ ] Add `X-Timezone` header injection
  - **Files**: `apps/web/lib/api.ts`, `apps/web/hooks/useSynapsisQuery.ts`

- [ ] **Task 3.1.3**: Create AuthContext (4h)
  - [ ] Create `contexts/AuthContext.tsx`
  - [ ] Implement `useAuth()` hook
  - [ ] Add user state management
  - [ ] Add loading and error states
  - **Files**: `apps/web/contexts/AuthContext.tsx`

**Dependencies**: Task 1.2 (Auth backend)  
**Total Effort**: 8h

### 3.2 Authentication UI
- [ ] **Task 3.2.1**: Build BiometricLogin component (8h)
  - [ ] Create login form with React Hook Form
  - [ ] Add email + password fields
  - [ ] Add consent checkbox (unchecked by default)
  - [ ] Add "Remember me" checkbox
  - [ ] Integrate with `/api/v1/auth/login`
  - [ ] Add error handling and validation feedback
  - [ ] Test login flow
  - **Files**: `apps/web/components/auth/BiometricLogin.tsx`

- [ ] **Task 3.2.2**: Add WebAuthn support (6h - Optional)
  - [ ] Add biometric authentication button
  - [ ] Integrate with WebAuthn API
  - [ ] Fallback to password login
  - **Files**: Update `BiometricLogin.tsx`

**Dependencies**: Task 3.1  
**Total Effort**: 14h

### 3.3 Layout & Navigation
- [ ] **Task 3.3.1**: Create PrivacyContext (3h)
  - [ ] Create `contexts/PrivacyContext.tsx`
  - [ ] Add `isPrivacyMode` state
  - [ ] Add blur toggle functionality
  - [ ] Test privacy mode switching
  - **Files**: `apps/web/contexts/PrivacyContext.tsx`

- [ ] **Task 3.3.2**: Build PrivacyLayout component (8h)
  - [ ] Create main layout wrapper
  - [ ] Add floating bottom navigation (Framer Motion)
  - [ ] Add "Eye Icon" privacy toggle
  - [ ] Add routing between Feed, Metrics, Vault
  - [ ] Implement glassmorphism styles (Tailwind)
  - [ ] Test on mobile viewport
  - **Files**: `apps/web/components/layout/PrivacyLayout.tsx`

**Dependencies**: Task 3.1  
**Total Effort**: 11h

### 3.4 Feed Module (UI)
- [ ] **Task 3.4.1**: Build StoryRing component (6h)
  - [ ] Create circular avatar ring
  - [ ] Fetch announcements from API
  - [ ] Add modal for story details
  - [ ] Add Framer Motion animations
  - **Files**: `apps/web/components/feed/StoryRing.tsx`

- [ ] **Task 3.4.2**: Build AssignmentCard component (8h)
  - [ ] Create swipeable card (Framer Motion)
  - [ ] Add left swipe → Dismiss
  - [ ] Add right swipe → Mark Done
  - [ ] Integrate with `POST /api/v1/assignments/:id/complete`
  - [ ] Add haptic feedback (if mobile)
  - **Files**: `apps/web/components/feed/AssignmentCard.tsx`

- [ ] **Task 3.4.3**: Build StoryFeed component (4h)
  - [ ] Combine StoryRing + AssignmentCard
  - [ ] Fetch timeline from `GET /api/v1/feed/timeline`
  - [ ] Add loading and error states
  - [ ] Test complete feed flow
  - **Files**: `apps/web/components/feed/StoryFeed.tsx`

**Dependencies**: Task 2.2, 2.3, Task 3.3  
**Total Effort**: 18h

### 3.5 Grades Module (UI)
- [ ] **Task 3.5.1**: Build GradeHologram component (10h)
  - [ ] Create 3D-style card with neon borders
  - [ ] Implement color coding (Lime/Yellow/Orange)
  - [ ] Add flip animation for details
  - [ ] Integrate Recharts RadialBarChart
  - [ ] Add privacy mode blur overlay
  - [ ] Fetch from `GET /api/v1/grades/current`
  - [ ] Display calculation_basis tooltip
  - **Files**: `apps/web/components/metrics/GradeHologram.tsx`

- [ ] **Task 3.5.2**: Build Metrics dashboard (4h)
  - [ ] Create grid layout for grade cards
  - [ ] Add trend indicators (up/down/stable)
  - [ ] Add filtering by subject
  - [ ] Test responsiveness
  - **Files**: `apps/web/app/metrics/page.tsx`

**Dependencies**: Task 2.1, Task 3.3  
**Total Effort**: 14h

### 3.6 Vault Module (UI)
- [ ] **Task 3.6.1**: Build IdentityVault component (10h)
  - [ ] Create privacy settings toggles
  - [ ] Add "Download My Data" button
  - [ ] Add "Forget Me Upon Graduation" button
  - [ ] Integrate with `POST /api/v1/gdpr/export`
  - [ ] Handle blob download for zip file
  - [ ] Add confirmation modals
  - **Files**: `apps/web/components/vault/IdentityVault.tsx`

**Dependencies**: Task 2.4, Task 3.3  
**Total Effort**: 10h

---

## Phase 4: Testing & Polish (Week 4)

### 4.1 Backend Testing
- [x] **Task 4.1.1**: Write integration tests (12h)
  - [x] Test auth flow (login, logout, token validation)
  - [ ] Test RLS for all user types
  - [x] Test GDPR export functionality
  - [ ] Test parental consent middleware
  - [x] Test grade CRUD operations
  - [x] Test assignment submission flow
  - **Command**: `node ace test`
  - **Files**: `tests/functional/auth.spec.ts`, `tests/functional/grades.spec.ts`

- [ ] **Task 4.1.2**: API documentation (4h)
  - [ ] Document all endpoints with examples
  - [ ] Add Postman collection
  - [ ] Create OpenAPI/Swagger spec
  - **Files**: `docs/api-reference.md`

**Total Effort**: 16h

### 4.2 Frontend Testing
- [ ] **Task 4.2.1**: Write component tests (8h)
  - [ ] Test BiometricLogin form validation
  - [ ] Test AssignmentCard swipe gestures
  - [ ] Test GradeHologram data display
  - [ ] Test PrivacyLayout blur functionality
  - **Command**: `pnpm test`
  - **Files**: `apps/web/__tests__/`

- [ ] **Task 4.2.2**: E2E testing with Playwright (8h)
  - [ ] Test complete user journey
  - [ ] Test mobile responsiveness
  - [ ] Test privacy mode toggle
  - **Files**: `apps/web/e2e/`

**Total Effort**: 16h

### 4.3 Security & Compliance
- [ ] **Task 4.3.1**: Security audit (6h)
  - [ ] Review all endpoints for authorization
  - [ ] Check for PII in logs
  - [ ] Verify HttpOnly cookies
  - [ ] Test XSS/CSRF protection
  - [ ] Penetration testing for RLS bypass

- [ ] **Task 4.3.2**: GDPR compliance review (4h)
  - [ ] Verify consent tracking
  - [ ] Test data export completeness
  - [ ] Check parental consent flow
  - [ ] Verify audit logging

**Total Effort**: 10h

### 4.4 Deployment Preparation
- [ ] **Task 4.4.1**: Docker configuration (4h)
  - [ ] Create Dockerfile for API
  - [ ] Create Dockerfile for Web
  - [ ] Update docker-compose.yml with all services
  - [ ] Test local deployment

- [ ] **Task 4.4.2**: Environment configuration (2h)
  - [ ] Create `.env.example` files
  - [ ] Document all environment variables
  - [ ] Setup CI/CD pipeline (GitHub Actions)

**Total Effort**: 6h

---

## Summary

### Total Effort by Phase
- **Phase 1 (Foundation)**: 59h (~1.5 weeks)
- **Phase 2 (Backend API)**: 50h (~1.25 weeks)
- **Phase 3 (Frontend)**: 75h (~2 weeks)
- **Phase 4 (Testing & Polish)**: 48h (~1.25 weeks)

**Total**: ~232 hours (~6 weeks with 1 developer, or 3-4 weeks with 2 developers)

### Critical Path
1. Database Setup → Auth System → RLS
2. Backend API Development (parallel with types)
3. Frontend Development (requires API endpoints)
4. Testing & Security Audit

### Quick Start Commands

```bash
# Initial setup
cd synapsis
pnpm install

# Start database
docker-compose up -d

# Setup backend
cd apps/api
node ace migration:run
node ace db:seed
pnpm dev

# Start frontend (new terminal)
cd apps/web
pnpm dev

# Run tests
node ace test              # Backend
pnpm test                  # Frontend
```

### Recommended Implementation Order

1. **Start with Phase 1, Task 1.1** (Database) - Foundation for everything
2. **Implement Phase 1, Task 1.2** (Auth) - Critical dependency
3. **Implement Phase 1, Task 1.3** (RLS) - Security foundation
4. **Build one complete vertical slice**: Auth → Grades API → Grades UI
5. **Iterate on remaining modules** in parallel if possible

### Notes for AI Agents

- ✅ **DO**: Mark tasks as complete as you go
- ✅ **DO**: Update this file if you discover missing tasks
- ✅ **DO**: Reference documentation files for implementation details
- ✅ **DO**: Write tests immediately after implementing features
- ❌ **DON'T**: Skip RLS implementation (security critical)
- ❌ **DON'T**: Hardcode user IDs or bypass auth
- ❌ **DON'T**: Log PII to console
- ❌ **DON'T**: Use npm/yarn (always use pnpm)
