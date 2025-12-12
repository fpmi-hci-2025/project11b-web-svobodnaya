<template>
  <div class="projects-page">
    <div class="page-header">
      <div class="page-header-content">
        <h1>Мои проекты</h1>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Новый проект
        </button>
      </div>
    </div>

    <div class="page-content">
      <div v-if="projectsStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка проектов...</p>
      </div>

      <div v-else-if="projectsStore.projects.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
        </svg>
        <h3>Нет проектов</h3>
        <p>Создайте свой первый проект, чтобы начать работу</p>
        <button @click="showCreateModal = true" class="btn btn-primary mt-4">
          Создать проект
        </button>
      </div>

      <div v-else class="projects-grid">
        <div 
          v-for="project in projectsStore.projects" 
          :key="project.id" 
          class="project-card card card-hover"
          @click="goToProject(project.id)"
        >
          <div class="project-card-header">
            <div class="project-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
              </svg>
            </div>
            <div class="project-owner-badge" v-if="project.owner_id === authStore.user?.id">
              Владелец
            </div>
          </div>
          <h3 class="project-title">{{ project.name }}</h3>
          <p class="project-description">{{ project.description || 'Нет описания' }}</p>
          <div class="project-meta">
            <div class="project-owner">
              <div class="avatar-small">{{ project.owner.username.charAt(0).toUpperCase() }}</div>
              <span>{{ project.owner.username }}</span>
            </div>
            <span class="project-date">{{ formatDate(project.updated_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div v-if="showCreateModal" class="modal-backdrop" @click.self="closeCreateModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Новый проект</h2>
          <button @click="closeCreateModal" class="btn btn-ghost btn-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="handleCreateProject" class="modal-body">
          <div v-if="createError" class="error-message">{{ createError }}</div>
          
          <div class="input-group">
            <label for="projectName">Название проекта</label>
            <input
              id="projectName"
              v-model="newProject.name"
              type="text"
              class="input"
              placeholder="Введите название"
              required
            />
          </div>
          
          <div class="input-group">
            <label for="projectDesc">Описание</label>
            <textarea
              id="projectDesc"
              v-model="newProject.description"
              class="input"
              placeholder="Опишите проект (опционально)"
            ></textarea>
          </div>
        </form>
        <div class="modal-footer">
          <button @click="closeCreateModal" class="btn btn-secondary">Отмена</button>
          <button @click="handleCreateProject" class="btn btn-primary" :disabled="creating">
            <span v-if="creating" class="spinner"></span>
            <span v-else>Создать</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref(null)

const newProject = reactive({
  name: '',
  description: ''
})

onMounted(() => {
  projectsStore.fetchProjects()
})

function goToProject(id) {
  router.push(`/projects/${id}`)
}

function closeCreateModal() {
  showCreateModal.value = false
  newProject.name = ''
  newProject.description = ''
  createError.value = null
}

async function handleCreateProject() {
  if (!newProject.name.trim()) return
  
  creating.value = true
  createError.value = null
  
  const result = await projectsStore.createProject({
    name: newProject.name.trim(),
    description: newProject.description.trim() || null
  })
  
  creating.value = false
  
  if (result) {
    closeCreateModal()
    router.push(`/projects/${result.id}`)
  } else {
    createError.value = projectsStore.error
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин. назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч. назад`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн. назад`
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.projects-page {
  min-height: 100vh;
  background: var(--bg-main);
}

.page-header {
  background: white;
  border-bottom: 1px solid var(--border-light);
  padding: 24px 0;
}

.page-header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
  color: var(--text-secondary);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.project-card {
  cursor: pointer;
}

.project-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.project-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-bg), #FFF5F0);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-icon svg {
  width: 24px;
  height: 24px;
  color: var(--primary);
}

.project-owner-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--primary);
  background: var(--primary-bg);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.project-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.project-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.project-owner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.project-owner span {
  font-size: 13px;
  color: var(--text-secondary);
}

.project-date {
  font-size: 12px;
  color: var(--text-muted);
}
</style>

