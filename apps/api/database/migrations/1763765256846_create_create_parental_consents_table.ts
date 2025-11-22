import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'parental_consents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table
        .bigInteger('student_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table.string('parent_email', 255).notNullable()
      table.string('parent_name', 255).notNullable()
      table.string('consent_token', 64).notNullable().unique()
      table
        .enum('consent_type', ['general', 'grades_view', 'data_export', 'external_links'])
        .notNullable()

      table.timestamp('granted_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('revoked_at', { useTz: true }).nullable()

      table.string('ip_address').nullable()
      table.text('user_agent').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.index(['student_id'], 'idx_parental_consents_student_id')
      table.index(['consent_token'], 'idx_parental_consents_token')
      table.index(['expires_at'], 'idx_parental_consents_expires')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
