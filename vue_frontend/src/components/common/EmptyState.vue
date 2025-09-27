<template>
  <div class="empty-state" :class="type">
    <div class="empty-icon">{{ icon }}</div>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: '📄'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: '', // '', 'success', 'warning', 'error'
      validator: value => ['', 'success', 'warning', 'error'].includes(value)
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  grid-column: 1 / -1;
}

.empty-state.success {
  background: rgba(39, 174, 96, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.empty-state.warning {
  background: rgba(243, 156, 18, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(243, 156, 18, 0.2);
}

.empty-state.error {
  background: rgba(231, 76, 60, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-state h3 {
  color: #2c3e50;
  font-size: 24px;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.empty-state p {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0 0 32px 0;
}
</style>