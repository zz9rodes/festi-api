// app/models/question.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Quiz from './quiz.js'

export default class Question extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare quizId: string

  @column()
  declare questionText: string

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) =>{
      return  value
    } ,
  })
  declare options: string[]

  @column()
  declare correctOptionIndex: number

  @column()
  declare orderIndex: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Quiz)
  declare quiz: BelongsTo<typeof Quiz>
}
