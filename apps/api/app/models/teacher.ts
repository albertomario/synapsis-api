import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Teacher extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare teacherId: string

  @column()
  declare department: string

  @column.date()
  declare hireDate: DateTime

  @column()
  declare bio: string | null

  @column()
  declare officeLocation: string | null

  @column({
    prepare: (value: object) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare officeHours: object | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
