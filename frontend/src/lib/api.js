// src/lib/api.js  — centralised Axios instance
import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 120_000,   // 2 min for large video uploads
})

// ── Upload image for detection
export const detectImage = (file, onProgress) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/detect/image', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProgress?.(Math.round(e.loaded * 100 / e.total)),
  })
}

// ── Upload video for detection
export const detectVideo = (file, onProgress) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/detect/video', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProgress?.(Math.round(e.loaded * 100 / e.total)),
  })
}

// ── Health check
export const healthCheck = () => axios.get(`${API_URL}/health`)

export default api
