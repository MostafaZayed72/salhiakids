import { ref } from 'vue'

interface NotificationAction {
  label: string
  onClick: () => void
  style?: 'primary' | 'secondary'
  icon?: string
}

interface NotificationOptions {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  actions?: NotificationAction[]
  autoClose?: boolean
  duration?: number
}

// ✅ إنشاء state عام بدلاً من إنشاء واحد في كل مرة
const isOpen = ref(false)
const notificationData = ref<NotificationOptions>({
  title: '',
  message: '',
  type: 'info',
  actions: [],
  autoClose: false,
  duration: 3000
})

let autoCloseTimeout: ReturnType<typeof setTimeout> | null = null

export const useNotification = () => {
  const show = (options: NotificationOptions) => {
    // أوقف أي timeout سابق
    if (autoCloseTimeout) clearTimeout(autoCloseTimeout)

    notificationData.value = {
      title: options.title || '',
      message: options.message || '',
      type: options.type || 'info',
      actions: options.actions || [],
      autoClose: options.autoClose ?? false,
      duration: options.duration || 3000
    }
    isOpen.value = true

    // إذا كان autoClose مفعّل و type ليس warning
    if (options.autoClose === true && options.type !== 'warning') {
      autoCloseTimeout = setTimeout(() => {
        isOpen.value = false
      }, options.duration || 3000)
    }
  }

  const close = () => {
    isOpen.value = false
    if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
  }

  return {
    isOpen,
    notification: notificationData,
    show,
    close
  }
}