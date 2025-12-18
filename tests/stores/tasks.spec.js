import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasksStore } from '../../src/stores/tasks'

// Mock the API module
vi.mock('../../src/api', () => ({
  tasksApi: {
    getAll: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

import { tasksApi } from '../../src/api'

describe('Tasks Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useTasksStore()
      expect(store.tasks).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('tasksByStatus computed', () => {
    it('should group tasks by status', () => {
      const store = useTasksStore()
      store.tasks = [
        { id: 1, title: 'Task 1', status: 'todo' },
        { id: 2, title: 'Task 2', status: 'in_progress' },
        { id: 3, title: 'Task 3', status: 'todo' },
        { id: 4, title: 'Task 4', status: 'done' }
      ]

      const grouped = store.tasksByStatus

      expect(grouped.todo).toHaveLength(2)
      expect(grouped.in_progress).toHaveLength(1)
      expect(grouped.review).toHaveLength(0)
      expect(grouped.done).toHaveLength(1)
    })

    it('should return empty arrays for empty tasks', () => {
      const store = useTasksStore()
      const grouped = store.tasksByStatus

      expect(grouped.todo).toEqual([])
      expect(grouped.in_progress).toEqual([])
      expect(grouped.review).toEqual([])
      expect(grouped.done).toEqual([])
    })
  })

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      const store = useTasksStore()
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'todo' },
        { id: 2, title: 'Task 2', status: 'done' }
      ]
      tasksApi.getAll.mockResolvedValue({ data: mockTasks })

      await store.fetchTasks(1)

      expect(store.tasks).toEqual(mockTasks)
      expect(tasksApi.getAll).toHaveBeenCalledWith(1)
    })

    it('should handle fetch error', async () => {
      const store = useTasksStore()
      tasksApi.getAll.mockRejectedValue({
        response: { data: { detail: 'Project not found' } }
      })

      await store.fetchTasks(999)

      expect(store.error).toBe('Project not found')
    })

    it('should set loading state during fetch', async () => {
      const store = useTasksStore()
      tasksApi.getAll.mockImplementation(() => new Promise(() => {}))

      store.fetchTasks(1)

      expect(store.loading).toBe(true)
    })
  })

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const store = useTasksStore()
      const newTask = { id: 1, title: 'New Task', status: 'todo' }
      tasksApi.create.mockResolvedValue({ data: newTask })

      const result = await store.createTask(1, { title: 'New Task' })

      expect(result).toEqual(newTask)
      expect(store.tasks).toContainEqual(newTask)
    })

    it('should add new task to beginning of list', async () => {
      const store = useTasksStore()
      store.tasks = [{ id: 2, title: 'Existing Task' }]
      const newTask = { id: 1, title: 'New Task' }
      tasksApi.create.mockResolvedValue({ data: newTask })

      await store.createTask(1, { title: 'New Task' })

      expect(store.tasks[0]).toEqual(newTask)
    })

    it('should handle create error', async () => {
      const store = useTasksStore()
      tasksApi.create.mockRejectedValue({
        response: { data: { detail: 'Validation error' } }
      })

      const result = await store.createTask(1, { title: '' })

      expect(result).toBeNull()
      expect(store.error).toBe('Validation error')
    })
  })

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const store = useTasksStore()
      store.tasks = [{ id: 1, title: 'Old Title', status: 'todo' }]
      const updated = { id: 1, title: 'New Title', status: 'done' }
      tasksApi.update.mockResolvedValue({ data: updated })

      const result = await store.updateTask(1, 1, { title: 'New Title', status: 'done' })

      expect(result).toEqual(updated)
      expect(store.tasks[0]).toEqual(updated)
    })

    it('should replace task in array correctly', async () => {
      const store = useTasksStore()
      store.tasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' },
        { id: 3, title: 'Task 3' }
      ]
      const updated = { id: 2, title: 'Updated Task 2' }
      tasksApi.update.mockResolvedValue({ data: updated })

      await store.updateTask(1, 2, { title: 'Updated Task 2' })

      expect(store.tasks[1]).toEqual(updated)
      expect(store.tasks).toHaveLength(3)
    })

    it('should handle update error', async () => {
      const store = useTasksStore()
      tasksApi.update.mockRejectedValue({
        response: { data: { detail: 'Not found' } }
      })

      const result = await store.updateTask(1, 999, { title: 'Test' })

      expect(result).toBeNull()
      expect(store.error).toBe('Not found')
    })
  })

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const store = useTasksStore()
      store.tasks = [
        { id: 1, title: 'To Delete' },
        { id: 2, title: 'Keep' }
      ]
      tasksApi.delete.mockResolvedValue({})

      const result = await store.deleteTask(1, 1)

      expect(result).toBe(true)
      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0].id).toBe(2)
    })

    it('should handle delete error', async () => {
      const store = useTasksStore()
      store.tasks = [{ id: 1, title: 'Task' }]
      tasksApi.delete.mockRejectedValue({
        response: { data: { detail: 'Cannot delete' } }
      })

      const result = await store.deleteTask(1, 1)

      expect(result).toBe(false)
      expect(store.tasks).toHaveLength(1)
    })
  })

  describe('clearTasks', () => {
    it('should clear all tasks', () => {
      const store = useTasksStore()
      store.tasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' }
      ]

      store.clearTasks()

      expect(store.tasks).toEqual([])
    })
  })
})

