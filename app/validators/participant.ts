import vine from '@vinejs/vine'

/**
 * Validator for participating in a quiz
 */
export const participateValidator = vine.compile(
    vine.object({
        participant_name: vine.string().minLength(2).maxLength(100),
        answers: vine.array(
            vine.object({
                question_id: vine.string(),
                selected_option_index: vine.number(),
            })
        ).minLength(1),
    })
)
