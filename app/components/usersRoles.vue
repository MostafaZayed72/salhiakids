<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-right">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-extrabold text-gray-900 mb-10 border-b pb-4 flex items-center gap-3">
        <span class="material-icons text-purple-600 text-4xl">manage_accounts</span>
        إدارة المستخدمين
      </h1>

      <!-- Search and Filter Section -->
      <div class="bg-white p-6 rounded-2xl shadow-xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          v-model="searchPhrase"
          @input="debouncedFetchUsers"
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          class="flex-grow w-full md:w-auto p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-right"
          dir="rtl"
        />

        <select
          v-model="selectedUserType"
          @change="fetchUsers(1)"
          class="p-2 border border-gray-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="All">كل المستخدمين</option>
          <option value="1">Admin</option>
          <option value="2">Teacher</option>
          <option value="3">Student</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20 bg-white rounded-xl shadow-md">
        <div class="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-purple-600 font-medium text-lg">جاري تحميل بيانات المستخدمين...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
        <p class="font-bold">خطأ في جلب البيانات!</p>
        <p class="text-sm">{{ error }}</p>
      </div>

      <!-- Users Table -->
      <div v-else class="bg-white rounded-2xl shadow-xl overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع المستخدم</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدور الحالي</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة (تفعيل/تعطيل)</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users.items" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ user.firstName }} {{ user.lastName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getUserTypeClass(user.userTypeName)">
                  {{ user.userTypeName }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.roles.join(', ') }}
              </td>
              
              


<td class="px-6 py-4 whitespace-nowrap text-center text-sm">
  <button
   @click="toggleUserStatus(user)"
   :disabled="user.isStatusChanging"
   :class="[
    'relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    user.isActive ? 'bg-green-500' : 'bg-gray-300',
    user.isStatusChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
   ]"
   type="button"
   :aria-pressed="user.isActive"
  >
   <span
  :class="[
    'absolute  h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 top-0',
    user.isActive ? 'right-0' : 'left-0'
  ]"
></span>

  </button>
 </td>


              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="openRoleModal(user)"
                  class="text-indigo-600 hover:text-indigo-900 font-semibold transition-colors focus:outline-none"
                >
                  تعديل الدور
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.items.length === 0 && !loading" class="text-center py-10 text-gray-500">
          لا توجد نتائج مطابقة لمعايير البحث.
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="users.totalPages > 1" class="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-xl">
        <p class="text-sm text-gray-700">
          عرض
          <span class="font-medium">{{ (pageNumber - 1) * pageSize + 1 }}</span>
          إلى
          <span class="font-medium">{{ Math.min(pageNumber * pageSize, users.totalItemsCount) }}</span>
          من
          <span class="font-medium">{{ users.totalItemsCount }}</span>
          نتيجة
        </p>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            @click="fetchUsers(pageNumber - 1)"
            :disabled="pageNumber === 1"
            :class="{ 'opacity-50 cursor-not-allowed': pageNumber === 1 }"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span class="material-icons text-lg">chevron_right</span>
          </button>

          <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-purple-600 text-sm font-medium text-white">
            {{ pageNumber }}
          </span>

          <button
            @click="fetchUsers(pageNumber + 1)"
            :disabled="pageNumber >= users.totalPages"
            :class="{ 'opacity-50 cursor-not-allowed': pageNumber >= users.totalPages }"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span class="material-icons text-lg">chevron_left</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Role Change Modal -->
    <div v-if="isRoleModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4 text-right">
        <h3 class="text-xl font-bold text-gray-900 mb-6">
          تعديل دور المستخدم: {{ currentEditingUser.firstName }}
        </h3>

        <div v-if="roleChangeError" class="bg-red-100 border-r-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
          {{ roleChangeError }}
        </div>

        <div class="mb-4">
          <label for="newRole" class="block text-sm font-medium text-gray-700 mb-2">الدور الجديد</label>
          <select
            id="newRole"
            v-model="newRoleValue"
            class="p-2 border border-gray-300 rounded-lg w-full focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="1">Admin</option>
            <option value="2">Teacher</option>
            <option value="3">Student</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="closeRoleModal"
            type="button"
            class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            @click="changeUserRole"
            type="button"
            :disabled="isRoleChanging"
            class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isRoleChanging" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري التعديل...
            </span>
            <span v-else>حفظ التعديل</span>
          </button>
        </div>
      </div>
    </div>
    <!-- في نهاية <template> -->
<NotificationModal 
  :is-open="notification.isOpen.value"
  :notification="notification.notification.value"
  @close="notification.close"
/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
const notification = useNotification()
// -------------------
// الثوابت ونقاط النهاية
// -------------------
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const USERS_ENDPOINT = `${API_BASE}/api/identity/users`
const ROLE_CHANGE_ENDPOINT = `${API_BASE}/api/identity/userRole/change`
const USER_STATUS_ENDPOINT = `${API_BASE}/api/identity/users`

// -------------------
// حالة البيانات والتحكم
// -------------------
const loading = ref(true)
const error = ref(null)
const users = ref({ items: [], totalPages: 0, totalItemsCount: 0 })

