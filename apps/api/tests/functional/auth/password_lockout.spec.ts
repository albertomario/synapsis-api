import { test } from '@japa/runner'
import User from '#models/user'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'

test.group('Auth - Password Validation', () => {
  test('reject password without uppercase letter', async ({ client }) => {
    const response = await client.post('/auth/register').json({
      email: `test_${Date.now()}@example.com`,
      password: 'weakpassword123!',
      password_confirmation: 'weakpassword123!',
      full_name: 'Test User',
      handle: `testuser_${Date.now()}`,
      user_type: 'student',
      date_of_birth: '2000-01-01',
      consent: true,
    })

    response.assertStatus(422)
  })

  test('reject password without number', async ({ client }) => {
    const response = await client.post('/auth/register').json({
      email: `test_${Date.now()}@example.com`,
      password: 'WeakPassword!',
      password_confirmation: 'WeakPassword!',
      full_name: 'Test User',
      handle: `testuser_${Date.now()}`,
      user_type: 'student',
      date_of_birth: '2000-01-01',
      consent: true,
    })

    response.assertStatus(422)
  })

  test('reject password without special character', async ({ client }) => {
    const response = await client.post('/auth/register').json({
      email: `test_${Date.now()}@example.com`,
      password: 'WeakPassword123',
      password_confirmation: 'WeakPassword123',
      full_name: 'Test User',
      handle: `testuser_${Date.now()}`,
      user_type: 'student',
      date_of_birth: '2000-01-01',
      consent: true,
    })

    response.assertStatus(422)
  })

  test('accept strong password', async ({ client }) => {
    const response = await client.post('/auth/register').json({
      email: `test_${Date.now()}@example.com`,
      password: 'Str0ng!Pass#2024',
      password_confirmation: 'Str0ng!Pass#2024',
      full_name: 'Test User',
      handle: `testuser_${Date.now()}`,
      user_type: 'student',
      date_of_birth: '2000-01-01',
      consent: true,
    })

    response.assertStatus(201)
  })
})

test.group('Auth - Account Lockout', () => {
  test('lock account after 5 failed attempts', async ({ client, assert }) => {
    const email = `lockout_${Date.now()}@example.com`
    const password = 'Correct!Pass#123'

    await User.create({
      email,
      passwordHash: await hash.make(password),
      fullName: 'Lockout Test',
      handle: `lockout_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.fromISO('2000-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await client.post('/auth/login').json({
        email,
        password: 'WrongPassword123!',
        consent: true,
      })
    }

    // Verify account is locked
    const response = await client.post('/auth/login').json({
      email,
      password,
      consent: true,
    })

    response.assertStatus(403)
    response.assertBodyContains({
      error: {
        code: 'ACCOUNT_LOCKED',
      },
    })
    assert.include(response.body().error.message.toLowerCase(), 'locked')
  })

  test('reset attempts on successful login', async ({ client, assert }) => {
    const email = `reset_${Date.now()}@example.com`
    const password = 'Correct!Pass#123'

    await User.create({
      email,
      passwordHash: await hash.make(password),
      fullName: 'Reset Test',
      handle: `reset_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.fromISO('2000-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    // 2 failed attempts
    await client.post('/auth/login').json({
      email,
      password: 'Wrong!',
      consent: true,
    })

    // Successful login
    await client.post('/auth/login').json({
      email,
      password,
      consent: true,
    })

    // Verify counter reset
    const user = await User.findByOrFail('email', email)
    assert.equal(user.failedLoginAttempts, 0)
  })
})
