<template>
  <div class="review-comments">
    <div class="section-header">
      <div class="section-title">
        <h2>Comment Review Queue</h2>
        <p class="section-subtitle">Comments flagged for human review</p>
      </div>
      <div class="queue-stats">
        <div class="stat-card mini">
          <span class="stat-number">{{ reviewItems.length }}</span>
          <span class="stat-label">Posts with pending reviews</span>
        </div>
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="Loading review queue..." />

    <div v-else-if="reviewItems.length > 0" class="review-queue">
      <div v-for="item in reviewItems" :key="`${item.user_id}-${item.post_id}`" class="review-item">
        <div class="review-header">
          <div class="user-profile-card">
            <div class="user-avatar-large">{{ item.username ? item.username.charAt(0).toUpperCase() : 'U' }}</div>
            <div class="user-details">
              <h4 class="user-name">{{ item.username }}</h4>
              <div class="user-metadata">
                <span class="user-id">ID: {{ item.user_id }}</span>
                <span class="user-status" :class="item.is_active ? 'active' : 'inactive'">
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span class="join-date">Joined {{ formatDate(item.user_created_at) }}</span>
              </div>
              <div class="abuse-rate-indicator">
                <span class="rate-label">Abuse Rate:</span>
                <div class="rate-bar">
                  <div class="rate-fill" :class="getAbuseRateClass(item.abuse_rate_percent)" 
                       :style="{ width: item.abuse_rate_percent + '%' }"></div>
                </div>
                <span class="rate-value" :class="getAbuseRateClass(item.abuse_rate_percent)">
                  {{ item.abuse_rate_percent }}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="post-preview">
          <div class="post-meta">
            <span class="post-id">Post #{{ item.post_id }}</span>
            <span class="pending-count">{{ item.pending_comments_count }} comments pending</span>
          </div>
          <div class="post-content-preview">
            <p>{{ item.post_content }}</p>
          </div>
        </div>
        
        <div class="review-actions">
          <button @click="$emit('view-comments', item.post_id)" class="action-button secondary">
            <span class="button-icon">👁️</span>
            View Post
          </button>
          <button @click="$emit('review-comments', item.post_id)" class="action-button primary">
            <span class="button-icon">⚖️</span>
            Review Comments
          </button>
        </div>
      </div>
    </div>
    
    <EmptyState
      v-else-if="!loading"
      type="success"
      icon="✅"
      title="All caught up!"
      message="No comments need review right now. Great job keeping the community clean!"
    />
  </div>
</template>

<script>
import { moderatorAPI } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

export default {
  name: 'ReviewComments',
  components: {
    LoadingSpinner,
    EmptyState
  },
  emits: ['view-comments', 'review-comments'],
  data() {
    return {
      reviewItems: [],
      loading: false
    }
  },
  async mounted() {
    await this.loadReviewItems()
  },
  methods: {
    async loadReviewItems() {
      this.loading = true
      try {
        const response = await moderatorAPI.getPostsForReview()
        this.reviewItems = response.review_items || []
      } catch (error) {
        console.error('Error loading review items:', error)
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
    getAbuseRateClass(rate) {
      if (!rate || rate < 10) return 'low'
      if (rate < 30) return 'medium'
      return 'high'
    }
  }
}
</script>

<style scoped>
.review-comments {
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

.queue-stats {
  display: flex;
  gap: 16px;
}

.stat-card.mini {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #667eea;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  display: block;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
}

.review-queue {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-profile-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.user-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 18px;
  margin: 0;
}

.user-metadata {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #7f8c8d;
}

.user-status.active { color: #27ae60; }
.user-status.inactive { color: #e74c3c; }

.abuse-rate-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rate-label {
  font-size: 12px;
  color: #7f8c8d;
}

.rate-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.rate-fill.low { background: #27ae60; }
.rate-fill.medium { background: #f39c12; }
.rate-fill.high { background: #e74c3c; }

.rate-value {
  font-size: 12px;
  font-weight: 600;
}

.rate-value.low { color: #27ae60; }
.rate-value.medium { color: #f39c12; }
.rate-value.high { color: #e74c3c; }

.post-preview {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  margin: 16px 0;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #7f8c8d;
}

.pending-count {
  color: #f39c12;
  font-weight: 600;
}

.post-content-preview p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.5;
}

.review-actions {
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

.action-button.secondary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.action-button.secondary:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

.button-icon {
  font-size: 12px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .user-profile-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>