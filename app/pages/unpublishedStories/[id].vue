<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router' // ✅ تأكد من الاستيراد الصحيح

// ------------------------------------
// تعريف الـ Router والـ Route
// ------------------------------------
const route = useRoute() 
const router = useRouter() // ✅ استخدام useRouter لجعل دالة router متاحة

// ------------------------------------
// Props (للحفاظ على التناسق إن لزم الأمر)
// ------------------------------------
const props = defineProps({
 storyCategoryId: {
  type: String,
  required: false,
  default: ''
 }
})

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// ------------------------------------
// State
// ------------------------------------
const stories = ref([])
const isAdmin = ref(false)
const isLoading = ref(true)

const totalPages = ref(0)
const currentPage = ref(1)
const searchPhrase = ref('')
const storiesPerPage = 12
const effectiveCategoryId = ref('')
const notification = useNotification()

// ------------------------------------
// Helper Function: getYouTubeThumbnail
// ------------------------------------
const getYouTubeThumbnail = (url) => {
 if (!url) return null;
 // Regex لاستخراج معرف الفيديو من روابط يوتيوب الشائعة
 const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/))([^&?#]+)/);
 if (videoIdMatch && videoIdMatch[1]) {
  const videoId = videoIdMatch[1];
  // إرجاع رابط الصورة المصغرة عالية الجودة
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
 }
 return null;
}

// ------------------------------------
// Helper: كوكي وتوكن (نفس الدوال السابقة)
// ------------------------------------
const getCookie = (name) => {
 const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
 return match ? decodeURIComponent(match[2]) : ''
}
const getToken = () => getCookie('authToken') || getCookie('token') || ''

// ------------------------------------
// جلب الـ categoryId من الـ URL (ديناميكي)
// ------------------------------------
const resolveCategoryIdFromUrl = () => {
 if (props.storyCategoryId) return props.storyCategoryId
 // نعتمد على route.params في هذا المكون
 return String(route.params.id || route.params.storyCategoryId || '')
}

// ------------------------------------
// 2. التحقق من صلاحيات المشرف والتحويل (مع رسالة تحذير)
// ------------------------------------
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
  
 // ✅ شرط التحويل
 if (!isAdmin.value) {
    // نستخدم router.replace بدلاً من push لتجنب تخزين المسار في سجل التصفح
  router.replace('/') 
  return false
 }
 return true
}

// ------------------------------------
// 3. جلب القصص غير المنشورة (isApproved: false)
// ------------------------------------
const fetchUnpublishedStories = async () => {
 const catId = effectiveCategoryId.value
 if (!catId) {
  isLoading.value = false
  stories.value = []
  totalPages.value = 0
  return
 }

 if (!isAdmin.value) { // تحقق إضافي، بالرغم من أن checkAdminStatus يجب أن تمنع الوصول
  isLoading.value = false
  return
 }

 try {
  isLoading.value = true
  const body = {
   storyCategoryId: catId,
   searchPhrase: searchPhrase.value,
   createdBy: '',
   ApprovalStatus: 0, 
   orderBy: 'createdAt', 
   descending: true,
   pageNumber: currentPage.value,
   pageSize: storiesPerPage
  }

  const response = await axios.post(`${API_BASE}/api/MasterStories/GetAllMatching`, body, {
   headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
  })

  stories.value = Array.isArray(response.data?.items) ? response.data.items : []
  totalPages.value = response.data?.totalPages || 0
 } catch (err) {
  console.error('Error fetching unpublished stories:', err)
  stories.value = []
  totalPages.value = 0
 } finally {
  isLoading.value = false
 }
}

const goToPage = (page) => {
 if (page >= 1 && page <= totalPages.value) {
  currentPage.value = page
  fetchUnpublishedStories()
 }
}

const handleSearch = () => {
 currentPage.value = 1
 fetchUnpublishedStories()
}

// ------------------------------------
// 4. النشر (Approve) 
// ------------------------------------
const publishStory = (story) => {
  notification.show({
    title: 'نشر القصة',
    message: `هل أنت متأكد من نشر القصة: ${story.title}؟`,
    type: 'warning',
    actions: [
      {
        label: 'نعم، نشر',
        onClick: async () => {
          try {
            const body = { id: story.id, ApprovalStatus: 1 }
            await axios.patch(`${API_BASE}/api/MasterStories/Approve`, body, {
              headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
            })
            notification.show({
              title: 'تم النشر',
              message: 'تم نشر القصة بنجاح!',
              type: 'success',
              autoClose: true,
              duration: 3000
            })
            await fetchUnpublishedStories()
          } catch (err) {
            console.error('Publish story failed:', err.response?.data || err)
            notification.show({
              title: 'خطأ',
              message: 'فشل نشر القصة: ' + (err.response?.data?.message || 'خطأ غير معروف'),
              type: 'error',
              actions: [{ label: 'حسناً', onClick: () => {}, style: 'primary' }]
            })
          }
        },
        style: 'primary'
      },
      {
        label: 'إلغاء',
        onClick: () => {},
        style: 'secondary'
      }
    ]
  })
}

// ------------------------------------
// 5. الحذف (Delete)
// ------------------------------------
const deleteStory = (id) => {
  notification.show({
    title: 'حذف القصة',
    message: 'هل أنت متأكد من حذف هذه القصة؟ سيتم حذفها نهائياً.',
    type: 'warning',
    actions: [
      {
        label: 'نعم، حذف',
        onClick: async () => {
          try {
            await axios.delete(`${API_BASE}/api/MasterStories/Delete/${id}`, {
              headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
            })
            await fetchUnpublishedStories()
            notification.show({
              title: 'تم الحذف',
              message: 'تم حذف القصة بنجاح.',
              type: 'success',
              autoClose: true,
              duration: 3000
            })
          } catch (err) {
            console.error('Delete story failed:', err.response?.data || err)
            notification.show({
              title: 'خطأ',
              message: 'فشل حذف القصة: ' + (err.response?.data?.message || 'خطأ غير معروف'),
              type: 'error',
              actions: [{ label: 'حسناً', onClick: () => {}, style: 'primary' }]
            })
          }
        },
        style: 'danger'
      },
      {
        label: 'إلغاء',
        onClick: () => {},
        style: 'secondary'
      }
    ]
  })
}

