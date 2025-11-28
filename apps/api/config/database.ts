import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
// @ts-expect-error pg module lacks type declarations
import pg from 'pg'

// Configure pg to parse jsonb columns as objects
pg.types.setTypeParser(pg.types.builtins.JSONB, (val: string) => JSON.parse(val))
pg.types.setTypeParser(pg.types.builtins.JSON, (val: string) => JSON.parse(val))

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      useNullAsDefault: true,
      pool: {
        afterCreate: (conn: any, cb: any) => {
          conn.query('SET timezone="UTC";', (err: any) => {
            cb(err, conn)
          })
        },
      },
    },
  },
})

export default dbConfig
