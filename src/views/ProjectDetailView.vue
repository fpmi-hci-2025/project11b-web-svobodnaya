<template>
  <div class="project-detail-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка проекта...</p>
    </div>

    <template v-else-if="project">
      <!-- Project Header -->
      <div class="project-header">
        <div class="project-header-content">
          <div class="project-header-left">
            <router-link to="/projects" class="back-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Проекты
            </router-link>
            <h1>{{ project.name }}</h1>
            <p v-if="project.description" class="project-desc">{{ project.description }}</p>
          </div>
          <div class="project-header-right">
            <button 
              v-if="isOwner" 
              @click="showMembersModal = true" 
              class="btn btn-secondary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Участники ({{ project.members.length + 1 }})
            </button>
            <button @click="showTaskModal = true" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Новая задача
            </button>
          </div>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle-container">
        <div class="view-toggle">
          <button 
            :class="['toggle-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Список
          </button>
          <button 
            :class="['toggle-btn', { active: viewMode === 'board' }]"
            @click="viewMode = 'board'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Доска
          </button>
        </div>
      </div>

      <!-- Tasks Content -->
      <div class="tasks-content">
        <!-- List View -->
        <div v-if="viewMode === 'list'" class="tasks-list-view">
          <div v-if="tasksStore.tasks.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <h3>Нет задач</h3>
            <p>Создайте первую задачу для этого проекта</p>
          </div>

          <div v-else class="tasks-list">
            <div 
              v-for="task in tasksStore.tasks" 
              :key="task.id" 
              class="task-item card"
              @click="openEditTask(task)"
            >
              <div class="task-item-left">
                <div class="task-status-dot" :class="task.status"></div>
                <div class="task-info">
                  <h4>{{ task.title }}</h4>
                  <p v-if="task.description">{{ task.description }}</p>
                </div>
              </div>
              <div class="task-item-right">
                <span :class="['badge', `badge-${task.complexity}`]">
                  {{ complexityLabels[task.complexity] }}
                </span>
                <span :class="['badge', `badge-${task.status}`]">
                  {{ statusLabels[task.status] }}
                </span>
                <div v-if="task.assignee" class="task-assignee">
                  <div class="avatar-small">{{ task.assignee.username.charAt(0).toUpperCase() }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Board View -->
        <div v-else class="tasks-board-view">
          <div 
            v-for="status in statusOrder" 
            :key="status" 
            class="board-column"
          >
            <div class="column-header">
              <div class="column-title">
                <div class="status-indicator" :class="status"></div>
                <span>{{ statusLabels[status] }}</span>
              </div>
              <span class="column-count">{{ tasksStore.tasksByStatus[status]?.length || 0 }}</span>
            </div>
            <div class="column-tasks">
              <div 
                v-for="task in tasksStore.tasksByStatus[status]" 
                :key="task.id" 
                class="board-task card card-hover"
                @click="openEditTask(task)"
              >
                <h4>{{ task.title }}</h4>
                <p v-if="task.description" class="task-desc">{{ task.description }}</p>
                <div class="board-task-footer">
                  <span :class="['badge', `badge-${task.complexity}`]">
                    {{ complexityLabels[task.complexity] }}
                  </span>
                  <div v-if="task.assignee" class="avatar-small">
                    {{ task.assignee.username.charAt(0).toUpperCase() }}
                  </div>
                </div>
              </div>
              <button 
                v-if="status === 'todo'"
                @click="showTaskModal = true" 
                class="add-task-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Добавить задачу
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Create/Edit Task Modal -->
    <div v-if="showTaskModal" class="modal-backdrop" @click.self="closeTaskModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingTask ? 'Редактировать задачу' : 'Новая задача' }}</h2>
          <button @click="closeTaskModal" class="btn btn-ghost btn-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="handleSaveTask" class="modal-body">
          <div class="input-group">
            <label for="taskTitle">Название</label>
            <input
              id="taskTitle"
              v-model="taskForm.title"
              type="text"
              class="input"
              placeholder="Введите название задачи"
              required
            />
          </div>

          <div class="input-group">
            <label for="taskDesc">Описание</label>
            <textarea
              id="taskDesc"
              v-model="taskForm.description"
              class="input"
              placeholder="Опишите задачу (опционально)"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label for="taskStatus">Статус</label>
              <select id="taskStatus" v-model="taskForm.status" class="input">
                <option v-for="status in statusOrder" :key="status" :value="status">
                  {{ statusLabels[status] }}
                </option>
              </select>
            </div>

            <div class="input-group">
              <label for="taskComplexity">Сложность</label>
              <select id="taskComplexity" v-model="taskForm.complexity" class="input">
                <option value="low">Низкая</option>
                <option value="medium">Средняя</option>
                <option value="high">Высокая</option>
                <option value="critical">Критическая</option>
              </select>
            </div>
          </div>

          <div class="input-group">
            <label for="taskAssignee">Ответственный</label>
            <select id="taskAssignee" v-model="taskForm.assignee_id" class="input">
              <option :value="null">Не назначен</option>
              <option :value="project.owner.id">{{ project.owner.username }} (владелец)</option>
              <option 
                v-for="member in project.members" 
                :key="member.user.id" 
                :value="member.user.id"
              >
                {{ member.user.username }}
              </option>
            </select>
          </div>
        </form>
        <div class="modal-footer">
          <button 
            v-if="editingTask" 
            @click="handleDeleteTask" 
            class="btn btn-danger"
            :disabled="savingTask"
          >
            Удалить
          </button>
          <div class="flex-1"></div>
          <button @click="closeTaskModal" class="btn btn-secondary">Отмена</button>
          <button @click="handleSaveTask" class="btn btn-primary" :disabled="savingTask">
            <span v-if="savingTask" class="spinner"></span>
            <span v-else>{{ editingTask ? 'Сохранить' : 'Создать' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Members Modal -->
    <div v-if="showMembersModal" class="modal-backdrop" @click.self="showMembersModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Участники проекта</h2>
          <button @click="showMembersModal = false" class="btn btn-ghost btn-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <!-- Add member search -->
          <div class="search-member">
            <label class="search-label">Добавить участника</label>
            <input
              v-model="memberSearch"
              @input="searchUsers"
              type="text"
              class="input"
              placeholder="Введите имя пользователя (мин. 2 символа)"
            />
            <div v-if="searchResults.length > 0" class="search-results">
              <div 
                v-for="user in searchResults" 
                :key="user.id" 
                class="search-result-item"
                @click="addMember(user)"
              >
                <div class="avatar-small">{{ user.username.charAt(0).toUpperCase() }}</div>
                <div>
                  <div class="font-medium">{{ user.username }}</div>
                </div>
                <span class="add-btn">+ Добавить</span>
              </div>
            </div>
            <p v-if="memberSearch.length >= 2 && searchResults.length === 0 && !searchLoading" class="no-results">
              Пользователи не найдены
            </p>
          </div>

          <!-- Members list -->
          <div class="members-section-title">Текущие участники</div>
          <div class="members-list">
            <div class="member-item">
              <div class="member-info">
                <div class="avatar-small">{{ project.owner.username.charAt(0).toUpperCase() }}</div>
                <div>
                  <div class="font-medium">{{ project.owner.username }}</div>
                </div>
              </div>
              <span class="owner-badge">Владелец</span>
            </div>
            <div v-for="member in project.members" :key="member.id" class="member-item">
              <div class="member-info">
                <div class="avatar-small">{{ member.user.username.charAt(0).toUpperCase() }}</div>
                <div>
                  <div class="font-medium">{{ member.user.username }}</div>
                </div>
              </div>
              <button @click="removeMember(member.user.id)" class="btn btn-ghost btn-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/auth'
import { usersApi } from '@/api'

const route = useRoute()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const authStore = useAuthStore()

const loading = ref(true)
const viewMode = ref('board')
const showTaskModal = ref(false)
const showMembersModal = ref(false)
const editingTask = ref(null)
const savingTask = ref(false)
const memberSearch = ref('')
const searchResults = ref([])
const searchLoading = ref(false)

const statusOrder = ['todo', 'in_progress', 'review', 'done']
const statusLabels = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  review: 'На проверке',
  done: 'Готово'
}
const complexityLabels = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
  critical: 'Критическая'
}

const taskForm = reactive({
  title: '',
  description: '',
  status: 'todo',
  complexity: 'medium',
  assignee_id: null
})

const project = computed(() => projectsStore.currentProject)
const isOwner = computed(() => project.value?.owner_id === authStore.user?.id)

onMounted(async () => {
  const projectId = route.params.id
  await projectsStore.fetchProject(projectId)
  await tasksStore.fetchTasks(projectId)
  loading.value = false
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    loading.value = true
    await projectsStore.fetchProject(newId)
    await tasksStore.fetchTasks(newId)
    loading.value = false
  }
})

