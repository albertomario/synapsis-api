import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ParentalConsent from '#models/parental_consent'

export default class Student extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare studentId: string

  @column.date()
  declare enrollmentDate: DateTime

  @column.date()
  declare graduationDate: DateTime | null

  @column()
  declare gradeLevel: number

  @column()
  declare section: string | null

  @column()
  declare academicStatus: 'active' | 'suspended' | 'graduated' | 'expelled'

  @column()
  declare requiresParentalConsent: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => ParentalConsent)
  declare parentalConsents: HasMany<typeof ParentalConsent>
}
