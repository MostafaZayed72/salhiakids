<!-- filepath: e:\projects\child\app\components\NotificationModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click="handleBackdropClick" 
        dir="rtl">
        
        <div 
          class="bg-white rounded-3xl shadow-2xl w-full max-w-sm transform transition-all duration-300"
          @click.stop>
          
          <div class="p-8 text-center">
            <!-- Icon -->
            <div class="mb-6 flex justify-center">
              <div :class="['w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg', iconClass]">
                <span class="material-icons text-5xl">{{ iconName }}</span>
              </div>
            </div>

            <!-- Title -->
            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ notification.title }}</h2>

            <!-- Message -->
            <p class="text-gray-600 text-sm mb-6 leading-relaxed">{{ notification.message }}</p>

            <!-- Actions -->
            <div v-if="notification.actions && notification.actions.length > 0" class="flex flex-col gap-3">
              <button 
                v-for="(action, idx) in notification.actions" 
                :key="idx"
                @click="handleAction(action)"
                :class="[
                  'w-full py-2.5 px-4 rounded-xl font-semibold transition duration-200 flex items-center justify-center gap-2',
                  action.style === 'primary'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-300'
                    : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                ]">
                <span v-if="action.icon" class="material-icons text-sm">{{ getActionIcon(action.icon) }}</span>
                {{ action.label }}
              </button>
            </div>
            
            <!-- Default Close Button if no actions -->
            <div v-else class="flex flex-col gap-3">
              <button 
                @click="close()"
                class="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition duration-200">
                حسناً
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface NotificationAction {
  label: string
  onClick: () => void
  style?: 'primary' | 'secondary'
  icon?: string
}

interface Notification {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  actions?: NotificationAction[]
}

const props = defineProps<{
  isOpen: boolean
  notification: Notification
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}

const handleBackdropClick = () => {
  // إذا كان هناك أزرار تأكيد، لا تغلق بالضغط على الخلفية
  if (!props.notification.actions || props.notification.actions.length === 0) {
    close()
  }
}

const handleAction = (action: NotificationAction) => {
  action.onClick?.()
  close()
}

const iconClass = computed(() => {
  const baseClass = 'shadow-lg'
  switch (props.notification.type) {
    case 'success':
      return `bg-green-500 ${baseClass}`
    case 'error':
      return `bg-red-500 ${baseClass}`
    case 'warning':
      return `bg-yellow-500 ${baseClass}`
    case 'info':
      return `bg-blue-500 ${baseClass}`
    default:
      return `bg-purple-600 ${baseClass}`
  }
})

const iconName = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'notifications'
  }
})

const getActionIcon = (icon?: string) => {
  const iconMap: { [key: string]: string } = {
    'plus': 'add',
    'home': 'home',
    'check': 'check',
    'delete': 'delete'
  }
  return icon ? iconMap[icon] || '' : ''
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>