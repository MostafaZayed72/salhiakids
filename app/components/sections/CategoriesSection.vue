<template>
<section class="py-20 ">
 <div class="container mx-auto px-4">
 <div class="text-center mb-12">
  <h2 class="text-4xl font-bold text-gray-800 mb-3">
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

 <div v-if="isLoading" class="text-center text-gray-700">
  <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-purple-600 mx-auto"></div>
  <p class="mt-4">جاري تحميل الفئات...</p>
 </div>

    <div v-else class=" flex justify-center gap-6 flex-wrap max-w-7xl mx-auto"> 
  <div
  v-for="(category, index) in categories"
  :key="category.id"
  class="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-700 to-purple-600 hover:from-indigo-800 hover:to-purple-800 transition-all duration-400 transform hover:-translate-y-2 shadow-lg border border-gray-700 text-center cursor-pointer w-full max-w-xs"
  @click="navigateTo(`/categories/${category.id}`)"
  data-aos="fade-up"
  :data-aos-delay="index % 4 * 100" 
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
   <img v-if="category.imageUrl" :src="category.imageUrl" :alt="category.title" class="w-full h-full object-cover">
   <div v-else class="w-full h-full flex items-center justify-center text-white text-3xl font-semibold">
   {{ (category.title || '').charAt(0) || '؟' }}
   </div>
  </div>

  <h3 class="text-xl font-semibold text-white mb-1 truncate">{{ category.title }}</h3>
  <p class="text-gray-300 text-sm mb-2">{{ category.masterStoriesCount || 0 }} قصة</p>
  </div>
 </div>
    
      <div v-if="totalPages > 1 && !isLoading" class="flex justify-center mt-12 space-x-2 space-x-reverse">
    <button 
  @click="changePage(currentPage - 1)" 
  :disabled="currentPage === 1"
  class="px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200"
  :class="{'bg-purple-600 text-white hover:bg-purple-700': currentPage > 1, 'bg-gray-200 text-gray-500 cursor-not-allowed': currentPage === 1}"
  >
  السابق
  </button>
  
    <button 
  v-for="(page, index) in visiblePages" 
  :key="index"
  @click="page !== '...' && changePage(page)" 
  :disabled="page === '...'"
  class="w-10 h-10 text-sm font-semibold rounded-full transition-colors duration-200"
  :class="{
   'bg-purple-600 text-white': page === currentPage,
   'bg-gray-100 text-gray-700 hover:bg-gray-200': page !== currentPage && page !== '...',
   'text-gray-500 cursor-default': page === '...'
  }"
  >
  {{ page }}
  </button>

    <button 
  @click="changePage(currentPage + 1)" 
  :disabled="currentPage === totalPages"
  class="px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200"
  :class="{'bg-purple-600 text-white hover:bg-purple-700': currentPage < totalPages, 'bg-gray-200 text-gray-500 cursor-not-allowed': currentPage === totalPages}"
  >
  التالي
  </button>
 </div>
 </div>

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
   class="w-full rounded-md border border-indigo-400 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 ring-indigo-400 focus:ring-indigo-400" />
  </div>

  <div>
   <label class="block mb-1 text-sm font-medium text-gray-700">الوصف</label>
   <textarea v-model="newCategory.description" rows="3" required
   class="w-full rounded-md  shadow-sm px-3 py-2 focus:outline-none focus:ring-2 border border-indigo-400 focus:ring-indigo-400"></textarea>
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
   class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-60">
   {{ isUploading ? 'جاري الرفع...' : 'إضافة' }}
   </button>
  </div>
  </form>
 </div>
 </div>

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

<script setup>
import { ref, onMounted, computed } from 'vue'
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

// ⭐️ Pagination State - تم التعديل إلى 1
const currentPage = ref(1)
const pageSize = ref(8) 
const totalItems = ref(0) 

// Form data
const newCategory = ref({ title: '', description: '', imageUrl: '' })
const editingCategory = ref(null)

// Helpers
const getCookie = (name) => {
const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
return match ? decodeURIComponent(match[2]) : ''
}
const getToken = () => getCookie('authToken') || getCookie('token') || ''

// ⭐️ Computed Properties for Pagination
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

const visiblePages = computed(() => {
    const pages = []
    // عرض 5 أزرار حول الصفحة الحالية
    const maxVisiblePages = 5; 
    let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages.value, start + maxVisiblePages - 1);

    // ضبط البداية إذا كانت النهاية مقيدة بـ totalPages
    if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
    }
    
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  // إضافة ... (ellipsis) في البداية والنهاية
  if (start > 1) {
    if (start > 2) pages.unshift('...')
    pages.unshift(1)
  }
  if (end < totalPages.value) {
    if (end < totalPages.value - 1) pages.push('...')
    pages.push(totalPages.value)
  }
    
    // إزالة تكرار النقاط ...
    return pages.filter((value, index, self) => {
        if (value === '...') {
            return self[index - 1] !== '...' && self[index + 1] !== '...';
        }
        return self.indexOf(value) === index;
    })
})

// API Calls
const fetchCategories = async () => {
try {
 isLoading.value = true
 // ⭐️ هنا يتم استخدام pageNumber و pageSize في body الطلب
 const response = await axios.post(`${API_BASE}/api/StoryCategories/GetAllMatching`, {
 searchPhrase: '',
 orderBy: 'title',
 descending: false,
 pageNumber: currentPage.value, // إرسال رقم الصفحة الحالية
 pageSize: pageSize.value       // إرسال عدد العناصر في الصفحة (وهو 1)
 })

 categories.value = Array.isArray(response.data?.items) ? response.data.items : []
totalItems.value = response.data?.totalItemsCount || response.data?.totalCount || 0
 
} catch (err) {
 console.error('Error fetching categories:', err)
 categories.value = []
 totalItems.value = 0
} finally {
 isLoading.value = false
}
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value && page !== '...') {
    currentPage.value = page
    fetchCategories()
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
 currentPage.value = 1
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
 // If last item in the current page is deleted, go back one page
 if (categories.value.length === 1 && currentPage.value > 1) {
   currentPage.value -= 1
 }
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

<style scoped>
.line-clamp-3 {
display: -webkit-box;
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;
overflow: hidden;
}
</style>