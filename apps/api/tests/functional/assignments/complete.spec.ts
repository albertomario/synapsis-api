import { test } from '@japa/runner'
import User from '#models/user'

test.group('Assignments complete', () => {
  test('mark assignment as complete', async ({ client }) => {
    const user = await User.query().where('userType', 'student').firstOrFail()
    const token = await User.accessTokens.create(user, ['*'])
    // We need an assignment. Assuming seeds create some or we mock it.
    // For now, we'll assume ID 1 exists or fail.
    // Ideally we should create an assignment here, but we don't have the model yet?
    // The user said "Write tests first for all features that have to be implemented."
    // I should probably create the Assignment model and migration as part of the implementation,
    // but for now I'm writing the test.

    const response = await client
      .post('/api/v1/assignments/1/complete')
      .bearerToken(token.value!.release())

    // Expecting 404 if not implemented, or 200 if mocked.
    // Since we are writing tests FIRST, we expect this to fail or 404.
    // But I should write the assertion for success.
    response.assertStatus(200)
    response.assertBodyContains({
      status: 'completed',
    })
  })
})
