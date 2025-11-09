

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router' // لو بتستخدم vue-router

// ------------------------------------
// Props: نخليها اختيارية (مش Required) لأننا ممكن ناخد id من الـ URL
// ------------------------------------
const props = defineProps({
  storyCategoryId: {
    type: String,
    required: false,
    default: ''
  }
})

const emit = defineEmits(['viewStory'])

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')


// ------------------------------------
// State
// ------------------------------------
const stories = ref([])
const isAdmin = ref(false)
const currentUserId = ref(null)
const isLoading = ref(true)
const showAddModal = ref(false)
const showEditModal = ref(false)
const isUploading = ref(false)

const newStory = ref({ title: '', content: '', imageUrl: '' })
const editingStory = ref(null)
const showReviewModal = ref(false)
const totalPages = ref(0)
const currentPage = ref(1)
const searchPhrase = ref('')
const storiesPerPage = 12

// ------------------------------------
// Helper: كوكي وتوكن
// ------------------------------------
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : ''
}
const getToken = () => getCookie('authToken') || getCookie('token') || ''

// ------------------------------------
// جلب الـ categoryId من الـ URL أو من props
// ------------------------------------
const route = useRoute() // لو في vue-router
const effectiveCategoryId = ref('')

// دالة مساعدة تقرأ id من أماكن ممكنة بالترتيب:
// 1) props.storyCategoryId
// 2) route.params.id أو route.params.storyCategoryId (لو vue-router)
// 3) query param ?category=xxx أو ?storyCategoryId=xxx
// 4) آخر حل: تحلل window.location.pathname وتستخرج آخر جزء
const resolveCategoryIdFromUrl = () => {
  // 1) props
  if (props.storyCategoryId) return props.storyCategoryId

  // 2) route (vue-router)
  if (route && route.params) {
    if (route.params.id) return String(route.params.id)
    if (route.params.storyCategoryId) return String(route.params.storyCategoryId)
  }

  // 3) query params
  if (route && route.query) {
    if (route.query.category) return String(route.query.category)
    if (route.query.storyCategoryId) return String(route.query.storyCategoryId)
  }

  // 4) window.location (fallback)
  try {
    const u = new URL(window.location.href)
    // check query 'category' or 'storyCategoryId'
    if (u.searchParams.get('category')) return u.searchParams.get('category')
    if (u.searchParams.get('storyCategoryId')) return u.searchParams.get('storyCategoryId')

    // fallback: last path segment (مثلاً /categories/123)
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length) {
      const last = parts[parts.length - 1]
      // لو آخر جزء رقمى أو يشبه id، نرجعه
      return last
    }
  } catch (e) {
    // ignore
  }

  return ''
}

// set initial effectiveCategoryId
effectiveCategoryId.value = resolveCategoryIdFromUrl()

// لو router params اتغيرت (التنقل داخل SPA)، نحدّث القيمة ونعيد fetch
watch(
  () => route.fullPath,
  () => {
    const newId = resolveCategoryIdFromUrl()
    if (newId !== effectiveCategoryId.value) {
      effectiveCategoryId.value = newId
      currentPage.value = 1
      fetchStories()
    }
  }
)

