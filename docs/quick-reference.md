# Synapsis - Quick Reference

## Essential Commands

### Package Management
```bash
pnpm install              # Install all dependencies
pnpm add <package>        # Add to current workspace
pnpm add -w <package>     # Add to workspace root
pnpm -r dev               # Run dev in all workspaces
```

### Backend (AdonisJS)
```bash
cd apps/api

# Development
pnpm dev                  # Start dev server with HMR (port 3333)
node ace serve --hmr      # Alternative dev command

# Database
node ace migration:run    # Run pending migrations
node ace migration:rollback # Rollback last batch
node ace migration:status # Check migration status
node ace db:seed          # Run seeders

# Generate Files
node ace make:controller <Name>
node ace make:model <Name>
node ace make:migration <description>
node ace make:seeder <Name>
node ace make:middleware <Name>
node ace make:validator <Name>

# Testing
node ace test             # Run all tests
node ace test --files=tests/unit/auth.spec.ts # Run specific test

# Build
pnpm build                # Production build
node ace build            # Alternative build command
```

### Frontend (Next.js)
```bash
cd apps/web

pnpm dev                  # Start dev server (port 3000)
pnpm build                # Production build
pnpm start                # Start production server
pnpm lint                 # Run ESLint
```

### Database (Docker)
```bash
cd synapsis

docker-compose up -d      # Start PostgreSQL
docker-compose down       # Stop PostgreSQL
docker-compose logs -f postgres # View logs

# Direct PostgreSQL access
docker exec -it synapsis-postgres-1 psql -U root -d app
```

## Project Structure

```
synapsis/
├── apps/
│   ├── api/                    # AdonisJS backend (port 3333)
│   │   ├── app/
│   │   │   ├── controllers/   # HTTP request handlers
│   │   │   ├── models/        # Lucid ORM models
│   │   │   ├── middleware/    # Auth, GDPR guards
│   │   │   ├── services/      # Business logic (RLS, GDPR)
│   │   │   └── validators/    # VineJS validation schemas
│   │   ├── config/            # App configuration
│   │   ├── database/
│   │   │   ├── migrations/    # Schema migrations
│   │   │   └── seeders/       # Test data
│   │   └── start/
│   │       ├── routes.ts      # API route definitions
│   │       └── kernel.ts      # Middleware registration
│   │
│   └── web/                   # Next.js frontend (port 3000)
│       ├── app/               # App router pages
│       ├── components/        # React components
│       │   ├── auth/          # BiometricLogin
│       │   ├── feed/          # StoryFeed, AssignmentCard
│       │   ├── metrics/       # GradeHologram
│       │   ├── vault/         # IdentityVault
│       │   └── layout/        # PrivacyLayout
│       ├── contexts/          # React contexts (Auth, Privacy)
│       ├── hooks/             # Custom hooks (useSynapsisQuery)
│       └── lib/               # Utilities, API client
│
├── packages/
│   └── types/                 # Shared TypeScript interfaces
│       └── src/
│           ├── user.ts        # UserDTO
│           ├── grade.ts       # GradeDTO
│           ├── assignment.ts  # AssignmentDTO
│           └── index.ts       # Exports
│
└── docs/                      # Documentation
    ├── database-schema.md
    ├── authentication-strategy.md
    ├── row-level-security.md
    └── implementation-tasks.md
```

## API Endpoints (Port 3333)

### Authentication
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/logout` - Logout and revoke token
- `GET /api/v1/auth/me` - Get current user

### Grades
- `GET /api/v1/grades` - List grades (RLS filtered)
- `GET /api/v1/grades/:id` - Get single grade
- `GET /api/v1/grades/current` - Dashboard with trends
- `POST /api/v1/grades` - Create grade (teachers only)

### Assignments
- `GET /api/v1/assignments` - List assignments
- `GET /api/v1/assignments/:id` - Get single assignment
- `POST /api/v1/assignments` - Create assignment (teachers)
- `POST /api/v1/assignments/:id/complete` - Mark assignment done
- `POST /api/v1/assignments/:id/submit` - Submit assignment

### Feed
- `GET /api/v1/feed/timeline` - Get timeline (announcements + assignments)

### Announcements
- `GET /api/v1/announcements` - List announcements
- `POST /api/v1/announcements` - Create announcement (teachers)

### GDPR / Vault
- `POST /api/v1/gdpr/export` - Export user data (JSON zip)
- `PATCH /api/v1/gdpr/preferences` - Update privacy settings
- `POST /api/v1/gdpr/schedule-delete` - Schedule account deletion

## Environment Variables

### Backend (.env in apps/api)
```bash
NODE_ENV=development
PORT=3333
APP_KEY=<generate-with-node-ace-generate:key>
HOST=0.0.0.0
LOG_LEVEL=info

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=app
```

### Frontend (.env.local in apps/web)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## Import Patterns

### Backend (Subpath Imports)
```typescript
// ✅ CORRECT
import User from '#models/user'
import { withRLS } from '#services/db_service'
import AuthController from '#controllers/auth_controller'
import { LoginValidator } from '#validators/login_validator'

