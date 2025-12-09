import vine from '@vinejs/vine'

/**
 * Validator for creating a quiz
 */
export const createQuizValidator = vine.compile(
    vine.object({
        title: vine.string().minLength(3).maxLength(255),
    })
)

/**
 * Validator for updating a quiz
 */
export const updateQuizValidator = vine.compile(
    vine.object({
        title: vine.string().minLength(3).maxLength(255).optional(),
    })
)
