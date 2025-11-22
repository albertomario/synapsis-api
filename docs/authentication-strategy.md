# Authentication Strategy

## Overview

Snap SIS implements a **token-based authentication** system using AdonisJS v6's `@adonisjs/auth` package with support for:

- Standard email/password login
- WebAuthn biometric authentication (fingerprint, Face ID)
- HttpOnly cookies for web clients
- Bearer tokens for mobile/API clients
- Multi-factor authentication (MFA) for admin users
- Parental consent verification for minors (<16)

## Architecture

```
┌─────────────────┐
│  Next.js Client │
│   (apps/web)    │
└────────┬────────┘
         │ POST /api/v1/auth/login
         │ Cookie: snap_token (HttpOnly)
         ▼
┌─────────────────────────┐
│   AdonisJS API Gateway  │
│   (apps/api)            │
├─────────────────────────┤
│ AuthController          │
│ → validate credentials  │
│ → generate token        │
│ → set HttpOnly cookie   │
└────────┬────────────────┘
         │ SELECT * FROM access_tokens
         ▼
┌─────────────────────────┐
│   PostgreSQL Database   │
│   - users               │
│   - access_tokens       │
│   - parental_consents   │
└─────────────────────────┘
```

## Authentication Flows

### 1. Standard Login (Email + Password)

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "student@school.edu",
  "password": "SecurePassword123!",
  "remember_me": true,
  "consent": true // Required, must be explicitly checked
}
```

**Response** (Success):
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "student@school.edu",
    "full_name": "Alex Zhang",
    "handle": "@alex_z",
    "user_type": "student"
  },
  "token": {
    "type": "bearer",
    "token": "oat_xxx...xxx",
    "expires_at": "2025-12-21T10:00:00.000Z"
  }
}
```

**Cookie Set**: `snap_token=oat_xxx; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`

**Controller Implementation**:
```typescript
// apps/api/app/controllers/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { LoginValidator } from '#validators/login_validator'
import User from '#models/user'

export default class AuthController {
  async login({ request, response, auth }: HttpContext) {
    // 1. Validate input
    const { email, password, remember_me, consent } = await request.validateUsing(LoginValidator)
    
    // 2. Verify consent checkbox was checked
    if (!consent) {
      return response.badRequest({
        errors: [{ message: 'Data processing consent is required' }]
      })
    }
    
    // 3. Verify credentials
    const user = await User.verifyCredentials(email, password)
    
    // 4. Check account status
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      return response.forbidden({
        errors: [{ message: 'Account is temporarily locked. Try again later.' }]
      })
    }
    
    // 5. Generate token
    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: remember_me ? '7 days' : '24 hours',
      name: request.header('user-agent')
    })
    
    // 6. Update last login
    user.lastLoginAt = new Date()
    user.failedLoginAttempts = 0
    await user.save()
    
    // 7. Set HttpOnly cookie
    response.cookie('snap_token', token.value!.release(), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: remember_me ? 604800 : 86400 // seconds
    })
    
    // 8. Log successful login
    await AuditLog.create({
      userId: user.id,
      action: 'auth.login',
      ipAddress: request.ip(),
      userAgent: request.header('user-agent')
    })
    
    return {
      success: true,
      user: user.serialize(),
      token: token.toJSON()
    }
  }
}
```

### 2. Biometric Login (WebAuthn)

**Endpoint**: `POST /api/v1/auth/webauthn/authenticate`

**Flow**:
1. Client requests challenge: `POST /api/v1/auth/webauthn/challenge`
2. Browser prompts for biometric (Face ID, fingerprint)
3. Client sends credential: `POST /api/v1/auth/webauthn/authenticate`
4. Server verifies and issues token

