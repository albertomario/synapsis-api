# Synapsis Documentation

This directory contains comprehensive documentation for the Synapsis project. Start here for implementation guidance, architecture details, and development workflows.

## 📚 Documentation Index

### 🚀 Quick Start
- **[Quick Reference](./quick-reference.md)** - Essential commands, patterns, and troubleshooting tips

### 🏗️ Architecture & Design
- **[Database Schema](./database-schema.md)** - Complete schema, relationships, migrations, and query examples
- **[Authentication Strategy](./authentication-strategy.md)** - Auth flows, guards, token lifecycle, and GDPR consent
- **[Row Level Security (RLS)](./row-level-security.md)** - RLS implementation, usage patterns, and security best practices

### 📋 Implementation
- **[Implementation Tasks](./implementation-tasks.md)** - Step-by-step task breakdown with effort estimates and dependencies

### 🎯 For AI Coding Agents
- **[../.github/copilot-instructions.md](../.github/copilot-instructions.md)** - Essential patterns and conventions for AI agents

## 🗂️ Documentation Overview

### Database Schema (`database-schema.md`)
Comprehensive database design documentation including:
- All 10 core tables with SQL definitions
- Table relationships and foreign keys
- GDPR-compliant fields (`consent_given_at`, `scheduled_deletion_at`)
- Index definitions for query optimization
- Migration and seeding commands
- RLS integration examples

**Use this when**: Creating migrations, understanding data model, writing queries

### Authentication Strategy (`authentication-strategy.md`)
Complete authentication system documentation:
- Email/password login flow with consent tracking
- WebAuthn biometric authentication (Face ID, fingerprint)
- Token-based auth with HttpOnly cookies
- Authorization guards (Auth, GDPR, Role-based)
- Password security (Argon2id hashing)
- Failed login protection
- Parental consent verification for minors

**Use this when**: Implementing auth, adding protected routes, handling user sessions

### Row Level Security (`row-level-security.md`)
Application-level RLS implementation:
- `withRLS()` wrapper function and usage
- RLS rules for students, teachers, parents, admins
- Automatic audit logging
- Permission checking with `can()` helper
- Testing RLS rules
- Security best practices and common pitfalls

**Use this when**: Writing controllers, querying database, implementing data access controls

### Implementation Tasks (`implementation-tasks.md`)
Detailed task breakdown for the entire MVP:
- 4 phases: Foundation → Backend → Frontend → Testing
- ~232 hours of work (~6 weeks solo, ~3-4 weeks with team)
- Task dependencies and critical path
- Effort estimates per task
- Specific files and commands for each task

**Use this when**: Planning sprints, tracking progress, understanding task dependencies

### Quick Reference (`quick-reference.md`)
Developer cheat sheet:
- Essential commands (pnpm, node ace, docker)
- Project structure overview
- API endpoint list
- Environment variables
- Common code patterns
- Troubleshooting guide

**Use this when**: Quick lookups, debugging, learning project structure

## 🎯 Recommended Reading Order

### For New Developers
1. **Start**: [Quick Reference](./quick-reference.md) - Get oriented
2. **Architecture**: [Database Schema](./database-schema.md) - Understand data model
3. **Security**: [Row Level Security](./row-level-security.md) - Critical for data access
4. **Auth**: [Authentication Strategy](./authentication-strategy.md) - User management
5. **Implementation**: [Implementation Tasks](./implementation-tasks.md) - Start building

### For AI Coding Agents
1. **Start**: [../.github/copilot-instructions.md](../.github/copilot-instructions.md) - Project conventions
2. **Patterns**: [Quick Reference](./quick-reference.md) - Common patterns
3. **Deep Dive**: Relevant docs based on task (DB, Auth, RLS)
4. **Tasks**: [Implementation Tasks](./implementation-tasks.md) - What to build

### For Security Review
1. [Authentication Strategy](./authentication-strategy.md) - Auth mechanisms
2. [Row Level Security](./row-level-security.md) - Data access controls
3. [Database Schema](./database-schema.md) - GDPR compliance fields

