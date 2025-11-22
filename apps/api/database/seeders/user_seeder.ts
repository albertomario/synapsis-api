import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // 1. Admin User
    await User.create({
      email: 'admin@synapsis.school',
      passwordHash: await hash.make('admin123'),
      fullName: 'Principal Skinner',
      handle: '@skinner',
      userType: 'admin',
      dateOfBirth: DateTime.fromISO('1970-01-01'),
      timezone: 'Europe/Brussels',
      locale: 'en-EU',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    // 2. Teacher User
    const teacherUser = await User.create({
      email: 'teacher@synapsis.school',
      passwordHash: await hash.make('teacher123'),
      fullName: 'Edna Krabappel',
      handle: '@edna_k',
      userType: 'teacher',
      dateOfBirth: DateTime.fromISO('1980-05-15'),
      timezone: 'Europe/Brussels',
      locale: 'en-EU',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    await teacherUser.related('teacher').create({
      teacherId: 'T001',
      department: 'Mathematics',
      hireDate: DateTime.fromISO('2010-09-01'),
      bio: 'Math teacher with 15 years of experience.',
      officeLocation: 'Room 101',
      officeHours: { monday: '14:00-16:00' },
    })

    // 3. Student User (>16)
    const student1User = await User.create({
      email: 'student1@synapsis.school',
      passwordHash: await hash.make('student123'),
      fullName: 'Lisa Simpson',
      handle: '@lisa_s',
      userType: 'student',
      dateOfBirth: DateTime.now().minus({ years: 17 }), // 17 years old
      timezone: 'Europe/Brussels',
      locale: 'en-EU',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    await student1User.related('student').create({
      studentId: 'S001',
      enrollmentDate: DateTime.fromISO('2020-09-01'),
      gradeLevel: 11,
      section: 'A',
      academicStatus: 'active',
      requiresParentalConsent: false,
    })

    // 4. Student User (<16)
    const student2User = await User.create({
      email: 'student2@synapsis.school',
      passwordHash: await hash.make('student123'),
      fullName: 'Bart Simpson',
      handle: '@bart_s',
      userType: 'student',
      dateOfBirth: DateTime.now().minus({ years: 14 }), // 14 years old
      timezone: 'Europe/Brussels',
      locale: 'en-EU',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    const student2 = await student2User.related('student').create({
      studentId: 'S002',
      enrollmentDate: DateTime.fromISO('2022-09-01'),
      gradeLevel: 9,
      section: 'B',
      academicStatus: 'active',
      requiresParentalConsent: true,
    })

    // 5. Parent User
    const parentUser = await User.create({
      email: 'parent@synapsis.school',
      passwordHash: await hash.make('parent123'),
      fullName: 'Marge Simpson',
      handle: '@marge_s',
      userType: 'parent',
      dateOfBirth: DateTime.fromISO('1975-03-10'),
      timezone: 'Europe/Brussels',
      locale: 'en-EU',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    // 6. Parental Consent
    await student2.related('parentalConsents').create({
      parentEmail: parentUser.email,
      parentName: parentUser.fullName,
      consentToken: 'consent_token_123',
      consentType: 'grades_view',
      grantedAt: DateTime.now(),
      expiresAt: DateTime.now().plus({ years: 1 }),
    })
  }
}
