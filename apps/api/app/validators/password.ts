import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

/**
 * Password complexity validator for GDPR-compliant authentication
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 * - Cannot contain common patterns (e.g., 'password', '123456')
 */

const commonPasswords = [
  'password',
  'password123',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'master',
  'sunshine',
  'princess',
  'football',
  'baseball',
]

/**
 * Custom VineJS rule to validate password complexity
 */
const passwordComplexity = vine.createRule(
  async (value: unknown, options: any, field: FieldContext) => {
    if (typeof value !== 'string') {
      field.report('Password must be a string', 'passwordComplexity', field)
      return
    }

    const password = value as string

    // Check minimum length
    if (password.length < 8) {
      field.report('Password must be at least 8 characters long', 'passwordComplexity', field)
      return
    }

    // Check maximum length (prevent DoS attacks)
    if (password.length > 128) {
      field.report('Password cannot exceed 128 characters', 'passwordComplexity', field)
      return
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      field.report(
        'Password must contain at least one uppercase letter',
        'passwordComplexity',
        field
      )
      return
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      field.report(
        'Password must contain at least one lowercase letter',
        'passwordComplexity',
        field
      )
      return
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
      field.report('Password must contain at least one number', 'passwordComplexity', field)
      return
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      field.report(
        'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
        'passwordComplexity',
        field
      )
      return
    }

    // Check for common passwords
    const lowerPassword = password.toLowerCase()
    for (const common of commonPasswords) {
      if (lowerPassword.includes(common)) {
        field.report(
          'Password contains a common pattern and is too weak',
          'passwordComplexity',
          field
        )
        return
      }
    }

    // Check for sequential characters (e.g., '12345', 'abcde')
    const hasSequential =
      /(?:012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
        password
      )
    if (hasSequential) {
      field.report('Password cannot contain sequential characters', 'passwordComplexity', field)
      return
    }

    // Check for repeated characters (e.g., 'aaa', '111')
    if (/(.)\1{2,}/.test(password)) {
      field.report(
        'Password cannot contain repeated characters (e.g., "aaa" or "111")',
        'passwordComplexity',
        field
      )
      return
    }
  }
)

/**
 * Password validator for registration and password change
 */
export const passwordValidator = vine.compile(
  vine.object({
    password: vine.string().use(passwordComplexity()).confirmed(),
  })
)

/**
 * Validator for password change (requires current password)
 */
export const changePasswordValidator = vine.compile(
  vine.object({
    current_password: vine.string(),
    new_password: vine
      .string()
      .use(passwordComplexity())
      .confirmed({ confirmationField: 'new_password_confirmation' }),
  })
)

/**
 * Helper function to check password strength (for frontend feedback)
 * Returns a score from 0-4
 */
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (!password || password.length === 0) {
    return { score: 0, feedback: ['Password is required'] }
  }

  // Length check
  if (password.length >= 8) score++
  else feedback.push('Use at least 8 characters')

  if (password.length >= 12) score++
  else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security')

  // Character variety
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  else feedback.push('Mix uppercase and lowercase letters')

  if (/[0-9]/.test(password)) score++
  else feedback.push('Include at least one number')

  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++
  else feedback.push('Add special characters for extra security')

  // Common patterns check
  const lowerPassword = password.toLowerCase()
  for (const common of commonPasswords) {
    if (lowerPassword.includes(common)) {
      score = Math.max(0, score - 2)
      feedback.push('Avoid common password patterns')
      break
    }
  }

  return {
    score: Math.min(4, score),
    feedback,
  }
}

/**
 * Export the custom rule for use in other validators
 */
export { passwordComplexity }
