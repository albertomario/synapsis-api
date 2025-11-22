import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'access_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table
        .bigInteger('tokenable_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('type', 50).notNullable().defaultTo('auth_token')
      table.string('name', 255).nullable()
      table.string('hash', 255).notNullable()
      table
        .text('abilities')
        .notNullable()
        .defaultTo(JSON.stringify(['*']))

      table.timestamp('last_used_at', { useTz: true }).nullable()
      table.timestamp('expires_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.index(['tokenable_id'], 'idx_access_tokens_tokenable_id')
      table.index(['hash'], 'idx_access_tokens_hash')
      table.index(['expires_at'], 'idx_access_tokens_expires')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
