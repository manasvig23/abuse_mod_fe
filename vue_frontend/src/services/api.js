import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8001'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication API
export const authAPI = {
  async login(credentials) {
    const response = await api.post('/api/login', credentials)
    return response.data
  },

  async register(userData) {
    try {
      const response = await api.post('/api/register', userData)
      return response.data
    } catch (error) {
      console.error('Registration API Error:', error.response?.data)
      throw error
    }
  }
}

// User API
export const userAPI = {
  async getMyPosts() {
    const response = await api.get('/api/user/my-posts')
    return response.data
  },

  async getExploreFeed() {
    const response = await api.get('/api/user/explore-feed')
    return response.data
  },

  async createPost(postData) {
    const response = await api.post('/api/posts/', postData)
    return response.data
  },

  async createComment(commentData) {
    const response = await api.post('/api/comments/', commentData)
    return response.data
  },

  async deleteOwnPost(postId, reason) {
    const response = await api.delete(`/api/posts/${postId}`, {
      data: { reason }
    })
    return response.data
  },

  async getDeletedPostsNotifications() {
    const response = await api.get('/api/user/deleted-posts')
    return response.data
  },

  async markDeletedPostViewed(deletedPostId) {
    const response = await api.put(`/api/user/deleted-posts/${deletedPostId}/mark-viewed`)
    return response.data
  },

  async getDeletedPostsCount() {
    const response = await api.get('/api/user/deleted-posts-count')
    return response.data
  }
}

// Moderator API
export const moderatorAPI = {
  async getAllUsers() {
    const response = await api.get('/api/moderator/users')
    return response.data
  },

  async getUsersDropdown() {
    const response = await api.get('/api/moderator/users-dropdown')
    return response.data
  },

  async getAllPosts(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/api/moderator/all-posts', { params })
    return response.data
  },

  async getPostsForReview() {
    const response = await api.get('/api/moderator/posts-for-review')
    return response.data
  },

  async getPostForReview(postId) {
    const response = await api.get(`/api/moderator/posts/${postId}/review`)
    return response.data
  },

  async getPostComments(postId) {
    const response = await api.get(`/api/moderator/posts/${postId}/view-comments`)
    return response.data
  },

  async getFlaggedComments(userId = null) {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/api/moderator/flagged-comments', { params })
    return response.data
  },

  async getStatistics(username = null) {
    const params = username ? { username: username } : {}
    const response = await api.get('/api/moderator/statistics', { params })
    return response.data
  },

  async reviewComment(commentId, action, reason = '') {
    const response = await api.put(`/api/moderator/comments/${commentId}/review`, {
      action,
      reason
    })
    return response.data
  },

  async deletePost(postId, reason) {
    const response = await api.delete(`/api/moderator/posts/${postId}`, {
      data: { reason }
    })
    return response.data
  },

  async deleteUser(userId, reason) {
    const response = await api.delete(`/api/moderator/users/${userId}`, {
      data: { reason }
    })
    return response.data
  }
}

// Admin API
export const adminAPI = {
  async getAllModerators() {
    const response = await api.get('/api/admin/moderators')
    return response.data
  },

  async suspendModerator(moderatorId, data) {
    const response = await api.put(`/api/admin/moderators/${moderatorId}/suspend`, data)
    return response.data
  },

  async unsuspendModerator(moderatorId) {
    const response = await api.put(`/api/admin/moderators/${moderatorId}/unsuspend`)
    return response.data
  },

  async deleteModerator(moderatorId, data) {
    const response = await api.delete(`/api/admin/moderators/${moderatorId}`, {
      data: data
    })
    return response.data
  }
}

export default api