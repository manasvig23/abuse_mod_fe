<template>
  <div class="flagged-comments">
    <div class="section-header">
      <div class="section-title">
        <h2>Flagged Content</h2>
        <p class="section-subtitle">Posts with flagged comments and abusive content</p>
      </div>
      <div class="section-controls">
        <div class="filter-controls">
          <label class="filter-label">Filter by User:</label>
          <select v-model="selectedUserId" @change="loadFlaggedPosts" class="modern-select">
            <option value="">All Users</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.username }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="Loading flagged content..." />

    <div v-else class="flagged-content-list">
      <div class="flagged-list-header">
        <div class="list-header-cell">Post</div>
        <div class="list-header-cell">Author</div>
        <div class="list-header-cell">Flagged Count</div>
        <div class="list-header-cell">Actions</div>
      </div>

      <div v-for="post in flaggedPosts" :key="post.id" class="flagged-list-item">
        <div class="flagged-post-info">
          <div class="post-preview-mini">
            <p>{{ truncateText(post.content, 100) }}</p>
            <span class="post-date-mini">{{ formatDate(post.created_at) }}</span>
          </div>
        </div>
        
        <div class="author-info-mini">
          <div class="author-avatar-mini">
            {{ post.author_username ? post.author_username.charAt(0).toUpperCase() : 'U' }}
          </div>
          <span class="author-name-mini">{{ post.author_username }}</span>
        </div>
        
        <div class="flagged-count-display">
          <div class="flagged-badge-mini">
            <span class="flag-icon">🚩</span>
            <span>{{ post.flagged_count || 0 }} flagged</span>
          </div>
        </div>
        
        <div class="flagged-actions">
          <button @click="$emit('view-flagged-comments', post.id)" class="action-button primary">
            <span class="button-icon">👁️</span>
            View Flagged Comments
          </button>
        </div>
      </div>

      <EmptyState
        v-if="flaggedPosts.length === 0"
        icon="🎉"
        title="No flagged content"
        message="No flagged comments found for the selected criteria."
      />
    </div>
  </div>
</template>

<script>
import { moderatorAPI } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

export default {
  name: 'FlaggedComments',
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
  emits: ['view-flagged-comments'],
  data() {
    return {
      flaggedPosts: [],
      loading: false,
      selectedUserId: ''
    }
  },
  async mounted() {
    await this.loadFlaggedPosts()
  },
  methods: {
    async loadFlaggedPosts() {
      this.loading = true
      try {
        const response = await moderatorAPI.getFlaggedComments(this.selectedUserId)
        // The API should return posts with flagged comments, not individual comments
        this.flaggedPosts = response.posts || []
      } catch (error) {
        console.error('Error loading flagged posts:', error)
      } finally {
        this.loading = false
      }
    },
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
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
.flagged-comments {
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

.flagged-content-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.flagged-list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.flagged-list-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  align-items: center;
  transition: background-color 0.2s ease;
}

.flagged-list-item:hover {
  background: #f8f9fa;
}

.post-preview-mini p {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.4;
}

.post-date-mini {
  font-size: 12px;
  color: #7f8c8d;
}

.author-info-mini {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar-mini {
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

.author-name-mini {
  font-weight: 500;
  color: #2c3e50;
}

.flagged-badge-mini {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
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

.button-icon {
  font-size: 12px;
}

@media (max-width: 768px) {
  .flagged-list-header,
  .flagged-list-item {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>