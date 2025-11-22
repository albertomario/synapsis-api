import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

/**
 * Base exception for all application-specific exceptions
 */
export class BaseAppException extends Exception {
  constructor(
    message: string,
    public code: string,
    status: number = 500
  ) {
    super(message, { status, code })
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      error: {
        code: this.code,
        message: error.message,
        status: error.status,
      },
    })
  }
}

/**
 * Exception thrown when validation fails
 */
export class ValidationException extends BaseAppException {
  constructor(
    message: string,
    public field?: string,
    public errors?: any[]
  ) {
    super(message, 'VALIDATION_ERROR', 422)
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      error: {
        code: this.code,
        message: error.message,
        status: error.status,
        field: this.field,
        errors: this.errors,
      },
    })
  }
}

/**
 * Exception thrown when a resource is not found
 */
export class NotFoundException extends BaseAppException {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 'NOT_FOUND', 404)
  }
}

/**
 * Exception thrown when authentication fails
 */
export class AuthenticationException extends BaseAppException {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_FAILED', 401)
  }
}

/**
 * Exception thrown when authorization fails
 */
export class AuthorizationException extends BaseAppException {
  constructor(message: string = 'You are not authorized to perform this action') {
    super(message, 'AUTHORIZATION_FAILED', 403)
  }
}

/**
 * Exception thrown when account is locked
 */
export class AccountLockedException extends BaseAppException {
  constructor(
    message: string,
    public lockedUntil?: string
  ) {
    super(message, 'ACCOUNT_LOCKED', 403)
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      error: {
        code: this.code,
        message: error.message,
        status: error.status,
        locked_until: this.lockedUntil,
      },
    })
  }
}

/**
 * Exception thrown when a resource already exists (duplicate)
 */
export class DuplicateResourceException extends BaseAppException {
  constructor(
    resource: string,
    public field: string,
    value: string
  ) {
    super(`${resource} with ${field} '${value}' already exists`, 'DUPLICATE_RESOURCE', 422)
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      error: {
        code: this.code,
        message: error.message,
        status: error.status,
        field: this.field,
      },
      errors: [
        {
          field: this.field,
          message: error.message,
        },
      ],
    })
  }
}

/**
 * Exception thrown when invalid credentials are provided
 */
export class InvalidCredentialsException extends BaseAppException {
  constructor(
    message: string = 'Invalid credentials provided',
    public attemptsRemaining?: number
  ) {
    super(message, 'INVALID_CREDENTIALS', 400)
  }

  async handle(error: this, ctx: HttpContext) {
    const response: any = {
      error: {
        code: this.code,
        message: error.message,
        status: error.status,
      },
    }

    if (this.attemptsRemaining !== undefined) {
      response.error.attempts_remaining = this.attemptsRemaining
    }

    ctx.response.status(error.status).send(response)
  }
}

/**
 * Exception thrown when GDPR consent is missing
 */
export class GDPRConsentException extends BaseAppException {
  constructor(message: string = 'GDPR consent is required') {
    super(message, 'GDPR_CONSENT_REQUIRED', 403)
  }
}

/**
 * Exception thrown when business logic constraint is violated
 */
export class BusinessLogicException extends BaseAppException {
  constructor(message: string, code: string = 'BUSINESS_LOGIC_ERROR') {
    super(message, code, 400)
  }
}
