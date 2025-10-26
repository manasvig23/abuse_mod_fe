<template>
  <div class="moderator-management">
    <div class="section-header">
      <div class="section-title">
        <h2>🛡️ Moderator Management</h2>
        <p class="section-subtitle">Manage moderator accounts (Admin Only)</p>
      </div>
      <div class="admin-badge">
        <span>Admin Panel</span>
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="Loading moderators..." />

    <div v-else class="moderators-table-container">
      <div class="table-wrapper">
        <table class="moderators-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions Taken</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mod in moderators" :key="mod.id" class="moderator-row">
              <td class="mod-id">#{{ mod.id }}</td>
              <td class="username">
                <div class="user-cell">
                  <div class="user-avatar-small">
                    {{ mod.username.charAt(0).toUpperCase() }}
                  </div>
                  <span class="user-name">{{ mod.username }}</span>
                </div>
              </td>
              <td class="email">{{ mod.email }}</td>
              <td class="role">
                <span class="role-badge" :class="mod.role">
                  {{ mod.role === 'admin' ? '👑 Admin' : '🛡️ Moderator' }}
                </span>
              </td>
              <td class="status">
                <span class="status-badge" :class="getStatusClass(mod)">
                  {{ getStatusText(mod) }}
                </span>
              </td>
              <td class="actions-count">{{ mod.moderated_comments || 0 }}</td>
              <td class="last-login">{{ formatDate(mod.last_login) }}</td>
              <td class="actions">
                <div class="action-buttons">
                  <!-- Suspend/Unsuspend Button -->
                  <button
                    v-if="mod.can_suspend"
                    @click="mod.is_suspended ? unsuspendModerator(mod) : showSuspendModal(mod)"
                    class="action-btn"
                    :class="mod.is_suspended ? 'success' : 'warning'"
                  >
                    {{ mod.is_suspended ? '✅ Unsuspend' : '⚠️ Suspend' }}
                  </button>
                  
                  <!-- Delete Button -->
                  <button
                    v-if="mod.can_delete"
                    @click="showDeleteModal(mod)"
                    class="action-btn danger"
                  >
                    🗑️ Delete
                  </button>
                  
                  <!-- Protected Badge -->
                  <span v-if="mod.username === 'admin'" class="protected-badge">
                    🔒 Protected
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-if="moderators.length === 0"
        icon="👥"
        title="No moderators found"
        message="No moderator accounts in the system."
      />
    </div>

    <!-- Suspend Modal -->
    <Modal
      v-if="showSuspendConfirm"
      title="Suspend Moderator"
      size="medium"
      :show-footer="true"
      @close="closeSuspendModal"
    >
      <div class="modal-content">
        <p style="color: #333333; margin-bottom: 20px;">
          Are you sure you want to suspend <strong>{{ selectedModerator.username }}</strong>?
        </p>
        
        <div class="form-group">
          <label class="form-label">Suspension Reason:</label>
          <textarea
            style="background-color: #f1efefff;"
            v-model="suspensionReason"
            class="form-textarea"
            rows="4"
            placeholder="Enter the reason for suspension..."
            required
          ></textarea>
        </div>
        
        <div class="warning-box">
          <p><strong>⚠️ This action will:</strong></p>
          <ul>
            <li>Revoke all moderator privileges</li>
            <li>Block access to moderator dashboard</li>
            <li>Send suspension notification email</li>
            <li>Require admin action to restore access</li>
          </ul>
        </div>
      </div>
      
      <template #footer>
        <button @click="closeSuspendModal" class="modal-button secondary">Cancel</button>
        <button 
          @click="confirmSuspend" 
          class="modal-button warning"
          :disabled="!suspensionReason.trim() || processing"
        >
          <span v-if="processing" class="loading-spinner-small"></span>
          {{ processing ? 'Suspending...' : 'Suspend Moderator' }}
        </button>
      </template>
    </Modal>

    <!-- Delete Modal -->
    <Modal
      v-if="showDeleteConfirm"
      title="Delete Moderator Account"
      size="medium"
      :show-footer="true"
      @close="closeDeleteModal"
    >
      <div class="modal-content">
        <p style="color: #e74c3c; font-weight: 600; margin-bottom: 20px;">
          ⚠️ PERMANENT ACTION - Cannot be undone!
        </p>
        
        <p style="color: #333333; margin-bottom: 20px;">
          Are you sure you want to permanently delete <strong>{{ selectedModerator.username }}</strong>'s moderator account?
        </p>
        
        <div class="form-group">
          <label class="form-label">Deletion Reason:</label>
          <textarea
            style="background-color: #f1efefff;"
            v-model="deletionReason"
            class="form-textarea"
            rows="4"
            placeholder="Enter the reason for deletion..."
            required
          ></textarea>
        </div>
        
        <div class="danger-box">
          <p><strong>🚫 This will permanently:</strong></p>
          <ul>
            <li>Delete the moderator account</li>
            <li>Remove all moderator privileges</li>
            <li>Archive their moderation history</li>
            <li>Send deletion notification email</li>
          </ul>
          <p style="margin-top: 15px; color: #c0392b; font-weight: 600;">
            This action CANNOT be reversed!
          </p>
        </div>
      </div>
      
      <template #footer>
        <button @click="closeDeleteModal" class="modal-button secondary">Cancel</button>
        <button 
          @click="confirmDelete" 
          class="modal-button danger"
          :disabled="!deletionReason.trim() || processing"
        >
          <span v-if="processing" class="loading-spinner-small"></span>
          {{ processing ? 'Deleting...' : 'Delete Permanently' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { adminAPI } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Modal from '@/components/common/Modal.vue'

export default {
  name: 'ModeratorManagement',
  components: {
    LoadingSpinner,
    EmptyState,
    Modal
  },
  data() {
    return {
      moderators: [],
      loading: false,
      showSuspendConfirm: false,
      showDeleteConfirm: false,
      selectedModerator: {},
      suspensionReason: '',
      deletionReason: '',
      processing: false
    }
  },
  async mounted() {
    await this.loadModerators()
  },
  methods: {
    async loadModerators() {
      this.loading = true
      try {
        const response = await adminAPI.getAllModerators()
        this.moderators = response.moderators || []
      } catch (error) {
        console.error('Error loading moderators:', error)
        alert('Failed to load moderators')
      } finally {
        this.loading = false
      }
    },
    
    getStatusClass(mod) {
      if (mod.is_suspended) return 'suspended'
      if (mod.is_active) return 'active'
      return 'inactive'
    },
    
    getStatusText(mod) {
      if (mod.is_suspended) return 'Suspended'
      if (mod.is_active) return 'Active'
      return 'Inactive'
    },
    
    showSuspendModal(moderator) {
      this.selectedModerator = moderator
      this.suspensionReason = ''
      this.showSuspendConfirm = true
    },
    
    closeSuspendModal() {
      this.showSuspendConfirm = false
      this.selectedModerator = {}
      this.suspensionReason = ''
    },
    
    async confirmSuspend() {
      if (!this.suspensionReason.trim()) {
        alert('Please provide a reason for suspension')
        return
      }
      
      this.processing = true
      try {
        await adminAPI.suspendModerator(this.selectedModerator.id, {
          reason: this.suspensionReason
        })
        
        alert(`✅ Moderator '${this.selectedModerator.username}' suspended successfully`)
        this.closeSuspendModal()
        await this.loadModerators()
      } catch (error) {
        console.error('Error suspending moderator:', error)
        alert(error.response?.data?.detail || 'Failed to suspend moderator')
      } finally {
        this.processing = false
      }
    },
    
    async unsuspendModerator(moderator) {
      const confirmed = confirm(`Unsuspend moderator '${moderator.username}'?`)
      if (!confirmed) return
      
      try {
        await adminAPI.unsuspendModerator(moderator.id)
        alert(`✅ Moderator '${moderator.username}' unsuspended successfully`)
        await this.loadModerators()
      } catch (error) {
        console.error('Error unsuspending moderator:', error)
        alert('Failed to unsuspend moderator')
      }
    },
    
    showDeleteModal(moderator) {
      this.selectedModerator = moderator
      this.deletionReason = ''
      this.showDeleteConfirm = true
    },
    
    closeDeleteModal() {
      this.showDeleteConfirm = false
      this.selectedModerator = {}
      this.deletionReason = ''
    },
    
    async confirmDelete() {
      if (!this.deletionReason.trim()) {
        alert('Please provide a reason for deletion')
        return
      }
      
      this.processing = true
      try {
        await adminAPI.deleteModerator(this.selectedModerator.id, {
          reason: this.deletionReason
        })
        
        alert(`✅ Moderator '${this.selectedModerator.username}' deleted permanently`)
        this.closeDeleteModal()
        await this.loadModerators()
      } catch (error) {
        console.error('Error deleting moderator:', error)
        alert(error.response?.data?.detail || 'Failed to delete moderator')
      } finally {
        this.processing = false
      }
    },
    
    formatDate(date) {
      if (!date) return 'Never'
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
.moderator-management {
  animation: fadeIn 0.5s ease;
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

.admin-badge {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

.moderators-table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.table-wrapper {
  overflow-x: auto;
}

.moderators-table {
  width: 100%;
  border-collapse: collapse;
}

.moderators-table th {
  background: #f8f9fa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.moderators-table td {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.moderator-row:hover {
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

.role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.admin {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.role-badge.moderator {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
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

.status-badge.suspended {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.status-badge.inactive {
  background: rgba(149, 165, 166, 0.1);
  color: #95a5a6;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.warning {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.2);
}

.action-btn.warning:hover {
  background: #f39c12;
  color: white;
}

.action-btn.success {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.action-btn.success:hover {
  background: #27ae60;
  color: white;
}

.action-btn.danger {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.action-btn.danger:hover {
  background: #e74c3c;
  color: white;
}

.protected-badge {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.warning-box {
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
  background: #fff3cd;
  border: 1px solid #ffc107;
}

.warning-box p {
  color: #856404 !important;
  font-weight: 600;
  margin: 10px 0;
}

.warning-box ul {
  margin: 10px 0;
  padding-left: 20px;
}

.warning-box li {
  color: #856404 !important;
  margin: 5px 0;
}

/* Fix for danger box */
.danger-box {
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
  background: #f8d7da;
  border: 1px solid #dc3545;
}

.danger-box p {
  color: #721c24 !important;
  font-weight: 600;
  margin: 10px 0;
}

.danger-box ul {
  margin: 10px 0;
  padding-left: 20px;
}

.danger-box li {
  color: #721c24 !important;
  margin: 5px 0;
}

.danger-box strong {
  color: #721c24 !important;
}

.modal-content p {
  color: #2c3e50 !important;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #ffffffff;
  margin-bottom: 8px;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-family: inherit;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 1);
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>