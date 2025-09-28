<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal" :class="[size, type]" @click.stop>
      <div class="modal-header" v-if="showHeader">
        <div class="modal-title">
          <h3>{{ title }}</h3>
          <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
        </div>
        <button v-if="showCloseButton" @click="$emit('close')" class="modal-close">✕</button>
      </div>

      <div class="modal-body">
        <slot></slot>
      </div>

      <div class="modal-footer" v-if="showFooter">
        <slot name="footer">
          <button @click="$emit('close')" class="modal-button secondary">Close</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium', // 'small', 'medium', 'large'
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    type: {
      type: String,
      default: 'default', // 'default', 'modern'
      validator: value => ['default', 'modern'].includes(value)
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: false
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  methods: {
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.$emit('close')
      }
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

.modal {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.4s ease;
}

.modal.small { width: 400px; }
.modal.medium { width: 600px; }
.modal.large { width: 800px; }

.modal.modern {
  border-radius: 20px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
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
  background-color: #ffffffff

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
  .modal {
    width: 95vw;
    margin: 20px;
  }
  
  .modal.small,
  .modal.medium,
  .modal.large {
    width: 95vw;
  }
}
</style>