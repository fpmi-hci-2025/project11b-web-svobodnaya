<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#regGrad)"/>
              <path d="M8 10h16M8 16h12M8 22h8" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="24" cy="22" r="3" fill="white"/>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop stop-color="#FF6B35"/>
                  <stop offset="1" stop-color="#F7931E"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>Создать аккаунт</h1>
          <p>Присоединяйтесь к TaskFlow</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>

          <div class="input-group">
            <label for="username">Имя пользователя</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="input"
              placeholder="Минимум 3 символа"
              required
              minlength="3"
            />
          </div>

          <div class="input-group">
            <label for="password">Пароль</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="input"
              placeholder="Минимум 6 символов"
              required
              minlength="6"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-lg" :disabled="authStore.loading" style="width: 100%;">
            <span v-if="authStore.loading" class="spinner"></span>
            <span v-else>Зарегистрироваться</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Уже есть аккаунт? <router-link to="/login">Войдите</router-link></p>
        </div>
      </div>
    </div>
    
    <div class="auth-decoration">
      <div class="decoration-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="decoration-content">
        <h2>Начните работу прямо сейчас</h2>
        <p>Создавайте проекты, добавляйте участников и управляйте задачами в удобном интерфейсе</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

async function handleRegister() {
  const success = await authStore.register(form)
  if (success) {
    router.push('/projects')
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
}

.auth-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--bg-main);
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
}

.auth-logo svg {
  width: 100%;
  height: 100%;
}

.auth-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.auth-header p {
  color: var(--text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.auth-decoration {
  flex: 1;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

.decoration-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: 100px;
  left: -50px;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  right: 100px;
}

.decoration-content {
  max-width: 400px;
  text-align: center;
  color: white;
  position: relative;
  z-index: 1;
}

.decoration-content h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
}

.decoration-content p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .auth-decoration {
    display: none;
  }
}
</style>

