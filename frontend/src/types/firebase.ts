export interface User {
  uid: string
  name: string
  email: string
  profilePicture?: string
  role: string
  accountStatus: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
  preferences: Record<string, any>
  studySettings?: Record<string, any>
  timezone?: string
  language?: string
  theme?: string
  notificationPreferences?: Record<string, any>
}

export interface Material {
  materialId: string
  userId: string
  title: string
  originalFileName?: string
  sourceType?: 'pdf' | 'docx' | 'text'
  fileType?: string
  fileSize?: number
  storagePath?: string
  downloadUrl?: string
  storageUrl?: string
  uploadStatus?: string
  createdAt: string
  updatedAt?: string
  tags?: string[]
  subject?: string
  description?: string
  extractedText?: string
  wordCount?: number
  uploadedAt?: string
  aiStatus?: string
}

export interface Flashcard {
  id: string
  question: string
  answer: string
  explanation: string
  difficulty: string
  topic: string
  subtopic: string
  keywords: string[]
  cardType: string
  status: string
}

export interface FlashcardDeck {
  deckId: string
  materialId: string
  userId: string
  cards: Flashcard[]
  version: number
  modelUsed: string
  createdAt: string
  updatedAt: string
}

export interface QuizQuestion {
  id: string
  question: string
  type: string
  options?: string[]
  correctAnswer: string
  explanation: string
  difficulty: string
  topic: string
  subtopic: string
}

export interface Quiz {
  quizId: string
  materialId: string
  userId: string
  questions: QuizQuestion[]
  version: number
  modelUsed: string
  createdAt: string
  updatedAt: string
}

export interface QuizAttemptResult {
  questionId: string
  userAnswer: string | undefined
  isCorrect: boolean
}

export interface QuizAttempt {
  attemptId: string
  quizId: string
  userId: string
  score: number
  totalQuestions: number
  percentage: number
  timeTaken: number
  results: QuizAttemptResult[]
  createdAt: string
}

export interface StudyPlan {
  planId: string
  userId: string
  createdAt: string
  status: string
}

export interface StudyTask {
  taskId: string
  planId: string
  userId: string
  title: string
  description: string
  dueDate: string
  estimatedMinutes: number
  type: string
  priority: string
  status: string
  createdAt: string
  materialId?: string
}

export interface Appointment {
  appointmentId: string
  userId: string
  title: string
  description: string
  date: string
  location: string
  createdAt: string
}

export interface UploadResult {
  url: string
  path: string
  size: number
  type: string
}

export interface StorageMetadata {
  size: number
  contentType: string
  timeCreated: string
  updated: string
  name: string
  fullPath: string
}

export interface FirestoreResponse<T> {
  data: T | null
  error: APIError | null
  success: boolean
}

export interface APIError {
  code: string
  message: string
  details?: any
}
