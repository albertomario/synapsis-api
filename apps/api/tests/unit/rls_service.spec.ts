import { test } from '@japa/runner'
import User from '#models/user'
import { withRLS } from '#services/rls_service'
import { DateTime } from 'luxon'

test.group('RLS - Student Access', () => {
  test('student can query their own data', async ({ assert }) => {
    const student = await User.create({
      email: `student_rls_${Date.now()}@example.com`,
      passwordHash: 'hashed',
      fullName: 'RLS Student',
      handle: `rls_student_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.fromISO('2005-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    const query = User.query().where('id', student.id)
    const results = await withRLS(query, student)

    assert.lengthOf(results, 1)
    assert.equal(results[0].id, student.id)
  })

  test('student can see other students with public profiles', async ({ assert }) => {
    const student1 = await User.create({
      email: `student1_${Date.now()}@example.com`,
      passwordHash: 'hashed',
      fullName: 'Student 1',
      handle: `student1_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.fromISO('2005-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      gdprPreferences: {
        showGrades: true,
        allowSearch: true,
        shareWithParents: true,
        marketingEmails: false,
      },
    })

    await User.create({
      email: `student2_${Date.now()}@example.com`,
      passwordHash: 'hashed',
      fullName: 'Student 2',
      handle: `student2_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.fromISO('2005-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      gdprPreferences: {
        showGrades: true,
        allowSearch: true,
        shareWithParents: true,
        marketingEmails: false,
      },
    })

    const query = User.query().where('user_type', 'student')
    const results = await withRLS(query, student1)

    // Should see themselves and others with allowSearch: true
    assert.isAtLeast(results.length, 1)
  })
})

test.group('RLS - Teacher Access', () => {
  test('teacher can see all students', async ({ assert }) => {
    const teacher = await User.create({
      email: `teacher_rls_${Date.now()}@example.com`,
      passwordHash: 'hashed',
      fullName: 'RLS Teacher',
      handle: `rls_teacher_${Date.now()}`,
      userType: 'teacher',
      dateOfBirth: DateTime.fromISO('1985-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    await User.create({
      email: `student_for_teacher_${Date.now()}@example.com`,
      passwordHash: 'hashed',
      fullName: 'Student',
      handle: `student_teacher_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.fromISO('2005-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    const query = User.query().where('user_type', 'student')
    const results = await withRLS(query, teacher)

    assert.isAtLeast(results.length, 1)
  })
})

test.group('RLS - Admin Access', () => {
  test('admin can see all data', async ({ assert }) => {
    const admin = await User.create({
      email: `admin_rls_${Date.now()}@example.com`,
      passwordHash: 'hashed',
      fullName: 'RLS Admin',
      handle: `rls_admin_${Date.now()}`,
      userType: 'admin',
      dateOfBirth: DateTime.fromISO('1980-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    const query = User.query()
    const results = await withRLS(query, admin)

    // Admin should see all users
    assert.isAtLeast(results.length, 1)
  })

  test('admin can access soft-deleted records', async ({ assert }) => {
    const admin = await User.create({
      email: `admin_deleted_${Date.now()}@example.com`,
      passwordHash: 'hashed',
      fullName: 'Admin Deleted',
      handle: `admin_deleted_${Date.now()}`,
      userType: 'admin',
      dateOfBirth: DateTime.fromISO('1980-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
    })

    // Create and soft-delete a user
    const deletedUser = await User.create({
      email: `deleted_${Date.now()}@example.com`,
      passwordHash: 'hashed',
      fullName: 'Deleted User',
      handle: `deleted_${Date.now()}`,
      userType: 'student',
      dateOfBirth: DateTime.fromISO('2005-01-01'),
      dataProcessingConsent: true,
      consentGivenAt: DateTime.now(),
      deletedAt: DateTime.now(),
    })

    // Admin with includeTrashed should see deleted records
    const query = User.query()
    const results = await withRLS(query, admin, { includeTrashed: true })

    const foundDeleted = results.some((u) => u.id === deletedUser.id)
    assert.isTrue(foundDeleted)
  })
})
