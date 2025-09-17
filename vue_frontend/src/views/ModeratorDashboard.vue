<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header">
      <h1>Hello {{ user.username }}!</h1>
      <button @click="showLogoutModal = true" class="logout-btn">Logout</button>
    </div>

    <!-- Navigation Sidebar -->
    <div class="dashboard-layout">
      <div class="sidebar">
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'allPosts' }" 
          @click="activeTab = 'allPosts'"
        >
          All Posts
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'reviewComments' }" 
          @click="activeTab = 'reviewComments'"
        >
          Review Comments
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'flaggedComments' }" 
          @click="activeTab = 'flaggedComments'"
        >
          Flagged Comments
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'statistics' }" 
          @click="activeTab = 'statistics'"
        >
          Statistics
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'userList' }" 
          @click="activeTab = 'userList'"
        >
          User List
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- All Posts Tab -->
        <div v-if="activeTab === 'allPosts'" class="content-section">
          <h2>All Posts</h2>
          
          <!-- User Selection Dropdown -->
          <div class="controls">
            <label>Select User:</label>
            <select v-model="selectedUserId" @change="loadAllPosts" class="user-select">
              <option value="">All Users</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.username }} ({{ user.role }})
              </option>
            </select>
          </div>

          <div v-if="loadingAllPosts" class="loading">Loading posts...</div>

          <div class="posts-container">
            <div v-for="post in allPosts" :key="post.id" class="post-item">
              <div class="post-content">
                <p>{{ post.content }}</p>
                <div class="post-meta">
                  <span>by {{ post.author_username }}</span>
                  <span>{{ formatDate(post.created_at) }}</span>
                  <span>{{ post.total_comments }} comments</span>
                </div>
              </div>
              <div class="post-actions" v-if="post.has_comments_to_view">
                <button @click="viewPostComments(post.id)" class="action-btn">View Comments</button>
              </div>
            </div>
            
            <div v-if="allPosts.length === 0 && !loadingAllPosts" class="empty-state">
              No posts found for the selected user.
            </div>
          </div>
        </div>

        <!-- Review Comments Tab -->
        <div v-if="activeTab === 'reviewComments'" class="content-section">
          <h2>Review Comments - User Details</h2>
          <p class="info-text">Users with posts containing comments that need human review</p>

          <div v-if="loadingReviewPosts" class="loading">Loading posts for review...</div>

          <div v-else-if="reviewItems.length > 0" class="review-table">
            <div class="table-header">
              <div>User ID</div>
              <div>Username</div>
              <div>Status</div>
              <div>Abuse Rate</div>
              <div>User Joined</div>
              <div>Post ID</div>
              <div>Post Content</div>
              <div>Pending</div>
              <div>Actions</div>
            </div>
            
            <div v-for="item in reviewItems" :key="`${item.user_id}-${item.post_id}`" class="table-row">
              <div class="user-id">{{ item.user_id }}</div>
              <div class="username">{{ item.username }}</div>
              <div class="status" :class="item.is_active ? 'active' : 'inactive'">
                {{ item.is_active ? 'Active' : 'Inactive' }}
              </div>
              <div class="abuse-rate" :class="getAbuseRateClass(item.abuse_rate_percent)">
                {{ item.abuse_rate_percent }}%
              </div>
              <div class="date">{{ formatDate(item.user_created_at) }}</div>
              <div class="post-id">{{ item.post_id }}</div>
              <div class="post-content">{{ item.post_content }}</div>
              <div class="pending-count">{{ item.pending_comments_count }}</div>
              <div class="actions">
                <button @click="viewPostComments(item.post_id)" class="action-btn view-btn">
                  View Post
                </button>
                <button @click="reviewPostComments(item.post_id)" class="action-btn review-btn">
                  Review
                </button>
              </div>
            </div>
          </div>
          
          <div v-else-if="!loadingReviewPosts" class="empty-state">
            🎉 No comments need review right now!
          </div>
        </div>

        <!-- Flagged Comments Tab -->
        <div v-if="activeTab === 'flaggedComments'" class="content-section">
          <h2>Flagged Comments</h2>

          <!-- User Selection Dropdown -->
          <div class="controls">
            <label>Select User:</label>
            <select v-model="selectedFlaggedUserId" @change="loadFlaggedComments" class="user-select">
              <option value="">All Users</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.username }}
              </option>
            </select>
          </div>

          <div v-if="loadingFlaggedComments" class="loading">Loading flagged comments...</div>

          <div class="posts-container">
            <div v-for="post in flaggedPosts" :key="post.id" class="post-item">
              <div class="post-content">
                <p>{{ post.content }}</p>
                <div class="post-meta">
                  <span>by {{ post.author_username }}</span>
                  <span>{{ post.flagged_count }} flagged comments</span>
                </div>
              </div>
              
              <div class="flagged-comments">
                <div v-for="comment in post.flagged_comments" :key="comment.id" class="comment-item flagged">
                  <div class="comment-content">
                    <strong>{{ comment.author_username }}:</strong>
                    <p>{{ comment.text }}</p>
                    <div class="comment-meta">
                      <span class="status-label" :class="comment.status">{{ comment.label }}</span>
                      <span v-if="comment.flagged_words">Flagged: {{ comment.flagged_words }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="flaggedPosts.length === 0 && !loadingFlaggedComments" class="empty-state">
              No flagged comments found.
            </div>
          </div>
        </div>

        <!-- Statistics Tab -->
        <div v-if="activeTab === 'statistics'" class="content-section">
          <h2>Statistics</h2>

          <!-- User Selection for specific stats -->
          <div class="controls">
            <label>View User Statistics:</label>
            <select v-model="selectedStatsUsername" @change="loadStatistics" class="user-select">
              <option value="">Overall System Statistics</option>
              <option v-for="user in users" :key="user.id" :value="user.username">
                {{ user.username }}
              </option>
            </select>
          </div>

          <div v-if="loadingStatistics" class="loading">Loading statistics...</div>

          <!-- Overall Statistics -->
          <div v-if="stats && stats.type === 'overall_stats'" class="stats-container">
            <div class="stats-grid">
              <div class="stat-card">
                <h3>{{ stats.stats.total_users }}</h3>
                <p>Total Users</p>
              </div>
              <div class="stat-card">
                <h3>{{ stats.stats.total_posts }}</h3>
                <p>Total Posts</p>
              </div>
              <div class="stat-card">
                <h3>{{ stats.stats.total_comments }}</h3>
                <p>Total Comments</p>
              </div>
              <div class="stat-card">
                <h3>{{ stats.stats.clean_comments }}</h3>
                <p>Clean Comments</p>
              </div>
              <div class="stat-card">
                <h3>{{ stats.stats.flagged_comments }}</h3>
                <p>Flagged Comments</p>
              </div>
              <div class="stat-card">
                <h3>{{ stats.stats.needs_review }}</h3>
                <p>Needs Review</p>
              </div>
              <div class="stat-card highlight">
                <h3>{{ stats.stats.ai_efficiency_percent }}%</h3>
                <p>AI Efficiency</p>
              </div>
              <div class="stat-card highlight">
                <h3>{{ stats.stats.abuse_detection_rate }}%</h3>
                <p>Abuse Detection Rate</p>
              </div>
            </div>
          </div>

          <!-- User-specific Statistics -->
          <div v-else-if="stats && stats.type === 'user_stats'" class="stats-container">
            <div class="user-info">
              <h3>{{ stats.user.username }} Statistics</h3>
              <p>Role: {{ stats.user.role }} | Joined: {{ stats.user.join_date }}</p>
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <h3>{{ stats.stats.total_posts }}</h3>
                <p>Posts</p>
              </div>
              <div class="stat-card">
                <h3>{{ stats.stats.total_comments }}</h3>
                <p>Total Comments</p>
              </div>
              <div class="stat-card">
                <h3>{{ stats.stats.approved_comments }}</h3>
                <p>Approved</p>
              </div>
              <div class="stat-card">
                <h3>{{ stats.stats.hidden_comments }}</h3>
                <p>Hidden</p>
              </div>
              <div class="stat-card">
                <h3>{{ stats.stats.pending_comments }}</h3>
                <p>Pending Review</p>
              </div>
              <div class="stat-card warning">
                <h3>{{ stats.stats.abuse_rate_percent }}%</h3>
                <p>Abuse Rate</p>
              </div>
            </div>
          </div>
        </div>

        <!-- User List Tab -->
        <div v-if="activeTab === 'userList'" class="content-section">
          <h2>User List</h2>

          <div v-if="loadingUsers" class="loading">Loading users...</div>

          <div class="users-table" v-else>
            <div class="table-header">
              <div>Username</div>
              <div>Role</div>
              <div>Posts</div>
              <div>Comments</div>
              <div>Flagged</div>
              <div>Status</div>
              <div>Joined</div>
            </div>
            
            <div v-for="user in usersList" :key="user.id" class="table-row">
              <div class="username">{{ user.username }}</div>
              <div class="role" :class="user.role">{{ user.role }}</div>
              <div>{{ user.total_posts }}</div>
              <div>{{ user.total_comments }}</div>
              <div class="flagged-count">{{ user.flagged_comments }}</div>
              <div class="status" :class="user.status.toLowerCase()">{{ user.status }}</div>
              <div>{{ user.join_date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="modal-overlay" @click="closeReviewModal">
      <div class="modal large-modal" @click.stop>
        <h3>Review Comments - Post by {{ reviewPost.author_username }}</h3>
        <div class="post-content-modal">
          <p>{{ reviewPost.content }}</p>
        </div>

        <h4>Comments for Review:</h4>
        <div class="comments-review-section">
          <div v-for="comment in reviewComments" :key="comment.id" class="comment-review-item">
            <div class="comment-content">
              <strong>{{ comment.author_username }}:</strong>
              <p>{{ comment.text }}</p>
              <div class="comment-meta">
                <span>Status: {{ comment.status }}</span>
                <span v-if="comment.flagged_words">Flagged: {{ comment.flagged_words }}</span>
                <span v-if="comment.confidence_score">Confidence: {{ comment.confidence_score }}%</span>
              </div>
            </div>
            <div class="comment-actions">
              <button 
                @click="reviewComment(comment.id, 'approve')" 
                class="approve-btn"
                :disabled="comment.status === 'approved'"
              >
                Approve
              </button>
              <button 
                @click="reviewComment(comment.id, 'hide')" 
                class="hide-btn"
                :disabled="comment.status === 'hidden'"
              >
                Hide
              </button>
              <button 
                @click="reviewComment(comment.id, 'delete')" 
                class="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeReviewModal" class="cancel-btn">Close</button>
        </div>
      </div>
    </div>

    <!-- Logout Modal -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
      <div class="modal" @click.stop>
        <h3>Are you sure you want to logout?</h3>
        <div class="modal-actions">
          <button @click="confirmLogout" class="confirm-btn">Yes</button>
          <button @click="showLogoutModal = false" class="cancel-btn">No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { moderatorAPI } from '@/services/api'

export default {
  name: 'ModeratorDashboard',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      activeTab: 'allPosts',
      
      // Data arrays
      users: [],
      usersList: [],
      allPosts: [],
      reviewPosts: [],
      reviewItems: [],
      flaggedPosts: [],
      stats: null,
      reviewPost: {},
      reviewComments: [],
      
      // Loading states
      loadingUsers: false,
      loadingAllPosts: false,
      loadingReviewPosts: false,
      loadingFlaggedComments: false,
      loadingStatistics: false,
      
      // Selected values
      selectedUserId: '',
      selectedFlaggedUserId: '',
      selectedStatsUsername: '',
      
      // Modal states
      showLogoutModal: false,
      showReviewModal: false,
    }
  },
  
  async mounted() {
    await this.loadUsers()
    await this.loadAllPosts()
    await this.loadStatistics()
  },
  
  methods: {
    async loadUsers() {
      this.loadingUsers = true
      try {
        const response = await moderatorAPI.getUsersDropdown()
        this.users = response.users || []
        
        const userListResponse = await moderatorAPI.getAllUsers()
        this.usersList = userListResponse.users || []
      } catch (error) {
        console.error('Error loading users:', error)
        alert('Failed to load users')
      } finally {
        this.loadingUsers = false
      }
    },

    async loadAllPosts() {
      this.loadingAllPosts = true
      try {
        const response = await moderatorAPI.getAllPosts(this.selectedUserId || null)
        this.allPosts = response.posts || []
      } catch (error) {
        console.error('Error loading posts:', error)
      } finally {
        this.loadingAllPosts = false
      }
    },

    async loadReviewPosts() {
      if (this.reviewItems.length > 0) return // Already loaded
      
      this.loadingReviewPosts = true
      try {
        const response = await moderatorAPI.getPostsForReview()
        this.reviewItems = response.review_items || []
      } catch (error) {
        console.error('Error loading review posts:', error)
      } finally {
        this.loadingReviewPosts = false
      }
    },

    async loadFlaggedComments() {
      this.loadingFlaggedComments = true
      try {
        const response = await moderatorAPI.getFlaggedComments(this.selectedFlaggedUserId || null)
        this.flaggedPosts = response.posts || []
      } catch (error) {
        console.error('Error loading flagged comments:', error)
      } finally {
        this.loadingFlaggedComments = false
      }
    },

    async loadStatistics() {
      this.loadingStatistics = true
      try {
        const response = await moderatorAPI.getStatistics(this.selectedStatsUsername || null)
        this.stats = response
      } catch (error) {
        console.error('Error loading statistics:', error)
      } finally {
        this.loadingStatistics = false
      }
    },

    async viewPostComments(postId) {
      // This would show all comments with color coding (blue/yellow/red)
      alert(`View comments for post ${postId} - Feature to be implemented`)
    },

    async reviewPostComments(postId) {
      try {
        const response = await moderatorAPI.getPostForReview(postId)
        this.reviewPost = response.post
        this.reviewComments = response.comments || []
        this.showReviewModal = true
      } catch (error) {
        console.error('Error loading post for review:', error)
        alert('Failed to load comments for review')
      }
    },

    async reviewComment(commentId, action) {
      try {
        await moderatorAPI.reviewComment(commentId, action)
        alert(`Comment ${action}d successfully`)
        
        // Reload data
        await this.loadReviewPosts()
        await this.loadFlaggedComments()
        this.closeReviewModal()
        
      } catch (error) {
        console.error('Error reviewing comment:', error)
        alert('Failed to review comment')
      }
    },

    closeReviewModal() {
      this.showReviewModal = false
      this.reviewPost = {}
      this.reviewComments = []
    },

    confirmLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },

    formatDate(date) {
      if (!date) return 'Unknown'
      return new Date(date).toLocaleDateString()
    },

    getAbuseRateClass(rate) {
      if (rate >= 50) return 'high-risk'
      if (rate >= 20) return 'medium-risk' 
      return 'low-risk'
    },

    // Tab switching with data loading
    async switchTab(tab) {
      this.activeTab = tab
      
      switch(tab) {
        case 'reviewComments':
          await this.loadReviewPosts()
          break
        case 'flaggedComments':
          await this.loadFlaggedComments()
          break
        case 'statistics':
          await this.loadStatistics()
          break
      }
    }
  },

  watch: {
    activeTab(newTab) {
      this.switchTab(newTab)
    }
  }
}
</script>

