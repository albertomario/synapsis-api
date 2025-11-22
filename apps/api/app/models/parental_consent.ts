import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'

export default class ParentalConsent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare studentId: number

  @column()
  declare parentEmail: string

  @column()
  declare parentName: string

  @column()
  declare consentToken: string

  @column()
  declare consentType: 'general' | 'grades_view' | 'data_export' | 'external_links'

  @column.dateTime()
  declare grantedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime()
  declare revokedAt: DateTime | null

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>
}
