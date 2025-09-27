<template>
  <div class="dashboard-container" :class="{ loaded: isLoaded }">
    <!-- Modern Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-section">
            <div class="logo-icon">🛡️</div>
            <div class="header-info">
              <h1 class="welcome-text">Moderator Dashboard</h1>
              <p class="welcome-subtitle">Welcome back, <span class="username-highlight">{{ user.username }}</span></p>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="user-profile">
            <div class="user-avatar">{{ user.username ? user.username.charAt(0).toUpperCase() : 'M' }}</div>
            <div class="user-info">
              <span class="user-name">{{ user.username }}</span>
              <span class="user-role">{{ user.role }}</span>
            </div>
          </div>
          <button @click="showLogoutModal = true" class="logout-button">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Dashboard Layout -->
    <div class="dashboard-layout">
      <!-- Enhanced Sidebar -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'allPosts' }" 
            @click="switchTab('allPosts')"
          >
            <div class="nav-icon">📋</div>
            <div class="nav-content">
              <span class="nav-text">All Posts</span>
              <span class="nav-description">View user posts</span>
            </div>
            <div class="nav-indicator"></div>
          </div>
          
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'reviewComments' }" 
            @click="switchTab('reviewComments')"
          >
            <div class="nav-icon">⚖️</div>
            <div class="nav-content">
              <span class="nav-text">Review Comments</span>
              <span class="nav-description">Comments needing review</span>
            </div>
            <div class="nav-badge" v-if="pendingReviewCount > 0">{{ pendingReviewCount }}</div>
            <div class="nav-indicator"></div>
          </div>
          
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'flaggedComments' }" 
            @click="switchTab('flaggedComments')"
          >
            <div class="nav-icon">🚩</div>
            <div class="nav-content">
              <span class="nav-text">Flagged Comments</span>
              <span class="nav-description">Hidden content</span>
            </div>
            <div class="nav-indicator"></div>
          </div>
          
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'statistics' }" 
            @click="switchTab('statistics')"
          >
            <div class="nav-icon">📊</div>
            <div class="nav-content">
              <span class="nav-text">Statistics</span>
              <span class="nav-description">System analytics</span>
            </div>
            <div class="nav-indicator"></div>
          </div>
          
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'userList' }" 
            @click="switchTab('userList')"
          >
            <div class="nav-icon">👥</div>
            <div class="nav-content">
              <span class="nav-text">User Management</span>
              <span class="nav-description">Manage users</span>
            </div>
            <div class="nav-indicator"></div>
          </div>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Dynamic Component Loading -->
        <AllPosts 
          v-if="activeTab === 'allPosts'" 
          :users="users" 
          @view-comments="handleViewComments"
        />
        
        <ReviewComments 
          v-if="activeTab === 'reviewComments'" 
          @view-comments="handleViewComments"
          @review-comments="handleReviewComments"
        />
        
        <FlaggedComments 
          v-if="activeTab === 'flaggedComments'" 
          :users="users"
          @view-flagged-comments="handleViewFlaggedComments"
        />
        
        <Statistics 
          v-if="activeTab === 'statistics'" 
          :users="users"
        />
        
        <UserManagement 
          v-if="activeTab === 'userList'" 
        />
      </main>
    </div>

    <!-- Review Modal -->
    <ReviewModal
      v-if="showReviewModal"
      :post="selectedPost"
      :comments="reviewComments"
      :modal-title="modalTitle"
      :section-title="sectionTitle"
      :show-actions="showReviewActions"
      @close="closeReviewModal"
      @review-comment="handleReviewComment"
    />

    <!-- Logout Modal -->
    <Modal
      v-if="showLogoutModal"
      title="Confirm Logout"
      size="small"
      type="modern"
      :show-footer="false"
      @close="showLogoutModal = false"
    >
      <p>Are you sure you want to logout from your moderator account?</p>
      
      <template #footer>
        <button @click="showLogoutModal = false" class="modal-button secondary">Cancel</button>
        <button @click="confirmLogout" class="modal-button danger">Logout</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { moderatorAPI } from '@/services/api'
import AllPosts from '@/components/moderator/AllPosts.vue'
import ReviewComments from '@/components/moderator/ReviewComments.vue'
import FlaggedComments from '@/components/moderator/FlaggedComments.vue'
import Statistics from '@/components/moderator/Statistics.vue'
import UserManagement from '@/components/moderator/UserManagement.vue'
import ReviewModal from '@/components/moderator/ReviewModal.vue'
import Modal from '@/components/common/Modal.vue'

