/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const FeedController = () => import('#controllers/feed_controller')
const AssignmentsController = () => import('#controllers/assignments_controller')
const GradebookController = () => import('#controllers/gradebook_controller')
const GdprController = () => import('#controllers/gdpr_controller')

router.get('/', async () => 'It works!')

// Auth routes
router.post('/auth/register', [AuthController, 'register'])
router.post('/auth/login', [AuthController, 'login'])

// Protected API routes
router
  .group(() => {
    router.get('/feed/timeline', [FeedController, 'timeline'])
    router.post('/assignments/:id/complete', [AssignmentsController, 'complete'])
    router.get('/grades/current', [GradebookController, 'dashboard'])
    router.post('/gdpr/export', [GdprController, 'export'])
  })
  .prefix('/api/v1')
  .use(middleware.auth({ guards: ['api'] }))
