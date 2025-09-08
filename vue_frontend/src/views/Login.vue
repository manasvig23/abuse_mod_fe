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
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

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
        const response = await axios.post('http://localhost:8001/api/login', {
          username: this.username,
          password: this.password
        })
        
        const { access_token, user } = response.data
        
        // Store token and user info
        localStorage.setItem('token', access_token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Check user role and redirect accordingly
        if (user.role === 'moderator') {
          // Redirect to moderator dashboard
          this.$router.push('/moderator-dashboard')
        } else {
          // Redirect to user feed
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
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Arial', sans-serif;
}

.login-box {
  background-color: #2196F3;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-title {
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
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
  border-radius: 5px;
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
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  transform: scale(1.02);
}

.login-button {
  background-color: #1976D2;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 5px;
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
  border-radius: 5px;
  font-size: 14px;
}
</style>