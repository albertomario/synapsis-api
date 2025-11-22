import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Student from '#models/student'
import Teacher from '#models/teacher'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // Create admin user
    const admin = await User.create({
      email: 'admin@snapsis.edu',
      passwordHash: await hash.make('Admin123!@#'),
      fullName: 'System Administrator',
      handle: '@admin',
      userType: 'admin',
      dateOfBirth: DateTime.fromISO('1985-01-15'),
      phone: '+32470123456',
      timezone: 'Europe/Brussels',
      locale: 'en-EU',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
      gdprPreferences: {
        showGrades: true,
        allowSearch: true,
        shareWithParents: true,
        marketingEmails: false,
      },
    })

    // Create teacher users
    const teacher1 = await User.create({
      email: 'marie.dubois@snapsis.edu',
      passwordHash: await hash.make('Teacher123!'),
      fullName: 'Marie Dubois',
      handle: '@marie_d',
      userType: 'teacher',
      dateOfBirth: DateTime.fromISO('1982-05-20'),
      phone: '+32470234567',
      timezone: 'Europe/Brussels',
      locale: 'fr-BE',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
      gdprPreferences: {
        showGrades: true,
        allowSearch: true,
        shareWithParents: false,
        marketingEmails: true,
      },
    })

    await Teacher.create({
      userId: teacher1.id,
      teacherId: 'TCH001',
      department: 'Mathematics',
      hireDate: DateTime.fromISO('2010-09-01'),
      bio: 'Experienced mathematics teacher specializing in calculus and algebra.',
      officeLocation: 'Building A, Room 205',
      officeHours: {
        monday: '14:00-16:00',
        wednesday: '14:00-16:00',
        friday: '10:00-12:00',
      },
    })

    const teacher2 = await User.create({
      email: 'john.smith@snapsis.edu',
      passwordHash: await hash.make('Teacher123!'),
      fullName: 'John Smith',
      handle: '@john_s',
      userType: 'teacher',
      dateOfBirth: DateTime.fromISO('1978-11-10'),
      phone: '+32470345678',
      timezone: 'Europe/Brussels',
      locale: 'en-EU',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
      gdprPreferences: {
        showGrades: true,
        allowSearch: true,
        shareWithParents: false,
        marketingEmails: false,
      },
    })

    await Teacher.create({
      userId: teacher2.id,
      teacherId: 'TCH002',
      department: 'Science',
      hireDate: DateTime.fromISO('2012-09-01'),
      bio: 'Physics teacher with a passion for experimental science.',
      officeLocation: 'Building B, Room 301',
      officeHours: {
        tuesday: '13:00-15:00',
        thursday: '13:00-15:00',
      },
    })

    // Create student users (mix of ages for GDPR testing)

    // Student 1: 17 years old (no parental consent needed)
    const student1 = await User.create({
      email: 'alex.johnson@student.snapsis.edu',
      passwordHash: await hash.make('Student123!'),
      fullName: 'Alex Johnson',
      handle: '@alex_j',
      userType: 'student',
      dateOfBirth: DateTime.now().minus({ years: 17, months: 2 }),
      phone: '+32470456789',
      timezone: 'Europe/Brussels',
      locale: 'en-EU',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
      gdprPreferences: {
        showGrades: true,
        allowSearch: true,
        shareWithParents: true,
        marketingEmails: false,
      },
    })

    await Student.create({
      userId: student1.id,
      studentId: 'STU2023001',
      enrollmentDate: DateTime.fromISO('2020-09-01'),
      graduationDate: DateTime.fromISO('2026-06-30'),
      gradeLevel: 11,
      section: 'A',
      academicStatus: 'active',
      requiresParentalConsent: false,
    })

    // Student 2: 15 years old (requires parental consent)
    const student2 = await User.create({
      email: 'emma.wilson@student.snapsis.edu',
      passwordHash: await hash.make('Student123!'),
      fullName: 'Emma Wilson',
      handle: '@emma_w',
      userType: 'student',
      dateOfBirth: DateTime.now().minus({ years: 15, months: 6 }),
      phone: '+32470567890',
      timezone: 'Europe/Brussels',
      locale: 'nl-BE',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
      gdprPreferences: {
        showGrades: true,
        allowSearch: false,
        shareWithParents: true,
        marketingEmails: false,
      },
    })

    await Student.create({
      userId: student2.id,
      studentId: 'STU2024002',
      enrollmentDate: DateTime.fromISO('2021-09-01'),
      graduationDate: DateTime.fromISO('2027-06-30'),
      gradeLevel: 9,
      section: 'B',
      academicStatus: 'active',
      requiresParentalConsent: true,
    })

    // Student 3: 14 years old (requires parental consent)
    const student3 = await User.create({
      email: 'lucas.martin@student.snapsis.edu',
      passwordHash: await hash.make('Student123!'),
      fullName: 'Lucas Martin',
      handle: '@lucas_m',
      userType: 'student',
      dateOfBirth: DateTime.now().minus({ years: 14, months: 3 }),
      phone: '+32470678901',
      timezone: 'Europe/Brussels',
      locale: 'fr-BE',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
      gdprPreferences: {
        showGrades: true,
        allowSearch: false,
        shareWithParents: true,
        marketingEmails: false,
      },
    })

    await Student.create({
      userId: student3.id,
      studentId: 'STU2024003',
      enrollmentDate: DateTime.fromISO('2022-09-01'),
      graduationDate: DateTime.fromISO('2028-06-30'),
      gradeLevel: 8,
      section: 'A',
      academicStatus: 'active',
      requiresParentalConsent: true,
    })

    // Student 4: 16 years old (no parental consent needed)
    const student4 = await User.create({
      email: 'sophia.garcia@student.snapsis.edu',
      passwordHash: await hash.make('Student123!'),
      fullName: 'Sophia Garcia',
      handle: '@sophia_g',
      userType: 'student',
      dateOfBirth: DateTime.now().minus({ years: 16, months: 8 }),
      phone: '+32470789012',
      timezone: 'Europe/Brussels',
      locale: 'en-EU',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
      gdprPreferences: {
        showGrades: true,
        allowSearch: true,
        shareWithParents: false,
        marketingEmails: true,
      },
    })

    await Student.create({
      userId: student4.id,
      studentId: 'STU2023004',
      enrollmentDate: DateTime.fromISO('2021-09-01'),
      graduationDate: DateTime.fromISO('2026-06-30'),
      gradeLevel: 10,
      section: 'C',
      academicStatus: 'active',
      requiresParentalConsent: false,
    })

    // Create parent user for students under 16
    const parent1 = await User.create({
      email: 'parent.wilson@example.com',
      passwordHash: await hash.make('Parent123!'),
      fullName: 'Robert Wilson',
      handle: '@robert_w',
      userType: 'parent',
      dateOfBirth: DateTime.fromISO('1975-03-15'),
      phone: '+32470890123',
      timezone: 'Europe/Brussels',
      locale: 'en-EU',
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      emailVerifiedAt: DateTime.now(),
      gdprPreferences: {
        showGrades: false,
        allowSearch: false,
        shareWithParents: false,
        marketingEmails: false,
      },
    })

    console.log('Test data seeded successfully!')
    console.log('\nLogin credentials:')
    console.log('Admin: admin@snapsis.edu / Admin123!@#')
    console.log('Teacher 1: marie.dubois@snapsis.edu / Teacher123!')
    console.log('Teacher 2: john.smith@snapsis.edu / Teacher123!')
    console.log('Student 1 (17yo): alex.johnson@student.snapsis.edu / Student123!')
    console.log('Student 2 (15yo): emma.wilson@student.snapsis.edu / Student123!')
    console.log('Student 3 (14yo): lucas.martin@student.snapsis.edu / Student123!')
    console.log('Student 4 (16yo): sophia.garcia@student.snapsis.edu / Student123!')
    console.log('Parent: parent.wilson@example.com / Parent123!')
  }
}
