import type { HttpContext } from '@adonisjs/core/http'

export default class GradebookController {
  async dashboard({ response }: HttpContext) {
    return response.ok({
      calculation_basis: 'Weighted average: Exams 60%, Homework 40%',
      grades: [],
    })
  }
}
