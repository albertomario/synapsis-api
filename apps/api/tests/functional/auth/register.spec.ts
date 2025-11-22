import { test } from '@japa/runner'
import User from '#models/user'
import { DateTime } from 'luxon'

test.group('Auth register', (group) => {
  // Removed global delete to preserve seeds

  test('register a new user', async ({ client }) => {
    const email = `newuser_${Date.now()}@example.com`
    const handle = `newuser_${Date.now()}`

    const response = await client.post('/auth/register').json({
      email,
      password: 'password123',
      full_name: 'New User',
      handle,
      user_type: 'student',
      date_of_birth: '2000-01-01',
      consent: true,
    })

    response.assertStatus(201)
    response.assertBodyContains({
      user: {
        email,
        handle,
      },
    })
  })

  test('fail to register with existing email', async ({ client }) => {
    const email = `existing_${Date.now()}@example.com`
    const handle = `existing_${Date.now()}`

    await User.create({
      email,
      passwordHash: 'hashed_password', // No need to hash for this test check
      fullName: 'Existing User',
      handle,
      userType: 'student',
      dateOfBirth: DateTime.fromISO('2000-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    const response = await client.post('/auth/register').json({
      email,
      password: 'password123',
      full_name: 'New User',
      handle: `newhandle_${Date.now()}`,
      user_type: 'student',
      date_of_birth: '2000-01-01',
      consent: true,
    })

    response.assertStatus(422)
    // VineJS error structure
    response.assertBodyContains({
      errors: [{ field: 'email' }],
    })
  })
})
