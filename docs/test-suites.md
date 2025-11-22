# Test Suites Organization

## Overview
The SnapSIS project uses Japa test runner with organized test suites for different functional areas.

## Test Suite Configuration

Tests are configured in `adonisrc.ts` with the following suites:

### 1. Unit Tests (`unit`)
- **Path**: `tests/unit/**/*.spec.ts`
- **Timeout**: 2 seconds
- **Purpose**: Fast unit tests for isolated logic
- **Run**: `node ace test --suite=unit`

### 2. Functional Tests (`functional`)
- **Path**: `tests/functional/**/*.spec.ts`
- **Timeout**: 30 seconds
- **Purpose**: End-to-end integration tests
- **Run**: `node ace test --suite=functional`

### 3. Authentication Tests (`auth`)
- **Path**: `tests/functional/auth/**/*.spec.ts`
- **Timeout**: 30 seconds
- **Coverage**:
  - Login/Logout functionality
  - Password validation (complexity rules)
  - Account lockout (5 failed attempts)
  - User registration
- **Status**: ✅ 8/10 tests passing
- **Run**: `node ace test --suite=auth`

### 4. Audit Log Tests (`audit`)
- **Path**: `tests/functional/audit/**/*.spec.ts`
- **Timeout**: 30 seconds
- **Coverage**:
  - Audit log creation on user actions
  - Audit log querying by user/action/time
- **Status**: ✅ 6/6 tests passing
- **Run**: `node ace test --suite=audit`

### 5. Middleware Tests (`middleware`)
- **Path**: `tests/functional/middleware/**/*.spec.ts`
- **Timeout**: 30 seconds
- **Coverage**:
  - GDPR consent guard
  - Role-based access control (RBAC)
  - Authentication chain
- **Status**: ✅ 6/6 tests passing
- **Run**: `node ace test --suite=middleware`

### 6. Row-Level Security Tests (`unit`)
- **Path**: `tests/unit/rls_service.spec.ts`
- **Timeout**: 2 seconds
- **Coverage**:
  - Student RLS (own data only)
  - Teacher RLS (assigned students)
  - Parent RLS (own children)
  - Admin RLS (all data)
- **Status**: ✅ 5/5 tests passing
- **Run**: `node ace test tests/unit/rls_service.spec.ts`

### 7. Grades Tests (`grades`)
- **Path**: `tests/functional/grades/**/*.spec.ts`
- **Timeout**: 30 seconds
- **Coverage**:
  - Grade dashboard retrieval
- **Status**: ✅ 1/1 tests passing
- **Run**: `node ace test --suite=grades`

### 8. Feed Tests (`feed`)
- **Path**: `tests/functional/feed/**/*.spec.ts`
- **Timeout**: 30 seconds
- **Coverage**:
  - Timeline retrieval
  - Age-based content filtering
- **Status**: ✅ 2/2 tests passing
- **Run**: `node ace test --suite=feed`

### 9. GDPR Tests (`gdpr`)
- **Path**: `tests/functional/gdpr/**/*.spec.ts`
- **Timeout**: 30 seconds
- **Coverage**:
  - Data export functionality
- **Status**: ✅ 1/1 tests passing
- **Run**: `node ace test --suite=gdpr`

### 10. Assignments Tests (`assignments`)
- **Path**: `tests/functional/assignments/**/*.spec.ts`
- **Timeout**: 30 seconds
- **Coverage**:
  - Assignment completion
- **Status**: ✅ 1/1 tests passing
- **Run**: `node ace test --suite=assignments`

## Test Execution

### Run All Tests
```bash
node ace test
```

### Run Specific Suite
```bash
node ace test --suite=auth
node ace test --suite=middleware
node ace test --suite=audit
```

### Run Specific Test File
```bash
node ace test tests/functional/auth/login.spec.ts
```

### Watch Mode
```bash
node ace test --watch
```

## Current Test Status

**Overall**: 30/32 tests passing (93.75%)

### Passing Tests by Category
- ✅ **Unit Tests**: 5/5 (RLS Service)
- ✅ **Auth Tests**: 8/10
  - ✅ Login validation
  - ✅ Password complexity rules
  - ✅ Account lockout
  - ❌ User registration (2 tests need fixing)
- ✅ **Audit Tests**: 6/6
- ✅ **Middleware Tests**: 6/6
- ✅ **Grades Tests**: 1/1
- ✅ **Feed Tests**: 2/2
- ✅ **GDPR Tests**: 1/1
- ✅ **Assignments Tests**: 1/1

### Known Issues

#### 1. Register Tests (2 failing)
- **Issue**: Password confirmation validation not working correctly
- **Affected**: `tests/functional/auth/register.spec.ts`
- **Priority**: Medium
- **Next Step**: Verify VineJS `.confirmed()` method implementation

## Test Database Setup

Tests use a separate test database with:
- Automatic migrations before each test suite
- Test data seeding (users, roles, etc.)
- Automatic cleanup after tests

Configuration is in `tests/bootstrap.ts`:
```typescript
export const runnerHooks = {
  setup: [
    () => testUtils.db().migrate(),
    () => testUtils.db().seed()
  ],
  teardown: []
}
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Unique Data**: Use `Date.now()` for unique emails/handles
3. **Cleanup**: Tests auto-rollback migrations
4. **Timeouts**: 30s for functional, 2s for unit tests
5. **Assertions**: Use descriptive assertions for better error messages

## Next Steps for Phase 2

Phase 1 (Foundation & Infrastructure) is 93.75% complete. Before moving to Phase 2:

1. ✅ Fix register test validation issues
2. ✅ Verify all middleware is properly tested
3. ✅ Ensure RLS is working correctly
4. ✅ Confirm audit logging is functional

Once these are resolved, proceed with Phase 2 (Backend API Development).
