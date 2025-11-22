// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserType = 'student' | 'teacher' | 'parent' | 'admin'

export interface User {
  id: number
  email: string
  fullName: string
  handle: string
  userType: UserType
  dateOfBirth: string
  phone?: string
  avatarUrl?: string
  timezone: string
  locale: string
  emailVerifiedAt?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface GDPRPreferences {
  showGrades: boolean
  allowSearch: boolean
  shareWithParents: boolean
  marketingEmails: boolean
}

// ============================================================================
// Grade Types
// ============================================================================

export type GradeType = 'exam' | 'quiz' | 'homework' | 'project' | 'participation'
export type CalculationBasis = 'points' | 'percentage' | 'letter' | 'pass_fail'

export interface GradeDTO {
  id: number
  studentId: number
  teacherId: number
  courseId?: number
  assignmentId?: number
  gradeType: GradeType
  subject: string
  title: string
  score: number
  maxScore: number
  percentage: number
  letterGrade?: string
  calculationBasis: CalculationBasis
  weight?: number
  feedback?: string
  isPublished: boolean
  dueDate?: string
  submittedAt?: string
  gradedAt?: string
  gradedBy?: number
  createdAt: string
  updatedAt: string
}

export interface CreateGradeDTO {
  studentId: number
  teacherId: number
  courseId?: number
  assignmentId?: number
  gradeType: GradeType
  subject: string
  title: string
  score: number
  maxScore: number
  calculationBasis: CalculationBasis
  weight?: number
  feedback?: string
  isPublished?: boolean
  dueDate?: string
  submittedAt?: string
}

export interface UpdateGradeDTO {
  score?: number
  maxScore?: number
  feedback?: string
  isPublished?: boolean
  gradedAt?: string
}

// ============================================================================
// Assignment Types
// ============================================================================

export type AssignmentType = 'homework' | 'quiz' | 'exam' | 'project' | 'essay' | 'lab'
export type AssignmentStatus = 'draft' | 'published' | 'closed' | 'archived'
export type SubmissionStatus = 'not_submitted' | 'submitted' | 'late' | 'graded' | 'returned'

export interface AssignmentDTO {
  id: number
  teacherId: number
  courseId?: number
  assignmentType: AssignmentType
  title: string
  description: string
  instructions?: string
  maxScore: number
  weight?: number
  dueDate: string
  availableFrom?: string
  availableUntil?: string
  allowLateSubmissions: boolean
  lateSubmissionPenalty?: number
  requiresFile: boolean
  allowedFileTypes?: string[]
  maxFileSize?: number
  externalLinks?: string[]
  attachments?: string[]
  rubric?: any
  status: AssignmentStatus
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAssignmentDTO {
  teacherId: number
  courseId?: number
  assignmentType: AssignmentType
  title: string
  description: string
  instructions?: string
  maxScore: number
  weight?: number
  dueDate: string
  availableFrom?: string
  availableUntil?: string
  allowLateSubmissions?: boolean
  lateSubmissionPenalty?: number
  requiresFile?: boolean
  allowedFileTypes?: string[]
  maxFileSize?: number
  externalLinks?: string[]
  attachments?: string[]
  rubric?: any
  isPublished?: boolean
}

export interface UpdateAssignmentDTO {
  title?: string
  description?: string
  instructions?: string
  maxScore?: number
  weight?: number
  dueDate?: string
  availableFrom?: string
  availableUntil?: string
  allowLateSubmissions?: boolean
  lateSubmissionPenalty?: number
  requiresFile?: boolean
  allowedFileTypes?: string[]
  maxFileSize?: number
  externalLinks?: string[]
  attachments?: string[]
  rubric?: any
  status?: AssignmentStatus
  isPublished?: boolean
}

export interface SubmissionDTO {
  id: number
  assignmentId: number
  studentId: number
  status: SubmissionStatus
  submittedAt?: string
  content?: string
  fileUrls?: string[]
  grade?: number
  feedback?: string
  isLate: boolean
  attemptNumber: number
  createdAt: string
  updatedAt: string
}

export interface CreateSubmissionDTO {
  assignmentId: number
  studentId: number
  content?: string
  fileUrls?: string[]
  attemptNumber?: number
}

// ============================================================================
// Announcement Types
// ============================================================================

export type AnnouncementType = 'general' | 'urgent' | 'event' | 'reminder' | 'achievement'
export type AnnouncementAudience = 'all' | 'students' | 'teachers' | 'parents' | 'grade_level' | 'course'

export interface AnnouncementDTO {
  id: number
  authorId: number
  authorName?: string
  announcementType: AnnouncementType
  title: string
  content: string
  summary?: string
  audience: AnnouncementAudience
  targetGradeLevels?: number[]
  targetCourseIds?: number[]
  isPinned: boolean
  isUrgent: boolean
  requiresAcknowledgment: boolean
  externalLinks?: string[]
  attachments?: string[]
  publishedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAnnouncementDTO {
  authorId: number
  announcementType: AnnouncementType
  title: string
  content: string
  summary?: string
  audience: AnnouncementAudience
  targetGradeLevels?: number[]
  targetCourseIds?: number[]
  isPinned?: boolean
  isUrgent?: boolean
  requiresAcknowledgment?: boolean
  externalLinks?: string[]
  attachments?: string[]
  publishedAt?: string
  expiresAt?: string
}

export interface UpdateAnnouncementDTO {
  title?: string
  content?: string
  summary?: string
  audience?: AnnouncementAudience
  targetGradeLevels?: number[]
  targetCourseIds?: number[]
  isPinned?: boolean
  isUrgent?: boolean
  requiresAcknowledgment?: boolean
  externalLinks?: string[]
  attachments?: string[]
  expiresAt?: string
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: ApiError[]
}

export interface ApiError {
  field?: string
  message: string
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
  }
}

// ============================================================================
// GDPR Types
// ============================================================================

export interface GDPRExportDTO {
  userId: number
  exportDate: string
  personalData: {
    user: User
    grades?: GradeDTO[]
    assignments?: AssignmentDTO[]
    submissions?: SubmissionDTO[]
  }
  metadata: {
    dataCategories: string[]
    exportFormat: string
    expiresAt: string
  }
}
