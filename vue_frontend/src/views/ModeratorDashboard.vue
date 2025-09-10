<template>
  <div class="moderator-dashboard">
    <!-- Header -->
    <div class="header">
      <h1>Hello {{ user.username }}!</h1>
      <button @click="showLogoutModal = true" class="logout-btn">Logout</button>
    </div>

    <!-- Sidebar -->
    <div class="dashboard-layout">
      <div class="sidebar">
        <div class="nav-item" :class="{ active: activeTab === 'allPosts' }" @click="setActiveTab('allPosts')">All Posts</div>
        <div class="nav-item" :class="{ active: activeTab === 'reviewComments' }" @click="setActiveTab('reviewComments')">Review Comments</div>
        <div class="nav-item" :class="{ active: activeTab === 'flaggedComments' }" @click="setActiveTab('flaggedComments')">Flagged Comments</div>
        <div class="nav-item" :class="{ active: activeTab === 'statistics' }" @click="setActiveTab('statistics')">Statistics</div>
        <div class="nav-item" :class="{ active: activeTab === 'userList' }" @click="setActiveTab('userList')">User List</div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- All Posts Tab -->
        <div v-if="activeTab === 'allPosts'" class="content-section">
          <h2>All Posts</h2>
          <div class="filter-bar">
            <select v-model="selectedUserId" @change="loadAllPosts" class="user-filter">
              <option value="">Select user dropdown</option>
              <option v-for="user in allUsers" :key="user.id" :value="user.id">
                {{ user.username }}
              </option>
            </select>
          </div>
          <div v-if="loadingPosts" class="loading">Loading posts...</div>
          <div class="posts-container">
            <div v-for="post in allPosts" :key="post.id" class="post-item">
              <div class="post-content">
                <p>{{ post.content }}</p>
                <div class="post-meta">
                  <span>by {{ post.author_username }}</span>
                  <span>{{ formatDate(post.created_at) }}</span>
                  <span>{{ post.total_comments }} comments</span>
                </div>
              </div>
              <div class="post-actions">
                <button @click="viewPost