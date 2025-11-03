<script setup>
import { ref, onMounted, computed, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

// 1. تعريف المتغيرات الحالة
const router = useRouter()
const userData = ref(null)
const isAuthenticated = ref(false)
const isLoading = ref(true)
const isEditing = ref(false) // حالة النموذج المنبثق للتعديل
const isSaving = ref(false) // حالة حفظ البيانات

// بيانات النموذج القابلة للتعديل
const editFormData = reactive({
  userId: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
})

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

// 2. دالة تسجيل الخروج
const logout = () => {
  Cookies.remove('authToken')
  localStorage.removeItem('userData')
  localStorage.removeItem('lastActivity')
  window.dispatchEvent(new Event('auth-change'));
  router.push('/login')
}

// 3. دالة جلب بيانات المستخدم مع Bearer Token والتحقق من الدور
const fetchUser = async () => {
  isLoading.value = true
  const authToken = Cookies.get('authToken')

  if (!authToken) {
    isAuthenticated.value = false
    isLoading.value = false
    router.push('/login')
    return
  }

  isAuthenticated.value = true

  try {
    const fullUrl = `${apiBaseUrl}/api/identity/users/me`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error('فشل المصادقة أو انتهاء صلاحية التوكن.')
        logout()
        return
      }
      throw new Error('فشل جلب بيانات المستخدم.')
    }

    const user = await response.json()

    const isAdmin = user.roles && user.roles.includes('Admin');

    if (!isAdmin) {
      console.warn('تم منع الوصول: المستخدم ليس مسؤولاً.')
      router.push('/')
    } else {
      userData.value = user
      localStorage.setItem('userData', JSON.stringify(user))

      // **تهيئة بيانات النموذج للتعديل**
      editFormData.userId = user.id;
      editFormData.firstName = user.firstName;
      editFormData.lastName = user.lastName;
      editFormData.phoneNumber = user.phoneNumber;
    }

  } catch (error) {
    console.error('خطأ في الاتصال بالخادم:', error)
  } finally {
    isLoading.value = false
  }
}

// 4. دالة تحديث الملف الشخصي (PATCH request)
const updateProfile = async () => {
  if (isSaving.value) return;

  isSaving.value = true;
  const authToken = Cookies.get('authToken');

  try {
    const fullUrl = `${apiBaseUrl}/api/identity/update`;

    const response = await fetch(fullUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: editFormData.userId,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phoneNumber: editFormData.phoneNumber,
      })
    });

    if (response.ok) {
      alert('تم تحديث البيانات بنجاح!');
      isEditing.value = false;
      await fetchUser(); // إعادة جلب البيانات المحدثة
    } else {
      const errorData = await response.json();
      alert(`فشل التعديل: ${errorData.message || 'حدث خطأ غير معروف'}`);
    }
  } catch (error) {
    console.error('خطأ أثناء التعديل:', error);
    alert('فشل الاتصال بالخادم أثناء محاولة التعديل.');
  } finally {
    isSaving.value = false;
  }
}

// 5. منطق فتح النموذج وتجهيز البيانات
const openEditModal = () => {
  if (userData.value) {
    editFormData.userId = userData.value.id;
    editFormData.firstName = userData.value.firstName;
    editFormData.lastName = userData.value.lastName;
    editFormData.phoneNumber = userData.value.phoneNumber;
  }
  isEditing.value = true;
}

// 6. منطق الإعدادات والمظهر (لم يتغير)
const getSystemSettings = () => {
  // ... (منطق جلب الإعدادات)
  try {
    return {
      general: JSON.parse(localStorage.getItem('generalConfig') || '{}'),
      security: JSON.parse(localStorage.getItem('securityConfig') || '{}'),
      appearance: JSON.parse(localStorage.getItem('appearanceConfig') || '{}'),
      content: JSON.parse(localStorage.getItem('contentConfig') || '{}'),
      registration: JSON.parse(localStorage.getItem('registrationConfig') || '{}')
    }
  } catch (error) {
    console.error('خطأ في تحميل الإعدادات:', error)
    return {}
  }
}

