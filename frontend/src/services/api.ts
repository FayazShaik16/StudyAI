import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

api.interceptors.response.use((response) => response, (error) => {
  return Promise.reject(error)
})

export default api
