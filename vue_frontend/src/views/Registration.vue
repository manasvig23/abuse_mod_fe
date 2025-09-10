<template>
  <div class="registration-container">
    <div class="registration-box">
      <h2 class="registration-title">Register</h2>
      
      <form @submit.prevent="handleRegister" class="registration-form">
        <div class="input-group">
          <input
            v-model="formData.username"
            type="text"
            placeholder="Enter Username"
            class="registration-input"
            required
          />
        </div>
        
        <div class="input-group">
          <input
            v-model="formData.email"
            type="email"
            placeholder="Enter Email"
            class="registration-input"
            required
          />
        </div>
        
        <div class="input-group">
          <input
            v-model="formData.password"
            type="password"
            placeholder="Enter Password"
            class="registration-input"
            required
          />
        </div>
        
        <div class="role-selection">
          <label class="role-label">Select Role:</label>
          <div class="role-buttons">
            <button
              type="button"
              :class="['role-btn', { active: formData.role === 'user' }]"
              @click="formData.role = 'user'"
            >
              User
            </button>
            <button
              type="button"
              :class="['role-btn', { active: formData.role === 'moderator' }]"
              @click="formData.role = 'moderator'"
            >
              Moderator
            </button>
          </div>
        </div>
        
        <button type="submit" class="register-button" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="login-link">
          Already have an account? 
          <router-link to="/login" class="link">Login</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/services/api'

export default {
  name: 'Registration',
  data() {
    return {
      formData: {
        username: '',
        email: '',
        password: '',
        role: 'user'
      },
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleRegister() {
      this.loading = true
      this.error = ''
      
      try {
        const response = await authAPI.register(this.formData)
        
        // Auto-login after successful registration
        const loginResponse = await authAPI.login({
          username: this.formData.username,
          password: this.formData.password
        })
        
        // Store token and user info
        localStorage.setItem('token', loginResponse.access_token)
        localStorage.setItem('user', JSON.stringify(loginResponse.user))
        
        // Redirect based on role
        if (loginResponse.user.role === 'moderator') {
          this.$router.push('/mod-dashboard')
        } else {
          this.$router.push('/feed')
        }
        
      } catch (error) {
        this.error = error.response?.data?.detail || 'Registration failed. Please try again.'
        console.error('Registration error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.registration-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Arial', sans-serif;
  padding: 20px;
}

.registration-box {
  background-color: #2196F3;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
}

.registration-title {
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 32px;
  font-weight: 300;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
}

.registration-input {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: white;
  transition: all 0.3s ease;
}

.registration-input::placeholder {
  color: #999;
  opacity: 1;
}

.registration-input:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  transform: scale(1.02);
}

.role-selection {
  margin: 10px 0;
}

.role-label {
  color: white;
  font-size: 16px;
  font-weight: 500;
  display: block;
  margin-bottom: 10px;
}

.role-buttons {
  display: flex;
  gap: 15px;
}

.role-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background-color: transparent;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.role-btn.active {
  background-color: #1976D2;
  border-color: #1976D2;
  color: white;
}

.register-button {
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

.register-button:hover:not(:disabled) {
  background-color: #1565C0;
  transform: translateY(-2px);
}

.register-button:disabled {
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

.login-link {
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