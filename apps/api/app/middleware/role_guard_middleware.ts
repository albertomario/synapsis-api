import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { AuthenticationException, AuthorizationException } from '#exceptions/app_exceptions'

/**
 * Role Guard Middleware
 *
 * Implements Role-Based Access Control (RBAC) by checking if the
 * authenticated user has one of the allowed roles for a route.
 *
 * Usage in routes:
 * ```
 * router.get('/admin/dashboard', [AdminController, 'index'])
 *   .middleware([auth(), role(['admin'])])
 *
 * router.get('/grades', [GradesController, 'index'])
 *   .middleware([auth(), role(['student', 'teacher', 'parent'])])
 * ```
 */
export default class RoleGuardMiddleware {
  /**
   * The list of allowed roles for this route
   */
  private allowedRoles: string[] = []

  /**
   * Configure the middleware with allowed roles
   */
  constructor(allowedRoles?: string[]) {
    if (allowedRoles) {
      this.allowedRoles = allowedRoles
    }
  }

  /**
   * Check if user has one of the required roles
   */
  async handle(ctx: HttpContext, next: NextFn, options?: { roles?: string[] }) {
    const user = ctx.auth.user

    if (!user) {
      throw new AuthenticationException('Authentication required')
    }

    // Get roles from options or constructor
    const requiredRoles = options?.roles || this.allowedRoles

    if (requiredRoles.length === 0) {
      // No roles specified, allow access
      return await next()
    }

    // Check if user has one of the required roles
    if (!requiredRoles.includes(user.userType)) {
      throw new AuthorizationException(
        `This action requires one of the following roles: ${requiredRoles.join(', ')}`
      )
    }

    await next()
  }
}

/**
 * Helper function to create role middleware with specific roles
 *
 * Usage:
 * ```
 * import { role } from '#middleware/role_guard_middleware'
 *
 * router.get('/admin/dashboard', [AdminController, 'index'])
 *   .middleware([auth(), role(['admin'])])
 * ```
 */
export function role(allowedRoles: string[]) {
  return async (ctx: HttpContext, next: NextFn) => {
    const middleware = new RoleGuardMiddleware()
    return middleware.handle(ctx, next, { roles: allowedRoles })
  }
}
