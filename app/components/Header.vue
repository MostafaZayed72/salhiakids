<template>
  <header class="bg-gradient-to-r from-white to-purple-50 dark:from-gray-900 dark:to-purple-900 shadow-2xl border-b border-purple-200 dark:border-purple-700 sticky top-0 z-50 transition-all duration-300 font-tajawal">
    <div class="container mx-auto px-6 py-4">
      <!-- Main Header -->
      <div class="flex items-center justify-between">
        
        <!-- Logo Section -->
        <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-all duration-300 transform hover:scale-105 group">
          <!-- شعار النظام - يمكن تغييره من إعدادات النظام -->
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center md:bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg overflow-hidden custom-rotate group-hover:rotate-12 transition-transform duration-500">
            <img 
              v-if="systemLogo" 
              :src="systemLogo" 
              alt="شعار النظام"
              class="w-full h-full object-cover"
            >
            <span v-else class="material-icons text-white text-2xl">auto_stories</span>
          </div>
          <div class="text-right">
            <h1 class="text-xl font-bold text-purple-700 dark:text-white custom-text-pulse">
              الجمعية الأهلية الصالحية بعنيزة
            </h1>
            <p class="text-xs text-purple-500 dark:text-purple-300 mt-1 transform group-hover:translate-x-1 transition-transform duration-300">مكتبة الطفل الرقمية</p>
          </div>
        </router-link>
        
        <!-- Controls Section -->
        <div class="flex items-center gap-3">
          
          <!-- Inbox Button -->
          <div v-if="isAuthenticated" class="relative group">
            <router-link 
              :to="user?.role === 'admin' ? '/admin/messages' : 
                    user?.role === 'employee' ? '/employee/messages' : '/messages'"
              class="relative p-3 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-800 transition-all duration-300 transform hover:scale-110 custom-bounce"
            >
              <span class="material-icons text-purple-600 dark:text-purple-400 text-xl">mail</span>
              <span v-if="unreadMessages > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full border-2 border-white dark:border-gray-900 text-xs text-white flex items-center justify-center shadow-lg animate-ping-slow">
                {{ unreadMessages }}
              </span>
            </router-link>
            
            <!-- Inbox Preview -->
            <div class="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 custom-fade-in-up">
              <div class="p-4 border-b border-purple-100 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900">
                <h3 class="font-bold text-purple-700 dark:text-white">الرسائل</h3>
                <span class="text-xs text-purple-500 dark:text-purple-300">{{ unreadMessages }} رسالة جديدة</span>
              </div>
              <div class="max-h-60 overflow-y-auto">
                <div v-for="message in messages" :key="message.id" 
                  @click="goToMessages"
                  class="p-4 border-b border-purple-50 dark:border-purple-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-800 dark:hover:to-pink-800 transition-all duration-300 cursor-pointer transform hover:translate-x-2"
                  :class="{ 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30': !message.read }"
                >
                  <div class="flex items-start gap-3">
                    <!-- صورة المرسل -->
                    <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 shadow-md">
                      <img 
                        v-if="message.senderAvatar" 
                        :src="message.senderAvatar" 
                        :alt="message.sender"
                        class="w-full h-full object-cover"
                      >
                      <span v-else class="material-icons text-white text-sm">person</span>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-purple-700 dark:text-purple-300">{{ message.sender }}</p>
                      <p class="text-sm text-purple-600 dark:text-purple-400 mt-1 line-clamp-1">{{ message.text }}</p>
                      <p class="text-xs text-purple-500 dark:text-purple-300 mt-1">{{ message.time }}</p>
                    </div>
                  </div>
                </div>
                <div v-if="messages.length === 0" class="p-6 text-center text-purple-500 dark:text-purple-400">
                  <span class="material-icons text-4xl mb-2 opacity-50">mail_outline</span>
                  <p>لا توجد رسائل</p>
                </div>
              </div>
              <div class="p-3 border-t border-purple-200 dark:border-purple-700">
                <router-link 
                  :to="user?.role === 'admin' ? '/admin/messages' : 
                        user?.role === 'employee' ? '/employee/messages' : '/messages'"
                  class="w-full text-center text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-2 px-4 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 block shadow-md"
                >
                  عرض جميع الرسائل
                </router-link>
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <NotificationsIcon v-if="isAuthenticated" />

          <!-- Dark Mode Toggle -->
          <!-- <button
            @click="toggleDarkMode"
            class="p-3 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-800 transition-all duration-300 transform hover:scale-110 hover:rotate-12"
            :title="isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'"
          >
            <span v-if="isDarkMode" class="material-icons text-yellow-400 text-xl custom-spin-slow">light_mode</span>
            <span v-else class="material-icons text-purple-600 text-xl custom-spin-slow">dark_mode</span>
          </button> -->

          <div class="w-px h-8 bg-gradient-to-b from-purple-300 to-pink-300 dark:from-purple-600 dark:to-pink-600 mx-2"></div>
          
          <!-- User Menu -->
          <div v-if="isAuthenticated" class="relative">
            <button 
              @click="showMenu = !showMenu"
              class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-800 dark:hover:to-pink-800 transition-all duration-300 transform hover:scale-105 group"
            >
              <!-- صورة المستخدم الشخصية -->
              <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                <img 
                  v-if="user?.profileImage" 
                  :src="user.profileImage" 
                  :alt="user?.name"
                  class="w-full h-full object-cover"
                >
                <span v-else class="text-white text-sm font-bold">
                  {{ user?.name?.charAt(0) || 'م' }}
                </span>
              </div>
              <div class="text-right hidden sm:block">
                <span class="text-sm font-bold text-purple-700 dark:text-purple-300 block transform group-hover:translate-x-1 transition-transform">{{ user?.name || 'المستخدم' }}</span>
                <span class="text-xs text-purple-500 dark:text-purple-400 capitalize bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded-full mt-1 inline-block">{{ getUserRoleText(user?.role) }}</span>
              </div>
              <span class="material-icons text-purple-600 dark:text-purple-400 text-xl transition-all duration-300 transform" :class="showMenu ? 'rotate-180 scale-110' : ''">
                expand_more
              </span>
            </button>
            
            <!-- User Dropdown -->
            <transition name="custom-slide-down">
              <div v-if="showMenu" class="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-700 z-50 custom-fade-in-up">
                
                <!-- User Info -->
                <div class="p-4 border-b border-purple-100 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-t-2xl">
                  <div class="flex items-center gap-3">
                    <!-- صورة المستخدم في القائمة المنسدلة -->
                    <div class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                      <img 
                        v-if="user?.profileImage" 
                        :src="user.profileImage" 
                        :alt="user?.name"
                        class="w-full h-full object-cover"
                      >
                      <span v-else class="text-white font-bold text-lg">
                        {{ user?.name?.charAt(0) || 'م' }}
                      </span>
                    </div>
                    <div class="flex-1 text-right">
                      <p class="text-sm font-bold text-purple-700 dark:text-white">{{ user?.name || 'المستخدم' }}</p>
                      <p class="text-xs text-purple-500 dark:text-purple-300 mt-1">{{ user?.email }}</p>
                      <p class="text-xs text-purple-500 dark:text-purple-300 capitalize bg-white dark:bg-purple-700 px-2 py-1 rounded-full mt-2 inline-block">{{ getUserRoleText(user?.role) }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="p-3 bg-gradient-to-b from-white to-purple-50 dark:from-gray-800 dark:to-purple-900 rounded-b-2xl">
                  <!-- Admin Menu - تبويبات داخل القائمة المنسدلة -->
                  <template v-if="user?.role === 'admin'">
                    <router-link to="/admin" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-purple-500 to-pink-500">
                        <span class="material-icons">dashboard</span>
                      </div>
                      <span>لوحة التحكم</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/admin/stories" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-blue-500 to-cyan-500">
                        <span class="material-icons">library_books</span>
                      </div>
                      <span>إدارة المحتوى</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/admin/users" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-green-500 to-emerald-500">
                        <span class="material-icons">people</span>
                      </div>
                      <span>المستفيدين</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/admin/analytics" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-orange-500 to-red-500">
                        <span class="material-icons">analytics</span>
                      </div>
                      <span>التقارير والإحصائيات</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/admin/messages" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-indigo-500 to-purple-500">
                        <span class="material-icons">mail</span>
                      </div>
                      <span>الرسائل</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/admin/settings" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-gray-500 to-gray-700">
                        <span class="material-icons">settings</span>
                      </div>
                      <span>إعدادات النظام</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                  </template>
                  
                  <!-- Employee Menu - تبويبات داخل القائمة المنسدلة -->
                  <template v-else-if="user?.role === 'employee'">
                    <router-link to="/employee/stories" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-blue-500 to-cyan-500">
                        <span class="material-icons">library_books</span>
                      </div>
                      <span>إدارة المحتوى</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/employee/users/new" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-green-500 to-emerald-500">
                        <span class="material-icons">person_add</span>
                      </div>
                      <span>إضافة مستفيد</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/employee/messages" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-indigo-500 to-purple-500">
                        <span class="material-icons">mail</span>
                      </div>
                      <span>الرسائل</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/employee/profile" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-purple-500 to-pink-500">
                        <span class="material-icons">person</span>
                      </div>
                      <span>الملف الشخصي</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                  </template>
                  
                  <!-- User Menu - تبويبات داخل القائمة المنسدلة -->
                  <template v-else>
                    <router-link to="/dashboard" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-purple-500 to-pink-500">
                        <span class="material-icons">dashboard</span>
                      </div>
                      <span>لوحة النشاط</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/messages" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-indigo-500 to-purple-500">
                        <span class="material-icons">mail</span>
                      </div>
                      <span>الرسائل</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/user/profile" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-blue-500 to-cyan-500">
                        <span class="material-icons">person</span>
                      </div>
                      <span>الملف الشخصي</span>
                      <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                  </template>
                  
                  <div class="custom-dropdown-divider"></div>
                  
                  <button @click="handleLogout" class="custom-dropdown-item group text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20">
                    <div class="custom-dropdown-icon bg-gradient-to-r from-red-500 to-pink-500">
                      <span class="material-icons">logout</span>
                    </div>
                    <span>تسجيل الخروج</span>
                    <span class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
          
          <!-- Auth Buttons -->
          <div v-else class="flex items-center gap-3">
            <router-link
              to="/login"
              class="flex items-center gap-2 px-5 py-3 border-2 border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-300 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 transform hover:scale-105 font-bold text-sm shadow-lg hover:shadow-xl"
            >
              <span class="material-icons text-lg">login</span>
              <span class="hidden sm:block">تسجيل الدخول</span>
            </router-link>
            
            <router-link
              to="/register"
              class="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold text-sm shadow-lg hover:shadow-xl custom-pulse-slow"
            >
              <span class="material-icons text-lg">person_add</span>
              <span class="hidden sm:block">إنشاء حساب</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NotificationsIcon from './NotificationsIcon.vue'

export default {
  components: {
    NotificationsIcon
  },
  name: 'AppHeader',
  setup() {
    const router = useRouter()
    const showMenu = ref(false)
    const isDarkMode = ref(false)
    
    // تفاعلية بيانات المستخدم
    const user = ref(null)
    const isAuthenticated = ref(false)
    const systemLogo = ref(null) // رابط صورة شعار النظام

    // تحديث حالة المستخدم
    const updateAuthState = () => {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      
      isAuthenticated.value = !!(token && userData)
      user.value = userData ? JSON.parse(userData) : null
      
      // التوجيه التلقائي بعد تسجيل الدخول
      if (isAuthenticated.value && user.value) {
        handleAutoRedirect(user.value.role)
      }
    }

    // تحميل شعار النظام من الإعدادات
    const loadSystemLogo = () => {
      const systemSettings = JSON.parse(localStorage.getItem('systemSettings') || '{}')
      systemLogo.value = systemSettings.logo || null
    }

    // التوجيه التلقائي بناءً على نوع المستخدم
    const handleAutoRedirect = (userRole) => {
      const currentPath = router.currentRoute.value.path
      
      // إذا كان المستخدم في الصفحة الرئيسية أو صفحات التسجيل، قم بالتوجيه
      if (currentPath === '/' || currentPath === '/login' || currentPath === '/register') {
        switch(userRole) {
          case 'admin':
            router.push('/admin')
            break
          case 'employee':
            router.push('/employee/stories')
            break
          case 'user':
          case 'parent':
          case 'teacher':
          case 'student':
            router.push('/dashboard')
            break
        }
      }
    }

    // الاستماع لتغييرات localStorage
    const setupStorageListener = () => {
      const handleStorageChange = (e) => {
        if (e.key === 'authToken' || e.key === 'userData' || e.key === 'systemSettings') {
          updateAuthState()
          if (e.key === 'systemSettings') {
            loadSystemLogo()
          }
        }
      }

      window.addEventListener('storage', handleStorageChange)
      
      // أيضًا نستمع للتغييرات في نفس النافذة
      const originalSetItem = localStorage.setItem
      localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments)
        if (key === 'authToken' || key === 'userData' || key === 'systemSettings') {
          updateAuthState()
          if (key === 'systemSettings') {
            loadSystemLogo()
          }
        }
      }

      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    }

    // إغلاق القوائم المنسدلة عند النقر خارجها
    const setupClickOutsideListener = () => {
      const handleClickOutside = (event) => {
        // إغلاق القائمة المنسدلة للمستخدم
        if (showMenu.value && !event.target.closest('.relative')) {
          showMenu.value = false
        }
        
        // إغلاق القوائم المنسدلة الأخرى (سيتم التعامل معها في مكوناتها الخاصة)
      }

      document.addEventListener('click', handleClickOutside)
      
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }

    // الرسائل
    const messages = ref([
      { 
        id: 1, 
        sender: 'إدارة النظام', 
        text: 'مرحباً بك في النظام الجديد! نتمنى لك تجربة ممتعة',
        time: 'منذ 2 ساعة',
        read: false,
        senderAvatar: null
      },
      { 
        id: 2, 
        sender: 'فريق الدعم', 
        text: 'تم حل مشكلتك بنجاح، يمكنك متابعة استخدام النظام',
        time: 'منذ 5 ساعات',
        read: false,
        senderAvatar: null
      },
      { 
        id: 3, 
        sender: 'مكتبة الطفل', 
        text: 'تم إضافة قصص جديدة قد تعجبك',
        time: 'منذ يوم',
        read: true,
        senderAvatar: null
      }
    ])

    // تم نقل وظائف الإشعارات إلى مكون NotificationsIcon

    // حساب الرسائل غير المقروءة
    const unreadMessages = computed(() => {
      return messages.value.filter(m => !m.read).length
    })

    // دوال التحكم
    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
    
    const handleLogout = () => {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('userType')
      showMenu.value = false
      
      // تحديث فوري للحالة
      updateAuthState()
      
      router.push('/')
    }

    // الحصول على نص دور المستخدم
    const getUserRoleText = (role) => {
      const roles = {
        'admin': 'مدير النظام',
        'employee': 'موظف',
        'parent': 'ولي أمر',
        'teacher': 'معلم',
        'student': 'طالب',
        'user': 'مستفيد'
      }
      return roles[role] || 'مستخدم'
    }
    
    // مراقبة تغيير المسار لإغلاق القوائم
    watch(() => router.currentRoute.value.fullPath, () => { 
      showMenu.value = false 
    })
    
    onMounted(() => {
      // تحميل الحالة الأولية
      updateAuthState()
      loadSystemLogo()
      
      // إعداد مستمع التخزين
      const cleanupStorage = setupStorageListener()
      
      // إعداد مستمع النقر خارج القوائم
      const cleanupClickOutside = setupClickOutsideListener()
      
      // تحميل الوضع الليلي
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDarkMode.value = true
        document.documentElement.classList.add('dark')
      }

      return () => {
        cleanupStorage()
        cleanupClickOutside()
      }
    })
    
    // توجيه المستخدم لصفحة الرسائل المناسبة
    const goToMessages = () => {
      const path = user.value?.role === 'admin' ? '/admin/messages' : 
                  user.value?.role === 'employee' ? '/employee/messages' : '/messages'
      router.push(path)
      showMenu.value = false
    }

    return {
      isDarkMode, 
      isAuthenticated, 
      user, 
      showMenu,
      systemLogo,
      messages,

      unreadMessages,
      toggleDarkMode, 
      handleLogout,
      getUserRoleText,
      goToMessages
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.font-tajawal {
  font-family: 'Tajawal', sans-serif;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  font-weight: 600;
  cursor: pointer;
  text-align: right;
  color: #6b7280;
  text-decoration: none;
  margin-bottom: 0.25rem;
}

.custom-dropdown-item:hover {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #7c3aed;
  transform: translateX(-5px);
}

.dark .custom-dropdown-item {
  color: #d1d5db;
}

.dark .custom-dropdown-item:hover {
  background: linear-gradient(135deg, #4b5563, #374151);
  color: #c4b5fd;
}

.custom-dropdown-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.custom-dropdown-icon .material-icons {
  color: white;
  font-size: 1rem;
}

.custom-dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
  margin: 0.75rem 0;
}

.dark .custom-dropdown-divider {
  background: linear-gradient(90deg, transparent, #4b5563, transparent);
}

.custom-slide-down-enter-active,
.custom-slide-down-leave-active {
  transition: all 0.3s ease;
}

.custom-slide-down-enter-from,
.custom-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* حركات مخصصة */
@keyframes custom-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes custom-text-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes custom-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes custom-fade-in-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes custom-pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes custom-spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes custom-ping-slow {
  0% { transform: scale(1); opacity: 1; }
  75%, 100% { transform: scale(2); opacity: 0; }
}

.custom-rotate {
  animation: custom-rotate 20s linear infinite;
}

.custom-text-pulse {
  animation: custom-text-pulse 3s ease-in-out infinite;
}

.custom-bounce {
  animation: custom-bounce 2s ease-in-out infinite;
}

.custom-fade-in-up {
  animation: custom-fade-in-up 0.5s ease-out;
}

.custom-pulse-slow {
  animation: custom-pulse-slow 2s ease-in-out infinite;
}

.custom-spin-slow {
  animation: custom-spin-slow 3s linear infinite;
}

.animate-ping-slow {
  animation: custom-ping-slow 1.5s ease-in-out infinite;
}

/* تحسينات للظلال والزوايا */
.rounded-2xl {
  border-radius: 1rem;
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

/* تحسينات التدرج اللوني */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* تحسينات للاستجابة */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .text-xl {
    font-size: 1.125rem;
  }
  
  .px-5 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .py-3 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}
</style>