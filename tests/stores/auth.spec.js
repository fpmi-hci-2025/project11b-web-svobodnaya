import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../src/stores/auth'

// Mock the API module
vi.mock('../../src/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn()
  },
  setAuthToken: vi.fn()
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

import { authApi, setAuthToken } from '../../src/api'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const store = useAuthStore()
      const mockToken = { data: { access_token: 'test-token' } }
      const mockUser = { data: { id: 1, username: 'testuser' } }

      authApi.login.mockResolvedValue(mockToken)
      authApi.getMe.mockResolvedValue(mockUser)

      const result = await store.login('testuser', 'password')

      expect(result).toBe(true)
      expect(store.token).toBe('test-token')
      expect(store.user).toEqual({ id: 1, username: 'testuser' })
      expect(store.isAuthenticated).toBe(true)
      expect(setAuthToken).toHaveBeenCalledWith('test-token')
    })

    it('should handle login error', async () => {
      const store = useAuthStore()
      authApi.login.mockRejectedValue({
        response: { data: { detail: 'Invalid credentials' } }
      })

      const result = await store.login('testuser', 'wrongpassword')

      expect(result).toBe(false)
      expect(store.error).toBe('Invalid credentials')
      expect(store.isAuthenticated).toBe(false)
    })

    it('should set loading state during login', async () => {
      const store = useAuthStore()
      authApi.login.mockImplementation(() => new Promise(() => {}))

      store.login('testuser', 'password')

      expect(store.loading).toBe(true)
    })
  })

  describe('register', () => {
    it('should register and login successfully', async () => {
      const store = useAuthStore()
      const mockRegister = { data: { id: 1, username: 'newuser' } }
      const mockToken = { data: { access_token: 'new-token' } }
      const mockUser = { data: { id: 1, username: 'newuser' } }

      authApi.register.mockResolvedValue(mockRegister)
      authApi.login.mockResolvedValue(mockToken)
      authApi.getMe.mockResolvedValue(mockUser)

      const result = await store.register({ username: 'newuser', password: 'password' })

      expect(result).toBe(true)
      expect(authApi.register).toHaveBeenCalledWith('newuser', 'password')
    })

    it('should handle registration error', async () => {
      const store = useAuthStore()
      authApi.register.mockRejectedValue({
        response: { data: { detail: 'Username already exists' } }
      })

      const result = await store.register({ username: 'existing', password: 'password' })

      expect(result).toBe(false)
      expect(store.error).toBe('Username already exists')
    })
  })

  describe('logout', () => {
    it('should clear user data on logout', async () => {
      const store = useAuthStore()
      store.user = { id: 1, username: 'testuser' }
      store.token = 'test-token'

      store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(setAuthToken).toHaveBeenCalledWith(null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })
})

