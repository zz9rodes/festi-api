import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AnonymousMessage from '#models/anonymous_message'
import { createMessageValidator } from '#validators/anonymous_message'

export default class AnonymousMessagesController {
    /**
     * POST /api/users/:userId/messages
     * Send an anonymous message to a user (PUBLIC).
     */
    async store({ params, request, response }: HttpContext) {
        try {
            const publicKey = params.publicKey
            const user = await User.findBy('publicKey', publicKey)

            if (!user) {
                return response.status(404).json({
                    message: 'Utilisateur non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            const payload = await request.validateUsing(createMessageValidator)

            const message = await AnonymousMessage.create({
                recipientId: user.id,
                content: payload.content,
            })

            return response.status(201).json({
                message: 'Message envoyé avec succès',
                data: {
                    id: message.id,
                    created_at: message.createdAt,
                },
            })
        } catch (error) {
            console.error('Send message error:', error)
            return response.status(500).json({
                message: "Erreur lors de l'envoi du message",
                code: 'INTERNAL_ERROR',
                details: error.messages || error.message,
            })
        }
    }

    /**
     * GET /api/messages
     * List received messages (PROTECTED).
     */
    async index({ auth, response }: HttpContext) {
        try {
            const user = auth.user!
            const messages = await user.related('anonymousMessages')
                .query()
                .orderBy('createdAt', 'desc')

            return response.status(200).json({
                messages: messages.map((msg) => ({
                    id: msg.id,
                    content: msg.content,
                    created_at: msg.createdAt,
                })),
            })
        } catch (error) {
            console.error('List messages error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la récupération des messages',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * GET /api/messages/:id
     * Show a single message (PROTECTED).
     */
    async show({ params, auth, response }: HttpContext) {
        try {
            const user = auth.user!
            const message = await user.related('anonymousMessages')
                .query()
                .where('id', params.id)
                .first()

            if (!message) {
                return response.status(404).json({
                    message: 'Message non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            return response.status(200).json({
                message: {
                    id: message.id,
                    content: message.content,
                    created_at: message.createdAt,
                },
            })
        } catch (error) {
            console.error('Show message error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la récupération du message',
                code: 'INTERNAL_ERROR',
            })
        }
    }

    /**
     * DELETE /api/messages/:id
     * Delete a message (PROTECTED).
     */
    async destroy({ params, auth, response }: HttpContext) {
        try {
            const user = auth.user!
            const message = await user.related('anonymousMessages')
                .query()
                .where('id', params.id)
                .first()

            if (!message) {
                return response.status(404).json({
                    message: 'Message non trouvé',
                    code: 'NOT_FOUND',
                })
            }

            await message.delete()

            return response.status(200).json({
                message: 'Message supprimé avec succès',
            })
        } catch (error) {
            console.error('Delete message error:', error)
            return response.status(500).json({
                message: 'Erreur lors de la suppression du message',
                code: 'INTERNAL_ERROR',
            })
        }
    }
}