# Backlog.md Quick Commands

Quick reference for common Backlog.md operations in this project.

## View Tasks

```bash
# Terminal Kanban board (interactive)
backlog board

# Web interface (recommended for visual work)
backlog browser

# List all tasks
backlog task list

# List tasks by status
backlog task list --status "To Do"
backlog task list --status "In Progress"

# List subtasks of a parent
backlog task list --parent 1

# View specific task details
backlog task 1
backlog task 1.11

# View task in plain text (good for AI)
backlog task 1.11 --plain
```

## Work on Tasks

```bash
# Start working on a task
backlog task edit 1.11 --status "In Progress"

# Add yourself as assignee
backlog task edit 1.11 -a @yourusername

# Add notes about progress
backlog task edit 1.11 --append-notes "Implemented basic RLSQueryBuilder class"

# Add acceptance criteria
backlog task edit 1.11 --ac "All RLS rules must be tested"

# Check off acceptance criteria
backlog task edit 1.11 --check-ac 1

# Mark task as done
backlog task edit 1.11 --status "Done"
```

## Create New Tasks

```bash
# Simple task
backlog task create "Fix login bug"

# Task with full details
backlog task create "Implement OAuth provider" \
  --desc "Add Google OAuth support for authentication" \
  --status "To Do" \
  --priority high \
  -l auth,oauth,backend

# Create subtask under parent
backlog task create -p 1 "Setup OAuth credentials"

# Create with dependencies
backlog task create "Deploy to production" --dep task-4.4,task-4.5
```

## Search & Filter

```bash
# Fuzzy search
backlog search "auth"

# Search with filters
backlog search "rls" --status "To Do"
backlog search "test" --priority high

# Search by labels (list tasks with label)
backlog task list | grep "rls"
```

## Board Management

```bash
# Export board to markdown
backlog board export

# Export to custom file
backlog board export docs/current-status.md

# Export with version tag
backlog board export --export-version "Sprint 1"
```

## Configuration

```bash
# View all config
backlog config list

# View specific setting
backlog config get autoCommit

# Set default editor
backlog config set defaultEditor "code --wait"

# Change web UI port
backlog config set defaultPort 8080
```

## Phase-Based Workflow

Our project is organized into 4 phases:

### Phase 1: Foundation (task-1)
```bash
# List Phase 1 tasks
backlog task list --parent 1

# Work on RLS service
backlog task edit 1.11 -s "In Progress"
```

### Phase 2: Backend API (task-2)
```bash
# List Phase 2 tasks
backlog task list --parent 2

# Work on grades module
backlog task edit 2.1 -s "In Progress"
```

### Phase 3: Frontend (task-3)
```bash
# List Phase 3 tasks
backlog task list --parent 3
```

### Phase 4: Testing & Polish (task-4)
```bash
# List Phase 4 tasks
backlog task list --parent 4

# Work on security audit
backlog task edit 4.4 -s "In Progress"
```

## Common Workflows

### Starting Your Day

```bash
# 1. View the board
backlog board

# 2. Pick a task and mark it in progress
backlog task edit 1.11 -s "In Progress"

# 3. Open in your editor (press 'E' in web UI)
backlog browser
```

### Completing a Task

```bash
# 1. Add final notes
backlog task edit 1.11 --append-notes "Completed all RLS rules with tests"

# 2. Check all acceptance criteria
backlog task edit 1.11 --check-ac 1 --check-ac 2

# 3. Mark as done
backlog task edit 1.11 -s "Done"

# 4. Export updated board
backlog board export
```

### Working with AI (GitHub Copilot)

```bash
# 1. View task details
backlog task 1.11 --plain

# 2. Copy task description and ask Copilot
# "Can you help implement task-1.11? Here are the requirements: [paste]"

# 3. As you work, update task with progress
backlog task edit 1.11 --append-notes "AI helped implement withRLS() wrapper"
```

## Tips

- **Use tab completion**: Install with `backlog completion install`
- **Task IDs**: Can use `1` instead of `task-1` for brevity
- **Press 'E' in web UI**: Opens task in your default editor
- **Multi-line notes**: Use `$'Line1\nLine2'` syntax in bash
- **Drag and drop**: Works in the web interface for status changes

## Integration with Git

Backlog.md tasks are tracked in Git. Commit task changes:

```bash
# Stage backlog changes
git add backlog/

# Commit with descriptive message
git commit -m "Update task-1.11: Completed RLS service implementation"

# Push to remote
git push
```

## Help

```bash
# Full help
backlog --help

# Command-specific help
backlog task --help
backlog board --help
```

## Next Steps

1. Run `backlog browser` to see the visual board
2. Pick a task from Phase 1 marked as "To Do"
3. Update its status to "In Progress"
4. Start coding!

---

📖 **Full documentation**: [docs/backlog-setup.md](./backlog-setup.md)
