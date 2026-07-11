import api from "./api"
import type { FirestoreResponse, StudyPlan, StudyTask, Appointment } from "@/types/firebase"

export const generateStudyPlan = async (materialId?: string): Promise<FirestoreResponse<{plan: StudyPlan, tasks: StudyTask[]}>> => {
  try {
    const res = await api.post(`/planner/generate`, { materialId })
    return { data: res.data, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const getTasks = async (): Promise<FirestoreResponse<StudyTask[]>> => {
  try {
    const res = await api.get(`/planner/tasks`)
    return { data: res.data.tasks, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const createTask = async (data: Partial<StudyTask>): Promise<FirestoreResponse<StudyTask>> => {
  try {
    const res = await api.post(`/planner/tasks`, data)
    return { data: res.data.task, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const updateTaskStatus = async (taskId: string, status: string): Promise<FirestoreResponse<StudyTask>> => {
  try {
    const res = await api.put(`/planner/tasks/${taskId}/status`, { status })
    return { data: res.data.task, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const updateTask = async (taskId: string, data: Partial<StudyTask>): Promise<FirestoreResponse<StudyTask>> => {
  try {
    const res = await api.put(`/planner/tasks/${taskId}`, data)
    return { data: res.data.task, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const getAppointments = async (): Promise<FirestoreResponse<Appointment[]>> => {
  try {
    const res = await api.get(`/planner/appointments`)
    return { data: res.data.appointments, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const createAppointment = async (data: Partial<Appointment>): Promise<FirestoreResponse<Appointment>> => {
  try {
    const res = await api.post(`/planner/appointments`, data)
    return { data: res.data.appointment, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const deleteAppointment = async (appointmentId: string): Promise<FirestoreResponse<void>> => {
  try {
    await api.delete(`/planner/appointments/${appointmentId}`)
    return { data: null, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const clearAllTasks = async (): Promise<FirestoreResponse<void>> => {
  try {
    await api.delete(`/planner/tasks/clear`)
    return { data: null, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const clearAllAppointments = async (): Promise<FirestoreResponse<void>> => {
  try {
    await api.delete(`/planner/appointments/clear`)
    return { data: null, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}
