`<template>
  <div class="relative">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!-- أيقونة الإشعارات -->
    <button
      @click="toggleNotifications"
      class="relative p-2 text-gray-600 hover:text-[#1B3C53] dark:text-gray-300 dark:hover:text-white transition-colors"
      :class="{ 'text-[#1B3C53] dark:text-white': showDropdown }"
    >
      <i class="material-icons">notifications</i>
      <!-- علامة العدد -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- قائمة الإشعارات -->
    <div
      v-if="showDropdown"
      class="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 class="font-bold text-gray-800 dark:text-white">الإشعارات</h3>
        <router-link
          :to="getNotificationsPath()"
          class="text-sm text-[#1B3C53] dark:text-blue-400 hover:underline"
        >
          عرض الكل
        </router-link>
      </div>

      <!-- قائمة الإشعارات -->
      <div class="max-h-96 overflow-y-auto">
        <template v-if="notifications.length > 0">
          <div
            v-for="notification in notifications.slice(0, 5)"
            :key="notification.id"
            class="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            :class="{ 'bg-blue-50 dark:bg-blue-900/20': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start gap-3">
              <span 
                class="material-icons text-2xl"
                :class="getNotificationIcon(notification.type).class"
              >
                {{ getNotificationIcon(notification.type).icon }}
              </span>
              <div class="flex-1">
                <h4 class="font-medium text-gray-800 dark:text-white text-sm">
                  {{ notification.title }}
                </h4>
                <p class="text-gray-600 dark:text-gray-300 text-xs mt-1">
                  {{ notification.message }}
                </p>
                <span class="text-gray-400 dark:text-gray-500 text-xs mt-2 block">
                  {{ formatDate(notification.timestamp) }}
                </span>
              </div>
            </div>
          </div>
        </template>
        <div
          v-else
          class="p-8 text-center text-gray-500 dark:text-gray-400"
        >
          <span class="material-icons text-4xl mb-2">notifications_off</span>
          <p>لا توجد إشعارات جديدة</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'NotificationsIcon',
  setup() {
    const router = useRouter()
    const showDropdown = ref(false)
    const notifications = ref([])
    
    // احتساب عدد الإشعارات غير المقروءة
    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.read).length
    })

    // تحديد مسار صفحة الإشعارات حسب نوع المستخدم
        // الحصول على مسار صفحة الإشعارات
    const getNotificationsPath = () => {
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}')
      switch (currentUser.role) {
        case 'admin':
          return '/admin/notifications'
        case 'employee':
          return '/employee/notifications'
        default:
          return '/notifications'
      }
    }

    // تحميل الإشعارات عند تحميل المكون
    onMounted(() => {
      loadNotifications()
      // الاستماع لأحداث الإشعارات الجديدة
      window.addEventListener('newNotification', loadNotifications)
    })

    // تحميل الإشعارات حسب نوع المستخدم
    const loadNotifications = () => {
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}')
      let storageKey = ''
      
      switch (currentUser.role) {
        case 'admin':
          storageKey = 'adminNotifications'
          break
        case 'employee':
          storageKey = 'employeeNotifications'
          break
        default:
          storageKey = 'userNotifications'
          break
      }
      
      notifications.value = JSON.parse(localStorage.getItem(storageKey) || '[]')
    }

    // التعامل مع النقر على الإشعار
    const handleNotificationClick = (notification) => {
      // تحديث حالة القراءة
      notification.read = true
      updateNotificationStorage()
      
      // التوجيه حسب نوع الإشعار
      navigateToNotification(notification)
      
      // إغلاق القائمة
      showDropdown.value = false
    }

    // تحديث تخزين الإشعارات
    const updateNotificationStorage = () => {
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}')
      const storageKey = currentUser.role === 'admin' ? 'adminNotifications' :
                        currentUser.role === 'employee' ? 'employeeNotifications' :
                        'userNotifications'
      
      localStorage.setItem(storageKey, JSON.stringify(notifications.value))
    }

    // التوجيه حسب نوع الإشعار
    const navigateToNotification = (notification) => {
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}')
      
      switch (notification.type) {
        case 'content_submitted':
          if (currentUser.role === 'admin') {
            router.push('/admin/stories/review/' + notification.data.id)
          }
          break
        case 'content_reviewed':
          if (currentUser.role === 'employee') {
            router.push('/employee/stories/edit/' + notification.data.id)
          }
          break
        case 'new_content':
          router.push('/story/' + notification.data.id)
          break
        case 'comment_reply':
        case 'comment_like':
          router.push('/story/' + notification.data.storyId + '#comment-' + notification.data.commentId)
          break
        case 'message':
          const path = getNotificationsPath()
          router.push(path + '/messages/' + notification.data.messageId)
          break
      }
    }

    // الحصول على أيقونة الإشعار وتصنيفها
    const getNotificationIcon = (type) => {
      const icons = {
        content_submitted: { icon: 'rate_review', class: 'text-purple-500' },
        content_reviewed: { icon: 'assignment_turned_in', class: 'text-green-500' },
        new_content: { icon: 'auto_stories', class: 'text-blue-500' },
        comment_reply: { icon: 'chat', class: 'text-orange-500' },
        comment_like: { icon: 'favorite', class: 'text-red-500' },
        message: { icon: 'mail', class: 'text-indigo-500' }
      }
      return icons[type] || { icon: 'notifications', class: 'text-gray-500' }
    }

    // تنسيق التاريخ
    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      // أقل من يوم
      if (diff < 86400000) {
        if (diff < 3600000) {
          const minutes = Math.floor(diff / 60000)
          return 'منذ ' + minutes + ' دقيقة'
        } else {
          const hours = Math.floor(diff / 3600000)
          return 'منذ ' + hours + ' ساعة'
        }
      }
      
      // أقل من أسبوع
      if (diff < 604800000) {
        const days = Math.floor(diff / 86400000)
        return 'منذ ' + days + ' يوم'
      }
      
      // التاريخ الكامل
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // إظهار/إخفاء قائمة الإشعارات
    const toggleNotifications = () => {
      showDropdown.value = !showDropdown.value
    }

    return {
      showDropdown,
      notifications,
      unreadCount,
      getNotificationsPath,
      handleNotificationClick,
      getNotificationIcon,
      formatDate,
      toggleNotifications
    }
  }
}
</script>`