const applyAppearanceSettings = () => {
  const settings = getSystemSettings()
  const appearance = settings.appearance || {}

  if (appearance.fontFamily) {
    document.documentElement.style.setProperty('--font-family', appearance.fontFamily)
  }

  if (appearance.primaryColor) {
    document.documentElement.style.setProperty('--primary-color', appearance.primaryColor)
  }

  if (appearance.secondaryColor) {
    document.documentElement.style.setProperty('--secondary-color', appearance.secondaryColor)
  }

  if (appearance.baseFontSize) {
    document.documentElement.style.fontSize = appearance.baseFontSize
  }
}

const getFontFamilyClass = (fontFamily) => {
  const fontMap = {
    'Tahoma': 'font-tahoma',
    'Arial': 'font-arial',
    'Helvetica': 'font-helvetica',
    "'Segoe UI'": 'font-segoe',
    "'Traditional Arabic'": 'font-traditional'
  }
  return fontMap[fontFamily] || ''
}

// 7. Computed Properties
const systemSettings = computed(() => getSystemSettings())

const appearanceClasses = computed(() => {
  const appearance = systemSettings.value.appearance || {}
  const classes = {
    'bg-gray-50': !appearance.darkMode,
    'bg-gray-900': appearance.darkMode,
  }

  if (appearance.fontFamily) {
    const fontClass = getFontFamilyClass(appearance.fontFamily)
    if (fontClass) classes[fontClass] = true
  }

  return classes
})

const containerClasses = computed(() => {
  const appearance = systemSettings.value.appearance || {}
  return {
    'max-w-full': appearance.fullWidth,
    'max-w-7xl': !appearance.fullWidth
  }
})

// 8. منطق انتهاء الجلسة (لم يتغير)
const checkSession = () => {
  const security = systemSettings.value.security || {}
  const authToken = Cookies.get('authToken');

  if (!authToken) {
    clearInterval(sessionInterval);
    return;
  }

  const sessionTimeout = security.sessionTimeout || 60

  if (sessionTimeout > 0) {
    const lastActivity = localStorage.getItem('lastActivity')
    if (lastActivity) {
      const now = new Date().getTime()
      const diff = (now - parseInt(lastActivity)) / (1000 * 60)

      if (diff > sessionTimeout) {
        alert('انتهت الجلسة بسبب عدم النشاط')
        logout()
      }
    }
  }
}

const updateActivityTime = () => {
  localStorage.setItem('lastActivity', new Date().getTime().toString())
}

let sessionInterval;

// 9. دورة حياة المكون
onMounted(() => {
  fetchUser()
  applyAppearanceSettings()

  updateActivityTime()
  document.addEventListener('click', updateActivityTime)
  document.addEventListener('keypress', updateActivityTime)

  sessionInterval = setInterval(checkSession, 60000)
})

onUnmounted(() => {
  clearInterval(sessionInterval)
  document.removeEventListener('click', updateActivityTime)
  document.removeEventListener('keypress', updateActivityTime)
})
</script>

