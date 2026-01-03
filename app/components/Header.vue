<template>
  <header
    class="bg-gradient-to-r from-gray-300 to-white shadow-2xl border-b border-purple-700 sticky top-0 z-50 transition-all duration-300 ">
    <div class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">

        <router-link to="/"
          class="flex items-center gap-3 hover:opacity-80 transition-all duration-300 transform hover:scale-105 group">
          <div
            class="w-32 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center md:bg-white shadow-lg overflow-hidden transition-transform duration-500">
            <img src="/logo.jpeg" alt="شعار النظام" class="w-full h-full object-cover ">
          </div>
          <div class="text-right">
            <h1 class="text-xl font-bold text-purple-600 custom-text-pulse" style="font-family: tajawal">
              الجمعية الأهلية الصالحية بعنيزة
            </h1>
          </div>
        </router-link>

        <div class="flex items-center gap-3">


          <div class="w-px h-8 bg-gradient-to-b from-purple-600 to-pink-600 mx-2">
          </div>

          <div v-if="isAuthenticated" class="relative ">
            <button @click="showMenu = !showMenu"
              class="bg-gradient-to-r from-purple-800 to-pink-800  flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-800 hover:to-pink-800 transition-all duration-300 transform hover:scale-105 group">
              <div
                class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                <img v-if="user?.profileImage" :src="user.profileImage" :alt="user?.name"
                  class="w-full h-full object-cover">
                <span v-else class="text-white text-base font-extrabold">
                  {{ user?.firstInitial || 'م' }}
                </span>
              </div>
              <div class="text-right hidden sm:block">
                <span
                  class="text-sm font-bold text-purple-300 block transform group-hover:translate-x-1 transition-transform">{{
                    user?.name || 'المستخدم' }}</span>
                <span
                  class="text-xs text-purple-400 capitalize bg-purple-800 px-2 py-1 rounded-full mt-1 inline-block">{{
                    getUserRoleText(user?.role) }}</span>
              </div>
              <span
                class="material-icons text-purple-400 text-xl transition-all duration-300 transform"
                :class="showMenu ? 'rotate-180 scale-110' : ''">
                expand_more
              </span>
            </button>

            <transition name="custom-slide-down">
              <div v-if="showMenu" @click.away="showMenu = false"
                class="absolute top-full left-0 mt-3 w-64 bg-gray-800 rounded-2xl shadow-2xl border border-purple-700 z-50 custom-fade-in-up">

                <div
                  class="p-4 border-b border-purple-700 bg-gradient-to-r from-purple-900 to-pink-900 rounded-t-2xl">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                      <img v-if="user?.profileImage" :src="user.profileImage" :alt="user?.name"
                        class="w-full h-full object-cover">
                      <span v-else class="text-white font-bold text-lg">
                        {{ user?.firstInitial || 'م' }}
                      </span>
                    </div>
                    <div class="flex-1 text-right">
                      <p class="text-sm font-bold text-white">{{ user?.name || 'المستخدم' }}</p>
                      <p class="text-xs text-purple-300 mt-1">{{ user?.email }}</p>
                      <p
                        class="text-xs text-purple-300 capitalize bg-purple-700 px-2 py-1 rounded-full mt-2 inline-block">
                        {{ getUserRoleText(user?.role) }}</p>
                    </div>
                  </div>
                </div>

                <div
                  class="p-3 bg-gradient-to-b from-gray-800 to-purple-900 rounded-b-2xl">
                  <template v-if="user?.role === 'admin'">

    <router-link to="/dashboard" class="custom-dropdown-item group" @click="showMenu = false">
        <div class="custom-dropdown-icon bg-gradient-to-r from-blue-500 to-cyan-500">
            <span class="material-icons">bar_chart</span> 
        </div>
        <span>التقارير والإحصائيات</span>
        <span
            class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
    </router-link>

    <router-link to="/admin/users" class="custom-dropdown-item group" @click="showMenu = false">
        <div class="custom-dropdown-icon bg-gradient-to-r from-purple-500 to-pink-500">
            <span class="material-icons">manage_accounts</span> 
        </div>
        <span>إدارة المستخدمين</span>
        <span
            class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
    </router-link>

    <router-link to="/admin/content-management" class="custom-dropdown-item group" @click="showMenu = false">
        <div class="custom-dropdown-icon bg-gradient-to-r from-green-500 to-teal-500">
            <span class="material-icons">library_books</span> 
        </div>
        <span>إدارة المحتوى</span>
        <span
            class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
    </router-link>

    <router-link to="/profile" class="custom-dropdown-item group" @click="showMenu = false">
        <div class="custom-dropdown-icon bg-gradient-to-r from-indigo-500 to-blue-500">
            <span class="material-icons">person</span> </div>
        <span>حسابي</span>
        <span
            class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
    </router-link>


    <router-link to="/admin/system-settings" class="custom-dropdown-item group" @click="showMenu = false">
        <div class="custom-dropdown-icon bg-gradient-to-r from-gray-600 to-gray-500">
            <span class="material-icons">settings</span> 
        </div>
        <span>إعدادات النظام</span>
        <span
            class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
    </router-link>

    <router-link to="/favorite" class="custom-dropdown-item group" @click="showMenu = false">
        <div class="custom-dropdown-icon bg-gradient-to-r from-red-500 to-pink-500">
            <span class="material-icons">favorite</span>
        </div>
        <span>القصص المفضلة</span>
        <span
            class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
    </router-link>
    <router-link to="/addCustomStory" class="custom-dropdown-item group" @click="showMenu = false">
        <div class="custom-dropdown-icon bg-gradient-to-r from-yellow-500 to-orange-500">
            <span class="material-icons">add_box</span>
        </div>
        <span>تخصيص قصة</span>
        <span
            class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
    </router-link>