**Implementation**:
```typescript
// apps/api/app/controllers/webauthn_controller.ts
import { verifyAuthenticationResponse } from '@simplewebauthn/server'

export default class WebAuthnController {
  async challenge({ auth, response }: HttpContext) {
    const challenge = generateChallenge() // Random 32 bytes
    
    // Store challenge in session/cache
    await redis.setex(`webauthn:${auth.user!.id}`, 300, challenge)
    
    return { challenge }
  }
  
  async authenticate({ request, response, auth }: HttpContext) {
    const { credentialId, authenticatorData, signature } = request.body()
    
    // 1. Retrieve stored challenge
    const challenge = await redis.get(`webauthn:${auth.user!.id}`)
    
    // 2. Verify WebAuthn response
    const verification = await verifyAuthenticationResponse({
      response: request.body(),
      expectedChallenge: challenge,
      expectedOrigin: 'https://snap.school',
      expectedRPID: 'snap.school'
    })
    
    if (!verification.verified) {
      return response.unauthorized({ errors: [{ message: 'Biometric authentication failed' }] })
    }
    
    // 3. Generate token (same as standard login)
    const token = await User.accessTokens.create(auth.user!)
    
    return { success: true, token: token.toJSON() }
  }
}
```

### 3. Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Controller**:
```typescript
async logout({ auth, response }: HttpContext) {
  // Revoke current token
  await User.accessTokens.delete(auth.user!, auth.user!.currentAccessToken.identifier)
  
  // Clear cookie
  response.clearCookie('snap_token')
  
  return { success: true }
}
```

## Authorization Guards

### 1. Standard Auth Guard
Protects routes requiring authentication.

```typescript
// apps/api/start/kernel.ts
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.group(() => {
  router.get('/profile', [ProfileController, 'show'])
  router.get('/grades', [GradesController, 'index'])
}).use(middleware.auth())
```

**Middleware**: `@adonisjs/auth` (built-in)

### 2. GDPR Guard (Parental Consent)
Verifies parental consent for users <16.

```typescript
// apps/api/app/middleware/gdpr_guard.ts
import type { HttpContext } from '@adonisjs/core/http'
import ParentalConsent from '#models/parental_consent'

export default class GdprGuard {
  async handle({ auth, request, response }: HttpContext, next: NextFn) {
    const user = auth.user!
    
    // Check if user is under 16
    const age = calculateAge(user.dateOfBirth)
    if (age < 16) {
      // Verify parental consent token
      const consentToken = request.header('X-Parent-Consent-Token')
      
      if (!consentToken) {
        return response.forbidden({
          errors: [{ message: 'Parental consent required for users under 16' }],
          code: 'PARENTAL_CONSENT_REQUIRED'
        })
      }
      
      // Validate consent token
      const consent = await ParentalConsent.query()
        .where('student_id', user.student!.id)
        .where('consent_token', consentToken)
        .where('consent_type', 'grades_view')
        .where('expires_at', '>', new Date())
        .whereNull('revoked_at')
        .first()
      
      if (!consent) {
        return response.forbidden({
          errors: [{ message: 'Invalid or expired parental consent' }],
          code: 'INVALID_CONSENT_TOKEN'
        })
      }
    }
    
    await next()
  }
}
```

**Usage**:
```typescript
router.get('/grades', [GradesController, 'index'])
  .use(middleware.auth())
  .use(middleware.gdprGuard()) // Applied after auth
```

### 3. Role-Based Access Control (RBAC)

```typescript
// apps/api/app/middleware/role_guard.ts
export default class RoleGuard {
  async handle({ auth, response }: HttpContext, next: NextFn, options: { roles: string[] }) {
    const user = auth.user!
    
    if (!options.roles.includes(user.userType)) {
      return response.forbidden({
        errors: [{ message: `Access denied. Required role: ${options.roles.join(' or ')}` }]
      })
    }
    
    await next()
  }
}
```

**Usage**:
```typescript
router.post('/announcements', [AnnouncementsController, 'create'])
  .use(middleware.auth())
  .use(middleware.roleGuard({ roles: ['teacher', 'admin'] }))
```

## Token Abilities (Scopes)

Access tokens can have limited abilities/scopes:

```typescript
// Full access
const token = await User.accessTokens.create(user, ['*'])

// Limited scopes
const token = await User.accessTokens.create(user, [
  'read:profile',
  'read:grades',
  'write:assignments'
])

// Check abilities in controller
if (!auth.user!.currentAccessToken.abilities.includes('write:profile')) {
  return response.forbidden({ errors: [{ message: 'Insufficient permissions' }] })
}
```

