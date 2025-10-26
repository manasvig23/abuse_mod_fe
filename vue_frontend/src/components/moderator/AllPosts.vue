<template>
  <div class="all-posts">
    <div class="section-header">
      <div class="section-title">
        <h2>All Posts Management</h2>
        <p class="section-subtitle">Monitor and review user-generated content</p>
      </div>
      <div class="section-controls">
        <div class="filter-controls">
          <label class="filter-label">Filter by User:</label>
          <select v-model="selectedUserId" @change="loadPosts" class="modern-select">
            <option value="">All Users</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.username }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="Loading posts..." />

    <div v-else class="posts-grid">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <div class="post-author">
            <div class="author-avatar">
              {{ post.author_username ? post.author_username.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div class="author-info">
              <h4 class="author-name">{{ post.author_username }}</h4>
              <p class="post-date">{{ formatDate(post.created_at) }}</p>
            </div>
          </div>
          <div class="post-stats">
            <div class="stat-chip">
              <span class="stat-icon">💬</span>
              <span class="stat-value">{{ post.total_comments || 0 }}</span>
            </div>
          </div>
        </div>
        
        <div class="post-content">
          <p>{{ post.content }}</p>
        </div>
        
        <div class="post-footer">
          <div class="comment-breakdown">
            <div class="comment-stat approved" v-if="post.approved_comments > 0">
              <span class="dot"></span>
              <span>{{ post.approved_comments }} Approved</span>
            </div>
            <div class="comment-stat pending" v-if="post.pending_comments > 0">
              <span class="dot"></span>
              <span>{{ post.pending_comments }} Pending</span>
            </div>
            <div class="comment-stat hidden" v-if="post.hidden_comments > 0">
              <span class="dot"></span>
              <span>{{ post.hidden_comments }} Hidden</span>
            </div>
          </div>
          <div class="post-actions">
            <button 
              @click="$emit('view-comments', post.id)" 
              class="action-button primary"
            >
              <span class="button-icon">👁️</span>
              View Comments
            </button>
            <button 
              @click="$emit('delete-post', post)" 
              class="action-button danger"
            >
              <span class="button-icon">🗑️</span>
              Delete Post
            </button>
          </div>
        </div>
      </div>
      
      <EmptyState
        v-if="posts.length === 0"
        icon="📭"
        title="No posts found"
        :message="selectedUserId ? 'This user has not created any posts yet.' : 'No posts available in the system.'"
      />
    </div>
  </div>
</template>

<script>
import { moderatorAPI } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

export default {
  name: 'AllPosts',
  components: {
    LoadingSpinner,
    EmptyState
  },
  props: {
    users: {
      type: Array,
      default: () => []
    }
  },
  emits: ['view-comments', 'delete-post'],
  data() {
    return {
      posts: [],
      loading: false,
      selectedUserId: ''
    }
  },
  async mounted() {
    await this.loadPosts()
  },
  methods: {
    async loadPosts() {
      this.loading = true
      try {
        const response = await moderatorAPI.getAllPosts(this.selectedUserId)
        this.posts = response.posts || []
      } catch (error) {
        console.error('Error loading posts:', error)
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
.all-posts {
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

.section-controls {
  display: flex;
  gap: 20px;
  align-items: center;
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

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.post-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.post-date {
  color: #7f8c8d;
  font-size: 12px;
  margin: 0;
}

.post-stats {
  display: flex;
  gap: 8px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  font-size: 12px;
  color: #2c3e50;
}

.post-content {
  margin-bottom: 20px;
}

.post-content p {
  color: #2c3e50;
  line-height: 1.6;
  margin: 0;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.comment-breakdown {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.comment-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.comment-stat.approved .dot { background: #27ae60; }
.comment-stat.pending .dot { background: #f39c12; }
.comment-stat.hidden .dot { background: #e74c3c; }

.post-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.action-button.danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.action-button.danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.button-icon {
  font-size: 12px;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .post-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>