// ❌ WRONG
import User from '../../app/models/user'
```

### Frontend (Shared Types)
```typescript
// ✅ CORRECT
import type { GradeResponse, UserDTO } from '@synapsis/types'

// ❌ WRONG
import { Grade } from '../../../apps/api/app/models/grade' // Never import models!
```

## Common Patterns

### Backend: Protected Route with RLS
```typescript
// start/routes.ts
import router from '@adonisjs/core/services/router'

router.group(() => {
  router.get('/grades', [GradesController, 'index'])
})
.prefix('/api/v1')
.use(middleware.auth())

// controllers/grades_controller.ts
import { withRLS } from '#services/db_service'

async index({ auth }: HttpContext) {
  const grades = await withRLS(auth.user!)
    .from('grades')
    .select('*')
  
  return grades
}
```

### Frontend: API Call with Auth
```tsx
// Using custom hook
import { useSynapsisQuery } from '@/hooks/useSynapsisQuery'

function GradesList() {
  const { data, isLoading } = useSynapsisQuery('/api/v1/grades')
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>{data.map(grade => ...)}</div>
}
```

### Privacy Mode (Blur Sensitive Data)
```tsx
import { usePrivacyContext } from '@/contexts/PrivacyContext'

function GradeCard({ grade }) {
  const { isPrivacyMode } = usePrivacyContext()
  
  return (
    <div className={isPrivacyMode ? 'blur-lg' : ''}>
      Score: {grade.score}
    </div>
  )
}
```

## Troubleshooting

### Database connection failed
```bash
# Check if PostgreSQL is running
docker ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs -f postgres
```

### Migration errors
```bash
# Check migration status
node ace migration:status

# Rollback and re-run
node ace migration:rollback
node ace migration:run

# Fresh start (WARNING: deletes all data)
node ace migration:refresh
```

### TypeScript errors in imports
```bash
# Rebuild types package
cd packages/types
pnpm build

# Clear Next.js cache
cd apps/web
rm -rf .next
pnpm dev
```

### RLS not working (seeing wrong data)
- Ensure you're using `withRLS(auth.user!)` wrapper
- Check if user profile (student/teacher) is loaded
- Verify middleware chain includes `auth()`
- Check database for `visible_to_student` / `visible_to_parents` flags

### Auth token issues
```bash
# Clear browser cookies
# In browser console:
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
});
```

## Testing

### Backend Tests
```bash
cd apps/api

# Run all tests
node ace test

# Run specific suite
node ace test --suite=unit
node ace test --suite=functional

# Run specific file
node ace test --files=tests/unit/auth.spec.ts

# Watch mode
node ace test --watch
```

### Frontend Tests
```bash
cd apps/web

# Run Jest tests
pnpm test

# Run Playwright E2E
pnpm test:e2e
```

## Performance Tips

- Add database indexes for RLS columns (`student_id`, `teacher_id`)
- Use `.noAudit()` for non-sensitive aggregate queries
- Cache frequently accessed data with TanStack Query
- Optimize images with Next.js Image component
- Use `select()` to limit returned columns
- Implement pagination for large datasets

## Security Reminders

- ⚠️ **NEVER** log PII (emails, names, grades) to console
- ⚠️ **ALWAYS** use `withRLS()` wrapper for queries
- ⚠️ **ALWAYS** validate input with VineJS/Zod
- ⚠️ **ALWAYS** check parental consent for users <16
- ⚠️ Use HttpOnly cookies for tokens (not LocalStorage)
- ⚠️ Include `calculation_basis` for computed values
- ⚠️ Sanitize user input before database insertion

## Need Help?

- **Architecture**: Read `.github/copilot-instructions.md`
- **Database**: Check `docs/database-schema.md`
- **Auth**: See `docs/authentication-strategy.md`
- **RLS**: Review `docs/row-level-security.md`
- **Tasks**: Follow `docs/implementation-tasks.md`
- **Planning**: See `plans/component-specs.md`
