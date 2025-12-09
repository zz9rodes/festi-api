import vine from '@vinejs/vine'

/**
 * Validator for user registration
 */
export const registerValidator = vine.compile(
    vine.object({
        email: vine.string().email().normalizeEmail(),
        password: vine.string().minLength(6),
        display_name: vine.string().minLength(2).maxLength(100),
    })
)

/**
 * Validator for user login
 */
export const loginValidator = vine.compile(
    vine.object({
        email: vine.string().email(),
        password: vine.string(),
    })
)

/**
 * Validator for updating user profile
 */
export const updateProfileValidator = vine.compile(
    vine.object({
        display_name: vine.string().minLength(2).maxLength(100).optional(),
    })
)
