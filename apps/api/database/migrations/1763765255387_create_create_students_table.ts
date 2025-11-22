import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'students'

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
      table.string('student_id', 20).notNullable().unique()
      table.date('enrollment_date').notNullable()
      table.date('graduation_date').nullable()
      table.integer('grade_level').notNullable()
      table.string('section', 10).nullable()

      table
        .enum('academic_status', ['active', 'suspended', 'graduated', 'expelled'])
        .defaultTo('active')

      // requires_parental_consent logic to be handled by app or trigger
      table.boolean('requires_parental_consent').defaultTo(true)

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.index(['user_id'], 'idx_students_user_id')
      table.index(['grade_level'], 'idx_students_grade_level')
      table.index(['academic_status'], 'idx_students_academic_status')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
