import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'
import {
  AuthenticationException,
  GDPRConsentException,
  NotFoundException,
} from '#exceptions/app_exceptions'

/**
 * GDPR Guard Middleware
 *
 * Ensures users under 16 years old have valid parental consent
 * according to GDPR Article 8 requirements.
 *
 * This middleware should be applied to routes that require
 * parental consent for users under the age of digital consent (16).
 */
export default class GdprGuardMiddleware {
  /**
   * Check if user requires parental consent and if it's been granted
   */
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    if (!user) {
      throw new AuthenticationException('Authentication required')
    }

    // Load student profile if user is a student
    if (user.userType === 'student') {
      await user.load('student')

      const student = user.student

      if (!student) {
        throw new NotFoundException('Student profile')
      }

      // Check if parental consent is required
      if (student.requiresParentalConsent) {
        // Load parental consents
        await student.load('parentalConsents')

        const activeConsents = student.parentalConsents.filter((consent) => {
          // Check if consent is active (granted, not revoked, and not expired)
          return (
            consent.grantedAt !== null &&
            !consent.revokedAt &&
            (!consent.expiresAt || consent.expiresAt > DateTime.now())
          )
        })

        if (activeConsents.length === 0) {
          throw new GDPRConsentException(
            'User is under 16 years old and requires parental consent to access this resource'
          )
        }
      }
    }

    // Verify user has given data processing consent
    if (!user.dataProcessingConsent || !user.consentGivenAt) {
      throw new GDPRConsentException('Data processing consent required')
    }

    await next()
  }
}