// ------------------------------------
// 2. التحقق من صلاحيات المشرف
// ------------------------------------
// ------------------------------------
// 2. التحقق من صلاحيات المشرف وتخزين ID المستخدم
// ------------------------------------
const checkAdminStatus = async () => {
 try {
  // ... (استدعاء الـ API) ...
  const response = await axios.get(`${API_BASE}/api/identity/users/me`, {
   headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
  })
  const data = response.data || {}
    
  // التحقق من المشرف (صحيح)
  isAdmin.value = Array.isArray(data.roles) ? data.roles.includes('Admin') : (data.userTypeName === 'Admin' || data.userTypeValue === 1)
    
    // ✅ تأكيد أننا نستخدم الحقل 'id' لتخزين معرف المستخدم
    currentUserId.value = data.id || null; 
    
 } catch (err) {
  // ... (معالجة الأخطاء) ...
 }
}// ------------------------------------
// 3. جلب القصص (READ) — مُحسّن
// ------------------------------------
const fetchStories = async () => {
  // استخدام effectiveCategoryId بدل props.storyCategoryId
  const catId = effectiveCategoryId.value
  if (!catId) {
    // لو مافيش id، نتأكد إننا نوقف الـ loading وننظف المصفوفة
    isLoading.value = false
    stories.value = []
    totalPages.value = 0
    return
  }

  try {
    isLoading.value = true
    const body = {
      storyCategoryId: catId,
      searchPhrase: searchPhrase.value,
      createdBy: '',
      isApproved: true,
      orderBy: 'title',
      descending: false,
      pageNumber: currentPage.value,
      pageSize: storiesPerPage
    }

    const response = await axios.post(`${API_BASE}/api/MasterStories/GetAllMatching`, body)

    stories.value = Array.isArray(response.data?.items) ? response.data.items : []
    totalPages.value = response.data?.totalPages || 0
  } catch (err) {
    console.error('Error fetching stories:', err)
    stories.value = []
    totalPages.value = 0
  } finally {
    isLoading.value = false
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchStories()
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchStories()
}

// ------------------------------------
// 4. رفع الصور (نفس ما كان)
// ------------------------------------
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

const handleImageSelected = async (event, target) => {
  const file = event.target.files?.[0]
  if (!file || isUploading.value) return

  const url = await uploadImage(file)

  if (!url) {
    alert('فشل رفع الصورة')
    return
  }

  if (target === 'new') {
    newStory.value.imageUrl = url
  } else if (editingStory.value) {
    editingStory.value.imageUrl = url
  }
}

// ------------------------------------
// 5. إضافة قصة (CREATE) — استخدام effectiveCategoryId
// ------------------------------------
const addStory = async () => {
  const catId = effectiveCategoryId.value
  if (!catId) {
    alert('خطأ: لم يتم تحديد معرف الفئة من الـ URL أو الخصائص.')
    return
  }
  if (isUploading.value) {
    alert('الرجاء الانتظار حتى انتهاء رفع الصورة.')
    return
  }
  if (!newStory.value.title || !newStory.value.content) {
    alert('الرجاء ملء الحقول المطلوبة.')
    return
  }

  try {
    console.log('Attempting to add story with Category ID:', catId);

    await axios.post(`${API_BASE}/api/MasterStories/Add`, {
      storyCategoryId: catId,
      title: newStory.value.title,
      content: newStory.value.content,
      imageUrl: newStory.value.imageUrl || ''
    }, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    })

    showAddModal.value = false
    newStory.value = { title: '', content: '', imageUrl: '' }
    currentPage.value = 1
    await fetchStories()

showReviewModal.value = true
  } catch (err) {
    console.error('Add story failed:', err.response?.data || err)
    alert('فشلت عملية الإضافة: ' + (err.response?.data?.message || 'خطأ غير معروف. راجع Console.'))
  }
}

// ------------------------------------
// 6. تعديل قصة (UPDATE)
// ------------------------------------
const openEdit = (story) => {
  editingStory.value = { ...story }
  showEditModal.value = true
}

const updateStory = async () => {
  if (!editingStory.value || isUploading.value) return

  try {
    await axios.put(`${API_BASE}/api/MasterStories/Update`, {
      id: editingStory.value.id,
      storyCategoryId: effectiveCategoryId.value,
      title: editingStory.value.title,
      content: editingStory.value.content,
      imageUrl: editingStory.value.imageUrl || ''
    }, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    })

    showEditModal.value = false
    editingStory.value = null
    await fetchStories()
    alert('تم تحديث القصة بنجاح!')
  } catch (err) {
    console.error('Update story failed:', err.response?.data || err)
    alert('فشل تحديث القصة: ' + (err.response?.data?.message || 'خطأ غير معروف'))
  }
}

// ------------------------------------
// 7. حذف قصة (DELETE)
// ------------------------------------
const deleteStory = async (id) => {
  if (!confirm('هل أنت متأكد من حذف هذه القصة؟ سيتم حذفها نهائياً.')) return
  try {
    await axios.delete(`${API_BASE}/api/MasterStories/Delete/${id}`, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    })
    await fetchStories()
    alert('تم حذف القصة بنجاح.')
  } catch (err) {
    console.error('Delete story failed:', err.response?.data || err)
    alert('فشل حذف القصة: ' + (err.response?.data?.message || 'خطأ غير معروف'))
  }
}