## 🔑 Key Concepts

### Monorepo Structure
```
synapsis/
├── apps/api/          # AdonisJS v6 backend (ESM, TypeScript)
├── apps/web/          # Next.js 14+ frontend (App Router)
└── packages/types/    # Shared TypeScript DTOs
```

### Core Technologies
- **Backend**: AdonisJS v6 (ESM), Lucid ORM, VineJS validation
- **Frontend**: Next.js 14, React 19, TanStack Query, Zustand, Framer Motion
- **Database**: PostgreSQL 16 with application-level RLS
- **Auth**: Token-based with HttpOnly cookies

### Critical Patterns

#### 1. Subpath Imports (Backend)
```typescript
// ✅ CORRECT
import User from '#models/user'
import { withRLS } from '#services/db_service'

// ❌ WRONG
import User from '../../app/models/user'
```

#### 2. RLS Wrapper (All DB Queries)
```typescript
// ✅ CORRECT
const grades = await withRLS(auth.user!).from('grades').select('*')

// ❌ WRONG - Bypasses security
const grades = await db.from('grades').select('*')
```

#### 3. DTOs (Never Export Lucid Models)
```typescript
// ✅ CORRECT
import type { GradeResponse } from '@synapsis/types'

return grades.map(g => ({
  id: g.id,
  score: g.score,
  subject: g.subject
} satisfies GradeResponse))

// ❌ WRONG
return grades // Exposes internal model structure
```

## 🛡️ Security Checklist

Before committing code, verify:

- [ ] All database queries use `withRLS()` wrapper
- [ ] No PII logged to console (use `logger.info({ userId: user.id })` instead)
- [ ] Input validated with VineJS (backend) or Zod (frontend)
- [ ] Auth middleware applied to protected routes
- [ ] Parental consent checked for users <16
- [ ] HttpOnly cookies used for tokens (not LocalStorage)
- [ ] Computed values include `calculation_basis` field
- [ ] Tests written for new features

## 🧪 Testing

### Backend Tests
```bash
cd apps/api
node ace test              # Run all tests
node ace test --suite=unit # Unit tests only
```

### Frontend Tests
```bash
cd apps/web
pnpm test                  # Jest/Vitest tests
pnpm test:e2e              # Playwright E2E
```

## 📝 Contributing to Docs

When adding new documentation:

1. **Keep it actionable**: Focus on "how" not just "what"
2. **Include examples**: Show actual code from the project
3. **Link related docs**: Cross-reference other documentation
4. **Update this README**: Add your doc to the index above
5. **Keep it current**: Update docs when code changes

### Documentation Standards
- Use markdown format
- Include code examples with syntax highlighting
- Add "Use this when" sections for guidance
- Include troubleshooting tips
- Link to specific files in the codebase

## 🆘 Need Help?

### Common Questions

**Q: Where do I start implementing feature X?**  
A: Check [Implementation Tasks](./implementation-tasks.md) for task breakdown and dependencies

**Q: How do I query the database securely?**  
A: Read [Row Level Security](./row-level-security.md) and always use `withRLS()` wrapper

**Q: What are all the API endpoints?**  
A: See [Quick Reference](./quick-reference.md) § API Endpoints

**Q: How does authentication work?**  
A: Full details in [Authentication Strategy](./authentication-strategy.md)

**Q: What tables exist in the database?**  
A: Complete schema in [Database Schema](./database-schema.md)

### Getting Unstuck

1. Check [Quick Reference](./quick-reference.md) § Troubleshooting
2. Review relevant architecture doc (DB, Auth, RLS)
3. Check `plans/component-specs.md` for feature requirements
4. Look at existing code in similar components
5. Run tests to verify expected behavior

## 📅 Document Version History

- **2025-11-21**: Initial documentation creation
  - Database schema documentation
  - Authentication strategy documentation
  - Row Level Security implementation guide
  - Implementation tasks breakdown
  - Quick reference guide

---

**Note**: This documentation is living and should be updated as the project evolves. When implementing new features or changing architecture, update the relevant docs first, then code.
