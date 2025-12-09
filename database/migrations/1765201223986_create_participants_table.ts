// database/migrations/xxx_create_participants_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'participants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('quiz_id').notNullable().references('id').inTable('quizzes').onDelete('CASCADE')
      table.string('participant_name', 100).notNullable()
      table.integer('score').notNullable()
      table.integer('total_questions').notNullable()
      table.jsonb('answers').notNullable()
      table.timestamp('completed_at').notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}