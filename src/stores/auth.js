import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, setAuthToken } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(username, password) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.login(username, password)
      token.value = response.data.access_token
      setAuthToken(token.value)
      
      // Get user info
      const userResponse = await authApi.getMe()
      user.value = userResponse.data
      localStorage.setItem('user', JSON.stringify(user.value))
      
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка входа'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    try {
      await authApi.register(userData.username, userData.password)
      return await login(userData.username, userData.password)
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка регистрации'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    setAuthToken(null)
    localStorage.removeItem('user')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout
  }
})

