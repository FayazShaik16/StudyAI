import api from "./api"
import type { FirestoreResponse } from "@/types/firebase"

export interface AnalyticsDashboard {
  totalStudyHours: number
  averageQuizScore: number
  flashcardMastery: number
  completedTasks: number
  chartData: { name: string, score: number }[]
  aiInsight: string
  quizHistory?: { attemptId: string, title: string, score: number, totalQuestions: number, percentage: number, createdAt: string }[]
  weakTopics?: { topic: string, percentage: number }[]
}

export interface Goal {
  goalId: string
  userId: string
  title: string
  target: number
  current: number
  type: string
  createdAt: string
}

export const getDashboardData = async (): Promise<FirestoreResponse<AnalyticsDashboard>> => {
  try {
    const res = await api.get(`/analytics/dashboard`)
    return { data: res.data, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const getGoals = async (): Promise<FirestoreResponse<Goal[]>> => {
  try {
    const res = await api.get(`/analytics/goals`)
    return { data: res.data.goals, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const createGoal = async (data: Partial<Goal>): Promise<FirestoreResponse<Goal>> => {
  try {
    const res = await api.post(`/analytics/goals`, data)
    return { data: res.data.goal, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}
