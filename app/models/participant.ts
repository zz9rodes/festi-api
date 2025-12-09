// app/models/participant.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Quiz from './quiz.js'

interface Answer {
  question_id: string
  selected_option_index: number
}

export default class Participant extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare quizId: string

  @column()
  declare participantName: string

  @column()
  declare score: number

  @column()
  declare totalQuestions: number

  @column({
    prepare: (value: Answer[]) => JSON.stringify(value),
    consume: (value: string) => { return value},
  })
  declare answers: Answer[]

  @column.dateTime({ autoCreate: true })
  declare completedAt: DateTime

  @belongsTo(() => Quiz)
  declare quiz: BelongsTo<typeof Quiz>
}