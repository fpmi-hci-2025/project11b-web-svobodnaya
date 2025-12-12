import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tasksApi } from '@/api'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  const tasksByStatus = computed(() => {
    const grouped = {
      todo: [],
      in_progress: [],
      review: [],
      done: []
    }
    tasks.value.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })
    return grouped
  })

  async function fetchTasks(projectId) {
    loading.value = true
    error.value = null
    try {
      const response = await tasksApi.getAll(projectId)
      tasks.value = response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка загрузки задач'
    } finally {
      loading.value = false
    }
  }

  async function createTask(projectId, data) {
    loading.value = true
    error.value = null
    try {
      const response = await tasksApi.create(projectId, data)
      tasks.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка создания задачи'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateTask(projectId, taskId, data) {
    loading.value = true
    error.value = null
    try {
      const response = await tasksApi.update(projectId, taskId, data)
      // Replace entire array to trigger Vue reactivity
      tasks.value = tasks.value.map(t => t.id === taskId ? response.data : t)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка обновления задачи'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(projectId, taskId) {
    loading.value = true
    error.value = null
    try {
      await tasksApi.delete(projectId, taskId)
      tasks.value = tasks.value.filter(t => t.id !== taskId)
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка удаления задачи'
      return false
    } finally {
      loading.value = false
    }
  }

  function clearTasks() {
    tasks.value = []
  }

  return {
    tasks,
    tasksByStatus,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    clearTasks
  }
})

