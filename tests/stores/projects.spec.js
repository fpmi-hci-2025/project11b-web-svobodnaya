import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectsStore } from '../../src/stores/projects'

// Mock the API module
vi.mock('../../src/api', () => ({
  projectsApi: {
    getAll: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn()
  }
}))

import { projectsApi } from '../../src/api'

describe('Projects Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useProjectsStore()
      expect(store.projects).toEqual([])
      expect(store.currentProject).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('fetchProjects', () => {
    it('should fetch projects successfully', async () => {
      const store = useProjectsStore()
      const mockProjects = [
        { id: 1, name: 'Project 1' },
        { id: 2, name: 'Project 2' }
      ]
      projectsApi.getAll.mockResolvedValue({ data: mockProjects })

      await store.fetchProjects()

      expect(store.projects).toEqual(mockProjects)
      expect(store.error).toBeNull()
    })

    it('should handle fetch error', async () => {
      const store = useProjectsStore()
      projectsApi.getAll.mockRejectedValue({
        response: { data: { detail: 'Server error' } }
      })

      await store.fetchProjects()

      expect(store.error).toBe('Server error')
    })

    it('should set loading state during fetch', async () => {
      const store = useProjectsStore()
      projectsApi.getAll.mockImplementation(() => new Promise(() => {}))

      store.fetchProjects()

      expect(store.loading).toBe(true)
    })
  })

  describe('fetchProject', () => {
    it('should fetch single project successfully', async () => {
      const store = useProjectsStore()
      const mockProject = { id: 1, name: 'Test Project', members: [] }
      projectsApi.getOne.mockResolvedValue({ data: mockProject })

      const result = await store.fetchProject(1)

      expect(result).toEqual(mockProject)
      expect(store.currentProject).toEqual(mockProject)
    })

    it('should return null on error', async () => {
      const store = useProjectsStore()
      projectsApi.getOne.mockRejectedValue({
        response: { data: { detail: 'Not found' } }
      })

      const result = await store.fetchProject(999)

      expect(result).toBeNull()
      expect(store.error).toBe('Not found')
    })
  })

  describe('createProject', () => {
    it('should create project successfully', async () => {
      const store = useProjectsStore()
      const newProject = { id: 1, name: 'New Project', description: 'Test' }
      projectsApi.create.mockResolvedValue({ data: newProject })

      const result = await store.createProject({ name: 'New Project', description: 'Test' })

      expect(result).toEqual(newProject)
      expect(store.projects).toContainEqual(newProject)
    })

    it('should add new project to beginning of list', async () => {
      const store = useProjectsStore()
      store.projects = [{ id: 2, name: 'Existing' }]
      const newProject = { id: 1, name: 'New Project' }
      projectsApi.create.mockResolvedValue({ data: newProject })

      await store.createProject({ name: 'New Project' })

      expect(store.projects[0]).toEqual(newProject)
    })

    it('should handle create error', async () => {
      const store = useProjectsStore()
      projectsApi.create.mockRejectedValue({
        response: { data: { detail: 'Validation error' } }
      })

      const result = await store.createProject({ name: '' })

      expect(result).toBeNull()
      expect(store.error).toBe('Validation error')
    })
  })

  describe('updateProject', () => {
    it('should update project successfully', async () => {
      const store = useProjectsStore()
      store.projects = [{ id: 1, name: 'Old Name' }]
      const updated = { id: 1, name: 'New Name' }
      projectsApi.update.mockResolvedValue({ data: updated })

      const result = await store.updateProject(1, { name: 'New Name' })

      expect(result).toEqual(updated)
      expect(store.projects[0].name).toBe('New Name')
    })

    it('should update currentProject if it matches', async () => {
      const store = useProjectsStore()
      store.currentProject = { id: 1, name: 'Old Name' }
      store.projects = [{ id: 1, name: 'Old Name' }]
      const updated = { id: 1, name: 'New Name' }
      projectsApi.update.mockResolvedValue({ data: updated })

      await store.updateProject(1, { name: 'New Name' })

      expect(store.currentProject.name).toBe('New Name')
    })
  })

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      const store = useProjectsStore()
      store.projects = [
        { id: 1, name: 'To Delete' },
        { id: 2, name: 'Keep' }
      ]
      projectsApi.delete.mockResolvedValue({})

      const result = await store.deleteProject(1)

      expect(result).toBe(true)
      expect(store.projects).toHaveLength(1)
      expect(store.projects[0].id).toBe(2)
    })

    it('should handle delete error', async () => {
      const store = useProjectsStore()
      store.projects = [{ id: 1, name: 'Project' }]
      projectsApi.delete.mockRejectedValue({
        response: { data: { detail: 'Cannot delete' } }
      })

      const result = await store.deleteProject(1)

      expect(result).toBe(false)
      expect(store.projects).toHaveLength(1)
    })
  })

  describe('member management', () => {
    it('should add member successfully', async () => {
      const store = useProjectsStore()
      const updatedProject = { id: 1, name: 'Project', members: [{ id: 1, user: { id: 2 } }] }
      projectsApi.addMember.mockResolvedValue({})
      projectsApi.getOne.mockResolvedValue({ data: updatedProject })

      const result = await store.addMember(1, 2)

      expect(result).toBe(true)
      expect(projectsApi.addMember).toHaveBeenCalledWith(1, 2)
    })

    it('should remove member successfully', async () => {
      const store = useProjectsStore()
      const updatedProject = { id: 1, name: 'Project', members: [] }
      projectsApi.removeMember.mockResolvedValue({})
      projectsApi.getOne.mockResolvedValue({ data: updatedProject })

      const result = await store.removeMember(1, 2)

      expect(result).toBe(true)
      expect(projectsApi.removeMember).toHaveBeenCalledWith(1, 2)
    })
  })
})

