import vine from '@vinejs/vine'
import { passwordComplexity } from './password.js'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
    remember_me: vine.boolean().optional(),
    consent: vine.boolean(),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().use(passwordComplexity()).confirmed(),
    full_name: vine.string().minLength(3),
    handle: vine.string().minLength(3),
    user_type: vine.enum(['student', 'teacher', 'parent']),
    date_of_birth: vine.date(),
    consent: vine.boolean(),
  })
)
