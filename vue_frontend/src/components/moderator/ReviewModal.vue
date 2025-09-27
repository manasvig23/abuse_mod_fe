<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal large-modal modern-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-title">
          <h3>{{ modalTitle }}</h3>
          <p class="modal-subtitle">Post by {{ post.author_username }}</p>
        </div>
        <button @click="$emit('close')" class="modal-close">✕</button>
      </div>

      <div class="modal-body">
        <div class="post-context">
          <div class="post-content-display">
            <h4>Original Post:</h4>
            <p>{{ post.content }}</p>
          </div>
        </div>

        <div class="comments-review-section">
          <h4>{{ sectionTitle }} ({{ comments.length }})</h4>
          <div class="comments-review-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-review-card">
              <div class="comment-review-header">
                <div class="comment-author-info">
                  <div class="comment-avatar">
                    {{ comment.author_username ? comment.author_username.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div class="comment-meta">
                    <strong class="comment-author">{{ comment.author_username }}</strong>
                    <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                  </div>
                </div>
                <div class="comment-flags">
                  <div class="status-badge" :class="getStatusClass(comment.status)">
                    {{ comment.status }}
                  </div>
                </div>
              </div>
              
              <div class="comment-content">
                <p>{{ comment.text }}</p>
              </div>
              
              <div class="comment-analysis" v-if="comment.flagged_words || comment.confidence_score">
                <div class="analysis-item" v-if="comment.flagged_words">
                  <span class="analysis-label">Flagged Words:</span>
                  <span class="flagged-words-list">{{ comment.flagged_words }}</span>
                </div>
                <div class="analysis-item" v-if="comment.confidence_score">
                  <span class="analysis-label">Confidence:</span>
                  <span class="confidence-score">{{ comment.confidence_score }}%</span>
                </div>
              </div>
              
              <div class="comment-review-actions" v-if="showActions">
                <button 
                  @click="$emit('review-comment', comment.id, 'approve')" 
                  class="review-action-btn approve"
                  :disabled="comment.status === 'approved'"
                >
                  <span class="btn-icon">✅</span>
                  Approve
                </button>
                <button 
                  @click="$emit('review-comment', comment.id, 'hide')" 
                  class="review-action-btn hide"
                  :disabled="comment.status === 'hidden'"
                >
                  <span class="btn-icon">🚫</span>
                  Hide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="modal-button secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReviewModal',
  props: {
    post: {
      type: Object,
      default: () => ({})
    },
    comments: {
      type: Array,
      default: () => []
    },
    modalTitle: {
      type: String,
      default: 'Review Comments'
    },
    sectionTitle: {
      type: String,
      default: 'Comments for Review'
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'review-comment'],
  methods: {
    formatDate(date) {
      if (!date) return 'Unknown date'
      try {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'Invalid date'
      }
    },
    getStatusClass(status) {
      const statusMap = {
        'pending': 'pending',
        'approved': 'approved',
        'hidden': 'hidden',
        'flagged': 'flagged'
      }
      return statusMap[status] || 'pending'
    }
  }
}
</script>

<style scoped>
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

.modern-modal {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.4s ease;
}

.large-modal {
  width: 800px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

.modal-title h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.modal-subtitle {
  color: #7f8c8d;
  font-size: 14px;
  margin: 4px 0 0 0;
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
  max-height: 70vh;
  overflow-y: auto;
}

.post-context {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border-left: 4px solid #667eea;
}

.post-content-display h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.post-content-display p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.6;
}

.comments-review-section h4 {
  margin-bottom: 16px;
  color: #2c3e50;
}

.comments-review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-review-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.comment-review-card:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.comment-review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.comment-author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-avatar {
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

.comment-meta {
  display: flex;
  flex-direction: column;
}

.comment-author {
  color: #2c3e50;
  font-size: 14px;
}

.comment-date {
  color: #7f8c8d;
  font-size: 12px;
}

.comment-flags {
  display: flex;
  gap: 8px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.status-badge.approved {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.status-badge.hidden,
.status-badge.flagged {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.comment-content {
  margin-bottom: 12px;
}

.comment-content p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.5;
}

.comment-analysis {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.analysis-label {
  font-weight: 600;
  color: #7f8c8d;
}

.flagged-words-list {
  color: #e74c3c;
  font-weight: 500;
}

.confidence-score {
  color: #f39c12;
  font-weight: 600;
}

.comment-review-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.review-action-btn {
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

.review-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.review-action-btn.approve {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.review-action-btn.approve:hover:not(:disabled) {
  background: #27ae60;
  color: white;
}

.review-action-btn.hide {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.2);
}

.review-action-btn.hide:hover:not(:disabled) {
  background: #f39c12;
  color: white;
}

.btn-icon {
  font-size: 12px;
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

@media (max-width: 768px) {
  .large-modal {
    width: 95vw;
    margin: 20px;
  }
  
  .comment-review-actions {
    flex-direction: column;
  }
}
</style>