function openEditTask(task) {
  editingTask.value = task
  taskForm.title = task.title
  taskForm.description = task.description || ''
  taskForm.status = task.status
  taskForm.complexity = task.complexity
  taskForm.assignee_id = task.assignee_id
  showTaskModal.value = true
}

function closeTaskModal() {
  showTaskModal.value = false
  editingTask.value = null
  taskForm.title = ''
  taskForm.description = ''
  taskForm.status = 'todo'
  taskForm.complexity = 'medium'
  taskForm.assignee_id = null
}

async function handleSaveTask() {
  if (!taskForm.title.trim()) return
  
  savingTask.value = true
  const projectId = route.params.id
  
  const data = {
    title: taskForm.title.trim(),
    description: taskForm.description.trim() || null,
    status: taskForm.status,
    complexity: taskForm.complexity,
    assignee_id: taskForm.assignee_id
  }
  
  if (editingTask.value) {
    await tasksStore.updateTask(projectId, editingTask.value.id, data)
    await tasksStore.fetchTasks(projectId)
  } else {
    await tasksStore.createTask(projectId, data)
    await tasksStore.fetchTasks(projectId)
  }
  
  savingTask.value = false
  closeTaskModal()
}

async function handleDeleteTask() {
  if (!editingTask.value) return
  
  savingTask.value = true
  const projectId = route.params.id
  await tasksStore.deleteTask(projectId, editingTask.value.id)
  savingTask.value = false
  closeTaskModal()
}