// ------------------------------------
// Lifecycle & Watchers
// ------------------------------------
const initializeData = async () => {
 effectiveCategoryId.value = resolveCategoryIdFromUrl()
 
 // التحقق من الصلاحيات والتحويل إذا لزم الأمر
 const isAllowed = await checkAdminStatus()
 
 if (isAllowed) {
  await fetchUnpublishedStories()
 }
}

onMounted(initializeData)

watch(
 () => route.fullPath, 
 () => {
  const newId = resolveCategoryIdFromUrl()
  if (newId !== effectiveCategoryId.value) {
   effectiveCategoryId.value = newId
   currentPage.value = 1
   fetchUnpublishedStories()
  }
 }
)
</script>

<template>
 <section class="py-12 bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4">
   <div v-if="!isAdmin" class="text-center py-20">
            <h3 class="text-3xl font-bold text-red-600">❌ الوصول مرفوض ❌</h3>
            <p class="mt-4 text-lg text-gray-700">سيتم تحويلك إلى الصفحة الرئيسية.</p>
        </div>

   <div v-else> <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-gray-800 mb-3">
               🛑 القصص <span class="text-red-600">غير المنشورة</span> للمراجعة
            </h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
               تظهر هذه القصص للأدمن فقط وتنتظر الموافقة
            </p>
                
                <button
               @click="router.push(`/categories/${effectiveCategoryId}`)" 
               class="inline-flex items-center mt-6 justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-lg transition transform hover:scale-105 text-base font-medium"
             >
               <span class="material-icons text-xl">arrow_back</span>
               العودة للقصص المنشورة
             </button>
            </div>

     <div v-if="isLoading" class="text-center text-gray-700 py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto"></div>
      <p class="mt-4">جاري تحميل القصص غير المنشورة...</p>
     </div>

     <div v-else-if="stories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto ">
      <div
       v-for="story in stories"
       :key="story.id"
       @click="navigateTo(`preview/${story.id}`)"
       class="group cursor-pointer  relative p-4 rounded-2xl bg-white border-4 border-dashed border-red-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-md  overflow-hidden"
      >
       <div class="absolute top-3 left-3 flex gap-2 z-10 transition">
        
                <button @click.stop="publishStory(story)" class="p-2 bg-green-500 hover:bg-green-600 rounded-full text-white shadow-lg" title="نشر القصة (موافقة)">
         <span class="material-icons text-sm">check</span>
        </button>
        
                <button @click.stop="deleteStory(story.id)" class="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg" title="حذف القصة (رفض)">
         <span class="material-icons text-sm">close</span>
        </button>
       </div>
                
       <div class="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-100 shadow-inner relative">
        <img v-if="story.coverImageUrl" :src="story.coverImageUrl" :alt="story.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        
        <div v-else-if="story.mediaUrl && story.mediaType === 1" class="w-full h-full">
            <img :src="story.mediaUrl" :alt="story.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>

        <div v-else-if="story.mediaUrl && story.mediaType === 2 && getYouTubeThumbnail(story.mediaUrl)" class="w-full h-full relative">
            <img :src="getYouTubeThumbnail(story.mediaUrl)" :alt="story.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                <span class="material-icons text-6xl text-white/90 p-2 rounded-full transform group-hover:scale-110 transition">play_circle_filled</span>
            </div>
        </div>

        <div v-else class="w-full h-full flex items-center justify-center text-red-400 text-3xl font-semibold bg-gray-200">
            <span v-if="story.mediaType === 2" class="material-icons text-5xl text-red-500/80">play_circle_filled</span>
            <span v-else-if="story.mediaType === 4" class="material-icons text-5xl text-blue-500/80">picture_as_pdf</span>
            <span v-else class="material-icons text-5xl">unpublished</span>
        </div>
       </div>

       <h3 class="text-xl font-bold text-gray-800 text-center mb-1 truncate">{{ story.title }}</h3>
       <p class="text-gray-600 text-center text-sm line-clamp-3 leading-relaxed" v-html="story.content"></p>
      </div>
     </div>

     <div v-else class="text-center py-10 bg-white rounded-xl shadow-lg border-2 border-dashed border-red-300">
      <span class="material-icons text-6xl text-green-400">task_alt</span>
      <p class="mt-4 text-xl font-medium text-gray-700">لا توجد قصص غير منشورة حالياً في هذه الفئة.</p>
     </div>
     
     <div v-if="totalPages > 1 && !isLoading" class="flex justify-center items-center gap-4 mt-8">
      <button
       @click="goToPage(currentPage - 1)"
       :disabled="currentPage === 1"
       class="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-red-700"
      >
       السابق
      </button>
      <span class="text-lg font-medium text-gray-700">
       صفحة **{{ currentPage }}** من **{{ totalPages }}**
      </span>
      <button
       @click="goToPage(currentPage + 1)"
       :disabled="currentPage === totalPages"
       class="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-red-700"
      >
       التالي
      </button>
     </div>
        </div>
   <NotificationModal :is-open="notification.isOpen.value" :notification="notification.notification.value" @close="notification.close" />
  </div>
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