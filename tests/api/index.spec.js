import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }))
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('API Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('setAuthToken', () => {
    it('should save token to localStorage when provided', async () => {
      const { setAuthToken } = await import('../../src/api')
      
      setAuthToken('test-token')
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token')
    })

    it('should remove token from localStorage when null', async () => {
      const { setAuthToken } = await import('../../src/api')
      
      setAuthToken(null)
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('authApi', () => {
    it('should have register method', async () => {
      const { authApi } = await import('../../src/api')
      expect(typeof authApi.register).toBe('function')
    })

    it('should have login method', async () => {
      const { authApi } = await import('../../src/api')
      expect(typeof authApi.login).toBe('function')
    })

    it('should have getMe method', async () => {
      const { authApi } = await import('../../src/api')
      expect(typeof authApi.getMe).toBe('function')
    })
  })

  describe('projectsApi', () => {
    it('should have all CRUD methods', async () => {
      const { projectsApi } = await import('../../src/api')
      
      expect(typeof projectsApi.getAll).toBe('function')
      expect(typeof projectsApi.getOne).toBe('function')
      expect(typeof projectsApi.create).toBe('function')
      expect(typeof projectsApi.update).toBe('function')
      expect(typeof projectsApi.delete).toBe('function')
    })

    it('should have member management methods', async () => {
      const { projectsApi } = await import('../../src/api')
      
      expect(typeof projectsApi.addMember).toBe('function')
      expect(typeof projectsApi.removeMember).toBe('function')
    })
  })

  describe('tasksApi', () => {
    it('should have all CRUD methods', async () => {
      const { tasksApi } = await import('../../src/api')
      
      expect(typeof tasksApi.getAll).toBe('function')
      expect(typeof tasksApi.getOne).toBe('function')
      expect(typeof tasksApi.create).toBe('function')
      expect(typeof tasksApi.update).toBe('function')
      expect(typeof tasksApi.delete).toBe('function')
    })
  })

  describe('usersApi', () => {
    it('should have search method', async () => {
      const { usersApi } = await import('../../src/api')
      expect(typeof usersApi.search).toBe('function')
    })
  })
})

