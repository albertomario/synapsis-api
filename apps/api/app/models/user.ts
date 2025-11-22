import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, hasMany } from '@adonisjs/lucid/orm'
import type { HasOne, HasMany } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'
import Teacher from '#models/teacher'
import AuditLog from '#models/audit_log'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default class User extends BaseModel {
  static accessTokens = DbAccessTokensProvider.forModel(User, {
    table: 'access_tokens',
  })

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare passwordHash: string

  @column()
  declare fullName: string

  @column()
  declare handle: string

  @column()
  declare userType: 'student' | 'teacher' | 'parent' | 'admin'

  @column.date()
  declare dateOfBirth: DateTime

  @column()
  declare phone: string | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare timezone: string

  @column()
  declare locale: string

  // GDPR
  @column.dateTime()
  declare consentGivenAt: DateTime | null

  @column()
  declare dataProcessingConsent: boolean

  @column()
  declare gdprPreferences: {
    showGrades: boolean
    allowSearch: boolean
    shareWithParents: boolean
    marketingEmails: boolean
  } | null

  @column.dateTime()
  declare scheduledDeletionAt: DateTime | null

  // Security
  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column()
  declare failedLoginAttempts: number

  @column.dateTime()
  declare accountLockedUntil: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relationships
  @hasOne(() => Student)
  declare student: HasOne<typeof Student>

  @hasOne(() => Teacher)
  declare teacher: HasOne<typeof Teacher>

  @hasMany(() => AuditLog)
  declare auditLogs: HasMany<typeof AuditLog>
}
