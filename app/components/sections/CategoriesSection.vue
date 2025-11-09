<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const emit = defineEmits(['searchByCategory'])

// State
const categories = ref([])
const isAdmin = ref(false)
const isLoading = ref(true)
const showAddModal = ref(false)
const showEditModal = ref(false)
const isUploading = ref(false)

// Form data
const newCategory = ref({ title: '', description: '', imageUrl: '' })
const editingCategory = ref(null)

// Helpers
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : ''
}
const getToken = () => getCookie('authToken') || getCookie('token') || ''

// API Calls
const fetchCategories = async () => {
  try {
    isLoading.value = true
    const response = await axios.post(`${API_BASE}/api/StoryCategories/GetAllMatching`, {
      searchPhrase: '',
      orderBy: 'title',
      descending: false,
      pageNumber: 1,
      pageSize: 100
    })
    // keep backend properties; use imageUrl for visuals
    categories.value = Array.isArray(response.data?.items) ? response.data.items : []
  } catch (err) {
    console.error('Error fetching categories:', err)
    categories.value = []
  } finally {
    isLoading.value = false
  }
}

const uploadImage = async (file) => {
  if (!file) return ''
  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axios.post(`${API_BASE}/api/Upload/UploadImage`, formData, {
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : undefined }
    })
    return response.data?.url || ''
  } catch (err) {
    console.error('Upload failed:', err)
    return ''
  } finally {
    isUploading.value = false
  }
}

const addCategory = async () => {
  try {
    await axios.post(`${API_BASE}/api/StoryCategories/Add`, {
      title: newCategory.value.title,
      description: newCategory.value.description,
      imageUrl: newCategory.value.imageUrl || ''
    }, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    })
    showAddModal.value = false
    newCategory.value = { title: '', description: '', imageUrl: '' }
    await fetchCategories()
  } catch (err) {
    console.error('Add category failed:', err)
    alert('فشلت عملية الإضافة')
  }
}

const updateCategory = async () => {
  if (!editingCategory.value) return
  try {
    await axios.put(`${API_BASE}/api/StoryCategories/Update`, {
      id: editingCategory.value.id,
      title: editingCategory.value.title,
      description: editingCategory.value.description,
      imageUrl: editingCategory.value.imageUrl || ''
    }, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    })
    showEditModal.value = false
    editingCategory.value = null
    await fetchCategories()
  } catch (err) {
    console.error('Update category failed:', err)
    alert('فشل تحديث الفئة')
  }
}

const deleteCategory = async (id) => {
  if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return
  try {
    await axios.delete(`${API_BASE}/api/StoryCategories/Delete/${id}`, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    })
    await fetchCategories()
  } catch (err) {
    console.error('Delete category failed:', err)
    alert('فشل حذف الفئة')
  }
}

const checkAdminStatus = async () => {
  try {
    if (!API_BASE) { isAdmin.value = false; return }
    const response = await axios.get(`${API_BASE}/api/identity/users/me`, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    })
    const data = response.data || {}
    isAdmin.value = Array.isArray(data.roles) ? data.roles.includes('Admin') : (data.userTypeName === 'Admin' || data.userTypeValue === 1)
  } catch (err) {
    console.warn('Admin check failed:', err)
    isAdmin.value = false
  }
}

const handleImageSelected = async (event, target) => {
  const file = event.target.files?.[0]
  if (!file) return
  const url = await uploadImage(file)
  if (!url) {
    alert('فشل رفع الصورة')
    return
  }
  if (target === 'new') {
    newCategory.value.imageUrl = url
  } else {
    if (!editingCategory.value) editingCategory.value = {}
    editingCategory.value.imageUrl = url
  }
}

const openEdit = (cat) => {
  editingCategory.value = { ...cat }
  showEditModal.value = true
}

onMounted(async () => {
  await checkAdminStatus()
  await fetchCategories()
})
</script>