export default {
  name: 'ModeratorDashboard',
  components: {
    AllPosts,
    ReviewComments,
    FlaggedComments,
    Statistics,
    UserManagement,
    ReviewModal,
    Modal
  },
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      activeTab: 'allPosts',
      isLoaded: false,
      
      // Modal states
      showReviewModal: false,
      showLogoutModal: false,
      
      // Review modal data
      selectedPost: {},
      reviewComments: [],
      modalTitle: 'Review Comments',
      sectionTitle: 'Comments for Review',
      showReviewActions: true,
      
      // Users list for dropdowns
      users: [],
      
      // Computed values
      pendingReviewCount: 0
    }
  },
  
  async mounted() {
    await this.loadInitialData()
    
    // Add entrance animation
    setTimeout(() => {
      this.isLoaded = true
    }, 100)
  },
  
  methods: {
    async loadInitialData() {
      try {
        const response = await moderatorAPI.getUsersDropdown()
        this.users = response.users || []
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    },
    
    switchTab(tab) {
      this.activeTab = tab
    },
    
    async handleViewComments(postId) {
      try {
        const response = await moderatorAPI.getPostComments(postId)
        this.selectedPost = response.post || {}
        this.reviewComments = response.comments || []
        this.modalTitle = 'View Comments'
        this.sectionTitle = 'All Comments'
        this.showReviewActions = false
        this.showReviewModal = true
      } catch (error) {
        console.error('Error loading post comments:', error)
        alert('Failed to load comments')
      }
    },
    
    async handleReviewComments(postId) {
      try {
        const response = await moderatorAPI.getPostForReview(postId)
        this.selectedPost = response.post || {}
        this.reviewComments = response.comments || []
        this.modalTitle = 'Review Comments'
        this.sectionTitle = 'Comments for Review'
        this.showReviewActions = true
        this.showReviewModal = true
      } catch (error) {
        console.error('Error loading post for review:', error)
        alert('Failed to load comments for review')
      }
    },
    
    handleViewFlaggedComments(postId) {
      // Similar to view comments but focused on flagged ones
      this.handleViewComments(postId)
    },
    
    async handleReviewComment(commentId, action) {
      try {
        await moderatorAPI.reviewComment(commentId, action)
        
        // Show success message
        const actionText = action === 'approve' ? 'approved' : action === 'hide' ? 'hidden' : 'deleted'
        alert(`Comment ${actionText} successfully`)
        
        // Reload the current modal data
        if (this.showReviewActions) {
          await this.handleReviewComments(this.selectedPost.id)
        } else {
          await this.handleViewComments(this.selectedPost.id)
        }
        
      } catch (error) {
        console.error('Error reviewing comment:', error)
        alert('Failed to review comment')
      }
    },
    
    closeReviewModal() {
      this.showReviewModal = false
      this.selectedPost = {}
      this.reviewComments = []
    },
    
    confirmLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* Dashboard Container */
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.dashboard-container.loaded {
  opacity: 1;
}

/* Header */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  font-size: 32px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.welcome-text {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.welcome-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 4px 0 0 0;
}

.username-highlight {
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  opacity: 0.8;
  text-transform: capitalize;
}

.logout-button {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: rgba(255,255,255,0.3);
}

/* Dashboard Layout */
.dashboard-layout {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}

/* Sidebar */
.sidebar {
  width: 300px;
  background: rgba(255,255,255,0.95);
  border-right: 1px solid rgba(255,255,255,0.2);
}

.sidebar-nav {
  padding: 30px 0;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 30px;
  margin: 0 20px 8px 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #2c3e50;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-text {
  font-size: 16px;
  font-weight: 600;
}

.nav-description {
  font-size: 12px;
  opacity: 0.8;
}

.nav-badge {
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.nav-indicator {
  position: absolute;
  right: 16px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0;
}

.nav-item.active .nav-indicator {
  opacity: 1;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 40px;
  background: rgba(255,255,255,0.5);
}

/* Modal Buttons */
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

.modal-button.danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    order: 2;
  }
  
  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 20px;
    gap: 8px;
  }
  
  .nav-item {
    margin: 0;
    padding: 12px 20px;
    white-space: nowrap;
    min-width: auto;
    flex: 1;
  }
  
  .main-content {
    padding: 20px;
    order: 1;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .main-content {
    padding: 15px;
  }
}
</style>