// ------------------------------------
// Lifecycle
// ------------------------------------
onMounted(async () => {
  // تأكد من القراءة من props (لو وُجدت) أو من الـ URL
  effectiveCategoryId.value = resolveCategoryIdFromUrl()
  await checkAdminStatus()
  await fetchStories()
})
</script>

<template>
  <section class="py-12 bg-gradient-to-br from-purple-300 via-pink-400 to-purple-400 ">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-800 mb-3">
          قصص <span class="text-purple-600">هذه الفئة</span>
        </h2>
        <p class="text-lg text-gray-100 max-w-2xl mx-auto">
          تصفح القصص المتاحة في هذه الفئة وابدأ مغامرة جديدة.
        </p>

        <div class="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
          
          <div class="relative w-full max-w-2xl shadow-lg rounded-2xl mx-auto ">
            <div class="flex items-center rounded-2xl border-2 border-indigo-400 focus-within:border-red-500 transition-all duration-300 bg-white">
              
              <span class="material-icons text-gray-400 text-2xl sm:text-3xl mx-2 sm:mx-4">search</span>
              
              <input
                type="text"
                v-model="searchPhrase"
                @keyup.enter="handleSearch"
                placeholder="ابحث بعنوان القصة..."
                class="flex-grow py-3 sm:py-4 bg-transparent text-gray-800 focus:outline-none placeholder-gray-500 text-base sm:text-lg"
              >

              <button 
                @click="handleSearch" 
                class="p-2 sm:p-4 text-indigo-500 hover:text-indigo-700 transition-colors duration-300"
                title="تطبيق البحث"
              >
                <span class="material-icons text-xl sm:text-3xl">play_arrow</span>
              </button>

            </div>
          </div>
          
         
        </div>
         
      <div class="flex flex-col md:flex-row gap-4 justify-center">
<button
            
            @click="showAddModal = true"
            class="w-full md:w-auto inline-flex items-center mt-4 justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-xl transition transform hover:scale-105"
          >
            إضافة قصة جديدة
          </button>

