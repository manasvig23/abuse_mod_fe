<template>
  <div class="user-dashboard">
    <!-- Modern Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-section">
            <div class="logo-icon">🛡️</div>
            <h1 class="welcome-text">
              Welcome back, <span class="username-highlight">{{ user.username }}</span>!
            </h1>
          </div>
        </div>
        <div class="header-right">
          <!-- Notification Bell for Deleted Posts -->
          <button v-if="deletedPostsCount > 0" @click="loadDeletedPostsNotifications" class="notification-button">
            <span class="notification-icon">🔔</span>
            <span class="notification-badge">{{ deletedPostsCount }}</span>
          </button>
          
          <button @click="showLogoutModal = true" class="logout-button">
            Logout
          </button>
        </div>
      </div>
    </header>
    
    <!-- Main Dashboard Layout -->
    <div class="dashboard-layout">
      <!-- Modern Sidebar -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'myProfile' }" 
            @click="switchTab('myProfile')"
          >
            <div class="nav-icon">📝</div>
            <span class="nav-text">My Posts</span>
            <div class="nav-indicator"></div>
          </div>
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'exploreFeed' }" 
            @click="switchTab('exploreFeed')"
          >
            <div class="nav-icon">🌍</div>
            <span class="nav-text">Explore Feed</span>
            <div class="nav-indicator"></div>
          </div>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- My Profile Tab -->
        <div v-if="activeTab === 'myProfile'" class="content-section" :class="{ active: activeTab === 'myProfile' }">
          <div class="section-header">
            <div class="section-title">
              <h2>My Posts</h2>
              <p class="section-subtitle">Manage and view your content</p>
            </div>
            <button @click="showCreatePostModal = true" class="create-button">
              <span class="button-icon">➕</span>
              Create New Post
            </button>
          </div>
          
          <div v-if="loadingMyPosts" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your posts...</p>
          </div>
          
          <div class="posts-grid" v-else>
            <div v-for="post in myPosts" :key="post.id" class="post-card">
              <div class="post-header">
                <div class="post-meta">
                  <div class="author-info">
                    <div class="author-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
                    <div class="post-details">
                      <span class="author-name">You</span>
                      <span class="post-date">{{ formatDate(post.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="post-content">
                <p>{{ post.content }}</p>
              </div>
              
              <div class="post-footer">
                <div class="post-stats">
                  <div class="stat-item">
                    <span class="stat-icon">💬</span>
                    <span class="stat-text">{{ post.comments ? post.comments.length : 0 }} comments</span>
                  </div>
                </div>
                <div class="post-actions">
                  <button @click="viewComments(post, 'my')" class="action-button primary">
                    View Comments
                  </button>
                  <button @click="handleDeleteOwnPost(post)" class="action-button danger">
                    <span class="button-icon">🗑️</span>
                    Delete
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="myPosts.length === 0" class="empty-state">
              <div class="empty-icon">📝</div>
              <h3>No posts yet</h3>
              <p>Share your thoughts with the community</p>
              <button @click="showCreatePostModal = true" class="create-button">
                Create Your First Post
              </button>
            </div>
          </div>
        </div>

        <!-- Explore Feed Tab -->
        <div v-if="activeTab === 'exploreFeed'" class="content-section" :class="{ active: activeTab === 'exploreFeed' }">
          <div class="section-header">
            <div class="section-title">
              <h2>Discover Posts</h2>
              <p class="section-subtitle">Explore content from the community</p>
            </div>
          </div>
          
          <div v-if="loadingExploreFeed" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading posts...</p>
          </div>
          
          <div class="posts-grid" v-else>
            <div v-for="post in explorePosts" :key="post.id" class="post-card">
              <div class="post-header">
                <div class="post-meta">
                  <div class="author-info">
                    <div class="author-avatar">{{ post.author_username.charAt(0).toUpperCase() }}</div>
                    <div class="post-details">
                      <span class="author-name">{{ post.author_username }}</span>
                      <span class="post-date">{{ formatDate(post.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="post-content">
                <p>{{ post.content }}</p>
              </div>
              
              <div class="post-footer">
                <div class="post-stats">
                  <div class="stat-item">
                    <span class="stat-icon">💬</span>
                    <span class="stat-text">{{ post.total_comments || 0 }} comments</span>
                  </div>
                </div>
                <div class="post-actions">
                  <button @click="viewComments(post, 'explore')" class="action-button secondary">
                    View Comments
                  </button>
                  <button @click="postComment(post)" class="action-button primary">
                    <span class="button-icon">💭</span>
                    Comment
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="explorePosts.length === 0" class="empty-state">
              <div class="empty-icon">🌍</div>
              <h3>No posts to explore</h3>
              <p>Check back later for new content</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modern Modals -->
    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
      <div class="modal modern-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirm Logout</h3>
        </div>
        <div class="modal-body">
          <p style="color: #333333;">Are you sure you want to logout from your account?</p>
        </div>
        <div class="modal-footer">
          <button @click="showLogoutModal = false" class="modal-button secondary">Cancel</button>
          <button @click="confirmLogout" class="modal-button danger">Logout</button>
        </div>
      </div>
    </div>

    <!-- Create Post Modal -->
    <div v-if="showCreatePostModal" class="modal-overlay" @click="showCreatePostModal = false">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h3>Create New Post</h3>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">What's on your mind?</label>
            <textarea
              v-model="newPost.content" 
              placeholder="Share your thoughts with the community..." 
              class="form-textarea"
              rows="5"
              maxlength="2000"
            ></textarea>
            <div class="character-count">{{ newPost.content.length }}/2000</div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cancelCreatePost" class="modal-button secondary">Cancel</button>
          <button @click="createPost" class="modal-button primary" :disabled="creatingPost || !newPost.content.trim()">
            <span v-if="creatingPost" class="loading-spinner-small"></span>
            {{ creatingPost ? 'Creating...' : 'Create Post' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Own Post Modal -->
    <div v-if="showDeleteOwnPostModal" class="modal-overlay" @click="closeDeleteOwnPostModal">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Your Post</h3>
        </div>
        <div class="modal-body">
          <p style="color: #e74c3c; font-weight: 600; margin-bottom: 20px;">
            ⚠️ This action cannot be undone!
          </p>
          
          <div class="post-preview-box">
            <h4>Post Content:</h4>
            <p>{{ postToDeleteOwn.content }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">Select Deletion Reason:</label>
            <select v-model="ownDeletionReason" class="form-select">
              <option value="">-- Select a reason --</option>
              <option value="I want to repost with corrections">Want to repost with corrections</option>
              <option value="Posted by mistake">Posted by mistake</option>
              <option value="No longer relevant">No longer relevant</option>
              <option value="Privacy concerns">Privacy concerns</option>
              <option value="Duplicate post">Duplicate post</option>
              <option value="Changed my mind">Changed my mind</option>
              <option value="Other personal reason">Other personal reason</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteOwnPostModal" class="modal-button secondary">Cancel</button>
          <button 
            @click="confirmDeleteOwnPost" 
            class="modal-button danger"
            :disabled="!ownDeletionReason || deletingOwnPost"
          >
            <span v-if="deletingOwnPost" class="loading-spinner-small"></span>
            {{ deletingOwnPost ? 'Deleting...' : 'Delete Post' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Deleted Posts Notifications Modal -->
    <div v-if="showDeletedPostsModal" class="modal-overlay" @click="showDeletedPostsModal = false">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h3>🔔 Deleted Posts Notifications</h3>
        </div>
        <div class="modal-body">
          <div v-if="deletedPostsNotifications.length > 0" class="notifications-list">
            <div v-for="notification in deletedPostsNotifications" :key="notification.id" class="notification-item">
              <div class="notification-header">
                <span class="notification-icon-large">🗑️</span>
                <div class="notification-info">
                  <h4>Post Deleted by Moderator</h4>
                  <p class="notification-date">{{ formatDate(notification.deleted_at) }}</p>
                </div>
              </div>
              
              <div class="notification-content">
                <div class="deleted-post-content">
                  <h5>Original Post Content:</h5>
                  <p>{{ notification.content }}</p>
                </div>
                
                <div class="deletion-reason">
                  <strong>Reason for Deletion:</strong>
                  <p>{{ notification.deletion_reason }}</p>
                </div>
                
                <div class="deleted-by">
                  <span>Deleted by: <strong>{{ notification.deleted_by_username }}</strong></span>
                </div>
              </div>
              
              <div class="notification-actions">
                <button @click="markNotificationViewed(notification.id)" class="modal-button primary">
                  Mark as Read
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-notifications">
            <div class="empty-icon">✅</div>
            <p>No new notifications</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showDeletedPostsModal = false" class="modal-button secondary">Close</button>
        </div>
      </div>
    </div>

    <!-- Comments Modal -->
    <div v-if="showCommentModal" class="modal-overlay" @click="closeCommentsModal">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h3>Post by {{ selectedPost.author_username || 'You' }}</h3>
        </div>
        <div class="modal-body">
          <div class="post-content-modal">
            <p>{{ selectedPost.content }}</p>
          </div>
          
          <div class="comments-section">
            <h4 class="comments-title">
              Comments
              <span class="comments-count">({{ selectedPost.comments ? selectedPost.comments.length : 0 }})</span>
            </h4>
            
            <div v-if="selectedPost.comments && selectedPost.comments.length > 0" class="comments-list">
              <div v-for="comment in selectedPost.comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <div class="comment-author-avatar">{{ comment.author_username.charAt(0).toUpperCase() }}</div>
                  <div class="comment-meta">
                    <strong class="comment-author">{{ comment.author_username }}</strong>
                    <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                  </div>
                </div>
                <div class="comment-content">
                  <p>{{ comment.text }}</p>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-comments">
              <div class="empty-comments-icon">💭</div>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          </div>
          
          <!-- Add Comment Section (only for explore feed posts) -->
          <div v-if="commentMode === 'explore'" class="add-comment-section">
            <h4>Add a Comment</h4>
            <div class="comment-form">
              <textarea 
                v-model="newComment" 
                placeholder="Share your thoughts on this post..." 
                class="comment-input"
                rows="3"
                maxlength="1000"
              ></textarea>
              <div class="comment-form-footer">
                <div class="character-count">{{ newComment.length }}/1000</div>
                <button 
                  @click="submitComment" 
                  class="modal-button primary" 
                  :disabled="submittingComment || !newComment.trim()"
                >
                  <span v-if="submittingComment" class="loading-spinner-small"></span>
                  {{ submittingComment ? 'Posting...' : 'Post Comment' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeCommentsModal" class="modal-button secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userAPI } from '@/services/api'

export default {
  name: 'UserFeed',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      activeTab: 'myProfile',
      showLogoutModal: false,
      showCreatePostModal: false,
      showCommentModal: false,
      showDeleteOwnPostModal: false,
      showDeletedPostsModal: false,
      selectedPost: {},
      commentMode: 'my',
      newComment: '',
      newPost: { content: '' },
      myPosts: [],
      explorePosts: [],
      loadingMyPosts: false,
      loadingExploreFeed: false,
      creatingPost: false,
      submittingComment: false,

      // Delete own post
      postToDeleteOwn: {},
      ownDeletionReason: '',
      deletingOwnPost: false,

      // Deleted posts notifications
      deletedPostsCount: 0,
      deletedPostsNotifications: []
    }
  },

  async mounted() {
    await this.loadMyPosts()
    await this.loadExploreFeed()
    await this.checkDeletedPostsNotifications()

    // Entrance animation
    setTimeout(() => {
      document.querySelector('.main-content').classList.add('animate-in')
    }, 200)
  },

  methods: {
    switchTab(tab) {
      this.activeTab = tab
    },

    async loadMyPosts() {
      this.loadingMyPosts = true
      try {
        const response = await userAPI.getMyPosts()
        this.myPosts = response.posts || []
      } catch (error) {
        console.error('Error loading my posts:', error)
      } finally {
        this.loadingMyPosts = false
      }
    },

    async loadExploreFeed() {
      this.loadingExploreFeed = true
      try {
        const response = await userAPI.getExploreFeed()
        this.explorePosts = response.posts || []
      } catch (error) {
        console.error('Error loading explore feed:', error)
      } finally {
        this.loadingExploreFeed = false
      }
    },

    async createPost() {
      if (!this.newPost.content.trim()) return

      this.creatingPost = true
      try {
        await userAPI.createPost({ content: this.newPost.content })
        await this.loadMyPosts()
        this.cancelCreatePost()
      } catch (error) {
        console.error('Error creating post:', error)
        alert('Failed to create post. Please try again.')
      } finally {
        this.creatingPost = false
      }
    },

    cancelCreatePost() {
      this.newPost.content = ''
      this.showCreatePostModal = false
    },

    viewComments(post, mode) {
      this.selectedPost = post
      this.commentMode = mode
      this.showCommentModal = true
    },

    postComment(post) {
      this.viewComments(post, 'explore')
    },

    async submitComment() {
      if (!this.newComment.trim()) return

      this.submittingComment = true
      try {
        const response = await userAPI.createComment({
          text: this.newComment,
          post_id: this.selectedPost.id
        })

        if (response.user_suspended) {
          alert('Your account has been suspended due to high abuse rate. You will be logged out.')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          this.$router.push('/login')
          return
        }

        if (response.spam_detected) {
          alert(response.spam_message || '🚫 Your comment has been detected as spam and hidden.')
        } else if (response.warning) {
          alert(response.warning)
        } else if (response.visible_in_feed) {
          alert('✅ Comment posted successfully!')
        } else if (response.auto_processed) {
          alert('⚠️ Your comment has been hidden since it was found to be abusive.')
        } else {
          alert('⏳ Your comment has been submitted for moderation review.')
        }

        this.newComment = ''
        this.closeCommentsModal()
        await this.loadExploreFeed()
      } catch (error) {
        console.error('Error submitting comment:', error)
        if (error.response?.data?.detail) {
          alert(error.response.data.detail)
        } else {
          alert('❌ Failed to post comment. Please try again.')
        }
      } finally {
        this.submittingComment = false
      }
    },

    closeCommentsModal() {
      this.showCommentModal = false
      this.selectedPost = {}
      this.newComment = ''
    },

    // --- Delete own post ---
    handleDeleteOwnPost(post) {
      this.postToDeleteOwn = post
      this.ownDeletionReason = ''
      this.showDeleteOwnPostModal = true
    },

    closeDeleteOwnPostModal() {
      this.showDeleteOwnPostModal = false
      this.postToDeleteOwn = {}
      this.ownDeletionReason = ''
    },

    async confirmDeleteOwnPost() {
      if (!this.ownDeletionReason) {
        alert('Please select a deletion reason')
        return
      }

      this.deletingOwnPost = true
      try {
        await userAPI.deleteOwnPost(this.postToDeleteOwn.id, this.ownDeletionReason)
        alert('✅ Post deleted successfully')
        this.closeDeleteOwnPostModal()
        await this.loadMyPosts()
      } catch (error) {
        console.error('Error deleting own post:', error)
        alert('Failed to delete post')
      } finally {
        this.deletingOwnPost = false
      }
    },

    // --- Deleted posts notifications ---
    async checkDeletedPostsNotifications() {
      try {
        const response = await userAPI.getDeletedPostsCount()
        this.deletedPostsCount = response.count || 0
      } catch (error) {
        console.error('Error checking deleted posts:', error)
      }
    },

    async loadDeletedPostsNotifications() {
      try {
        const notifications = await userAPI.getDeletedPostsNotifications()
        this.deletedPostsNotifications = notifications
        this.showDeletedPostsModal = true
      } catch (error) {
        console.error('Error loading deleted posts:', error)
      }
    },

    async markNotificationViewed(deletedPostId) {
      try {
        await userAPI.markDeletedPostViewed(deletedPostId)
        await this.loadDeletedPostsNotifications()
        await this.checkDeletedPostsNotifications()
      } catch (error) {
        console.error('Error marking notification viewed:', error)
      }
    },

    confirmLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },

    formatDate(date) {
      if (!date) return 'Unknown date'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
/* Dashboard Container */
.user-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Modern Header */
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
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.welcome-text {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.username-highlight {
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
}

.logout-button {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-button:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}


/* Dashboard Layout */
.dashboard-layout {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}

/* Modern Sidebar */
.sidebar {
  width: 280px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255,255,255,0.2);
  padding: 0;
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
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 16px;
}

.nav-indicator {
  position: absolute;
  right: 16px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0;
  transition: all 0.3s ease;
}

.nav-item.active .nav-indicator {
  opacity: 1;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 40px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.main-content.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.content-section {
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

.content-section.active {
  opacity: 1;
}

@keyframes fadeIn {
  to { opacity: 1; }
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
}

.create-button {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

.button-icon {
  font-size: 16px;
}

/* Loading States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #7f8c8d;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Posts Grid */
.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.post-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.post-header {
  margin-bottom: 20px;
}

.post-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.post-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

.post-date {
  color: #7f8c8d;
  font-size: 14px;
}

.post-content {
  margin-bottom: 24px;
}

.post-content p {
  color: #5a6c7d;
  line-height: 1.7;
  font-size: 16px;
  margin: 0;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.post-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7f8c8d;
  font-size: 14px;
}

.stat-icon {
  font-size: 16px;
}

.post-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.action-button.secondary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.action-button.secondary:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

/* Empty States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-state h3 {
  color: #2c3e50;
  font-size: 24px;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.empty-state p {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0 0 32px 0;
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

.modal {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.4s ease;
}

.modern-modal {
  width: 400px;
}

.large-modal {
  width: 700px;
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

.modal-button {
  padding: 12px 24px;
  border: none;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.modal-button.secondary {
  background: #e9ecef;
  color: #495057;
}

.modal-button.secondary:hover {
  background: #dee2e6;
  transform: translateY(-2px);
}

.modal-button.danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.modal-button.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.modal-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Form Elements */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background-color: #ffffff;
  resize: vertical;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(228, 221, 221, 0.1);
}

.character-count {
  text-align: right;
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 8px;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Post Content Modal */
.post-content-modal {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border-left: 4px solid #667eea;
}

.post-content-modal p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.6;
}

/* Comments Section */
.comments-section {
  margin-bottom: 24px;
}

.comments-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.comments-count {
  background: #e9ecef;
  color: #495057;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.comments-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #fafafa;
}

.comment-item {
  padding: 16px;
  margin-bottom: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(222, 194, 194, 0.05);
  border: 1px solid #f0f0f0;
}

.comment-item:last-child {
  margin-bottom: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.comment-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-author {
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.comment-date {
  color: #7f8c8d;
  font-size: 12px;
}

.comment-content p {
  margin: 0;
  color: #5a6c7d;
  line-height: 1.6;
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-comments-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-comments p {
  color: #7f8c8d;
  margin: 0;
}

/* Add Comment Section */
.add-comment-section {
  border-top: 1px solid #e9ecef;
  padding-top: 24px;
}

.add-comment-section h4 {
  margin-bottom: 16px;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.comment-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.comment-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  margin-bottom: 12px;
  background-color: white;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.comment-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-layout {
    max-width: 100%;
  }
  
  .main-content {
    padding: 30px 20px;
  }
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 0;
  }
  
  .sidebar-nav {
    display: flex;
    padding: 20px;
    overflow-x: auto;
    gap: 8px;
  }
  
  .nav-item {
    margin: 0;
    padding: 12px 20px;
    white-space: nowrap;
    min-width: auto;
  }
  
  .header-content {
    padding: 15px 20px;
  }
  
  .welcome-text {
    font-size: 20px;
  }
  
  .logo-icon {
    font-size: 24px;
  }
  
  .section-title h2 {
    font-size: 28px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .post-card {
    padding: 20px;
  }
  
  .post-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-button {
    justify-content: center;
    width: 100%;
  }
  
  .modal {
    margin: 20px;
    width: auto;
    max-width: none;
  }
  
  .large-modal {
    width: auto;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .welcome-text {
    font-size: 18px;
  }
  
  .main-content {
    padding: 20px 15px;
  }
  
  .post-footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
  }
  
  .modal-button {
    width: 100%;
    justify-content: center;
  }
}
.notification-button {
  position: relative;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px 16px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-button:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.notification-icon {
  font-size: 20px;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #e74c3c;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.post-preview-box {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid #e74c3c;
}

.post-preview-box h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 14px;
}

.post-preview-box p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.6;
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

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notification-item {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 24px;
  border-left: 4px solid #e74c3c;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.notification-icon-large {
  font-size: 32px;
}

.notification-info h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 18px;
}

.notification-date {
  color: #7f8c8d;
  font-size: 13px;
  margin: 0;
}

.deleted-post-content {
  background: white;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.deleted-post-content h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 14px;
}

.deleted-post-content p {
  margin: 0;
  color: #5a6c7d;
  line-height: 1.6;
}

.deletion-reason {
  background: #fff3cd;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  border-left: 4px solid #f39c12;
}

.deletion-reason strong {
  display: block;
  margin-bottom: 8px;
  color: #856404;
}

.deletion-reason p {
  margin: 0;
  color: #856404;
}

.deleted-by {
  font-size: 13px;
  color: #7f8c8d;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.empty-notifications {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-notifications .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}
</style>