import axios from "axios"
import { getAccessToken } from "../Utils/Auth"

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

const axiosInstance = axios.create({
  baseURL: BASE_URL
})

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.message?.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!')
      window.location.href = '/auth/login&register'
    }

    return Promise.reject(error)
  }
)

const api = {
  get: (endpoint, params = {}) => axiosInstance.get(endpoint, { params }).then(res => res.data),
  post: (endpoint, data, config = {}) => axiosInstance.post(endpoint, data, config).then(res => res.data),
  put: (endpoint, data, config = {}) => axiosInstance.put(endpoint, data, config).then(res => res.data),
  delete: (endpoint, params = {}) => axiosInstance.delete(endpoint, { params }).then(res => res.data),
  postFormData: (endpoint, formData, config = {}) =>
    axiosInstance.post(endpoint, formData, {
      ...config,
      headers: {
        ...(config.headers || {})
      }
    }).then(res => res.data)
}

export default api;