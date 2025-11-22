import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teachers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table
        .bigInteger('user_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('teacher_id', 20).notNullable().unique()
      table.string('department', 100).notNullable()
      table.date('hire_date').notNullable()
      table.text('bio').nullable()
      table.string('office_location', 100).nullable()
      table.jsonb('office_hours').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.index(['user_id'], 'idx_teachers_user_id')
      table.index(['department'], 'idx_teachers_department')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
