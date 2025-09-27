<template>
  <div class="user-management">
    <div class="section-header">
      <div class="section-title">
        <h2>User Management</h2>
        <p class="section-subtitle">Monitor and manage platform users</p>
      </div>
      <div class="user-stats">
        <div class="stat-chip">
          <span class="stat-label">Total Users:</span>
          <span class="stat-value">{{ usersList.length }}</span>
        </div>
      </div>
    </div>

    <div class="section-controls">
      <div class="filter-controls">
        <label class="filter-label">Select User:</label>
        <select v-model="selectedUserId" class="modern-select">
          <option value="">All Users</option>
          <option v-for="user in usersList" :key="user.id" :value="user.id">
            {{ user.username }}
          </option>
        </select>
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="Loading users..." />

    <div v-else class="users-table-container">
      <div class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Status</th>
              <th>Posts</th>
              <th>Comments</th>
              <th>Flagged</th>
              <th>Join Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="user-id">#{{ user.id }}</td>
              <td class="username">
                <div class="user-cell">
                  <div class="user-avatar-small">
                    {{ user.username ? user.username.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <span class="user-name">{{ user.username }}</span>
                </div>
              </td>
              <td class="status">
                <span class="status-badge" :class="user.is_active ? 'active' : 'inactive'">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="posts-count">{{ user.total_posts || 0 }}</td>
              <td class="comments-count">{{ user.total_comments || 0 }}</td>
              <td class="flagged-count">
                <span v-if="user.flagged_comments > 0" class="flagged-number">
                  {{ user.flagged_comments }}
                </span>
                <span v-else class="no-flags">0</span>
              </td>
              <td class="join-date">{{ formatDate(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-if="filteredUsers.length === 0"
        icon="👥"
        title="No users found"
        message="No users match the selected criteria."
      />
    </div>
  </div>
</template>

<script>
import { moderatorAPI } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

export default {
  name: 'UserManagement',
  components: {
    LoadingSpinner,
    EmptyState
  },
  data() {
    return {
      usersList: [],
      loading: false,
      selectedUserId: ''
    }
  },
  computed: {
    filteredUsers() {
      if (!this.selectedUserId) {
        return this.usersList
      }
      return this.usersList.filter(user => user.id == this.selectedUserId)
    }
  },
  async mounted() {
    await this.loadUsers()
  },
  methods: {
    async loadUsers() {
      this.loading = true
      try {
        const response = await moderatorAPI.getAllUsers()
        // Filter out moderators, show only regular users
        this.usersList = (response.users || []).filter(user => user.role === 'user')
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        this.loading = false
      }
    },
    formatDate(date) {
      if (!date) return 'Unknown date'
      try {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return 'Invalid date'
      }
    }
  }
}
</script>

<style scoped>
.user-management {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.section-title h2 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.section-subtitle {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
}

.user-stats {
  display: flex;
  gap: 16px;
}

.stat-chip {
  background: white;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #667eea;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
}

.stat-value {
  font-weight: 600;
  color: #2c3e50;
}

.section-controls {
  margin-bottom: 24px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.modern-select {
  padding: 10px 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.modern-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.users-table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f8f9fa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.users-table td {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.user-row:hover {
  background: #f8f9fa;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.status-badge.inactive {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.flagged-number {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
}

.no-flags {
  color: #7f8c8d;
  font-size: 14px;
}

@media (max-width: 768px) {
  .users-table {
    font-size: 14px;
  }
  
  .users-table th,
  .users-table td {
    padding: 12px 8px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>