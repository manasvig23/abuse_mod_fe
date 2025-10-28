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
              <th>Account Status</th>
              <th>Last Activity</th>
              <th>Posts</th>
              <th>Comments</th>
              <th>Flagged</th>
              <th>Join Date</th>
              <th>Actions</th>
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
                  {{ user.is_active ? 'Active' : 'Disabled' }}
                </span>
              </td>
              <td class="last-activity">
                <div class="activity-cell">
                  <span class="activity-indicator" :class="user.is_recently_active ? 'online' : 'offline'"></span>
                  <span class="activity-text">{{ user.last_activity || 'Never' }}</span>
                </div>
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
              <td class="actions">
                <button 
                  @click="handleDeleteUser(user)" 
                  class="delete-btn"
                  :title="`Delete ${user.username}`"
                >
                  🗑️ Delete
                </button>
              </td>
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

    <!-- Delete User Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>Delete User Account</h3>
          <button @click="closeDeleteModal" class="modal-close">✕</button>
        </div>
        
        <div class="modal-body">
          <p style="color: #e74c3c; font-weight: 600; margin-bottom: 20px;">
            ⚠️ PERMANENT ACTION - Cannot be undone!
          </p>
          
          <div class="user-info-box">
            <h4>User Details:</h4>
            <p><strong>Username:</strong> {{ userToDelete?.username }}</p>
            <p><strong>Email:</strong> {{ userToDelete?.email }}</p>
            <p><strong>Posts:</strong> {{ userToDelete?.total_posts || 0 }}</p>
            <p><strong>Comments:</strong> {{ userToDelete?.total_comments || 0 }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">Deletion Reason:</label>
            <select v-model="deletionReason" class="form-select">
              <option value="">-- Select a reason --</option>
              <option value="Spam account">Spam account</option>
              <option value="Harassment or bullying">Harassment or bullying</option>
              <option value="Hate speech">Hate speech</option>
              <option value="Repeated policy violations">Repeated policy violations</option>
              <option value="Bot or fake account">Bot or fake account</option>
              <option value="User request">User request</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div class="warning-box">
            <p><strong>⚠️ This will permanently:</strong></p>
            <ul>
              <li>Delete the user account</li>
              <li>Remove all their posts</li>
              <li>Remove all their comments</li>
              <li>Remove all blocking relationships</li>
            </ul>
            <p style="margin-top: 15px; color: #c0392b; font-weight: 600;">
              This action CANNOT be reversed!
            </p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="modal-button secondary">Cancel</button>
          <button 
            @click="confirmDeleteUser" 
            class="modal-button danger"
            :disabled="!deletionReason || deleting"
          >
            <span v-if="deleting" class="loading-spinner-small"></span>
            {{ deleting ? 'Deleting...' : 'Delete Permanently' }}
          </button>
        </div>
      </div>
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
      selectedUserId: '',
      showDeleteModal: false,
      userToDelete: null,
      deletionReason: '',
      deleting: false
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
    },

    handleDeleteUser(user) {
      this.userToDelete = user
      this.deletionReason = ''
      this.showDeleteModal = true
    },

    closeDeleteModal() {
      this.showDeleteModal = false
      this.userToDelete = null
      this.deletionReason = ''
    },

    async confirmDeleteUser() {
      if (!this.deletionReason.trim()) {
        alert('Please select a deletion reason')
        return
      }

      this.deleting = true
      try {
        await moderatorAPI.deleteUser(this.userToDelete.id, this.deletionReason)
        alert(`✅ User '${this.userToDelete.username}' deleted successfully`)
        this.closeDeleteModal()
        await this.loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        alert(error.response?.data?.detail || 'Failed to delete user')
      } finally {
        this.deleting = false
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

.activity-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.activity-indicator.online {
  background: #27ae60;
  box-shadow: 0 0 8px rgba(39, 174, 96, 0.5);
  animation: pulse-online 2s infinite;
}

.activity-indicator.offline {
  background: #95a5a6;
}

@keyframes pulse-online {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.activity-text {
  color: #7f8c8d;
  font-size: 13px;
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

.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.delete-btn:hover {
  background: #e74c3c;
  color: white;
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-dialog {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.4s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: #95a5a6;
}

.modal-close:hover {
  background: rgba(0,0,0,0.1);
  color: #2c3e50;
}

.modal-body {
  padding: 28px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px 28px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8f9fa;
}

.user-info-box {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid #3498db;
}

.user-info-box h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 14px;
}

.user-info-box p {
  margin: 6px 0;
  color: #5a6c7d;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  transition: all 0.3s ease;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.warning-box {
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
  background: #f8d7da;
  border: 1px solid #dc3545;
}

.warning-box p {
  color: #721c24;
  font-weight: 600;
  margin: 10px 0;
}

.warning-box ul {
  margin: 10px 0;
  padding-left: 20px;
}

.warning-box li {
  color: #721c24;
  margin: 5px 0;
}

.modal-button {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal-button.secondary {
  background: #e9ecef;
  color: #495057;
}

.modal-button.secondary:hover {
  background: #dee2e6;
}

.modal-button.danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.modal-button.danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.modal-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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