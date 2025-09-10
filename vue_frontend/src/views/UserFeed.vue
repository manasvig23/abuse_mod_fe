<template>
  <div class="user-dashboard">
    <!-- Header -->
    <div class="header">
      <h1>Hello {{ user.username }}!</h1>
      <button @click="showLogoutModal = true" class="logout-btn">Logout</button>
    </div>
    
    <!-- Sidebar and Content -->
    <div class="dashboard-layout">
      <div class="sidebar">
        <div class="nav-item" :class="{ active: activeTab === 'myProfile' }" @click="activeTab = 'myProfile'">
          My Profile
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'exploreFeed' }" @click="activeTab = 'exploreFeed'">
          Explore Feed
        </div>
      </div>

      <div class="main-content">
        <!-- My Profile Tab -->
        <div v-if="activeTab === 'myProfile'" class="content-section">
          <div class="content-header">
            <h2>My Posts</h2>
            <button @click="showCreatePostModal = true" class="create-post-btn">+ Create New Post</button>
          </div>
          
          <div v-if="loadingMyPosts" class="loading">Loading your posts...</div>
          
          <div class="posts-container">
            <div v-for="post in myPosts" :key="post.id" class="post-item">
              <div class="post-content">
                <p>{{ post.content }}</p>
                <div class="post-meta">
                  <span>{{ formatDate(post.created_at) }}</span>
                  <span>{{ post.total_comments }} comments</span>
                </div>
              </div>
              <div class="post-actions">
                <button @click="viewComments(post, 'my')" class="action-btn">View Comments</button>
              </div>
            </div>
            
            <div v-if="myPosts.length === 0 && !loadingMyPosts" class="empty-state">
              <p>You haven't created any posts yet.</p>
              <button @click="showCreatePostModal = true" class="create-post-btn">Create Your First Post</button>
            </div>
          </div>
        </div>

        <!-- Explore Feed Tab -->
        <div v-if="activeTab === 'exploreFeed'" class="content-section">
          <h2>Discover Posts</h2>
          
          <div v-if="loadingExploreFeed" class="loading">Loading posts...</div>
          
          <div class="posts-container">
            <div v-for="post in explorePosts" :key="post.id" class="post-item">
              <div class="post-content">
                <p>{{ post.content }}</p>
                <div class="post-meta">
                  <span>by {{ post.author_username }}</span>
                  <span>{{ formatDate(post.created_at) }}</span>
                  <span>{{ post.total_comments }} comments</span>
                </div>
              </div>
              <div class="post-actions">
                <button @click="viewComments(post, 'explore')" class="action-btn">View Comments</button>
                <button @click="postComment(post)" class="action-btn comment-btn">Post a Comment</button>
              </div>
            </div>
            
            <div v-if="explorePosts.length === 0 && !loadingExploreFeed" class="empty-state">
              <p>No posts available to explore.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
      <div class="modal" @click.stop>
        <h3>Are you sure you want to logout?</h3>
        <div class="modal-actions">
          <button @click="confirmLogout" class="confirm-btn">Yes</button>
          <button @click="showLogoutModal = false" class="cancel-btn">No</button>
        </div>
      </div>
    </div>

    <!-- Create Post Modal -->
    <div v-if="showCreatePostModal" class="modal-overlay" @click="showCreatePostModal = false">
      <div class="modal large-modal" @click.stop>
        <h3>Create New Post</h3>
        <div class="form-group">
          <label>Content:</label>
          <textarea 
            v-model="newPost.content" 
            placeholder="What's on your mind?" 
            class="form-textarea"
            rows="5"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button @click="createPost" class="confirm-btn" :disabled="creatingPost">
            {{ creatingPost ? 'Creating...' : 'Create Post' }}
          </button>
          <button @click="cancelCreatePost" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Comments Modal -->
    <div v-if="showCommentModal" class="modal-overlay" @click="closeCommentsModal">
      <div class="modal large-modal" @click.stop>
        <h3>Post by {{ selectedPost.author_username || 'You' }}</h3>
        <div class="post-content-modal">
          <p>{{ selectedPost.content }}</p>
        </div>
        
        <h4>Comments:</h4>
        <div class="comments-section">
          <div v-if="selectedPost.comments && selectedPost.comments.length > 0">
            <div v-for="comment in selectedPost.comments" :key="comment.id" class="comment-item">
              <div class="comment-content">
                <strong>{{ comment.author_username }}:</strong>
                <p>{{ comment.text }}</p>
                <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-comments">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        </div>
        
        <!-- Add Comment Section (only for explore feed posts) -->
        <div v-if="commentMode === 'explore'" class="add-comment-section">
          <h4>Add a Comment:</h4>
          <textarea 
            v-model="newComment" 
            placeholder="Write your comment..." 
            class="comment-input"
            rows="3"
          ></textarea>
          <div class="comment-actions">
            <button @click="submitComment" class="confirm-btn" :disabled="submittingComment">
              {{ submittingComment ? 'Posting...' : 'Post Comment' }}
            </button>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="closeCommentsModal" class="cancel-btn">Close</button>
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
      selectedPost: {},
      commentMode: 'my', // 'my' or 'explore'
      newComment: '',
      newPost: {
        content: ''
      },
      myPosts: [],
      explorePosts: [],
      loadingMyPosts: false,
      loadingExploreFeed: false,
      creatingPost: false,
      submittingComment: false
    }
  },
  async mounted() {
    await this.loadMyPosts()
    await this.loadExploreFeed()
  },
  methods: {
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
      if (!this.newPost.content.trim()) {
        alert('Please enter some content for your post.')
        return
      }

      this.creatingPost = true
      try {
        await userAPI.createPost({
          content: this.newPost.content
        })
        
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
      if (!this.newComment.trim()) {
        alert('Please enter a comment.')
        return
      }

      this.submittingComment = true
      try {
        const response = await userAPI.createComment({
          text: this.newComment,
          post_id: this.selectedPost.id
        })
        
        if (response.visible_in_feed) {
          alert('Comment posted successfully!')
        } else if (response.auto_processed) {
          alert('Your comment has been flagged and is hidden from public view.')
        } else {
          alert('Your comment is pending review by moderators.')
        }
        
        this.newComment = ''
        await this.loadExploreFeed()
        this.closeCommentsModal()
        
      } catch (error) {
        console.error('Error submitting comment:', error)
        alert('Failed to post comment. Please try again.')
      } finally {
        this.submittingComment = false
      }
    },

    closeCommentsModal() {
      this.showCommentModal = false
      this.selectedPost = {}
      this.newComment = ''
    },

    confirmLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },

    formatDate(date) {
      if (!date) return 'Unknown date'
      return new Date(date).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.user-dashboard {
  min-height: 100vh;
  background-color: #f8f9fa;
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
  font-weight: 500;
}

.logout-btn:hover {
  background-color: rgba(255,255,255,0.3);
  transform: translateY(-2px);
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

.content-section {
  max-width: 1000px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.content-section h2 {
  color: #2c3e50;
  font-size: 28px;
  margin: 0 0 30px 0;
}

.create-post-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.create-post-btn:hover {
  background-color: #229954;
  transform: translateY(-2px);
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  border: 1px solid #e9ecef;
  transition: transform 0.3s ease;
}

.post-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.post-content p {
  color: #5a6c7d;
  line-height: 1.6;
  margin: 0 0 15px 0;
  font-size: 16px;
}

.post-meta {
  display: flex;
  gap: 20px;
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 20px;
}

.post-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.comment-btn {
  background-color: #e67e22;
}

.comment-btn:hover {
  background-color: #d35400;
}

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
  min-width: 600px;
  text-align: left;
  max-height: 80vh;
  overflow-y: auto;
}

.modal h3, .modal h4 {
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #2c3e50;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
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
  transition: all 0.3s ease;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #229954;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.post-content-modal {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #3498db;
}

.comments-section {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
}

.comment-item {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 10px;
}

.comment-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.comment-content p {
  margin: 8px 0;
  color: #5a6c7d;
}

.comment-date {
  font-size: 12px;
  color: #7f8c8d;
}

.add-comment-section {
  margin: 20px 0;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  margin-bottom: 10px;
  font-family: inherit;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.empty-comments {
  text-align: center;
  color: #7f8c8d;
  padding: 20px;
}
</style>