import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Quiz from '#models/quiz'
import Participant from '#models/participant'
import AnonymousMessage from '#models/anonymous_message'

export default class DashboardController {
    /**
     * GET /api/admin/users
     * List all users (admin only)
     */
    async listUsers({ response }: HttpContext) {
        try {
            const users = await User.all()

            return response.status(200).json({
                users: users.map((user) => ({
                    id: user.id,
                    email: user.email,
                    display_name: user.fullName,
                    public_key: user.publicKey,
                    avatar: user.avatar,
                    is_admin: user.isAdmin,
                    created_at: user.createdAt.toISO(),
                })),
            })
        } catch (error) {
            console.error('List users error:', error)
            return response.status(500).json({
                error: true,
                message: 'Erreur lors de la récupération des utilisateurs',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * GET /api/admin/quizzes
     * List all quizzes (admin only)
     */
    async listQuizzes({ response }: HttpContext) {
        try {
            const quizzes = await Quiz.query().preload('user')

            return response.status(200).json({
                quizzes: quizzes.map((quiz) => ({
                    id: quiz.id,
                    title: quiz.title,
                    creator: {
                        id: quiz.user.id,
                        display_name: quiz.user.fullName,
                        email: quiz.user.email,
                    },
                    created_at: quiz.createdAt.toISO(),
                    updated_at: quiz.updatedAt?.toISO(),
                })),
            })
        } catch (error) {
            console.error('List quizzes error:', error)
            return response.status(500).json({
                error: true,
                message: 'Erreur lors de la récupération des quizzes',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * GET /api/admin/quizzes/:id
     * Show quiz details with questions/options (admin only)
     */
    async showQuizDetails({ params, response }: HttpContext) {
        try {
            const quiz = await Quiz.query()
                .where('id', params.id)
                .preload('user')
                .preload('questions')
                .first()

            if (!quiz) {
                return response.status(404).json({
                    error: true,
                    message: 'Quiz non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            return response.status(200).json({
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    creator: {
                        id: quiz.user.id,
                        display_name: quiz.user.fullName,
                        email: quiz.user.email,
                    },
                    questions: quiz.questions.map((q) => ({
                        id: q.id,
                        question_text: q.questionText,
                        options: q.options,
                        correct_option_index: q.correctOptionIndex,
                        order_index: q.orderIndex,
                    })),
                    created_at: quiz.createdAt.toISO(),
                    updated_at: quiz.updatedAt?.toISO(),
                },
            })
        } catch (error) {
            console.error('Show quiz details error:', error)
            return response.status(500).json({
                error: true,
                message: 'Erreur lors de la récupération du quiz',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * GET /api/admin/participations
     * List all participations (admin only)
     */
    async listParticipations({ response }: HttpContext) {
        try {
            const participations = await Participant.query().preload('quiz')

            return response.status(200).json({
                participations: participations.map((p) => ({
                    id: p.id,
                    participant_name: p.participantName,
                    quiz: {
                        id: p.quiz.id,
                        title: p.quiz.title,
                    },
                    score: p.score,
                    total_questions: p.totalQuestions,
                    percentage: p.totalQuestions > 0 ? Math.round((p.score / p.totalQuestions) * 100) : 0,
                    completed_at: p.completedAt.toISO(),
                })),
            })
        } catch (error) {
            console.error('List participations error:', error)
            return response.status(500).json({
                error: true,
                message: 'Erreur lors de la récupération des participations',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * GET /api/admin/users/:publicKey/messages
     * List messages for a user (admin OR owner)
     */
    async listUserMessages({ params, auth, response }: HttpContext) {
        try {
            const targetUser = await User.findBy('publicKey', params.publicKey)

            if (!targetUser) {
                return response.status(404).json({
                    error: true,
                    message: 'Utilisateur non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            // Check if current user is admin OR the owner
            const currentUser = auth.user
            if (!currentUser?.isAdmin && currentUser?.id !== targetUser.id) {
                return response.status(403).json({
                    error: true,
                    message: 'Accès non autorisé',
                    code: 'FORBIDDEN',
                })
            }

            const messages = await AnonymousMessage.query()
                .where('recipientId', targetUser.id)
                .orderBy('createdAt', 'desc')

            return response.status(200).json({
                user: {
                    id: targetUser.id,
                    display_name: targetUser.fullName,
                    public_key: targetUser.publicKey,
                },
                messages: messages.map((m) => ({
                    id: m.id,
                    content: m.content,
                    created_at: m.createdAt.toISO(),
                })),
            })
        } catch (error) {
            console.error('List user messages error:', error)
            return response.status(500).json({
                error: true,
                message: 'Erreur lors de la récupération des messages',
                code: 'INTERNAL_ERROR',
            })
        }
    }
}