// حالة الفلترة والبحث والصفحات
const searchPhrase = ref('')
const selectedUserType = ref('All')
const pageNumber = ref(1)
const pageSize = ref(10)

// حالة الموديل لتعديل الدور
const isRoleModalOpen = ref(false)
const currentEditingUser = ref({})
const newRoleValue = ref(1)
const isRoleChanging = ref(false)
const roleChangeError = ref(null)

// -------------------
// الدوال المساعدة
// -------------------

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const getToken = () => {
  return getCookie('authToken')
}

const getUserTypeClass = (userTypeName) => {
  switch (userTypeName) {
    case 'Admin':
      return 'inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800'
    case 'Teacher':
      return 'inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800'
    case 'Student':
      return 'inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800'
    default:
      return 'inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800'
  }
}

const getUserTypeNameByValue = (value) => {
  switch (value) {
    case '1':
      return 'Admin'
    case '2':
      return 'Teacher'
    case '3':
      return 'Student'
    default:
      return null
  }
}

/**
 * دالة جلب بيانات المستخدمين
 * @param {number} page - رقم الصفحة المراد جلبها (يبدأ من 1)
 */
const fetchUsers = async (page = 1) => {
  loading.value = true
  error.value = null
  pageNumber.value = page

  const token = getToken()
  if (!token) {
    error.value = 'التوكن غير موجود. يرجى تسجيل الدخول.'
    loading.value = false
    return
  }

  let requestBody = {
    searchPhrase: searchPhrase.value || null,
    pageNumber: page,
    pageSize: pageSize.value
  }

  if (selectedUserType.value !== 'All') {
    const userType = parseInt(selectedUserType.value)
    const userTypeName = getUserTypeNameByValue(selectedUserType.value)
    requestBody.userType = userType
    requestBody.userTypeName = userTypeName
  }

  try {
    const response = await axios.post(USERS_ENDPOINT, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.data) {
      const itemsWithStatus = (response.data.items || []).map((user) => ({
        ...user,
        isStatusChanging: false
      }))

      users.value = {
        items: itemsWithStatus,
        totalPages: parseInt(response.data.totalPages || 0),
        totalItemsCount: parseInt(response.data.totalItemsCount || 0)
      }
    } else {
      throw new Error('تنسيق بيانات المستخدمين غير صحيح.')
    }
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      error.value = 'غير مصرح لك بالوصول. يرجى التأكد من صلاحيات المدير.'
    } else {
      error.value = err.message || 'فشل في الاتصال بالخادم.'
    }
    console.error('Users Fetch Error:', err)
  } finally {
    loading.value = false
  }
}

// دالة لتأخير استدعاء جلب البيانات أثناء الكتابة في حقل البحث
let timeoutId = null
const debouncedFetchUsers = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    fetchUsers(1)
  }, 500)
}

// -------------------
// دوال تعديل الدور (Modal)
// -------------------

const openRoleModal = (user) => {
  currentEditingUser.value = user
  newRoleValue.value = String(user.userType || 1)
  roleChangeError.value = null
  isRoleModalOpen.value = true
}

const closeRoleModal = () => {
  isRoleModalOpen.value = false
  currentEditingUser.value = {}
  newRoleValue.value = 1
}

const changeUserRole = async () => {
  isRoleChanging.value = true
  roleChangeError.value = null

  const token = getToken()

  const requestBody = {
    email: currentEditingUser.value.email,
    newRole: parseInt(newRoleValue.value)
  }

  try {
    await axios.put(ROLE_CHANGE_ENDPOINT, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    closeRoleModal()
    await fetchUsers(pageNumber.value)
  } catch (err) {
    console.error('Role Change Failed:', err)
    roleChangeError.value = 'فشل تعديل الدور: ' + (err.response?.data?.message || 'خطأ غير معروف.')
  } finally {
    isRoleChanging.value = false
  }
}

// -------------------
// دالة التحكم بحالة التفعيل/التعطيل
// -------------------
const toggleUserStatus = async (user) => {
  if (user.isStatusChanging) return

  const userIndex = users.value.items.findIndex((item) => item.id === user.id)
  if (userIndex === -1) return

  users.value.items[userIndex].isStatusChanging = true

  const token = getToken()
  const userId = user.id
  const action = user.isActive ? 'disable' : 'enable'

  const endpoint = `${USER_STATUS_ENDPOINT}/${userId}/${action}`

  try {
    await axios.put(endpoint, null, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    users.value.items[userIndex].isActive = !user.isActive
    notification.show({
      title: 'نجاح',
      message: `تم ${action === 'enable' ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح.`,
      type: 'success',
      autoClose: true
    })
  } catch (err) {
    console.error(`Failed to ${action} user:`, err)
    notification.show({
      title: 'خطأ',
      message: `فشل في ${action === 'enable' ? 'تفعيل' : 'تعطيل'} المستخدم.`,
      type: 'error',
      autoClose: true
    })
  } finally {
    users.value.items[userIndex].isStatusChanging = false
  }
}
// -------------------
// التنفيذ عند تحميل المكون
// -------------------
onMounted(() => {
  fetchUsers(1)
})
</script>