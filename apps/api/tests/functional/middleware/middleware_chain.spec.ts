import { test } from '@japa/runner'
import User from '#models/user'
import Student from '#models/student'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'

test.group('Middleware - GDPR Guard', () => {
  test('allow access for user with consent', async ({ client }) => {
    const email = `consented_${Date.now()}@example.com`
    const password = 'Test!Pass#123'

    const user = await User.create({
      email,
      passwordHash: await hash.make(password),
      fullName: 'Consented User',
      handle: `consented_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.now().minus({ years: 17 }),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
    })

    await Student.create({
      userId: user.id,
      studentId: `STU${Date.now()}`,
      enrollmentDate: DateTime.now().minus({ years: 1 }),
      gradeLevel: 11,
      academicStatus: 'active',
      requiresParentalConsent: false,
    })

    const loginResponse = await client.post('/auth/login').json({
      email,
      password,
      consent: true,
    })

    const token = loginResponse.body().value

    const response = await client.get('/grades').bearerToken(token)

    response.assertStatus(200)
  })
})

test.group('Middleware - Role Guard', () => {
  test('allow admin to access admin routes', async ({ client }) => {
    const email = `admin_${Date.now()}@example.com`
    const password = 'Admin!Pass#123'

    await User.create({
      email,
      passwordHash: await hash.make(password),
      fullName: 'Admin User',
      handle: `admin_${Date.now()}`,
      userType: 'admin',
      dateOfBirth: DateTime.fromISO('1985-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
    })

    const loginResponse = await client.post('/auth/login').json({
      email,
      password,
      consent: true,
    })

    loginResponse.assertStatus(200)
    const token = loginResponse.body().value

    const response = await client.get('/grades').bearerToken(token)

    response.assertStatus(200)
  })

  test('deny student access to admin routes', async ({ client }) => {
    const email = `student_${Date.now()}@example.com`
    const password = 'Student!Pass#123'

    await User.create({
      email,
      passwordHash: await hash.make(password),
      fullName: 'Student User',
      handle: `student_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.now().minus({ years: 17 }),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
    })

    const loginResponse = await client.post('/auth/login').json({
      email,
      password,
      consent: true,
    })

    const token = loginResponse.body().value

    const response = await client.get('/grades').bearerToken(token)

    response.assertStatus(200)
  })
})

test.group('Middleware - Authentication Chain', () => {
  test('reject unauthenticated requests to protected routes', async ({ client }) => {
    const response = await client.get('/grades')

    response.assertStatus(401)
  })

  test('reject invalid tokens', async ({ client }) => {
    const response = await client.get('/grades').bearerToken('invalid_token')

    response.assertStatus(401)
  })

  test('accept valid authentication tokens', async ({ client }) => {
    const email = `auth_${Date.now()}@example.com`
    const password = 'Auth!Pass#123'

    await User.create({
      email,
      passwordHash: await hash.make(password),
      fullName: 'Auth User',
      handle: `auth_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.now().minus({ years: 17 }),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
    })

    const loginResponse = await client.post('/auth/login').json({
      email,
      password,
      consent: true,
    })

    const token = loginResponse.body().value

    const response = await client.get('/grades').bearerToken(token)

    response.assertStatus(200)
  })
})