<style scoped>
/* Dashboard Layout */
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.logout-btn {
  background-color: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255,255,255,0.3);
}

.dashboard-layout {
  display: flex;
  min-height: calc(100vh - 80px);
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  padding: 0;
}

.nav-item {
  padding: 20px 25px;
  color: #ecf0f1;
  cursor: pointer;
  border-bottom: 1px solid #34495e;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-item:hover {
  background-color: #34495e;
  padding-left: 30px;
}

.nav-item.active {
  background-color: #3498db;
  color: white;
  border-left: 4px solid #2980b9;
}

.main-content {
  flex: 1;
  padding: 30px;
  background-color: white;
}

.content-section h2 {
  color: #2c3e50;
  font-size: 28px;
  margin: 0 0 20px 0;
}

.info-text {
  color: #7f8c8d;
  margin-bottom: 20px;
}

/* Controls */
.controls {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  min-width: 200px;
}

/* Review Table */
.review-table {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  overflow-x: auto;
}

.review-table .table-header {
  display: grid;
  grid-template-columns: 80px 120px 80px 100px 120px 80px 2fr 80px 180px;
  gap: 15px;
  background-color: #34495e;
  color: white;
  padding: 15px 20px;
  font-weight: 600;
  font-size: 14px;
}

.review-table .table-row {
  display: grid;
  grid-template-columns: 80px 120px 80px 100px 120px 80px 2fr 80px 180px;
  gap: 15px;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  align-items: center;
}

