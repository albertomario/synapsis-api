import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import { errors as authErrors } from '@adonisjs/auth'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    /**
     * Check if error has a handle method (custom exceptions)
     * This must be checked before debug mode to allow custom exceptions to format their own response
     */
    if (
      error &&
      typeof error === 'object' &&
      'handle' in error &&
      typeof error.handle === 'function'
    ) {
      return super.handle(error, ctx)
    }

    /**
     * Handle VineJS validation errors
     */
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.status(422).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          status: 422,
        },
        errors: error.messages.map((message: { field: string; message: string; rule: string }) => ({
          field: message.field,
          message: message.message,
          rule: message.rule,
        })),
      })
    }

    /**
     * Handle AdonisJS auth errors
     */
    if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS) {
      return ctx.response.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          status: 401,
        },
      })
    }

    if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
      return ctx.response.status(401).send({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          status: 401,
        },
      })
    }

    /**
     * In debug mode, show detailed error information
     */
    if (this.debug && error instanceof Error) {
      return ctx.response.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
          status: 500,
          stack: error.stack?.split('\n'),
          name: error.name,
        },
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    /**
     * Log detailed validation errors
     */
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      ctx.logger.error({
        message: 'Validation failure',
        url: ctx.request.url(),
        method: ctx.request.method(),
        validationErrors: error.messages,
        requestBody: ctx.request.all(),
      })
      return
    }

    /**
     * Log detailed error information in development
     */
    if (!app.inProduction && error instanceof Error) {
      ctx.logger.error({
        message: error.message,
        stack: error.stack,
        url: ctx.request.url(),
        method: ctx.request.method(),
      })
    }

    return super.report(error, ctx)
  }
}
