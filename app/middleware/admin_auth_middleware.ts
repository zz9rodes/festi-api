import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Admin Auth middleware checks if the authenticated user is an admin.
 */
export default class AdminAuthMiddleware {
    async handle(ctx: HttpContext, next: NextFn) {
        const user = ctx.auth.user

        if (!user || !user.isAdmin) {
            return ctx.response.status(403).json({
                error: true,
                message: 'Accès réservé aux administrateurs',
                code: 'FORBIDDEN',
            })
        }

        return next()
    }
}
