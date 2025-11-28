import { test } from '@japa/runner'
import User from '#models/user'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'

test.group('Auth login', (_group) => {
  // Removed global delete

  test('login with valid credentials', async ({ client }) => {
    const email = `login_${Date.now()}@example.com`
    const password = 'password123'

    await User.create({
      email,
      passwordHash: await hash.make(password),
      fullName: 'Login User',
      handle: `loginuser_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.fromISO('2000-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    const response = await client.post('/auth/login').json({
      email,
      password,
      consent: true,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      type: 'bearer',
    })
    response.assert?.isString(response.body().value)
  })

  test('fail to login with invalid credentials', async ({ client }) => {
    const email = `login_fail_${Date.now()}@example.com`
    const password = 'password123'

    await User.create({
      email,
      passwordHash: await hash.make(password),
      fullName: 'Login User',
      handle: `loginuser_fail_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.fromISO('2000-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    const response = await client.post('/auth/login').json({
      email,
      password: 'wrongpassword',
      consent: true,
    })

    response.assertStatus(400)
    response.assertBodyContains({
      error: {
        code: 'INVALID_CREDENTIALS',
      },
    })
  })
})
