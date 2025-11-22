# Snap SIS - AI Coding Agent Instructions

## Architecture Overview

This is a **pnpm monorepo** for a privacy-first Student Information System (SIS) with EU GDPR compliance. The architecture consists of:

- **`apps/api`**: AdonisJS v6 (ESM, TypeScript) - REST API running on port 3333
- **`apps/web`**: Next.js 14+ (App Router) - Frontend consuming the API
- **`packages/types`**: Shared TypeScript interfaces/DTOs bridging frontend and backend

The system emphasizes privacy controls, including a "Privacy Shield" feature that blurs sensitive data, parental consent flows for minors, and GDPR data export capabilities.

## Critical Developer Workflows

### Package Management (MANDATORY)
```bash
# ALWAYS use pnpm, NEVER npm or yarn
pnpm install              # Install dependencies
pnpm add <pkg>            # Add to current workspace
pnpm add -w <pkg>         # Add to workspace root
pnpm -r dev               # Run dev in all workspaces
```

### Development Commands
```bash
# Backend (apps/api)
node ace serve --hmr      # Dev server with hot reload
node ace build            # Production build
node ace make:controller  # Generate controller
node ace migration:run    # Run migrations

# Frontend (apps/web)
pnpm dev                  # Next.js dev server (port 3000)

# Run everything
pnpm dev                  # From root - starts all apps
```

### Database
- PostgreSQL 16 via `docker-compose.yml`
- Lucid ORM (Adonis v6 native)
- All queries must use the `withRLS` wrapper for Row Level Security
- Migrations: `database/migrations/` (auto-sorted by timestamp)

## Project-Specific Conventions

### 1. AdonisJS v6 Subpath Imports (NOT Relative Paths)
```typescript
// ✅ CORRECT - Use subpath imports defined in package.json
import UserController from '#controllers/user_controller'
import { User } from '#models/user'
import { withRLS } from '#services/db'

// ❌ WRONG - Never use relative paths
import UserController from '../../app/controllers/user_controller'
```

### 2. Type-Safe DTOs (Backend → Frontend)
**NEVER import Lucid Models directly into Next.js.** Always transform to DTOs:

```typescript
// apps/api/app/controllers/grades_controller.ts
import type { GradeResponse } from '@snap/types'

async index({ response }) {
  const grades = await Grade.all()
  return grades.map(g => ({
    id: g.id,
    subject: g.subject,
    score: g.score,
    trend: this.calculateTrend(g)
  } satisfies GradeResponse))
}
```

Update `packages/types/src/` interfaces when models change.

### 3. EU GDPR Compliance Patterns

#### Privacy Logging (CRITICAL)
```typescript
// ❌ NEVER log PII to console
console.log('User email:', user.email)

// ✅ Log sanitized identifiers only
logger.info('User action', { userId: user.id })
```

#### Parental Consent for Minors
```typescript
// Middleware: apps/api/app/middleware/gdpr_guard.ts
if (user.age < 16) {
  const token = request.header('X-Parent-Consent-Token')
  if (!token) throw new ForbiddenException('Parental consent required')
}
```

#### Explainable AI/Calculations
All computed scores (e.g., grade trends) must include a `calculation_basis` field:
```typescript
{
  score: 85,
  trend: 'up',
  calculation_basis: 'Weighted average: Exams 60%, Homework 40%'
}
```

### 4. Validation with VineJS
Use VineJS (not Zod) in AdonisJS controllers:

```typescript
import vine from '@vinejs/vine'

const schema = vine.object({
  limit: vine.number().min(1).max(100),
  cursor: vine.string().optional()
})

await request.validateUsing(schema)
```

### 5. Frontend Patterns

#### API Fetching
- Use TanStack Query (React Query) for all API calls
- Custom hook: `apps/web/hooks/useSnapQuery.ts` handles 401/403 errors
- Always pass `X-Timezone` header for UTC→Local conversion

#### State Management
- **Zustand**: Ephemeral UI state (sidebar open, privacy mode)
- **TanStack Query**: Server state (API data)
- **NOT Redux** (too heavy for this project)

#### Privacy Context
```typescript
// apps/web/components/layout/PrivacyLayout.tsx
const { isPrivacyMode } = usePrivacyContext()

// Apply blur when sensitive data is shown
<div className={isPrivacyMode ? 'blur-lg' : ''}>
  {student.grades}
</div>
```

## Testing Requirements

1. **Vitest tests required** for all utility functions
2. Update `docs/db_schema.md` when changing database schema
3. Backend tests: `node ace test` (Japa framework)
4. Test suites in `adonisrc.ts`: `unit` (2s timeout) and `functional` (30s timeout)

## UI/UX Standards

- **No boring tables**: Use Cards/Lists with animations (Framer Motion)
- **Mobile-first**: Responsive design is priority #1
- **Glassmorphism**: Floating bottom navigation bar
- **Dark mode**: Default theme (`bg-slate-950`)
- **Animations required** for all state changes

## Key Files & Integration Points

### Backend Entry Points
- `start/routes.ts`: HTTP route definitions
- `start/kernel.ts`: Middleware registration
- `config/database.ts`: Lucid ORM configuration

### Frontend Structure
- `app/layout.tsx`: Root layout with PrivacyContext
- `components/layout/PrivacyLayout.tsx`: Global shell with navigation
- `components/feed/`: StoryFeed module (Instagram-style announcements)
- `components/metrics/`: GradeHologram module (3D grade cards)
- `components/vault/`: IdentityVault (GDPR control center)

### Shared Types
- `packages/types/src/index.ts`: All shared interfaces
- Frontend imports as `@snap/types`

## API Conventions

- Base URL: `http://localhost:3333/api/v1`
- Prefix routes with `/api/v1/` in `start/routes.ts`
- Use resource controllers: `FeedController`, `GradebookController`, `VaultController`
- Return JSON DTOs, not Lucid models
- Include timezone conversions server-side (read `X-Timezone` header)

### Authentication Tokens
- Use `DbAccessTokensProvider.forModel()` for access tokens
- **CRITICAL**: The `abilities` column in `access_tokens` table MUST be TEXT, not JSON/JSONB
- AdonisJS auth handles JSON serialization internally; using JSONB breaks token verification
- In migrations: `table.text('abilities').notNullable().defaultTo(JSON.stringify(['*']))`

## Security Checklist

- [ ] No PII in logs
- [ ] All queries use `withRLS` wrapper
- [ ] Dates stored in UTC, displayed in EU timezones
- [ ] Auth tokens in HttpOnly cookies (not LocalStorage)
- [ ] Parental consent verified for users < 16
- [ ] Explainability fields in computed data
- [ ] GDPR export endpoint streams zip files

## Additional Documentation

For detailed implementation guidance, refer to:

- **`docs/database-schema.md`**: Complete database schema with all tables, relationships, and migration commands
- **`docs/authentication-strategy.md`**: Full auth implementation including WebAuthn, token lifecycle, and GDPR consent
- **`docs/row-level-security.md`**: RLS implementation patterns, usage examples, and security best practices
- **`docs/implementation-tasks.md`**: Step-by-step task breakdown with effort estimates and dependencies