let searchTimeout = null
async function searchUsers() {
  clearTimeout(searchTimeout)
  
  if (memberSearch.value.length < 2) {
    searchResults.value = []
    searchLoading.value = false
    return
  }
  
  searchLoading.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const response = await usersApi.search(memberSearch.value)
      // Filter out owner and existing members
      const existingIds = [
        project.value.owner_id,
        ...project.value.members.map(m => m.user.id)
      ]
      searchResults.value = response.data.filter(u => !existingIds.includes(u.id))
    } catch (e) {
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

async function addMember(user) {
  await projectsStore.addMember(project.value.id, user.id)
  memberSearch.value = ''
  searchResults.value = []
}

async function removeMember(userId) {
  await projectsStore.removeMember(project.value.id, userId)
  // Refresh tasks to update unassigned tasks
  await tasksStore.fetchTasks(route.params.id)
}
</script>

<style scoped>
.project-detail-page {
  min-height: 100vh;
  background: var(--bg-main);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  color: var(--text-secondary);
}

.project-header {
  background: white;
  border-bottom: 1px solid var(--border-light);
  padding: 24px 0;
}

.project-header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.project-header-left {
  flex: 1;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 12px;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--primary);
}

.project-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.project-desc {
  color: var(--text-secondary);
  font-size: 15px;
}

.project-header-right {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.view-toggle-container {
  background: white;
  border-bottom: 1px solid var(--border-light);
  padding: 12px 0;
}

.view-toggle {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 4px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-btn:hover {
  background: var(--bg-main);
}

.toggle-btn.active {
  background: var(--primary-bg);
  color: var(--primary);
}

.tasks-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* List View */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.task-item:hover {
  border-color: var(--primary-light);
}

.task-item-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.task-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-status-dot.todo { background: var(--status-todo); }
.task-status-dot.in_progress { background: var(--status-progress); }
.task-status-dot.review { background: var(--status-review); }
.task-status-dot.done { background: var(--status-done); }

.task-info {
  min-width: 0;
}

.task-info h4 {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.task-info p {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-item-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Board View */
.tasks-board-view {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  overflow-x: auto;
}

.board-column {
  min-width: 280px;
  background: var(--bg-main);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.todo { background: var(--status-todo); }
.status-indicator.in_progress { background: var(--status-progress); }
.status-indicator.review { background: var(--status-review); }
.status-indicator.done { background: var(--status-done); }

.column-count {
  font-size: 13px;
  color: var(--text-muted);
  background: var(--bg-card);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.column-tasks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.board-task {
  padding: 16px;
  cursor: pointer;
}

.board-task h4 {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.board-task .task-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.board-task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-task-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  font-family: inherit;
  font-size: 13px;
  color: var(--text-muted);
  background: transparent;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-task-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-bg);
}

/* Form row */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Members modal */
.search-member {
  position: relative;
  margin-bottom: 24px;
}

.search-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.search-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.search-result-item:hover {
  background: var(--primary-bg);
}

.search-result-item:hover .add-btn {
  opacity: 1;
}

.add-btn {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  color: var(--primary);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.no-results {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.members-section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-main);
  border-radius: var(--radius-md);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.owner-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-bg);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

@media (max-width: 1024px) {
  .tasks-board-view {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .project-header-content {
    flex-direction: column;
  }
  
  .project-header-right {
    width: 100%;
    flex-direction: column;
  }
  
  .tasks-board-view {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