.review-table .table-row:hover {
  background-color: #f8f9fa;
}

.user-id, .post-id {
  font-family: monospace;
  font-size: 14px;
  color: #6c757d;
}

.username {
  font-weight: 600;
  color: #2c3e50;
}

.status.active {
  color: #27ae60;
  font-weight: 500;
}

.status.inactive {
  color: #e74c3c;
  font-weight: 500;
}

.abuse-rate {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-align: center;
  font-size: 12px;
}

.abuse-rate.low-risk {
  background-color: #d4edda;
  color: #155724;
}

.abuse-rate.medium-risk {
  background-color: #fff3cd;
  color: #856404;
}

.abuse-rate.high-risk {
  background-color: #f8d7da;
  color: #721c24;
}

.post-content {
  font-size: 14px;
  color: #5a6c7d;
  line-height: 1.4;
}

.pending-count {
  background-color: #f39c12;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  text-align: center;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}

.view-btn {
  background-color: #3498db;
  font-size: 12px;
  padding: 6px 12px;
}

.view-btn:hover {
  background-color: #2980b9;
}

.review-btn {
  background-color: #f39c12;
  font-size: 12px;
  padding: 6px 12px;
}

.review-btn:hover {
  background-color: #e67e22;
}

.date {
  font-size: 12px;
  color: #7f8c8d;
}

/* Posts Container */
.posts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  border: 1px solid #e9ecef;
}

