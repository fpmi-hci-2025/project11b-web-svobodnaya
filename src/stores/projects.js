import { defineStore } from 'pinia'
import { ref } from 'vue'
import { projectsApi } from '@/api'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      const response = await projectsApi.getAll()
      projects.value = response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка загрузки проектов'
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id) {
    loading.value = true
    error.value = null
    try {
      const response = await projectsApi.getOne(id)
      currentProject.value = response.data
      return currentProject.value
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка загрузки проекта'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createProject(data) {
    loading.value = true
    error.value = null
    try {
      const response = await projectsApi.create(data)
      projects.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка создания проекта'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id, data) {
    loading.value = true
    error.value = null
    try {
      const response = await projectsApi.update(id, data)
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = response.data
      }
      if (currentProject.value?.id === id) {
        currentProject.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка обновления проекта'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id) {
    loading.value = true
    error.value = null
    try {
      await projectsApi.delete(id)
      projects.value = projects.value.filter(p => p.id !== id)
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка удаления проекта'
      return false
    } finally {
      loading.value = false
    }
  }

  async function addMember(projectId, userId) {
    try {
      await projectsApi.addMember(projectId, userId)
      await fetchProject(projectId)
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка добавления участника'
      return false
    }
  }

  async function removeMember(projectId, userId) {
    try {
      await projectsApi.removeMember(projectId, userId)
      await fetchProject(projectId)
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка удаления участника'
      return false
    }
  }

  return {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember
  }
})

