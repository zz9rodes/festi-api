import vine from '@vinejs/vine'

/**
 * Validator for creating a question
 */
export const createQuestionValidator = vine.compile(
    vine.object({
        question_text: vine.string().minLength(5).maxLength(500),
        options: vine.array(vine.string().minLength(1).maxLength(200)).minLength(4).maxLength(4),
        correct_option_index: vine.number().min(0).max(3),
    })
)

/**
 * Validator for updating a question
 */
export const updateQuestionValidator = vine.compile(
    vine.object({
        question_text: vine.string().minLength(5).maxLength(500).optional(),
        options: vine.array(vine.string().minLength(1).maxLength(200)).minLength(4).maxLength(4).optional(),
        correct_option_index: vine.number().min(0).max(3).optional(),
    })
)
