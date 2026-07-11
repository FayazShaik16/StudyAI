import api from "./api"
import type { Material, FirestoreResponse } from "@/types/firebase"

export const getMaterials = async (includeDeleted: boolean = false): Promise<FirestoreResponse<Material[]>> => {
  try {
    const res = await api.get(`/materials?include_deleted=${includeDeleted}`)
    return { data: res.data.materials, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const restoreMaterial = async (id: string): Promise<FirestoreResponse<void>> => {
  try {
    await api.post(`/materials/restore/${id}`)
    return { data: null, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const purgeMaterial = async (id: string): Promise<FirestoreResponse<void>> => {
  try {
    await api.delete(`/materials/purge/${id}`)
    return { data: null, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const getMaterial = async (id: string): Promise<FirestoreResponse<Material>> => {
  try {
    const res = await api.get(`/materials/${id}`)
    return { data: res.data.material, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const uploadMaterial = async (file: File, onUploadProgress?: (progressEvent: any) => void): Promise<FirestoreResponse<Material>> => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    const res = await api.post("/materials/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    })
    return { data: res.data.material, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const updateMaterial = async (id: string, data: Partial<Material>): Promise<FirestoreResponse<Material>> => {
  try {
    const res = await api.put(`/materials/${id}`, data)
    return { data: res.data.material, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}

export const deleteMaterial = async (id: string): Promise<FirestoreResponse<void>> => {
  try {
    await api.delete(`/materials/${id}`)
    return { data: null, success: true, error: null }
  } catch (err: any) {
    return { data: null, success: false, error: err.response?.data?.error || err.message }
  }
}
