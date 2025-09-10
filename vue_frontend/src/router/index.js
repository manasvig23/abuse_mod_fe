import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Registration from '../views/Registration.vue'
import UserFeed from '../views/UserFeed.vue'
import ModeratorDashboard from '../views/ModeratorDashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { title: 'Login - Abuse Moderation' }
    },
    {
      path: '/register',
      name: 'Registration',
      component: Registration,
      meta: { title: 'Register - Abuse Moderation' }
    },
    {
      path: '/feed',
      name: 'UserFeed',
      component: UserFeed,
      meta: { requiresAuth: true, role: 'user', title: 'Feed - Abuse Moderation' }
    },
    {
      path: '/mod-dashboard',
      name: 'ModeratorDashboard', 
      component: ModeratorDashboard,
      meta: { requiresAuth: true, role: 'moderator', title: 'Dashboard - Abuse Moderation' }
    }
  ]
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = to.meta.title || 'Abuse Moderation System'
  
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!token || !user) {
      // Redirect to login if not authenticated
      next('/login')
      return
    }

    // Check role-based access
    if (to.meta.role && user.role !== to.meta.role) {
      // Redirect based on user role
      if (user.role === 'moderator') {
        next('/mod-dashboard')
      } else {
        next('/feed')
      }
      return
    }
  }

  // If already logged in and trying to access login/register page
  if ((to.path === '/login' || to.path === '/register') && token && user) {
    if (user.role === 'moderator') {
      next('/mod-dashboard')
    } else {
      next('/feed')
    }
    return
  }

  next()
})

export default router