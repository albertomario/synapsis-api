# Backlog.md Setup Guide

## Overview

This project now uses [Backlog.md](https://github.com/MrLesk/Backlog.md) for task management. Backlog.md is a markdown-native task manager that works seamlessly with Git repositories and AI coding assistants like GitHub Copilot, Claude, and others.

## What is Backlog.md?

Backlog.md turns your repository into a self-contained project board powered by plain Markdown files. All tasks are stored in the `backlog/` directory as human-readable `.md` files, making them easy to track, version, and collaborate on.

### Key Features

- 📝 **Markdown-native tasks** - Every task is a plain `.md` file
- 🤖 **AI-Ready** - Works with Claude Code, Gemini CLI, GitHub Copilot, and other AI assistants via MCP (Model Context Protocol)
- 🔧 **MCP Integration** - AI assistants interact with tasks directly through MCP tools
- 📊 **Terminal Kanban** - `backlog board` displays a live board in your terminal
- 🌐 **Web Interface** - `backlog browser` launches a modern web UI
- 🔍 **Powerful search** - Fuzzy search across tasks, docs, and decisions
- 🔒 **100% private & offline** - Everything lives in your repository

## MCP Configuration

This project has Backlog.md configured in `.vscode/mcp.json`:

```json
{
  "servers": {
    "backlog": {
      "command": "backlog",
      "args": ["mcp", "start"],
      "type": "stdio",
      "cwd": "${workspaceFolder}/snap-sis"
    }
  }
}
```

### MCP Tools Available

**For AI Assistants (GitHub Copilot, Claude, etc.):**

- `mcp_backlog_task_list` - List and filter tasks
- `mcp_backlog_task_view` - View task details
- `mcp_backlog_task_search` - Search tasks
- `mcp_backlog_task_create` - Create new tasks
- `mcp_backlog_task_edit` - Update tasks
- `mcp_backlog_task_archive` - Archive tasks
- `mcp_backlog_get_workflow_overview` - Workflow guidance
- `mcp_backlog_document_*` - Manage documentation

AI assistants should use these MCP tools to interact with tasks rather than CLI commands.

## Installation

Backlog.md is already installed globally for this project. If you need to install it on another machine:

```bash
# Using npm
npm install -g backlog.md

# Using bun
bun add -g backlog.md

# Using Homebrew
brew install backlog-md
```

## Project Structure

```
snap-sis/
├── backlog/
│   ├── tasks/           # Active tasks
│   ├── completed/       # Completed tasks
│   ├── archive/         # Archived tasks
│   ├── drafts/          # Draft tasks
│   ├── docs/            # Project documentation
│   ├── decisions/       # Architecture decisions
│   └── config.yml       # Backlog configuration
├── backlog.md          # Exported board snapshot
└── docs/
    ├── implementation-tasks.md  # Original task list (reference)
    └── backlog-setup.md         # This file
```

## Quick Start

### View Your Tasks

```bash
# View Kanban board in terminal
backlog board

# Launch web interface (recommended)
backlog browser

# List all tasks
backlog task list

# View specific task
backlog task 1
```

### Create Tasks

```bash
# Create a simple task
backlog task create "Add user authentication"

# Create task with details
backlog task create "Implement OAuth" \
  --desc "Add OAuth 2.0 authentication support" \
  --status "To Do" \
  --priority high \
  -l auth,backend

# Create subtask
backlog task create -p 1 "Setup OAuth provider"
```

### Update Tasks

```bash
# Edit task status
backlog task edit 1 --status "In Progress"

# Assign task
backlog task edit 1 -a @username

# Add labels
backlog task edit 1 -l bug,urgent

# Add acceptance criteria
backlog task edit 1 --ac "Must handle errors gracefully"

# Append notes
backlog task edit 1 --append-notes "Fixed issue with token validation"
```

### Search Tasks

```bash
# Fuzzy search
backlog search "auth"

# Filter by status
backlog search "api" --status "In Progress"

# Filter by priority
backlog search "bug" --priority high
```

### Export Board

```bash
# Export to backlog.md
backlog board export

# Export to custom file
backlog board export project-status.md

# Export with version
backlog board export --export-version "v1.0.0"
```

## Task Organization

### Current Project Structure

The implementation tasks have been organized into 4 main phases:

1. **Phase 1: Foundation & Infrastructure** (task-1)
   - Database setup
   - Authentication system
   - Row Level Security (RLS)
   - Shared types package

2. **Phase 2: Backend API Development** (task-2)
   - Grades module
   - Assignments module
   - Feed module
   - GDPR module

3. **Phase 3: Frontend Development** (task-3)
   - Authentication UI
   - Layout & navigation
   - Feed module UI
   - Grades module UI
   - Vault module UI

4. **Phase 4: Testing & Polish** (task-4)
   - Backend testing
   - Frontend testing
   - Security audit
   - GDPR compliance
   - Deployment preparation

### Task Naming Convention

- Parent tasks: `task-1`, `task-2`, `task-3`, etc.
- Subtasks: `task-1.1`, `task-1.2`, `task-2.1`, etc.
- Tasks are stored as: `task-<id> - <title>.md`

## Working with AI Assistants

### MCP Integration

Backlog.md is already configured to work with AI assistants via MCP (Model Context Protocol). The MCP server is configured in the project root.

### GitHub Copilot Integration

GitHub Copilot can read and interact with your backlog through the MCP connector. Simply reference tasks in your conversations:

```
@workspace Can you implement task-1.11 (Create RLS service)?
```

### Best Practices with AI

1. **Be specific**: Reference task IDs when asking AI to implement features
2. **Update task status**: Mark tasks as "In Progress" when starting work
3. **Add notes**: Document decisions and progress in task notes
4. **Check acceptance criteria**: Ensure all ACs are met before marking done

## Configuration

View and modify project settings:

```bash
# View all configuration
backlog config list

# Set default editor
backlog config set defaultEditor "code --wait"

# Enable auto-commit (commits task changes automatically)
backlog config set autoCommit true

# Set web UI port
backlog config set defaultPort 6420
```

## Workflow Example

Here's a typical workflow for implementing a feature:

```bash
# 1. View available tasks
backlog board

# 2. Pick a task and mark it in progress
backlog task edit 1.11 --status "In Progress"

# 3. Implement the feature (with AI assistance if needed)
# Example: Ask GitHub Copilot to help implement the RLS service

# 4. Add notes about your progress
backlog task edit 1.11 --append-notes "Implemented withRLS() function with basic query builder"

# 5. Test your implementation
backlog task edit 1.11 --check-ac 1  # Mark acceptance criteria as complete

# 6. Mark task as done
backlog task edit 1.11 --status "Done"

# 7. Export updated board
backlog board export
```

## Tips & Tricks

### Keyboard Shortcuts (Web UI)

- `E` - Edit task in your default editor
- `ESC` - Close modals
- Drag and drop tasks between columns

### CLI Efficiency

```bash
# Use task aliases (plain numbers work)
backlog task edit 1 -s "Done"  # Same as task-1

# Chain operations
backlog task create "New feature" -s "In Progress" -l backend --priority high

# View task in plain text (good for AI)
backlog task 1 --plain
```

### Multi-line Input

```bash
# Use $'' syntax for newlines in bash/zsh
backlog task create "Feature" --desc $'Line 1\nLine 2\n\nParagraph 2'

# Or use printf
backlog task create "Feature" --desc "$(printf 'Line 1\nLine 2')"
```

## Maintenance

### Cleanup Completed Tasks

```bash
# Move old completed tasks to archive
backlog cleanup
```

### Update Agent Instructions

```bash
# Update AI agent instruction files
backlog agents --update-instructions
```

### Shell Completion

```bash
# Install tab completion for your shell
backlog completion install
```

## Integration with Existing Docs

The original `docs/implementation-tasks.md` file remains as a reference document. All active task management should now be done through Backlog.md. The key advantages:

- ✅ Tasks are version-controlled as individual files
- ✅ Easy to track task history with Git
- ✅ Better collaboration with team members
- ✅ AI assistants can directly interact with tasks
- ✅ Visual Kanban board and web UI
- ✅ Powerful search and filtering

## Support & Documentation

- **Official Documentation**: https://github.com/MrLesk/Backlog.md
- **CLI Reference**: Run `backlog --help`
- **Web UI**: Run `backlog browser` for visual task management

## Next Steps

1. Explore the web interface: `backlog browser`
2. Pick a task from Phase 1 to start implementing
3. Use GitHub Copilot with `@workspace` to reference tasks
4. Keep tasks updated as you make progress
5. Export board regularly to track project status

---

**Note**: All tasks from the original `implementation-tasks.md` have been migrated to Backlog.md. You can now manage your project using modern task management tools while keeping everything in markdown!
