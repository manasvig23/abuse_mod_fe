<template>
  <div class="statistics">
    <div class="section-header">
      <div class="section-title">
        <h2>Analytics & Statistics</h2>
        <p class="section-subtitle">System performance and user metrics</p>
      </div>
      <div class="section-controls">
        <div class="filter-controls">
          <label class="filter-label">User Statistics:</label>
          <select v-model="selectedStatsUsername" @change="loadStats" class="modern-select">
            <option value="">System Overview</option>
            <option v-for="user in users" :key="user.id" :value="user.username">
              {{ user.username }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="Loading analytics..." />

    <!-- System Statistics -->
    <div v-else-if="stats && stats.type === 'overall_stats'" class="stats-dashboard">
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.total_users }}</h3>
            <p class="stat-label">Total Users</p>
          </div>
        </div>
        
        <div class="stat-card secondary">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.total_posts }}</h3>
            <p class="stat-label">Total Posts</p>
          </div>
        </div>
        
        <div class="stat-card info">
          <div class="stat-icon">💬</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.total_comments }}</h3>
            <p class="stat-label">Total Comments</p>
          </div>
        </div>
        
        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.clean_comments }}</h3>
            <p class="stat-label">Clean Comments</p>
          </div>
        </div>
        
        <div class="stat-card warning">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.flagged_comments }}</h3>
            <p class="stat-label">Flagged Comments</p>
          </div>
        </div>
        
        <div class="stat-card danger">
          <div class="stat-icon">⚖️</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.needs_review }}</h3>
            <p class="stat-label">Needs Review</p>
          </div>
        </div>
      </div>
      
      <div class="performance-metrics">
        <div class="metric-card highlight">
          <div class="metric-header">
            <h4>AI Efficiency</h4>
            <span class="metric-percentage">{{ stats.stats.ai_efficiency_percent }}%</span>
          </div>
          <div class="metric-bar">
            <div class="metric-fill" :style="{ width: stats.stats.ai_efficiency_percent + '%' }"></div>
          </div>
          <p class="metric-description">Percentage of comments processed automatically</p>
        </div>
        
        <div class="metric-card highlight">
          <div class="metric-header">
            <h4>Abuse Detection Rate</h4>
            <span class="metric-percentage">{{ stats.stats.abuse_detection_rate }}%</span>
          </div>
          <div class="metric-bar">
            <div class="metric-fill danger" :style="{ width: stats.stats.abuse_detection_rate + '%' }"></div>
          </div>
          <p class="metric-description">Percentage of abusive content detected</p>
        </div>
      </div>
    </div>

    <!-- User-specific Statistics -->
    <div v-else-if="stats && stats.type === 'user_stats'" class="user-stats-dashboard">
      <div class="user-stats-header">
        <div class="user-avatar-large">{{ stats.user.username ? stats.user.username.charAt(0).toUpperCase() : 'U' }}</div>
        <div class="user-info">
          <h3>{{ stats.user.username }}</h3>
          <div class="user-details">
            <span class="user-role">{{ stats.user.role }}</span>
            <span class="join-date">Joined {{ stats.user.join_date }}</span>
            <span class="user-email">{{ stats.user.email }}</span>
          </div>
        </div>
      </div>
      
      <div class="user-stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.total_posts }}</h3>
            <p class="stat-label">Posts Created</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.total_comments }}</h3>
            <p class="stat-label">Total Comments</p>
          </div>
        </div>
        
        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.approved_comments }}</h3>
            <p class="stat-label">Approved</p>
          </div>
        </div>
        
        <div class="stat-card danger">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.hidden_comments }}</h3>
            <p class="stat-label">Hidden</p>
          </div>
        </div>
        
        <div class="stat-card warning">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.stats.pending_comments }}</h3>
            <p class="stat-label">Pending Review</p>
          </div>
        </div>
      </div>
      
      <div class="abuse-rate-card">
        <h4>User Abuse Rate</h4>
        <div class="abuse-rate-display">
          <div class="rate-circle" :class="getAbuseRateClass(stats.stats.abuse_rate_percent)">
            <span class="rate-number">{{ stats.stats.abuse_rate_percent }}%</span>
          </div>
          <p class="rate-description">
            {{ getAbuseRateDescription(stats.stats.abuse_rate_percent) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Default empty state -->
    <EmptyState
      v-else-if="!loading"
      icon="📊"
      title="No statistics available"
      message="Statistics data will appear here once loaded."
    />
  </div>
</template>

<script>
import { moderatorAPI } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

export default {
  name: 'Statistics',
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
  data() {
    return {
      stats: null,
      loading: false,
      selectedStatsUsername: ''
    }
  },
  async mounted() {
    await this.loadStats()
  },
  methods: {
    async loadStats() {
      this.loading = true
      try {
        const response = await moderatorAPI.getStatistics(this.selectedStatsUsername)
        this.stats = response
      } catch (error) {
        console.error('Error loading statistics:', error)
      } finally {
        this.loading = false
      }
    },
    getAbuseRateClass(rate) {
      if (!rate || rate < 10) return 'low'
      if (rate < 30) return 'medium'
      return 'high'
    },
    getAbuseRateDescription(rate) {
      if (!rate || rate < 10) return 'This user maintains excellent content quality.'
      if (rate < 30) return 'Moderate abuse rate. Monitor occasionally.'
      return 'High abuse rate. Requires close monitoring.'
    }
  }
}
</script>

<style scoped>
.statistics {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid #667eea;
}

.stat-card.primary { border-left-color: #667eea; }
.stat-card.secondary { border-left-color: #f5576c; }
.stat-card.info { border-left-color: #3498db; }
.stat-card.success { border-left-color: #27ae60; }
.stat-card.warning { border-left-color: #f39c12; }
.stat-card.danger { border-left-color: #e74c3c; }

.stat-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
}

.stat-content {
  flex: 1;
}

.stat-content .stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  display: block;
  margin: 0;
}

.stat-content .stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin: 4px 0 0 0;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.metric-card.highlight {
  border-left: 4px solid #667eea;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.metric-header h4 {
  margin: 0;
  color: #2c3e50;
}

.metric-percentage {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.metric-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.metric-fill.danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.metric-description {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.user-stats-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 24px;
}

.user-info h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 24px;
}

.user-details {
  display: flex;
  gap: 16px;
  color: #7f8c8d;
  font-size: 14px;
}

.user-role {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.user-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.abuse-rate-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  text-align: center;
}

.abuse-rate-card h4 {
  margin: 0 0 24px 0;
  color: #2c3e50;
}

.abuse-rate-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rate-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-weight: 700;
  font-size: 24px;
  border: 8px solid;
}

.rate-circle.low {
  background: rgba(39, 174, 96, 0.1);
  border-color: rgba(39, 174, 96, 0.3);
  color: #27ae60;
}

.rate-circle.medium {
  background: rgba(243, 156, 18, 0.1);
  border-color: rgba(243, 156, 18, 0.3);
  color: #f39c12;
}

.rate-circle.high {
  background: rgba(231, 76, 60, 0.1);
  border-color: rgba(231, 76, 60, 0.3);
  color: #e74c3c;
}

.rate-description {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .user-stats-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .stats-grid,
  .user-stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .performance-metrics {
    grid-template-columns: 1fr;
  }
}
</style>