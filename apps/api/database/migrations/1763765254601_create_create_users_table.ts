import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table.string('email', 255).notNullable().unique()
      table.string('password_hash', 255).notNullable()
      table.string('full_name', 255).notNullable()
      table.string('handle', 50).notNullable().unique()
      table.enum('user_type', ['student', 'teacher', 'parent', 'admin']).notNullable()
      table.date('date_of_birth').notNullable()
      table.string('phone', 20).nullable()
      table.string('avatar_url', 500).nullable()
      table.string('timezone', 50).defaultTo('Europe/Brussels')
      table.string('locale', 10).defaultTo('en-EU')

      // GDPR Compliance
      table.timestamp('consent_given_at', { useTz: true }).nullable()
      table.boolean('data_processing_consent').defaultTo(false)
      table.jsonb('gdpr_preferences').defaultTo({
        showGrades: true,
        allowSearch: true,
        shareWithParents: true,
        marketingEmails: false,
      })
      table.timestamp('scheduled_deletion_at', { useTz: true }).nullable()

      // Security
      table.timestamp('email_verified_at', { useTz: true }).nullable()
      table.timestamp('last_login_at', { useTz: true }).nullable()
      table.integer('failed_login_attempts').defaultTo(0)
      table.timestamp('account_locked_until', { useTz: true }).nullable()

      // Audit
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()

      // Indexes
      table.index(['email'], 'idx_users_email')
      table.index(['handle'], 'idx_users_handle')
      table.index(['user_type'], 'idx_users_user_type')
      table.index(['scheduled_deletion_at'], 'idx_users_scheduled_deletion')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
