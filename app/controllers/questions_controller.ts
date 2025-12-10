// app/controllers/questions_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Question from '#models/question'
import Quiz from '#models/quiz'

export default class QuestionsController {
    /**
     * POST /api/quizzes/:quizId/questions
     * Add a question to a quiz (owner only).
     */
    async store({ params, auth, request, response }: HttpContext) {
        try {
            const user = auth.user!
            const quizId = params.quizId

            // Verify quiz ownership
            const quiz = await Quiz.find(quizId)
            if (!quiz) {
                return response.status(404).json({
                    message: 'Quiz non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            if (quiz.userId !== user.id) {
                return response.status(403).json({
                    message: "Vous n'êtes pas autorisé à ajouter des questions à ce quiz",
                    code: 'FORBIDDEN',
                })
            }

            const { question_text, options, correct_option_index } = request.only([
                'question_text',
                'options',
                'correct_option_index',
            ])

            // Validation
            if (!question_text || question_text.length < 5 || question_text.length > 500) {
                return response.status(400).json({
                    message: 'La question doit contenir entre 5 et 500 caractères',
                    code: 'VALIDATION_ERROR',
                })
            }

            if (!Array.isArray(options) || options.length !== 4) {
                return response.status(400).json({
                    message: 'Il faut exactement 4 options',
                    code: 'VALIDATION_ERROR',
                })
            }

            if (correct_option_index === undefined || correct_option_index < 0 || correct_option_index > 3) {
                return response.status(400).json({
                    message: "L'index de la réponse correcte doit être entre 0 et 3",
                    code: 'VALIDATION_ERROR',
                })
            }

            // Determine order index (append to end)
            // We can find the max orderIndex for this quiz
            const lastQuestion = await Question.query()
                .where('quizId', quizId)
                .orderBy('orderIndex', 'desc')
                .first()

            const orderIndex = lastQuestion ? lastQuestion.orderIndex + 1 : 0

            const question = await Question.create({
                quizId: quizId,
                questionText: question_text,
                options: options,
                correctOptionIndex: correct_option_index,
                orderIndex: orderIndex,
            })

            return response.status(201).json({
                question: {
                    id: question.id,
                    quiz_id: question.quizId,
                    question_text: question.questionText,
                    options: question.options,
                    correct_option_index: question.correctOptionIndex,
                    order_index: question.orderIndex,
                },
            })
        } catch (error) {
            throw error
            console.error('Question store error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la création de la question',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * PUT /api/questions/:id
     * Update a question (quiz owner only).
     */
    async update({ params, auth, request, response }: HttpContext) {
        try {
            const user = auth.user!
            const question = await Question.query().where('id', params.id).preload('quiz').first()

            if (!question) {
                return response.status(404).json({
                    message: 'Question non trouvée',
                    code: 'NOT_FOUND',
                })
            }

            // Check ownership via quiz
            if (question.quiz.userId !== user.id) {
                return response.status(403).json({
                    message: "Vous n'êtes pas autorisé à modifier cette question",
                    code: 'FORBIDDEN',
                })
            }

            const { question_text, options, correct_option_index } = request.only([
                'question_text',
                'options',
                'correct_option_index',
            ])

            if (question_text) {
                if (question_text.length < 5 || question_text.length > 500) {
                    return response.status(400).json({
                        message: 'La question doit contenir entre 5 et 500 caractères',
                        code: 'VALIDATION_ERROR',
                    })
                }
                question.questionText = question_text
            }

            if (options) {
                if (!Array.isArray(options) || options.length !== 4) {
                    return response.status(400).json({
                        message: 'Il faut exactement 4 options',
                        code: 'VALIDATION_ERROR',
                    })
                }
                question.options = options
            }

            if (correct_option_index !== undefined) {
                if (correct_option_index < 0 || correct_option_index > 3) {
                    return response.status(400).json({
                        message: "L'index de la réponse correcte doit être entre 0 et 3",
                        code: 'VALIDATION_ERROR',
                    })
                }
                question.correctOptionIndex = correct_option_index
            }

            await question.save()

            return response.status(200).json({
                question: {
                    id: question.id,
                    question_text: question.questionText,
                    options: question.options,
                    correct_option_index: question.correctOptionIndex,
                },
            })
        } catch (error) {
            throw error
            console.error('Question update error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la mise à jour de la question',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * DELETE /api/questions/:id
     * Delete a question (quiz owner only).
     */
    async destroy({ params, auth, response }: HttpContext) {
        try {
            const user = auth.user!
            const question = await Question.query().where('id', params.id).preload('quiz').first()

            if (!question) {
                return response.status(404).json({
                    message: 'Question non trouvée',
                    code: 'NOT_FOUND',
                })
            }

            // Check ownership
            if (question.quiz.userId !== user.id) {
                return response.status(403).json({
                    message: "Vous n'êtes pas autorisé à supprimer cette question",
                    code: 'FORBIDDEN',
                })
            }

            await question.delete()

            return response.status(200).json({
                message: 'Question supprimée avec succès',
            })
        } catch (error) {
            throw error
            console.error('Question destroy error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la suppression de la question',
                code: 'INTERNAL_ERROR',
            })
        }
    }
}