<template>
  <section class="py-20 ">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-600 mb-3">
          اكتشف حسب <span class="text-purple-600">الموضوع</span>
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          اختر من مجموعتنا الواسعة من الموضوعات الممتعة والمفيدة.
        </p>

        <button
          v-if="isAdmin"
          @click="showAddModal = true"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-lg transition"
        >
          <span class="material-icons">add</span>
          إضافة فئة جديدة
        </button>
      </div>

      <div v-if="isLoading" class="text-center text-white">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto"></div>
        <p class="mt-4">جاري تحميل الفئات...</p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <div
          v-for="category in categories"
          :key="category.id"
          class="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-purple-700 hover:from-indigo-800 hover:to-purple-800 transition-all duration-400 transform hover:-translate-y-2 shadow-lg border border-gray-700 text-center cursor-pointer"
          @click="navigateTo(`/categories/${category.id}`)"
        >
          <div v-if="isAdmin" class="absolute top-3 right-3 flex gap-2 z-10">
            <button @click.stop="openEdit(category)" class="p-2 bg-white/10 hover:bg-white/20 rounded-md text-white">
              <span class="material-icons text-sm">edit</span>
            </button>
            <button @click.stop="deleteCategory(category.id)" class="p-2 bg-white/10 hover:bg-white/20 rounded-md text-red-500">
              <span class="material-icons text-sm">delete</span>
            </button>
          </div>

          <div class="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-inner">
            <img v-if="category.imageUrl" :src="category.imageUrl" alt="" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center text-white text-3xl font-semibold">
              {{ (category.title || '').charAt(0) || '؟' }}
            </div>
          </div>

          <h3 class="text-xl font-semibold text-white mb-1 truncate">{{ category.title }}</h3>
          <p class="text-gray-300 text-sm mb-2">{{ category.masterStoriesCount || 0 }} قصة</p>
          <!-- <p class="text-gray-400 text-xs line-clamp-3">{{ category.description }}</p> -->
        </div>
      </div>
    </div>

    <!-- Add Modal (centered popup) -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAddModal = false"></div>
      <div class="relative bg-white rounded-3xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition">
        <div class="flex items-start justify-between">
          <h3 class="text-xl font-bold text-gray-800">إضافة فئة جديدة</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="showAddModal = false">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form @submit.prevent="addCategory" class="mt-4 space-y-4">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">العنوان</label>
            <input v-model="newCategory.title" type="text" required
              class="w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">الوصف</label>
            <textarea v-model="newCategory.description" rows="3" required
              class="w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"></textarea>
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">الصورة</label>
            <input type="file" accept="image/*" @change="e => handleImageSelected(e, 'new')"
              class="w-full text-sm text-gray-600" />
            <div v-if="newCategory.imageUrl" class="mt-3">
              <img :src="newCategory.imageUrl" alt="preview" class="w-40 h-24 object-cover rounded-lg border">
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <button type="button" @click="showAddModal = false"
              class="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">إلغاء</button>
            <button type="submit" :disabled="isUploading"
              class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-60">
              {{ isUploading ? 'جاري الرفع...' : 'إضافة' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Modal (centered popup) -->
    <div v-if="showEditModal && editingCategory" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showEditModal = false"></div>
      <div class="relative bg-white rounded-3xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition">
        <div class="flex items-start justify-between">
          <h3 class="text-xl font-bold text-gray-800">تعديل الفئة</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="showEditModal = false">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form @submit.prevent="updateCategory" class="mt-4 space-y-4">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">العنوان</label>
            <input v-model="editingCategory.title" type="text" required
              class="w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">الوصف</label>
            <textarea v-model="editingCategory.description" rows="3" required
              class="w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"></textarea>
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">الصورة</label>
            <input type="file" accept="image/*" @change="e => handleImageSelected(e, 'edit')"
              class="w-full text-sm text-gray-600" />
            <div v-if="editingCategory.imageUrl" class="mt-3">
              <img :src="editingCategory.imageUrl" alt="preview" class="w-40 h-24 object-cover rounded-lg border">
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <button type="button" @click="showEditModal = false"
              class="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">إلغاء</button>
            <button type="submit" :disabled="isUploading"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-60">
              {{ isUploading ? 'جاري الرفع...' : 'حفظ التغييرات' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Small helper to clamp lines if Tailwind line-clamp isn't available */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>