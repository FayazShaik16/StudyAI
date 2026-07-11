import api from "./api"
import type { FirestoreResponse } from "@/types/firebase"

export interface Summary {
  summaryId: string
  materialId: string
  userId: string
  content: string
  modelUsed: string
  createdAt: string
  updatedAt: string
  versions?: Array<{
    content: string
    updatedAt: string
    modelUsed: string
  }>
}

export const generateSummary = async (materialId: string, force: boolean = false): Promise<FirestoreResponse<Summary>> => {
  try {
    const res = await api.post(`/ai/summary/generate/${materialId}?force=${force}`)
    return { data: res.data.summary, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const getSummary = async (materialId: string): Promise<FirestoreResponse<Summary>> => {
  try {
    const res = await api.get(`/ai/summary/${materialId}`)
    return { data: res.data.summary, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const generateFlashcards = async (materialId: string, force: boolean = false, count: number = 10): Promise<FirestoreResponse<any>> => {
  try {
    const res = await api.post(`/ai/flashcards/generate/${materialId}?force=${force}&count=${count}`)
    return { data: res.data.deck, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const getFlashcards = async (materialId: string): Promise<FirestoreResponse<any>> => {
  try {
    const res = await api.get(`/ai/flashcards/${materialId}`)
    return { data: res.data.deck, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const updateFlashcardProgress = async (deckId: string, cardId: string, status: string): Promise<FirestoreResponse<void>> => {
  try {
    await api.put(`/ai/flashcards/${deckId}/cards/${cardId}/progress`, { status })
    return { data: null, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const generateQuiz = async (materialId: string, force: boolean = false, types: string[] = ['Multiple Choice', 'True/False', 'Short Answer']): Promise<FirestoreResponse<any>> => {
  try {
    const res = await api.post(`/ai/quiz/generate/${materialId}?force=${force}`, { types })
    return { data: res.data.quiz, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const getQuiz = async (materialId: string): Promise<FirestoreResponse<any>> => {
  try {
    const res = await api.get(`/ai/quiz/${materialId}`)
    return { data: res.data.quiz, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const submitQuizAttempt = async (quizId: string, answers: Record<string, string>, timeTaken: number): Promise<FirestoreResponse<any>> => {
  try {
    const res = await api.post(`/ai/quiz/${quizId}/submit`, { answers, timeTaken })
    return { data: res.data.attempt, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const getQuizAttempts = async (quizId: string): Promise<FirestoreResponse<any>> => {
  try {
    const res = await api.get(`/ai/quiz/${quizId}/attempts`)
    return { data: res.data.attempts, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const deleteSummary = async (materialId: string): Promise<FirestoreResponse<void>> => {
  try {
    await api.delete(`/ai/summary/${materialId}`)
    return { data: null, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const deleteFlashcards = async (materialId: string): Promise<FirestoreResponse<void>> => {
  try {
    await api.delete(`/ai/flashcards/${materialId}`)
    return { data: null, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const deleteQuiz = async (materialId: string): Promise<FirestoreResponse<void>> => {
  try {
    await api.delete(`/ai/quiz/${materialId}/clear`)
    return { data: null, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}
