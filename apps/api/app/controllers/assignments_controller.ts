import type { HttpContext } from '@adonisjs/core/http'

export default class AssignmentsController {
  async complete({ response }: HttpContext) {
    return response.ok({ status: 'completed' })
  }
}
