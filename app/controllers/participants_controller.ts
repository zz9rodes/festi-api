// app/controllers/participants_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Quiz from '#models/quiz'
import Participant from '#models/participant'
import { DateTime } from 'luxon'
import { participateValidator } from '#validators/participant'

export default class ParticipantsController {
    /**
     * POST /api/quizzes/:id/participate
     * Submit a quiz participation (PUBLIC - no auth required).
     */
    async participate({ params, request, response }: HttpContext) {
        try {
            const quizId = params.id
            const payload = await request.validateUsing(participateValidator)

            const quiz = await Quiz.query()
                .where('id', quizId)
                .preload('questions')
                .first()

            if (!quiz) {
                return response.status(404).json({
                    message: 'Quiz non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            // Calculate score
            let score = 0
            const results: any[] = []
            const processedAnswers: any[] = []

            // Map questions for easy lookup
            const questionsMap = new Map(quiz.questions.map(q => [q.id, q]))

            for (const answer of payload.answers) {
                const question = questionsMap.get(answer.question_id)

                if (question) {
                    const isCorrect = question.correctOptionIndex === answer.selected_option_index
                    console.log(`Question ID: ${question.id}, Selected: ${answer.selected_option_index}, Correct: ${question.correctOptionIndex}, Is Correct: ${isCorrect}`);
                    if (isCorrect) {
                        score++
                    }

                    results.push({
                        question_id: question.id,
                        question_text: question.questionText,
                        selected_option_index: answer.selected_option_index,
                        correct_option_index: question.correctOptionIndex,
                        is_correct: isCorrect,
                        options: question.options,
                    })

                    processedAnswers.push({
                        question_id: question.id,
                        selected_option_index: answer.selected_option_index
                    })
                }
            }

            const totalQuestions = quiz.questions.length
            const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0

            const participant = await Participant.create({
                quizId: quiz.id,
                participantName: payload.participant_name,
                score: score,
                totalQuestions: totalQuestions,
                answers: processedAnswers,
                completedAt: DateTime.now()
            })

            return response.status(201).json({
                participation: {
                    id: participant.id,
                    quiz_id: quiz.id,
                    participant_name: participant.participantName,
                    score: participant.score,
                    total_questions: participant.totalQuestions,
                    percentage: Number(percentage.toFixed(2)),
                    completed_at: participant.completedAt.toISO(),
                    results: results,
                },
            })
        } catch (error) {
            throw error
            console.error('Participate error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la soumission du quiz',
                code: 'INTERNAL_ERROR',
                details: error.messages || error.message,
            })
        }
    }

    /**
     * GET /api/participations/:id
     * Get a participation result (PUBLIC - for showing results page).
     */
    async show({ params, response }: HttpContext) {
        try {
            const participation = await Participant.query()
                .where('id', params.id)
                .preload('quiz', (query) => {
                    query.preload('questions')
                })
                .first()

            if (!participation) {
                return response.status(404).json({
                    message: 'Participation non trouvée',
                    code: 'NOT_FOUND',
                })
            }

            const quiz = participation.quiz
            const questionsMap = new Map(quiz.questions.map(q => [q.id, q]))

            const results: any[] = []

            if (Array.isArray(participation.answers)) {
                for (const answer of participation.answers) {
                    const question = questionsMap.get(answer.question_id)
                    if (question) {
                        const isCorrect = question.correctOptionIndex === answer.selected_option_index
                        results.push({
                            question_id: question.id,
                            question_text: question.questionText,
                            selected_option_index: answer.selected_option_index,
                            correct_option_index: question.correctOptionIndex,
                            is_correct: isCorrect,
                            options: question.options,
                        })
                    }
                }
            }

            const percentage = participation.totalQuestions > 0
                ? (participation.score / participation.totalQuestions) * 100
                : 0

            return response.status(200).json({
                participation: {
                    id: participation.id,
                    quiz_title: quiz.title,
                    participant_name: participation.participantName,
                    score: participation.score,
                    total_questions: participation.totalQuestions,
                    percentage: Number(percentage.toFixed(2)),
                    completed_at: participation.completedAt.toISO(),
                    results: results,
                },
            })
        } catch (error) {
            throw error
            console.error('Participation show error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la récupération de la participation',
                code: 'INTERNAL_ERROR',
            })
        }
    }
    /**
     * GET /api/participations/:id/details
     * Get detailed participation result (PROTECTED - owner only).
     */
    async showDetails({ params, auth, response }: HttpContext) {
        try {
            const user = auth.user!
            const participation = await Participant.query()
                .where('id', params.id)
                .preload('quiz', (query) => {
                    query.preload('questions')
                })
                .first()

            if (!participation) {
                return response.status(404).json({
                    message: 'Participation non trouvée',
                    code: 'NOT_FOUND',
                })
            }

            const quiz = participation.quiz

            // Check if the authenticated user is the owner of the quiz
            if (quiz.userId !== user.id) {
                return response.status(403).json({
                    message: "Vous n'êtes pas autorisé à voir les détails de cette participation",
                    code: 'FORBIDDEN',
                })
            }

            const questionsMap = new Map(quiz.questions.map(q => [q.id, q]))
            const results: any[] = []

            if (Array.isArray(participation.answers)) {
                for (const answer of participation.answers) {
                    const question = questionsMap.get(answer.question_id)
                    if (question) {
                        const isCorrect = question.correctOptionIndex === answer.selected_option_index
                        results.push({
                            question_id: question.id,
                            question_text: question.questionText,
                            selected_option_index: answer.selected_option_index,
                            correct_option_index: question.correctOptionIndex,
                            is_correct: isCorrect,
                            options: question.options,
                        })
                    }
                }
            }

            const percentage = participation.totalQuestions > 0
                ? (participation.score / participation.totalQuestions) * 100
                : 0

            return response.status(200).json({
                participation: {
                    id: participation.id,
                    quiz_title: quiz.title,
                    participant_name: participation.participantName,
                    score: participation.score,
                    total_questions: participation.totalQuestions,
                    percentage: Number(percentage.toFixed(2)),
                    completed_at: participation.completedAt.toISO(),
                    results: results,
                },
            })
        } catch (error) {
            throw error
            console.error('Participation details error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la récupération des détails de la participation',
                code: 'INTERNAL_ERROR',
            })
        }
    }
}