<template>
  <div dir="rtl" class="min-h-screen" :class="appearanceClasses">

    <div class="pt-6"></div>

    <div class="container mx-auto px-4 py-8" :class="containerClasses">

      <div v-if="!isLoading && userData && userData.roles && userData.roles.includes('Admin')">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-8 text-gray-800">لوحة تحكم المسؤول</h1>

          <div class="bg-gradient-to-br from-purple-200 to-pink-100 rounded-2xl shadow-xl border border-gray-200 p-8 ">
            <h2 class="text-2xl font-semibold mb-6 border-b pb-2 text-purple-600">
              <i class="fas fa-user-circle ml-2"></i> بيانات الملف الشخصي
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div class="flex items-center">
                <span class="font-medium text-gray-500 w-32">الاسم الأول:</span>
                <span class="text-gray-900 font-bold">{{ userData.firstName }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-gray-500 w-32">الاسم الأخير:</span>
                <span class="text-gray-900 font-bold">{{ userData.lastName }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-gray-500 w-32">البريد الإلكتروني:</span>
                <span class="text-gray-900">{{ userData.email }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-gray-500 w-32">رقم الهاتف:</span>
                <span class="text-gray-900">{{ userData.phoneNumber }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-gray-500 w-32">نوع المستخدم:</span>
                <span class="px-3 py-1 text-sm font-semibold rounded-full bg-pink-100 text-pink-800">{{
                  userData.userTypeName }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-gray-500 w-32">تاريخ التسجيل:</span>
                <span class="text-gray-900">{{ new Date(userData.createdAt).toLocaleDateString() }}</span>
              </div>
            </div>

            <div class="mt-8 text-center">
              <button @click="openEditModal"
                class="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-300 transform hover:scale-105">
                <i class="fas fa-edit ml-2"></i> تعديل البيانات
              </button>
            </div>
          </div>

          <router-view />

        </div>
      </div>

      <div v-else-if="isLoading" class="flex justify-center items-center h-96">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        <p class="mr-4 text-lg text-purple-600">جاري التحميل...</p>
      </div>

      <div v-else-if="!isAuthenticated" class="text-center py-20 bg-white rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold text-red-600 mb-4">وصول مرفوض (401)</h2>
        <p class="text-gray-600">الرجاء تسجيل الدخول للوصول إلى لوحة التحكم.</p>
        <router-link to="/login"
          class="mt-6 inline-block px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
          صفحة تسجيل الدخول
        </router-link>
      </div>

    </div>

    <transition name="modal">
      <div v-if="isEditing" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="isEditing = false">
        <div
          class="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto p-6 transform transition-all duration-300 scale-100">
          <h3 class="text-xl font-bold mb-4 border-b pb-2 text-gray-800">تعديل بيانات الملف الشخصي</h3>

          <form @submit.prevent="updateProfile">

            <div class="mb-4">
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">الاسم الأول:</label>
              <input type="text" id="firstName" v-model="editFormData.firstName" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
            </div>

            <div class="mb-4">
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">الاسم الأخير:</label>
              <input type="text" id="lastName" v-model="editFormData.lastName" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
            </div>

            <div class="mb-6">
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف:</label>
              <input type="text" id="phoneNumber" v-model="editFormData.phoneNumber" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
            </div>

            <div class="flex justify-end space-x-4 space-x-reverse">
              <button type="button" @click="isEditing = false"
                class="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition">
                إلغاء
              </button>
              <button type="submit" :disabled="isSaving"
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50">
                {{ isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
/* تطبيق إعدادات الخطوط ديناميكياً */
:deep(*) {
  font-family: inherit;
}

/* تحسين المظهر في الوضع الداكن */
:deep(.bg-gray-50) {
  background-color: #f9fafb;
}

:deep(.bg-gray-900) {
  background-color: #111827;
  color: #f9fafb;
}

:deep(.bg-gray-900 .text-white) {
  color: #f9fafb;
}

/* تعريف فئات الخطوط */
.font-tahoma {
  font-family: Tahoma, Arial, sans-serif;
}

.font-arial {
  font-family: Arial, sans-serif;
}

.font-helvetica {
  font-family: Helvetica, Arial, sans-serif;
}

.font-segoe {
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

.font-traditional {
  font-family: 'Traditional Arabic', 'Segoe UI', Tahoma, sans-serif;
}

/* تنسيق الانتقال (Modal Transition) */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* تأثير التكبير/التصغير للمحتوى داخل الـ Modal */
.modal-enter-active .scale-100,
.modal-leave-active .scale-100 {
  transition: all 0.3s ease;
}

.modal-enter-from .scale-100,
.modal-leave-to .scale-100 {
  transform: scale(0.9);
}
</style>