</template>

                  <template v-else-if="user?.role === 'employee'">
                    <router-link to="/employee/stories" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-blue-500 to-cyan-500">
                        <span class="material-icons">library_books</span>
                      </div>
                      <span>إدارة المحتوى</span>
                      <span
                        class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>

                    <router-link to="/profile" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-purple-500 to-pink-500">
                        <span class="material-icons">person</span>
                      </div>

                      <span>حسابي</span>
                      <span
                        class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                  </template>

                  <template v-else>
                    <router-link to="/profile" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-blue-500 to-cyan-500">
                        <span class="material-icons">person</span>
                      </div>
                      <span>حسابي</span>
                      <span
                        class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                    <router-link to="/favorite" class="custom-dropdown-item group" @click="showMenu = false">
                      <div class="custom-dropdown-icon bg-gradient-to-r from-purple-500 to-pink-500">
                        <span class="material-icons">favorite</span>
                      </div>
                      <span>القصص المفضلة</span>
                      <span
                        class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                    </router-link>
                  </template>
                  <div class="custom-dropdown-divider"></div>

                  <button @click="handleLogout"
                    class="custom-dropdown-item group text-red-600 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-pink-900/20">
                    <div class="custom-dropdown-icon bg-gradient-to-r from-red-500 to-pink-500">
                      <span class="material-icons">logout</span>
                    </div>
                    <span>تسجيل الخروج</span>
                    <span
                      class="material-icons transform group-hover:translate-x-1 transition-transform">chevron_left</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <div v-else class="flex items-center gap-3">
            <router-link to="/login"
              class="flex items-center gap-2 px-5 py-3 border-2 border-purple-400 text-purple-600 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 transform hover:scale-105 font-bold text-sm shadow-lg hover:shadow-xl">
              <span class="material-icons text-lg">login</span>
              <span class="hidden sm:block">تسجيل الدخول</span>
            </router-link>

            <router-link to="/register"
              class="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold text-sm shadow-lg hover:shadow-xl custom-pulse-slow">
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
import Cookies from 'js-cookie'
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

    // **القيمة الافتراضية لكائن user لضمان عدم كونه null**
    const DEFAULT_USER_OBJECT = {
      fullName: 'مستخدم', // الاسم الكامل للعرض
      email: null,
      role: 'user',
      profileImage: null,
      firstInitial: 'م' // الحرف الأول للعرض في الدائرة
    }
    const user = ref(DEFAULT_USER_OBJECT) // التهيئة بالقيمة الافتراضية
    const isAuthenticated = ref(false)
    const systemLogo = ref(null)

    // تحديث حالة المستخدم (استخدام الكوكيز)
    // ... (داخل setup)

    // تحديث حالة المستخدم (استخدام الكوكيز)
    // ... (داخل setup)

    // تحديث حالة المستخدم (استخدام الكوكيز)
    const updateAuthState = () => {
      const token = Cookies.get('authToken')
      const userData = localStorage.getItem('userData')

      isAuthenticated.value = !!(token && userData)

      if (userData) {
        const parsedData = JSON.parse(userData);

        // 1. استخراج الدور وتحويله لأحرف صغيرة (lowercase) للتوافق
        // نستخدم حقل userTypeName أو roles أو نعود للقيمة الافتراضية 'user'
        const userRole = (
          parsedData.userTypeName ||
          (parsedData.roles && parsedData.roles[0]) ||
          'user'
        ).toLowerCase(); // ✅ نحوله إلى lowercase: 'Admin' -> 'admin'

        // 2. تجميع الاسم الكامل
        const fullName = `${parsedData.firstName || ''} ${parsedData.lastName || ''}`.trim() || 'مستخدم';

        // 3. الحصول على الحرف الأول
        const firstInitial = parsedData.firstName ? parsedData.firstName.charAt(0) : 'م';

        // 4. تعيين كائن المستخدم النهائي
        user.value = {
          ...DEFAULT_USER_OBJECT,
          ...parsedData, // نحافظ على جميع البيانات الأصلية

          // ✅ الحقول المصححة/المُنشأة
          role: userRole, // ✅ القيمة المصححة للتوافق مع شروط القالب
          name: fullName, // القالب يستخدم user?.name، لذا نستخدم الاسم الكامل
          firstInitial: firstInitial,
        }
      } else {
        user.value = DEFAULT_USER_OBJECT
      }
    }

    // ... بقية الكود (loadSystemLogo، setupStorageListener، إلخ)// ...    // تحميل شعار النظام من الإعدادات
    const loadSystemLogo = () => {
      const systemSettings = JSON.parse(localStorage.getItem('systemSettings') || '{}')
      systemLogo.value = systemSettings.logo || null
    }

    // الاستماع لتغييرات localStorage والكوكيز
    const setupStorageListener = () => {
      // ... (المنطق الخاص بـ storage و localStorage.setItem لم يتغير)
      const handleStorageChange = (e) => {
        if (e.key === 'userData' || e.key === 'systemSettings') {
          updateAuthState()
          if (e.key === 'systemSettings') {
            loadSystemLogo()
          }
        }
      }
      window.addEventListener('storage', handleStorageChange)

      const originalSetItem = localStorage.setItem
      localStorage.setItem = function (key, value) {
        originalSetItem.apply(this, arguments)
        if (key === 'userData' || key === 'systemSettings') {
          updateAuthState()
          if (key === 'systemSettings') {
            loadSystemLogo()
          }
        }
      }

      const handleAuthChange = () => {
        updateAuthState();
      };
      window.addEventListener('auth-change', handleAuthChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('auth-change', handleAuthChange);
      }
    }

    // إغلاق القوائم المنسدلة عند النقر خارجها
    const setupClickOutsideListener = () => {
      const handleClickOutside = (event) => {
        // إغلاق القائمة المنسدلة للمستخدم
        const profileButton = event.target.closest('.relative')
        if (showMenu.value && profileButton && profileButton.contains(event.target)) {
          // لا تفعل شيئاً إذا كان النقر داخل المنطقة النسبية (الزر أو القائمة)
          return;
        }
        if (showMenu.value && !profileButton) {
          showMenu.value = false;
        }
      }

      document.addEventListener('click', handleClickOutside)

      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }

    // الرسائل (الافتراضية)
    const messages = ref([
      { id: 1, sender: 'إدارة النظام', text: 'مرحباً بك في النظام الجديد! نتمنى لك تجربة ممتعة', time: 'منذ 2 ساعة', read: false, senderAvatar: null },
      { id: 2, sender: 'فريق الدعم', text: 'تم حل مشكلتك بنجاح، يمكنك متابعة استخدام النظام', time: 'منذ 5 ساعات', read: false, senderAvatar: null },
      { id: 3, sender: 'منصة الطفل', text: 'تم إضافة قصص جديدة قد تعجبك', time: 'منذ يوم', read: true, senderAvatar: null }
    ])

    const unreadMessages = computed(() => {
      return messages.value.filter(m => !m.read).length
    })

    // دالة تسجيل الخروج (حذف الكوكيز والتوجيه للمسار /)
    // داخل دالة handleLogout في كود AppHeader (في إجابتك السابقة)
    const handleLogout = () => {
      Cookies.remove('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('userType')
      showMenu.value = false

      // ✅ أضف هذا السطر هنا أيضاً إذا لم يكن موجوداً
      window.dispatchEvent(new Event('auth-change'));

      // تحديث فوري للحالة
      updateAuthState()

      // التوجيه للمسار /
      router.push('/')
    }
    // الحصول على نص دور المستخدم
    const getUserRoleText = (role) => {
      const roles = {
        'admin': 'أدمن',
        'employee': 'موظف',
        'parent': 'ولي أمر',
        'teacher': 'معلم',
        'student': 'طالب',
        'user': ''
      }
      return roles[role] || ''
    }

    // مراقبة تغيير المسار لإغلاق القوائم
    watch(() => router.currentRoute.value.fullPath, () => {
      showMenu.value = false
    })

    onMounted(() => {
      updateAuthState()
      loadSystemLogo()

      const cleanupStorage = setupStorageListener()
      const cleanupClickOutside = setupClickOutsideListener()

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

    const goToMessages = () => {
      const role = user.value?.role
      const path = role === 'admin' ? '/admin/messages' :
        role === 'employee' ? '/employee/messages' : '/messages'
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
      handleLogout,
      getUserRoleText,
      goToMessages
    }
  }
}
</script>

<style scoped>
/* (لم يتم تغيير تنسيقات CSS هنا، فقط للتأكد من أنها متضمنة) */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');


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
  color: white;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes custom-text-pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

@keyframes custom-bounce {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

@keyframes custom-fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes custom-pulse-slow {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

@keyframes custom-spin-slow {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes custom-ping-slow {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
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
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
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