<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">Login</h2>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <input
            v-model="username"
            type="text"
            placeholder="Username"
            class="login-input"
            required
          />
        </div>
        
        <div class="input-group">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="login-input"
            required
          />
        </div>
        
        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="register-link">
          Don't have an account? 
          <router-link to="/register" class="link">Register</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/services/api'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = ''
      
      try {
        const response = await authAPI.login({
          username: this.username,
          password: this.password
        })
        
        const { access_token, user } = response
        
        // Store token and user info
        localStorage.setItem('token', access_token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Check user role and redirect accordingly
        if (user.role === 'moderator') {
          this.$router.push('/mod-dashboard')
        } else {
          this.$router.push('/feed')
        }
        
      } catch (error) {
        this.error = error.response?.data?.detail || 'Login failed. Please try again.'
        console.error('Login error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Arial', sans-serif;
}

.login-box {
  background-color: #2196F3;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
}

.login-title {
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 32px;
  font-weight: 300;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
}

.login-input {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: white;
  transition: all 0.3s ease;
}

.login-input::placeholder {
  color: #999;
  opacity: 1;
}

.login-input:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  transform: scale(1.02);
}

.login-button {
  background-color: #1976D2;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  background-color: #1565C0;
  transform: translateY(-2px);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #ffcdd2;
  text-align: center;
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(244, 67, 54, 0.2);
  border-radius: 8px;
  font-size: 14px;
}

.register-link {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-top: 15px;
}

.link {
  color: white;
  font-weight: bold;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>