import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

let authToken = localStorage.getItem('token') || null

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Set token function
export function setAuthToken(token) {
  authToken = token
  if (token) {
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem('token')
  }
}

// Request interceptor for auth token
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      setAuthToken(null)
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register(username, password) {
    return api.post('/auth/register', { username, password })
  },
  login(username, password) {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  getMe() {
    return api.get('/auth/me')
  }
}

// Projects API
export const projectsApi = {
  getAll() {
    return api.get('/projects/')
  },
  getOne(id) {
    return api.get(`/projects/${id}`)
  },
  create(data) {
    return api.post('/projects/', data)
  },
  update(id, data) {
    return api.put(`/projects/${id}`, data)
  },
  delete(id) {
    return api.delete(`/projects/${id}`)
  },
  addMember(projectId, userId) {
    return api.post(`/projects/${projectId}/members`, { user_id: userId })
  },
  removeMember(projectId, userId) {
    return api.delete(`/projects/${projectId}/members/${userId}`)
  }
}

// Tasks API
export const tasksApi = {
  getAll(projectId) {
    return api.get(`/projects/${projectId}/tasks/`)
  },
  getOne(projectId, taskId) {
    return api.get(`/projects/${projectId}/tasks/${taskId}`)
  },
  create(projectId, data) {
    return api.post(`/projects/${projectId}/tasks/`, data)
  },
  update(projectId, taskId, data) {
    return api.put(`/projects/${projectId}/tasks/${taskId}`, data)
  },
  delete(projectId, taskId) {
    return api.delete(`/projects/${projectId}/tasks/${taskId}`)
  }
}

// Users API
export const usersApi = {
  search(query) {
    return api.get('/users/search', { params: { q: query } })
  }
}

export default api

