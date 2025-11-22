# Synapsis

A GDPR-compliant student information system designed with privacy-first principles and AI-native workflows.

## 📋 Task Management

This project uses **[Backlog.md](https://github.com/MrLesk/Backlog.md)** for task management. All tasks are managed as markdown files in the `backlog/` directory.

### Quick Commands

```bash
# View Kanban board in terminal
backlog board

# Open web interface (recommended)
backlog browser

# List all tasks
backlog task list

# View current board snapshot
cat backlog.md
```

📖 **[Full Backlog.md setup guide](./docs/backlog-setup.md)**

## 🚀 Quick Start

```bash
# Install dependencies
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
```

## 📚 Documentation

- **[Documentation Index](./docs/README.md)** - Complete documentation overview
- **[Backlog Setup](./docs/backlog-setup.md)** - Task management guide
- **[Implementation Tasks](./docs/implementation-tasks.md)** - Original task breakdown (reference)
- **[Database Schema](./docs/database-schema.md)** - Database design and migrations
- **[Authentication Strategy](./docs/authentication-strategy.md)** - Auth implementation
- **[Row Level Security](./docs/row-level-security.md)** - RLS patterns and usage
- **[Quick Reference](./docs/quick-reference.md)** - Essential commands and patterns

## 🏗️ Project Structure

```
snap-sis/
├── apps/
│   ├── api/           # AdonisJS backend
│   └── web/           # Next.js frontend
├── packages/
│   └── types/         # Shared TypeScript types
├── backlog/           # Task management (Backlog.md)
│   ├── tasks/         # Active tasks
│   ├── completed/     # Completed tasks
│   ├── docs/          # Project documentation
│   └── decisions/     # Architecture decisions
├── docs/              # Comprehensive documentation
├── backlog.md         # Current board snapshot
└── docker-compose.yml # PostgreSQL database
```

## 🎯 Current Status

**Phase 1**: Foundation & Infrastructure (In Progress)
- ✅ Database migrations created
- ✅ Authentication system implemented
- ✅ Models and controllers created
- 🔄 RLS service in progress
- 🔄 Testing in progress

View current status: `backlog board` or `backlog browser`

## 🤖 AI Integration

This project is optimized for AI-assisted development:

- **GitHub Copilot**: Use `@workspace` to reference tasks and documentation
- **Backlog.md MCP**: AI assistants can read and update tasks directly
- **Comprehensive docs**: All patterns and conventions documented for AI agents

## 🔒 Privacy & Compliance

- GDPR-compliant by design
- Row-Level Security (RLS) for data access control
- Parental consent tracking for minors
- Audit logging for all data access
- Data export and "right to be forgotten"

## 🛠️ Tech Stack

**Backend:**
- AdonisJS 6 (Node.js framework)
- PostgreSQL (database)
- VineJS (validation)
- Argon2 (password hashing)

**Frontend:**
- Next.js 15 (React framework)
- TanStack Query (data fetching)
- Framer Motion (animations)
- Tailwind CSS (styling)

**DevOps:**
- Docker & Docker Compose
- pnpm (package manager)
- Backlog.md (task management)

## 📄 License

[View License](./LICENSE)

---

**Getting Started**: Run `backlog browser` to see all available tasks and pick one to work on!
