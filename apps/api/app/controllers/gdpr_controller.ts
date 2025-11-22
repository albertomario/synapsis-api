import type { HttpContext } from '@adonisjs/core/http'

export default class GdprController {
  async export({ response }: HttpContext) {
    response.header('content-type', 'application/zip')
    return response.ok('')
  }
}
