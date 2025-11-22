import type { HttpContext } from '@adonisjs/core/http'

export default class FeedController {
  async timeline({ response }: HttpContext) {
    return response.ok({
      data: [],
      meta: {
        cursor: null,
      },
    })
  }
}
