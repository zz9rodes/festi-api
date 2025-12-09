// database/migrations/xxx_create_questions_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('quiz_id').notNullable().references('id').inTable('quizzes').onDelete('CASCADE')
      table.text('question_text').notNullable()
      table.jsonb('options').notNullable()
      table.integer('correct_option_index').notNullable()
      table.integer('order_index').notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}