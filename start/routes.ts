// start/routes.ts
import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import QuizzesController from '#controllers/quizzes_controller'
import QuestionsController from '#controllers/questions_controller'
import ParticipantsController from '#controllers/participants_controller'
import AnonymousMessagesController from '#controllers/anonymous_messages_controller'
import { middleware } from './kernel.js'

// Health check
router.get('/', async () => {
  return {
    message: 'Quiz Festif API - Running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }
})

// ============================================
// Authentication Routes (Public)
// ============================================
router.group(() => {
  router.post('/signup', [AuthController, 'signup'])
  router.post('/login', [AuthController, 'login'])
  router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
  router.get('/profile', [AuthController, 'profile']).use(middleware.auth())
  router.put('/profile', [AuthController, 'updateProfile']).use(middleware.auth())
  router.get('/users/:publicKey', [AuthController, 'showByPublicKey'])
}).prefix('/api/auth')

// ============================================
// Quiz Routes
// ============================================
router.group(() => {
  // Protected routes (owner only)
  router.get('/quizzes', [QuizzesController, 'index'])
  router.get('/quizzes/:id', [QuizzesController, 'show'])
  router.post('/quizzes', [QuizzesController, 'store'])
  router.put('/quizzes/:id', [QuizzesController, 'update'])
  router.delete('/quizzes/:id', [QuizzesController, 'destroy'])
  router.get('/quizzes/:id/stats', [QuizzesController, 'stats'])
  router.get('/quizzes/:id/participants', [QuizzesController, 'participants'])
}).prefix('/api').use(middleware.auth())

// Public quiz routes (no auth required)
router.get('/api/quizzes/:id/play', [QuizzesController, 'play'])

// ============================================
// Question Routes (Protected)
// ============================================
router.group(() => {
  router.post('/quizzes/:quizId/questions', [QuestionsController, 'store'])
  router.put('/questions/:id', [QuestionsController, 'update'])
  router.delete('/questions/:id', [QuestionsController, 'destroy'])
}).prefix('/api').use(middleware.auth())

// ============================================
// Participation Routes (Public)
// ============================================
router.group(() => {
  router.post('/quizzes/:id/participate', [ParticipantsController, 'participate'])
  router.get('/participations/:id', [ParticipantsController, 'show'])
}).prefix('/api')

// ============================================
// Participation Routes (Protected)
// ============================================
router.group(() => {
  router.get('/participations/:id/details', [ParticipantsController, 'showDetails'])
}).prefix('/api').use(middleware.auth())



// ============================================
// Anonymous Messages Routes (Public)
// ============================================
router.group(() => {
  router.post('/users/:publicKey/messages', [AnonymousMessagesController, 'store'])
  router.get('/users/:publicKey', [AuthController, 'showByPublicKey'])
}).prefix('/api')

// ============================================
// Anonymous Messages Routes (Protected)
// ============================================
router.group(() => {
  router.get('/messages', [AnonymousMessagesController, 'index'])
  router.get('/messages/:id', [AnonymousMessagesController, 'show'])
  router.delete('/messages/:id', [AnonymousMessagesController, 'destroy'])
}).prefix('/api').use(middleware.auth())

// 404 handler
router.any('*', async ({ response }) => {
  return response.status(404).json({
    message: 'Route non trouvée',
    code: 'NOT_FOUND',
  })
})