### Standard Abilities
- `read:profile` - View own profile
- `write:profile` - Edit own profile
- `read:grades` - View grades
- `read:assignments` - View assignments
- `write:assignments` - Submit assignments
- `read:announcements` - View teacher announcements
- `write:announcements` - Create announcements (teacher only)
- `gdpr:export` - Export personal data
- `gdpr:delete` - Request account deletion

### Parent View Scope
Parents have a special scope to view their child's data:

```typescript
const token = await User.accessTokens.create(parentUser, [
  'parent:view:grades',
  'parent:view:assignments'
], {
  meta: { student_id: childStudent.id }
})
```

## Password Security

### Hashing
Uses Argon2id (AdonisJS default):

```typescript
// config/hash.ts
import { defineConfig, drivers } from '@adonisjs/core/hash'

export default defineConfig({
  default: 'argon',
  
  list: {
    argon: drivers.argon2({
      version: 0x13, // Argon2id
      variant: 'id',
      iterations: 3,
      memory: 65536, // 64 MB
      parallelism: 4
    })
  }
})
```

### Password Requirements
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Validator**:
```typescript
// apps/api/app/validators/password_validator.ts
import vine from '@vinejs/vine'

export const passwordRule = vine.string()
  .minLength(12)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
```

### Failed Login Protection
- Lock account after 5 failed attempts
- Lockout duration: 15 minutes
- Reset counter on successful login

## Token Lifecycle

### Expiration
- Standard login: 24 hours
- "Remember me": 7 days
- Admin tokens: 4 hours
- Parent view tokens: 30 days

### Refresh (Future Enhancement)
Currently, users must re-login after expiration. Refresh tokens will be added in v2.

### Revocation
```typescript
// Revoke specific token
await User.accessTokens.delete(user, tokenIdentifier)

// Revoke all user tokens (force logout all devices)
await db.from('access_tokens')
  .where('tokenable_id', user.id)
  .delete()
```

## GDPR Compliance

### Consent Tracking
```typescript
// apps/api/app/controllers/auth_controller.ts
if (consent) {
  user.consentGivenAt = new Date()
  user.dataProcessingConsent = true
  await user.save()
}
```

### Data Portability
Users can download their authentication history:

```typescript
// Included in GDPR export
{
  "authentication": {
    "email_verified_at": "2024-09-15T10:00:00Z",
    "last_login_at": "2025-11-21T08:30:00Z",
    "active_sessions": 2,
    "login_history": [...] // From audit_logs
  }
}
```

## Frontend Integration

### Login Form (React)
```tsx
// apps/web/components/auth/BiometricLogin.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  remember_me: z.boolean(),
  consent: z.literal(true, { errorMap: () => ({ message: 'You must consent to continue' }) })
})

export function BiometricLogin() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema)
  })
  
  const onSubmit = async (data) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      credentials: 'include', // Send cookies
      body: JSON.stringify(data)
    })
    
    if (response.ok) {
      window.location.href = '/dashboard'
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" />
      <input {...register('password')} type="password" />
      <label>
        <input {...register('remember_me')} type="checkbox" />
        Remember me
      </label>
      <label>
        <input {...register('consent')} type="checkbox" />
        I consent to data processing for educational purposes
      </label>
      <button type="submit">Login</button>
    </form>
  )
}
```

### Auth Context
```tsx
// apps/web/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check if user is authenticated (cookie is sent automatically)
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .finally(() => setLoading(false))
  }, [])
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

## Security Checklist

- [x] Passwords hashed with Argon2id
- [x] HttpOnly cookies prevent XSS attacks
- [x] SameSite=Strict prevents CSRF
- [x] Failed login protection (account lockout)
- [x] Consent checkbox required (GDPR)
- [x] Audit logging for all auth events
- [x] Token expiration enforced
- [x] No PII in logs
- [ ] Rate limiting on login endpoint (TODO)
- [ ] Email verification required (TODO)
- [ ] MFA for admin users (TODO)
- [ ] IP-based geofencing (TODO)
