// app/models/quiz.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Question from './question.js'
import Participant from './participant.js'

export default class Quiz extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: number

  @column()
  declare title: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Question)
  declare questions: HasMany<typeof Question>

  @hasMany(() => Participant)
  declare participants: HasMany<typeof Participant>
}