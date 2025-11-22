import { test } from '@japa/runner'
import User from '#models/user'

test.group('Feed timeline', () => {
  test('get timeline items', async ({ client }) => {
    const user = await User.query().where('userType', 'student').firstOrFail()
    const token = await User.accessTokens.create(user, ['server:read', 'server:write'])

    const response = await client.get('/api/v1/feed/timeline').bearerToken(token.value!.release())

    if (response.status() !== 200) {
      console.log('Response body:', response.body())
    }
    response.assertStatus(200)
    response.assertBodyContains({
      data: [],
      meta: {
        cursor: null,
      },
    })
  })

  test('filter external links for young students', async ({ client }) => {
    // Assuming we have a young student in seeds or create one
    const { DateTime } = await import('luxon')
    const user = await User.create({
      email: 'young@example.com',
      passwordHash: 'hashed_password',
      fullName: 'Young Student',
      handle: 'young',
      userType: 'student',
      dateOfBirth: DateTime.now().minus({ years: 13 }),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })
    const token = await User.accessTokens.create(user, ['*'])

    const response = await client.get('/api/v1/feed/timeline').bearerToken(token.value!.release())

    response.assertStatus(200)
    // Assert filtering logic when implemented
  })
})
