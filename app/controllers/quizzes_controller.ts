// app/controllers/quizzes_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Quiz from '#models/quiz'
import { createQuizValidator, updateQuizValidator } from '#validators/quiz'

export default class QuizzesController {
    /**
     * GET /api/quizzes
     * Get all quizzes created by the authenticated user.
     */
    async index({ auth, response }: HttpContext) {
        try {
            const user = auth.user!

            // Load quizzes with counts
            // Note: Adonis Lucid doesn't have withCount by default in the same way as Laravel for relations on the model instance easily without query builder
            // But we can use query builder.

            const quizzes = await Quiz.query()
                .where('userId', user.id)
                .preload('questions')
                .preload('participants')
                .orderBy('createdAt', 'desc')

            const formattedQuizzes = quizzes.map((quiz) => ({
                id: quiz.id,
                title: quiz.title,
                question_count: quiz.questions.length,
                participant_count: quiz.participants.length,
                created_at: quiz.createdAt.toISO(),
                updated_at: quiz.updatedAt.toISO(),
            }))

            return response.status(200).json({
                quizzes: formattedQuizzes,
            })
        } catch (error) {
            console.error('Quizzes index error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la récupération des quiz',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * GET /api/quizzes/:id
     * Get a single quiz by ID (for the creator/owner).
     */
    async show({ params, auth, response }: HttpContext) {
        try {
            const user = auth.user!
            const quiz = await Quiz.query()
                .where('id', params.id)
                .where('userId', user.id)
                .preload('questions', (query) => {
                    query.orderBy('orderIndex', 'asc')
                })
                .preload('participants')
                .first()

            if (!quiz) {
                return response.status(404).json({
                    message: 'Quiz non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            return response.status(200).json({
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    question_count: quiz.questions.length,
                    participant_count: quiz.participants.length,
                    created_at: quiz.createdAt.toISO(),
                    questions: quiz.questions.map((q) => ({
                        id: q.id,
                        question_text: q.questionText,
                        options: q.options,
                        correct_option_index: q.correctOptionIndex,
                        order_index: q.orderIndex,
                    })),
                },
            })
        } catch (error) {
            console.error('Quiz show error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la récupération du quiz',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * POST /api/quizzes
     * Create a new quiz.
     */
    async store({ auth, request, response }: HttpContext) {
        try {
            const user = auth.user!
            const payload = await request.validateUsing(createQuizValidator)

            const quiz = await Quiz.create({
                userId: user.id,
                title: payload.title,
            })

            return response.status(201).json({
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    question_count: 0,
                    participant_count: 0,
                    created_at: quiz.createdAt.toISO(),
                },
            })
        } catch (error) {
            console.error('Quiz store error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la création du quiz',
                code: 'INTERNAL_ERROR',
                details: error.messages || error.message,
            })
        }
    }

    /**
     * PUT /api/quizzes/:id
     * Update a quiz (owner only).
     */
    async update({ params, auth, request, response }: HttpContext) {
        try {
            const user = auth.user!
            const quiz = await Quiz.find(params.id)

            if (!quiz) {
                return response.status(404).json({
                    message: 'Quiz non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            if (quiz.userId !== user.id) {
                return response.status(403).json({
                    message: "Vous n'êtes pas autorisé à modifier ce quiz",
                    code: 'FORBIDDEN',
                })
            }

            const payload = await request.validateUsing(updateQuizValidator)

            if (payload.title) {
                quiz.title = payload.title
                await quiz.save()
            }

            return response.status(200).json({
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    updated_at: quiz.updatedAt.toISO(),
                },
            })
        } catch (error) {
            console.error('Quiz update error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la mise à jour du quiz',
                code: 'INTERNAL_ERROR',
                details: error.messages || error.message,
            })
        }
    }

    /**
     * DELETE /api/quizzes/:id
     * Delete a quiz and all its questions/participations (owner only).
     */
    async destroy({ params, auth, response }: HttpContext) {
        try {
            const user = auth.user!
            const quiz = await Quiz.find(params.id)

            if (!quiz) {
                return response.status(404).json({
                    message: 'Quiz non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            if (quiz.userId !== user.id) {
                return response.status(403).json({
                    message: "Vous n'êtes pas autorisé à supprimer ce quiz",
                    code: 'FORBIDDEN',
                })
            }

            await quiz.delete()

            return response.status(200).json({
                message: 'Quiz supprimé avec succès',
            })
        } catch (error) {
            console.error('Quiz destroy error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la suppression du quiz',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * GET /api/quizzes/:id/stats
     * Get statistics for a quiz (owner only).
     */
    async stats({ params, auth, response }: HttpContext) {
        try {
            const user = auth.user!
            const quiz = await Quiz.query()
                .where('id', params.id)
                .where('userId', user.id)
                .preload('questions')
                .preload('participants')
                .first()

            if (!quiz) {
                return response.status(404).json({
                    message: 'Quiz non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            const participants = quiz.participants
            const participantCount = participants.length

            let totalScore = 0
            let totalPercentage = 0

            participants.forEach(p => {
                totalScore += p.score
                // Calculate percentage if not stored or calculate from score/totalQuestions
                // Participant model has percentage? No, it has score and totalQuestions.
                // Wait, API docs say it returns percentage.
                // Let's calculate it.
                const percentage = p.totalQuestions > 0 ? (p.score / p.totalQuestions) * 100 : 0
                totalPercentage += percentage
            })

            const averageScore = participantCount > 0 ? totalScore / participantCount : 0
            const averagePercentage = participantCount > 0 ? totalPercentage / participantCount : 0

            // Calculate most missed question
            // This requires analyzing answers. Participant model has `answers` JSON column.
            // We need to iterate over all participants' answers.

            const missCounts: Record<string, number> = {}

            participants.forEach(p => {
                if (Array.isArray(p.answers)) {
                    p.answers.forEach((ans: any) => {
                        // We need to know if it was correct. 
                        // The answer object in Participant model only has question_id and selected_option_index.
                        // We need to check against the question's correct_option_index.
                        const question = quiz.questions.find(q => q.id === ans.question_id)
                        if (question) {
                            if (question.correctOptionIndex !== ans.selected_option_index) {
                                missCounts[question.id] = (missCounts[question.id] || 0) + 1
                            }
                        }
                    })
                }
            })

            let mostMissedQuestion = null
            let maxMisses = -1

            for (const [qId, misses] of Object.entries(missCounts)) {
                if (misses > maxMisses) {
                    maxMisses = misses
                    const q = quiz.questions.find(quest => quest.id === qId)
                    if (q) {
                        mostMissedQuestion = {
                            id: q.id,
                            question_text: q.questionText,
                            miss_count: misses
                        }
                    }
                }
            }

            const formattedParticipants = participants.map(p => ({
    id: p.id,
    participant_name: p.participantName,
    score: p.score,
    total_questions: p.totalQuestions,
    percentage: p.totalQuestions > 0 ? (p.score / p.totalQuestions) * 100 : 0,
    completed_at: p.completedAt.toISO(),
}))

// 👉 Trier du plus grand score au plus petit
formattedParticipants.sort((a, b) => b.score - a.score)

return response.status(200).json({
    quiz: {
        id: quiz.id,
        title: quiz.title,
    },
    participantCount,
    averageScore,
    averagePercentage,
    mostMissedQuestion,
    participants: formattedParticipants, // Trié !
})


            // return response.status(200).json({
            //     quiz: {
            //         id: quiz.id,
            //         title: quiz.title,
            //     },
            //     participantCount,
            //     averageScore,
            //     averagePercentage,
            //     mostMissedQuestion,
            //     participants: formattedParticipants,
            // })

        } catch (error) {
            console.error('Quiz stats error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la récupération des statistiques',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * GET /api/quizzes/:id/participants
     * Get all participants for a quiz (owner only).
     */
    async participants({ params, auth, response }: HttpContext) {
        try {
            console.log('QuizzesController.participants called');
            console.log('Fetching participants for quiz ID:', params.id);
            const user = auth.user!
            const quiz = await Quiz.query()
                .where('id', params.id)
                .where('userId', user.id)
                .preload('participants')
                .first()

            if (!quiz) {
                return response.status(404).json({
                    message: 'Quiz non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            const formattedParticipants = quiz.participants.map(p => ({
                id: p.id,
                participant_name: p.participantName,
                score: p.score,
                total_questions: p.totalQuestions,
                percentage: p.totalQuestions > 0 ? (p.score / p.totalQuestions) * 100 : 0,
                completed_at: p.completedAt.toISO(),
            }))

            return response.status(200).json({
                participants: formattedParticipants,
            })

        } catch (error) {
            console.error('Quiz participants error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la récupération des participants',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * GET /api/quizzes/:id/play
     * Get quiz data for participants (PUBLIC - no auth required).
     */
    async play({ params, response }: HttpContext) {
        try {
            const quiz = await Quiz.query()
                .where('id', params.id)
                .preload('user')
                .preload('questions', (query) => {
                    query.orderBy('orderIndex', 'asc')
                })
                .first()

            if (!quiz) {
                return response.status(404).json({
                    message: 'Quiz non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            return response.status(200).json({
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    creator_name: quiz.user?.fullName || 'Inconnu',
                    questions: quiz.questions.map((q) => ({
                        id: q.id,
                        question_text: q.questionText,
                        options: q.options,
                        correct_option_index:q.correctOptionIndex
                        // DO NOT return correct_option_index
                    })),
                },
            })
        } catch (error) {
            console.error('Quiz play error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la récupération du quiz',
                code: 'INTERNAL_ERROR',
            })
        }
    }
}
