import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { loginValidator, registerValidator } from '#validators/auth'
import { DateTime } from 'luxon'
import {
  DuplicateResourceException,
  InvalidCredentialsException,
  AccountLockedException,
} from '#exceptions/app_exceptions'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await registerValidator.validate(request.all())

    // Check email uniqueness
    const existingEmail = await User.query().where('email', payload.email).first()
    if (existingEmail) {
      throw new DuplicateResourceException('User', 'email', payload.email)
    }

    // Check handle uniqueness
    const existingHandle = await User.query().where('handle', payload.handle).first()
    if (existingHandle) {
      throw new DuplicateResourceException('User', 'handle', payload.handle)
    }

    const user = await User.create({
      email: payload.email,
      passwordHash: await hash.make(payload.password),
      fullName: payload.full_name,
      handle: payload.handle,
      userType: payload.user_type,
      dateOfBirth: DateTime.fromJSDate(payload.date_of_birth),
      dataProcessingConsent: payload.consent,
      consentGivenAt: payload.consent ? DateTime.now() : null,
    })

    return response.created({
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
      },
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await loginValidator.validate(request.all())

    const user = await User.query().where('email', email).first()

    if (!user) {
      throw new InvalidCredentialsException('Invalid credentials')
    }

    // Check if account is locked
    if (user.accountLockedUntil) {
      const now = DateTime.now()
      if (user.accountLockedUntil > now) {
        const minutesRemaining = Math.ceil(user.accountLockedUntil.diff(now, 'minutes').minutes)
        throw new AccountLockedException(
          `Account locked due to too many failed login attempts. Try again in ${minutesRemaining} minute(s).`,
          user.accountLockedUntil.toISO()
        )
      } else {
        // Lock expired, reset attempts
        user.failedLoginAttempts = 0
        user.accountLockedUntil = null
        await user.save()
      }
    }

    const valid = await hash.verify(user.passwordHash, password)

    if (!valid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1

      // Lock account after 5 failed attempts (15 minute lockout)
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = DateTime.now().plus({ minutes: 15 })
        await user.save()

        throw new AccountLockedException(
          'Account locked due to too many failed login attempts. Try again in 15 minutes.',
          user.accountLockedUntil.toISO()
        )
      }

      await user.save()

      const attemptsRemaining = 5 - user.failedLoginAttempts
      throw new InvalidCredentialsException('Invalid credentials', attemptsRemaining)
    }

    // Successful login - reset failed attempts
    user.failedLoginAttempts = 0
    user.accountLockedUntil = null
    user.lastLoginAt = DateTime.now()
    await user.save()

    const token = await User.accessTokens.create(user)

    return response.ok({
      type: 'bearer',
      value: token.value!.release(),
    })
  }
}
