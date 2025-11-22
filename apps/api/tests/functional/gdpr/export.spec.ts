import { test } from '@japa/runner'
import User from '#models/user'

test.group('Gdpr export', () => {
  test('export user data', async ({ client }) => {
    const user = await User.query().where('userType', 'student').firstOrFail()
    const token = await User.accessTokens.create(user, ['*'])

    const response = await client.post('/api/v1/gdpr/export').bearerToken(token.value!.release())

    response.assertStatus(200)
    response.assertHeader('content-type', 'application/zip')
  })
})
