import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { loginValidator, registerValidator } from '#validators/auth'
import { DateTime } from 'luxon'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await registerValidator.validate(request.all())

    // Check email uniqueness
    const existingEmail = await User.query().where('email', payload.email).first()
    if (existingEmail) {
      return response.unprocessableEntity({
        errors: [{ field: 'email', message: 'Email already exists' }],
      })
    }

    // Check handle uniqueness
    const existingHandle = await User.query().where('handle', payload.handle).first()
    if (existingHandle) {
      return response.unprocessableEntity({
        errors: [{ field: 'handle', message: 'Handle already exists' }],
      })
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
      return response.badRequest({ message: 'Invalid credentials' })
    }

    const valid = await hash.verify(user.passwordHash, password)

    if (!valid) {
      return response.badRequest({ message: 'Invalid credentials' })
    }

    const token = await User.accessTokens.create(user)

    return response.ok({ token })
  }
}