<button
            v-if="isAdmin"
            @click="navigateTo(`/unpublishedStories/${effectiveCategoryId}`)"
            class="w-full md:w-auto inline-flex items-center mt-4 justify-center gap-2 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xl transition transform hover:scale-105"
          >
            القصص غير المنشورة
          </button>

      </div>



      </div>

      <div v-if="isLoading" class="text-center text-gray-700 py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
        <p class="mt-4">جاري تحميل القصص...</p>
      </div>

      <div v-else-if="stories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto ">
        <div
          v-for="story in stories"
          :key="story.id"
          class="group relative p-4 rounded-2xl bg-gradient-to-br from-purple-300 via-pink-300 to-purple-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-md border border-gray-200 cursor-pointer overflow-hidden"
          @click="navigateTo(`/stories/${story.id}`)"
        >
          <div v-if="isAdmin || (currentUserId && currentUserId.toString() === story.createdBy.toString())" class="absolute top-3 left-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition">
            <button @click.stop="openEdit(story)" class="p-2 bg-blue-500/80 hover:bg-blue-600 rounded-full text-white shadow-lg" title="تعديل">
              <span class="material-icons text-sm">edit</span>
            </button>
            <button @click.stop="deleteStory(story.id)" class="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white shadow-lg" title="حذف">
              <span class="material-icons text-sm">delete</span>
            </button>
          </div>

          <div class="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
            <img v-if="story.imageUrl" :src="story.imageUrl" :alt="story.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-semibold">
              <span class="material-icons text-5xl">book</span>
            </div>
          </div>

          <h3 class="text-xl font-bold text-gray-800 text-center mb-1 truncate">{{ story.title }}</h3>
          <p class="text-gray-100 text-center text-sm line-clamp-3 leading-relaxed" v-html="story.content"></p>
        </div>
      </div>

      <div v-else class="text-center py-10 bg-white rounded-xl shadow-lg border-2 border-dashed border-purple-300">
        <span class="material-icons text-6xl text-purple-400">sentiment_dissatisfied</span>
        <p class="mt-4 text-xl font-medium text-gray-700">لا توجد قصص حالياً في هذا القسم.</p>
        <p v-if="isAdmin || (currentUserId && currentUserId.toString() === story.createdBy.toString())" class="mt-2 text-sm text-gray-500">بصفتك مشرف، يمكنك البدء بإضافة قصة جديدة باستخدام الزر البنفسجي في الأعلى.</p>
        <p v-else class="mt-2 text-sm text-gray-500">حاول البحث في قسم آخر أو عد لاحقاً.</p>
      </div>
      
      <div v-if="totalPages > 1 && !isLoading" class="flex justify-center items-center gap-4 mt-8">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-purple-700"
        >
          السابق
        </button>
        <span class="text-lg font-medium text-gray-700">
          صفحة **{{ currentPage }}** من **{{ totalPages }}**
        </span>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-purple-700"
        >
          التالي
        </button>
      </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAddModal = false"></div>
      <div class="relative bg-white rounded-3xl p-6 w-full max-w-2xl mx-4 shadow-2xl transform transition">
        <div class="flex items-start justify-between border-b pb-3 mb-4">
          <h3 class="text-xl font-bold text-gray-800">إضافة قصة جديدة</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="showAddModal = false">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form @submit.prevent="addStory" class="mt-4 space-y-4">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">العنوان</label>
            <input v-model="newStory.title" type="text" required
              class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" /> </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">المحتوى الأساسي (النص)</label>
            <textarea v-model="newStory.content" rows="6" required
              class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea> </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">صورة الغلاف</label>
            <input type="file" accept="image/*" @change="e => handleImageSelected(e, 'new')"
              class="w-full text-sm text-gray-600" />
            <div v-if="newStory.imageUrl" class="mt-3">
              <img :src="newStory.imageUrl" alt="preview" class="w-40 h-24 object-cover rounded-lg border">
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" @click="showAddModal = false"
              class="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">إلغاء</button>
            <button type="submit" :disabled="isUploading"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
              <div v-if="isUploading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              {{ isUploading ? 'جاري الرفع...' : 'إضافة القصة' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <div v-if="showEditModal && editingStory" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showEditModal = false"></div>
      <div class="relative bg-white rounded-3xl p-6 w-full max-w-2xl mx-4 shadow-2xl transform transition">
        <div class="flex items-start justify-between border-b pb-3 mb-4">
          <h3 class="text-xl font-bold text-gray-800">تعديل القصة: {{ editingStory.title }}</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="showEditModal = false">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form @submit.prevent="updateStory" class="mt-4 space-y-4">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">العنوان</label>
            <input v-model="editingStory.title" type="text" required
              class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">المحتوى الأساسي (النص)</label>
            <textarea v-model="editingStory.content" rows="6" required
              class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea> </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">صورة الغلاف الحالية</label>
            <input type="file" accept="image/*" @change="e => handleImageSelected(e, 'edit')"
              class="w-full text-sm text-gray-600" />
            <div v-if="editingStory.imageUrl" class="mt-3">
              <img :src="editingStory.imageUrl" alt="preview" class="w-40 h-24 object-cover rounded-lg border">
            </div>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" @click="showEditModal = false"
              class="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">إلغاء</button>
            <button type="submit" :disabled="isUploading"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
              <div v-if="isUploading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              {{ isUploading ? 'جاري الرفع...' : 'حفظ التغييرات' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <Transition name="modal">
    <div 
        v-if="showReviewModal" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" 
        @click.self="showReviewModal = false"
    >
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 transform transition-all duration-300">
            
            <div class="text-center mb-6">
                <div class="w-16 h-16 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600 mx-auto mb-4 shadow-md">
                    <span class="material-icons text-3xl">rate_review</span> </div>
                <h3 class="text-xl font-bold text-gray-800">شكراً لك!</h3>
            </div>
            
            <p class="text-center text-gray-600 mb-8">
                ✅ تم استلام قصتك بنجاح.
                <br>
                **قصتك قيد المراجعة حالياً من قبل المشرفين، وسيتم نشرها قريباً.**
            </p>
            
            <button 
                @click="showReviewModal = false" 
                class="w-full bg-yellow-500 text-white py-3 rounded-xl hover:bg-yellow-600 transition-colors duration-200 font-semibold shadow-lg"
            >
                فهمت (إغلاق)
            </button>
            
        </div>
    </div>
</Transition>
  </section>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>