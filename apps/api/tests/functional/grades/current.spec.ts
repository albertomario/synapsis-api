import { test } from '@japa/runner'
import User from '#models/user'

test.group('Grades current', () => {
  test('get current grades dashboard', async ({ client }) => {
    const user = await User.query().where('userType', 'student').firstOrFail()
    const token = await User.accessTokens.create(user, ['*'])

    const response = await client.get('/api/v1/grades/current').bearerToken(token.value!.release())

    response.assertStatus(200)
    response.assertBodyContains({
      calculation_basis: 'Weighted average: Exams 60%, Homework 40%',
      grades: [], // Expecting array
    })
  })
})
