<template>
  <div class="user-feed">
    <div class="header">
      <h1>User Feed</h1>
      <button @click="logout" class="logout-btn">Logout</button>
    </div>
    <div class="content">
      <p>Welcome, {{ user.username }}!</p>
      <p>User feed will be implemented here.</p>
      <p>This page will show posts with approved comments only.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserFeed',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}')
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.user-feed {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #2196F3;
  padding-bottom: 20px;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.content {
  font-size: 16px;
  line-height: 1.6;
}
</style>