.post-item.review-item {
  border-left: 4px solid #f39c12;
}

.post-content p {
  color: #5a6c7d;
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.post-meta {
  display: flex;
  gap: 15px;
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 15px;
}

.pending-count {
  background-color: #f39c12;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.action-btn:hover {
  background-color: #2980b9;
}

.review-btn {
  background-color: #f39c12;
}

.review-btn:hover {
  background-color: #e67e22;
}

/* Flagged Comments */
.flagged-comments {
  margin-top: 15px;
}

.comment-item.flagged {
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 5px;
  padding: 10px;
  margin: 5px 0;
}

.comment-content p {
  margin: 5px 0;
  color: #2d3748;
}

.comment-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #718096;
  margin-top: 5px;
}

.status-label {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: bold;
}

.status-label.hidden {
  background-color: #fed7d7;
  color: #c53030;
}

/* Statistics */
.stats-container {
  max-width: 1000px;
}

.user-info {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  border: 1px solid #e9ecef;
}

.stat-card h3 {
  font-size: 36px;
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.stat-card p {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.stat-card.highlight {
  border-left: 4px solid #27ae60;
}

.stat-card.warning {
  border-left: 4px solid #e74c3c;
}

/* Users Table */
.users-table {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1.5fr;
  gap: 20px;
  background-color: #34495e;
  color: white;
  padding: 15px 20px;
  font-weight: 600;
  font-size: 14px;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1.5fr;
  gap: 20px;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  align-items: center;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.username {
  font-weight: 600;
  color: #2c3e50;
}

.role {
  padding: 4px 8px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.role.user {
  background-color: #e3f2fd;
  color: #1976d2;
}

.role.moderator {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.flagged-count {
  color: #e74c3c;
  font-weight: 600;
}

.status.active {
  color: #27ae60;
  font-weight: 500;
}

.status.disabled {
  color: #e74c3c;
  font-weight: 500;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  text-align: center;
  min-width: 400px;
  max-width: 90vw;
}

.large-modal {
  min-width: 800px;
  text-align: left;
  max-height: 80vh;
  overflow-y: auto;
}

.modal h3 {
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.post-content-modal {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #3498db;
}

.comments-review-section {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.comment-review-item {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.comment-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.approve-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.approve-btn:hover:not(:disabled) {
  background-color: #229954;
}

.approve-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hide-btn {
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.hide-btn:hover:not(:disabled) {
  background-color: #e67e22;
}

.hide-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

.confirm-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
}

.confirm-btn:hover {
  background-color: #229954;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn:hover {
  background-color: #7f8c8d;
}

/* Loading and Empty States */
.loading {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-state p {
  font-size: 18px;
  margin-bottom: 20px;
}
</style>