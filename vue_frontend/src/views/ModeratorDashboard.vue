<template>
  <div class="dashboard-container">
    <h1 class="title">Moderator Dashboard</h1>

    <!-- Statistics -->
    <section class="card">
      <h2>📊 Statistics</h2>
      <div v-if="stats" class="stats">
        <p><strong>Total Users:</strong> {{ stats.total_users }}</p>
        <p><strong>Total Posts:</strong> {{ stats.total_posts }}</p>
        <p><strong>Total Comments:</strong> {{ stats.total_comments }}</p>
        <p><strong>Clean Comments:</strong> {{ stats.clean_comments }}</p>
        <p><strong>Flagged Comments:</strong> {{ stats.flagged_comments }}</p>
        <p><strong>Needs Review:</strong> {{ stats.needs_review }}</p>
        <p><strong>AI Efficiency:</strong> {{ stats.ai_efficiency_percent }}%</p>
      </div>
      <div v-else>Loading statistics...</div>
    </section>

    <!-- Pending Comments -->
    <section class="card">
      <h2>📝 Pending Comments for Review</h2>
      <div v-if="pendingPosts.length">
        <div v-for="post in pendingPosts" :key="post.id" class="post">
          <h3>{{ post.content }}</h3>
          <p>By: {{ post.author_username }} | Pending Comments: {{ post.pending_comments_count }}</p>
          <button @click="openReview(post.id)">Review</button>
        </div>
      </div>
      <div v-else>No pending comments 🎉</div>
    </section>

    <!-- Flagged Comments -->
    <section class="card">
      <h2>🚩 Flagged Comments</h2>
      <div v-if="flaggedPosts.length">
        <div v-for="post in flaggedPosts" :key="post.id" class="post">
          <h3>{{ post.content }}</h3>
          <div v-for="comment in post.flagged_comments" :key="comment.id" class="comment">
            <p><strong>{{ comment.author_username }}:</strong> {{ comment.text }}</p>
            <p>Status: {{ comment.status }} | Reason: {{ comment.auto_review_reason }}</p>
            <div class="actions">
              <button @click="reviewComment(comment.id, 'approve')">Approve</button>
              <button @click="reviewComment(comment.id, 'hide')">Hide</button>
              <button @click="reviewComment(comment.id, 'delete')">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else>No flagged comments 🎉</div>
    </section>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: "ModeratorDashboard",
  data() {
    return {
      stats: null,
      pendingPosts: [],
      flaggedPosts: [],
      token: localStorage.getItem("token") || ""
    }
  },
  methods: {
    async fetchStats() {
      try {
        const res = await axios.get("http://localhost:8001/api/moderator/statistics", {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.stats = res.data.stats
      } catch (err) {
        console.error("Error fetching stats", err)
      }
    },
    async fetchPending() {
      try {
        const res = await axios.get("http://localhost:8001/api/moderator/posts-for-review", {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.pendingPosts = res.data.posts
      } catch (err) {
        console.error("Error fetching pending posts", err)
      }
    },
    async fetchFlagged() {
      try {
        const res = await axios.get("http://localhost:8001/api/moderator/flagged-comments", {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.flaggedPosts = res.data.posts
      } catch (err) {
        console.error("Error fetching flagged comments", err)
      }
    },
    async reviewComment(commentId, action) {
      try {
        await axios.put(
          `http://localhost:8001/api/moderator/comments/${commentId}/review`,
          { action },
          { headers: { Authorization: `Bearer ${this.token}` } }
        )
        alert(`Comment ${action}d successfully`)
        this.fetchFlagged()
        this.fetchPending()
      } catch (err) {
        console.error("Error reviewing comment", err)
      }
    },
    openReview(postId) {
      this.$router.push(`/moderator/review/${postId}`)
    }
  },
  mounted() {
    this.fetchStats()
    this.fetchPending()
    this.fetchFlagged()
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.card {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.title {
  text-align: center;
  margin-bottom: 20px;
}
.post {
  border: 1px solid #ddd;
  padding: 10px;
  margin: 10px 0;
  border-radius: 6px;
}
.comment {
  background: #fff;
  padding: 8px;
  margin: 6px 0;
  border-left: 3px solid #f44336;
}
.actions button {
  margin-right: 10px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.actions button:nth-child(1) { background: #4caf50; color: white; }
.actions button:nth-child(2) { background: #ff9800; color: white; }
.actions button:nth-child(3) { background: #f44336; color: white; }
</style>
