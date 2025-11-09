<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const masterStoryId = ref('') 

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const emit = defineEmits(['viewMedia']) 
const hoverRating = ref(0)
// ----------------------
// حالة القصة والميديا
// ----------------------
const storyTitle = ref('جاري تحميل اسم القصة...')
const mediaItems = ref([])
const isAdmin = ref(false)
const isLoading = ref(true)
const showAddModal = ref(false)
const showEditModal = ref(false)
const isUploading = ref(false)

const showPopup = ref(false)   
const selectedMediaUrl = ref('')  
const selectedMediaType = ref('') 

const newMedia = ref({ masterStoryId: '', title: '', description: '', url: '', isImage: true, newMediaUrl: '' })
const editingMedia = ref(null)

const totalPages = ref(0)
const currentPage = ref(1)
const searchPhrase = ref('')
const itemsPerPage = 12

// ----------------------
// حالة الميزات التفاعلية (تقييم، مفضلة، تعليقات)
// ----------------------
const userRating = ref(0) 
const isFavorite = ref(false) 
const comments = ref([]) 
const newCommentContent = ref('') 
const isCommentsLoading = ref(true)
const commentsTotalPages = ref(0)
const commentsCurrentPage = ref(1)
const commentsPerPage = 5 

// ----------------------
// الدوال المساعدة الأساسية
// ----------------------

const getCookie = (name) => {
    // ✅ حماية SSR من خطأ document is undefined
    if (typeof document === 'undefined') return ''; 
    
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : ''
}
const getToken = () => getCookie('authToken') || getCookie('token') || ''

const resolveStoryIdFromUrl = () => {
    if (route && route.params) {
        if (route.params.id) return String(route.params.id)
        if (route.params.masterStoryId) return String(route.params.masterStoryId)
    }
    return ''
}

// جلب عنوان القصة
const fetchStoryTitle = async (storyId) => {
if (!storyId) {
 storyTitle.value = 'القصة غير متوفرة';
 return;
}
try {
 const response = await axios.post(`${API_BASE}/api/MasterStories/GetById`, { id: storyId })
 storyTitle.value = response.data?.title || 'قصة بدون عنوان'
} catch (err) {
 console.error('Error fetching story title:', err)
 storyTitle.value = 'خطأ في تحميل اسم القصة'
}
}

// التحقق من حالة الإدارة
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

// جلب عناصر الميديا
const fetchMediaItems = async () => {
const storyId = masterStoryId.value
if (!storyId) {
isLoading.value = false
mediaItems.value = []
totalPages.value = 0
return
}

try {
isLoading.value = true
const body = {
masterStoryId: storyId,
searchPhrase: searchPhrase.value,
pageNumber: currentPage.value,
pageSize: itemsPerPage
}

const response = await axios.post(`${API_BASE}/api/MediaItems/GetAllMatching`, body) 

mediaItems.value = Array.isArray(response.data?.items) ? response.data.items : []
totalPages.value = response.data?.totalPages || 0
} catch (err) {
console.error('Error fetching media items:', err)
mediaItems.value = []
totalPages.value = 0
} finally {
isLoading.value = false
}
}

const goToPage = (page) => {
if (page >= 1 && page <= totalPages.value) {
currentPage.value = page
fetchMediaItems()
}
}

const handleSearch = () => {
currentPage.value = 1
fetchMediaItems()
}

const uploadFile = async (file, isImage) => {
if (!file) return ''
isUploading.value = true
const endpoint = isImage ? '/api/Upload/UploadImage' : '/api/Upload/UploadFile' 

try {
const formData = new FormData()
formData.append('file', file)

const response = await axios.post(`${API_BASE}${endpoint}`, formData, {
headers: { 
 Authorization: getToken() ? `Bearer ${getToken()}` : undefined,
 'Content-Type': 'multipart/form-data'
}
})
return response.data?.url || ''
} catch (err) {
console.error('Upload failed:', err)
return ''
} finally {
isUploading.value = false
}
}

const handleFileSelected = async (event, target) => {
const file = event.target.files?.[0]
if (!file || isUploading.value) return

if (target === 'new') {
 newMedia.value.newMediaUrl = ''
}

const isImageFile = file.type.startsWith('image/')
const url = await uploadFile(file, isImageFile)

if (!url) {
alert('فشل رفع الملف')
return
}

if (target === 'new') {
newMedia.value.url = url
newMedia.value.isImage = isImageFile
} else if (editingMedia.value) {
editingMedia.value.url = url
editingMedia.value.isImage = isImageFile
}
}

const addMediaItem = async () => {
const storyId = masterStoryId.value

const finalUrl = newMedia.value.url || newMedia.value.newMediaUrl;

if (!storyId || isUploading.value || !newMedia.value.title || !finalUrl) {
alert('الرجاء التأكد من ملء جميع الحقول ورفع الملف أو إضافة رابط خارجي.')
return
}

try {
const body = {
masterStoryId: storyId,
title: newMedia.value.title,
description: newMedia.value.description || '',
url: finalUrl
}

await axios.post(`${API_BASE}/api/MediaItems/Add`, body, {
headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
})

showAddModal.value = false
newMedia.value = { masterStoryId: '', title: '', description: '', url: '', isImage: true, newMediaUrl: '' }
currentPage.value = 1
await fetchMediaItems()
alert('تم إضافة عنصر الميديا بنجاح!')
} catch (err) {
console.error('Add media item failed:', err.response?.data || err)
alert('فشلت عملية الإضافة: ' + (err.response?.data?.message || 'خطأ غير معروف.'))
}
}

const handleUrlInput = () => {
if (newMedia.value.newMediaUrl) {
 newMedia.value.url = ''; 
}
}

const openEdit = (media) => {
editingMedia.value = { ...media }
const url = media.url || ''
editingMedia.value.isImage = /\.(jpe?g|png|gif|webp|svg)$/i.test(url.split('?')[0])
showEditModal.value = true
}

const updateMediaItem = async () => {
if (!editingMedia.value || isUploading.value) return

try {
const body = {
id: editingMedia.value.id, 
title: editingMedia.value.title,
description: editingMedia.value.description || '',
url: editingMedia.value.url 
}

await axios.put(`${API_BASE}/api/MediaItems/Update`, body, {
headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
})

showEditModal.value = false
editingMedia.value = null
await fetchMediaItems()
alert('تم تحديث عنصر الميديا بنجاح!')
} catch (err) {
console.error('Update media item failed:', err.response?.data || err)
alert('فشل تحديث الميديا: ' + (err.response?.data?.message || 'خطأ غير معروف'))
}
}

const deleteMediaItem = async (id) => {
if (!confirm('هل أنت متأكد من حذف هذا العنصر؟ سيتم حذفه نهائياً.')) return
try {
await axios.delete(`${API_BASE}/api/MediaItems/Delete/${id}`, {
headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
})
await fetchMediaItems()
alert('تم حذف عنصر الميديا بنجاح.')
} catch (err) {
console.error('Delete media item failed:', err.response?.data || err)
alert('فشل حذف الميديا: ' + (err.response?.data?.message || 'خطأ غير معروف'))
}
}

const openMediaPopup = (url) => {
if (!url) return;
selectedMediaUrl.value = url;

if (url.includes('youtube.com') || url.includes('youtu.be')) {
 selectedMediaType.value = 'youtube';
} 
else if (/\.(jpe?g|png|gif|webp|svg)$/i.test(url.split('?')[0])) {
 selectedMediaType.value = 'image';
} else {
 // ملف PDF يفتح في نافذة جديدة مباشرة
 window.open(url, '_blank');
 return; 
}
showPopup.value = true;
}

const closePopup = () => {
showPopup.value = false;
selectedMediaUrl.value = '';
selectedMediaType.value = '';
}

const getIconForUrl = (url) => {
if (!url) return 'insert_drive_file'
url = url.toLowerCase().split('?')[0]
if (url.match(/\.(jpe?g|png|gif|webp|svg)$/i)) return 'image'
if (url.match(/(youtu\.be|youtube\.com)/i)) return 'videocam' 
if (url.match(/\.(mp3|wav|aac)$/i)) return 'volume_up'
if (url.match(/\.(pdf)$/i)) return 'picture_as_pdf'
return 'insert_drive_file'
}

const getEmbedUrl = (url) => {
 if (!url) return '';
 const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
 const match = url.match(regExp);
 if (match && match[2].length === 11) {
  return `https://www.youtube.com/embed/${match[2]}`;
 }
 return url.startsWith('http') ? url : '';
}


// ----------------------
// منطق التقييم (Rating Logic)
// ----------------------

const fetchRating = async (storyId) => {
    if (!getToken() || !storyId) return

    try {
        const response = await axios.post(`${API_BASE}/api/StoryRatings/GetRating`, { masterStoryId: storyId }, {
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        userRating.value = response.data?.rating || 0
    } catch (err) {
        userRating.value = 0
    }
}

const submitRating = async (rating) => {
    const storyId = masterStoryId.value
    if (!getToken() || !storyId) {
        alert('يجب تسجيل الدخول لإضافة تقييم.')
        return
    }

    try {
        const body = { masterStoryId: storyId, rating: rating }
        
        if (userRating.value > 0) {
            await axios.put(`${API_BASE}/api/StoryRatings/Update`, body, {
                headers: { Authorization: `Bearer ${getToken()}` }
            })
        } else {
            await axios.post(`${API_BASE}/api/StoryRatings/Add`, body, {
                headers: { Authorization: `Bearer ${getToken()}` }
            })
        }
        
        userRating.value = rating
        alert('تم تسجيل تقييمك بنجاح.')
    } catch (err) {
        console.error('Rating failed:', err)
        alert('فشل في تسجيل التقييم.')
    }
}

// ----------------------
// منطق المفضلة (Favorite Logic)
// ----------------------

const toggleFavorite = async () => {
    const storyId = masterStoryId.value
    if (!getToken() || !storyId) {
        alert('يجب تسجيل الدخول لإضافة/إزالة المفضلة.')
        return
    }

    try {
        if (isFavorite.value) {
            // ⬅️ حالة الإزالة: نستخدم DELETE
            const endpoint = `/api/FavoriteStories/Remove` 
            const body = { masterStoryIds: [storyId] } 

            // استخدام axios.delete
            // عند استخدام DELETE مع BODY، يفضل وضع الـ Body في خاصية 'data'
            // هذا هو الإصلاح الرئيسي لخطأ 405
            await axios.delete(`${API_BASE}${endpoint}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
                data: body // إرسال الـ Body مع طلب DELETE
            })

        } else {
            // ⬅️ حالة الإضافة: نستخدم POST
            const endpoint = '/api/FavoriteStories/Add'
            const body = { masterStoryIds: [storyId] }

            await axios.post(`${API_BASE}${endpoint}`, body, {
                headers: { Authorization: `Bearer ${getToken()}` }
            })
        }

        // تحديث الحالة بعد نجاح العملية
        isFavorite.value = !isFavorite.value
        alert(isFavorite.value ? 'تمت الإضافة إلى المفضلة! ❤️' : 'تمت الإزالة من المفضلة.')

    } catch (err) {
        console.error('Favorite toggle failed:', err)
        // عرض رسالة خطأ أكثر تحديداً من الـ API
        const errorMessage = err.response?.data?.message || 'فشل في تحديث المفضلة.'
        alert(errorMessage)
    }
}


const checkFavoriteStatus = async (storyId) => {
    if (!getToken() || !storyId) {
        isFavorite.value = false
        return
    }

    try {
        // يتم افتراض مسار للتحقق من المفضلة
        const response = await axios.post(`${API_BASE}/api/FavoriteStories/Get`, { 
            masterStoryId: storyId, 
            pageSize: 1 
        }, {
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        
        isFavorite.value = response.data?.items?.length > 0
    } catch (err) {
        isFavorite.value = false
    }
}

// ----------------------
// منطق التعليقات (Comments Logic)
// ----------------------

const fetchComments = async () => {
    const storyId = masterStoryId.value
    if (!storyId) return

    isCommentsLoading.value = true
    try {
        const body = {
            masterStoryId: storyId,
            searchPhrase: '', 
            orderBy: "createdAt",
            descending: true,
            pageNumber: commentsCurrentPage.value,
            pageSize: commentsPerPage
        }

        const response = await axios.post(`${API_BASE}/api/StoryComments/GetAllMatching`, body) 

        comments.value = Array.isArray(response.data?.items) ? response.data.items : []
        commentsTotalPages.value = response.data?.totalPages || 0
    } catch (err) {
        console.error('Error fetching comments:', err)
        comments.value = []
    } finally {
        isCommentsLoading.value = false
    }
}

const addComment = async () => {
    const storyId = masterStoryId.value
    if (!getToken() || !storyId) {
        alert('يجب تسجيل الدخول لإضافة تعليق.')
        return
    }

    const content = newCommentContent.value.trim()
    if (!content) return

    try {
        const body = { masterStoryId: storyId, content: content }
        await axios.post(`${API_BASE}/api/StoryComments/Add`, body, {
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        
        newCommentContent.value = ''
        commentsCurrentPage.value = 1 
        await fetchComments()
    } catch (err) {
        console.error('Add comment failed:', err)
        alert('فشل في إضافة التعليق.')
    }
}

const deleteComment = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return
    
    try {
        await axios.delete(`${API_BASE}/api/StoryComments/Delete/${id}`, {
            headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
        })
        await fetchComments() 
    } catch (err) {
        console.error('Delete comment failed:', err)
        alert('فشل في حذف التعليق.')
    }
}

const goToCommentPage = (page) => {
    if (page >= 1 && page <= commentsTotalPages.value) {
        commentsCurrentPage.value = page
        fetchComments()
    }
}

// ----------------------
// تهيئة البيانات والمراقبة
// ----------------------

const initializeData = async (id) => {
    if (!id) return;
    
    await Promise.all([
        checkAdminStatus(),
        fetchStoryTitle(id),
        fetchMediaItems(),
        fetchRating(id), 
        checkFavoriteStatus(id), 
        fetchComments() 
    ]);
};

onMounted(async () => {
    masterStoryId.value = resolveStoryIdFromUrl();
})

watch(
    () => route.params.masterStoryId || route.params.id, 
    async (newId) => {
        if (newId) {
            masterStoryId.value = newId
            currentPage.value = 1
            commentsCurrentPage.value = 1
            await initializeData(newId) 
        }
    },
    { immediate: true }
)
</script>
<template>
<section class="py-12 bg-gradient-to-br from-purple-300 via-pink-400 to-purple-400 min-h-screen">
 <div class="container mx-auto px-4" >
 <div class="text-center mb-12">
  <h2 class="text-4xl font-bold text-gray-800 mb-3">
  <span class="text-purple-600">{{ storyTitle }}</span>
  </h2>
  <p class="text-lg text-gray-600 max-w-2xl mx-auto">
  تصفح العناصر المرئية والملفات الخاصة بهذه القصة.
  </p>
    
    
  
<div class="mt-6 flex flex-wrap items-center justify-center gap-6 bg-white/70 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-white/90 max-w-xl mx-auto">
    
    <div class="flex items-center gap-3 p-2 rounded-full transition duration-300">
        <h1 
            :class="[isFavorite ? 'text-red-600 font-bold' : 'text-gray-700 font-medium', 
                     'text-lg sm:text-xl transition-colors']"
        >
            {{ isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة' }}
        </h1> 
        
        <button 
            @click="toggleFavorite"
            :class="[
                'p-3 rounded-full  transform transition duration-300',
                // خلفية بيضاء دائماً للزر لتوفير التباين
                ' hover:shadow-xl', 
                { 'scale-110 shadow-red-400/50': isFavorite } // تكبير خفيف وتركيز للظل عند الإضافة
            ]"
            :title="isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'"
        >
            <span 
                class="material-icons text-3xl transition-colors duration-300"
                :class="[isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400']"
            >
                {{ isFavorite ? 'favorite' : 'favorite_border' }}
            </span>
        </button>
    </div>

<div class="h-8 w-px bg-gray-300"></div> 

<div class="flex items-center gap-3">
    <span class="text-lg font-semibold text-gray-700">تقييمك:</span>
    
    <div class="flex ">
        <button 
            v-for="star in 5" 
            :key="star"
            
            @click="submitRating(star)"
            
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0" 
            
            :class="[
                // إذا كانت القيمة أكبر من الصفر، استخدمها، وإلا استخدم userRating
                star <= (hoverRating || userRating) ? 'text-yellow-300' : 'text-gray-400', 
                
                // تغيير لون التحويم إلى الأصفر بشكل دائم أثناء التحويم
                'transition-colors duration-200 hover:text-yellow-500'
            ]"
            class="material-icons text-3xl transform hover:scale-110 cursor-pointer"
            :title="`تقييم ${star} نجوم`"
        >
            star
        </button>
    </div>
</div>

</div>




      <div class="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
   
  <div class="relative w-full max-w-2xl shadow-lg rounded-2xl mx-auto">
   <div class="flex items-center rounded-2xl border-2 border-indigo-400 focus-within:border-red-500 transition-all duration-300 bg-white">
   <span class="material-icons text-gray-400 text-2xl sm:text-3xl mx-2 sm:mx-4">search</span>
   <input
    type="text"
    v-model="searchPhrase"
    @keyup.enter="handleSearch"
    placeholder="ابحث بعنوان الميديا..."
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
  
  <button
   v-if="isAdmin && masterStoryId"
   @click="showAddModal = true"
   class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-xl transition transform hover:scale-105"
  >
   <span class="material-icons">add</span>
   إضافة ميديا جديدة
  </button>
  </div>
 </div>
</div>
 <div v-if="isLoading" class="text-center text-gray-700 py-20">
  <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
  <p class="mt-4">جاري تحميل عناصر الميديا...</p>
 </div>

 <div v-else-if="mediaItems.length > 0" class="space-y-8 max-w-4xl mx-auto">
  <div
  v-for="item in mediaItems"
  :key="item.id"
  class="relative p-6 rounded-2xl bg-gradient-to-br from-purple-300 via-pink-300 to-purple-600 shadow-xl border border-gray-200 overflow-hidden"
  >
  <div v-if="isAdmin" class="absolute top-3 left-3 flex gap-2 z-10">
   <button @click.stop="openEdit(item)" class="p-2 bg-blue-500/80 hover:bg-blue-600 rounded-full text-white shadow-lg" title="تعديل">
   <span class="material-icons text-sm">edit</span>
   </button>
   <button @click.stop="deleteMediaItem(item.id)" class="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white shadow-lg" title="حذف">
   <span class="material-icons text-sm">delete</span>
   </button>
  </div>

  <h3 class="text-2xl font-bold text-gray-800 mb-2 text-center">{{ item.title }}</h3>
  <p class="text-white mb-4 text-center">{{ item.description || 'لا يوجد وصف.' }}</p>

  <div class="w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300 relative">
   
    <template v-if="getIconForUrl(item.url) === 'picture_as_pdf'">
        <div 
          class="h-64 flex flex-col items-center justify-center p-6 text-center bg-white border-4 border-dashed border-red-300 rounded-lg relative"
        >
          <span class="material-icons text-7xl text-red-500 mb-4">picture_as_pdf</span>
          <p class="text-lg font-semibold text-gray-700 mb-4">ملف PDF جاهز للعرض</p>
          
          <a 
      :href="item.url"
      target="_blank"
            @click.stop
      class="inline-flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-xl transition transform hover:scale-105 text-base font-medium"     
            title="فتح ملف PDF في نافذة جديدة"
     >
            <span class="material-icons text-xl">open_in_new</span>
      فتح الملف
     </a>
        </div>
      </template>
   <div 
    v-else-if="getIconForUrl(item.url) === 'videocam'" 
    class="relative w-full" 
    style="padding-top: 56.25%;"
   >
    <iframe 
     :src="getEmbedUrl(item.url)" 
     class="absolute top-0 left-0 w-full h-full"
     frameborder="0" 
     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
     allowfullscreen
     title="مشغل فيديو يوتيوب"
    ></iframe>
   </div>

   <img 
    v-else-if="getIconForUrl(item.url) === 'image'" 
    :src="item.url" 
    :alt="item.title" 
    class="w-full h-auto max-h-[900px] object-contain cursor-pointer transition duration-300 hover:opacity-80" 
    @click="openMediaPopup(item.url)"
   >

   <div 
    v-else 
    class="p-6 text-center text-gray-500 hover:text-purple-600 transition duration-200 cursor-pointer"
    @click="item.url && window.open(item.url, '_blank')"
   >
    <span class="material-icons text-6xl block mx-auto mb-2">{{ getIconForUrl(item.url) }}</span>
    <p>اضغط لتحميل أو فتح الملف المرفق</p>
   </div>

  </div>
  </div>
 </div>

 <div v-else class="text-center py-10 bg-white rounded-xl shadow-lg border-2 border-dashed border-purple-300">
  <span class="material-icons text-6xl text-purple-400">folder_open</span>
  <p class="mt-4 text-xl font-medium text-gray-700">لا توجد عناصر ميديا حالياً لهذه القصة.</p>
  <p v-if="isAdmin" class="mt-2 text-sm text-gray-500">بصفتك مشرف، يمكنك البدء بإضافة ملفات أو صور جديدة.</p>
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
 
 <hr class="my-12 border-t border-purple-400/50 max-w-4xl mx-auto"/>

    <div class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
            <span class="material-icons text-purple-600 text-3xl">comment</span>
            التعليقات ({{ comments.length }})
        </h3>
        
        <div v-if="getToken()" class="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <textarea
                v-model="newCommentContent"
                placeholder="أضف تعليقك هنا..."
                rows="3"
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            ></textarea>
            <div class="flex justify-end mt-3">
                <button 
                    @click="addComment" 
                    :disabled="!newCommentContent.trim()"
                    class="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                    إرسال التعليق
                </button>
            </div>
        </div>
        <div v-else class="mb-8 p-4 text-center bg-yellow-50 border border-yellow-200 rounded-lg text-gray-700">
            يرجى تسجيل الدخول لإضافة تعليق على هذه القصة.
        </div>
        
        <div v-if="isCommentsLoading" class="text-center text-gray-500 py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto"></div>
            <p class="mt-2">جاري تحميل التعليقات...</p>
        </div>
        <div v-else-if="comments.length > 0" class="space-y-4">
            <div v-for="comment in comments" :key="comment.id" class="p-4 bg-white border border-gray-100 rounded-lg shadow-sm relative">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-gray-800">{{ comment.userName || 'مستخدم مجهول' }}</p>
                        <p class="text-xs text-gray-500">{{ new Date(comment.createdAt).toLocaleDateString('ar-EG') }}</p>
                    </div>
                    <button 
                        v-if="isAdmin || comment.canDelete"
                        @click="deleteComment(comment.id)"
                        class="text-red-500 hover:text-red-700 p-1 rounded-full transition"
                        title="حذف التعليق"
                    >
                        <span class="material-icons text-base">delete</span>
                    </button>
                </div>
                <p class="mt-2 text-gray-700">{{ comment.content }}</p>
            </div>
        </div>
        <div v-else class="text-center text-gray-500 py-4">
            كن أول من يعلق على هذه القصة!
        </div>

        <div v-if="commentsTotalPages > 1 && !isCommentsLoading" class="flex justify-center items-center gap-4 mt-8">
            <button
                @click="goToCommentPage(commentsCurrentPage - 1)"
                :disabled="commentsCurrentPage === 1"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed transition hover:bg-gray-300"
            >
                السابق
            </button>
            <span class="text-sm font-medium text-gray-600">
                صفحة {{ commentsCurrentPage }} من {{ commentsTotalPages }}
            </span>
            <button
                @click="goToCommentPage(commentsCurrentPage + 1)"
                :disabled="commentsCurrentPage === commentsTotalPages"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed transition hover:bg-gray-300"
            >
                التالي
            </button>
        </div>
    </div>
     <div v-if="showPopup" class="fixed inset-0 z-[100] flex items-center justify-center">
 <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closePopup"></div>
 <div class="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center">
  
  <button 
   class="absolute top-4 left-4 z-50 p-2 bg-white/30 text-white rounded-full hover:bg-white/50 transition" 
   @click="closePopup"
  >
   <span class="material-icons text-3xl">close</span>
  </button>

  <div class="w-full h-full flex items-center justify-center">
   
   <img v-if="selectedMediaType === 'image'" 
    :src="selectedMediaUrl" 
    class="max-w-full max-h-full object-contain" 
    alt="ميديا مكبرة"
   />
   
   <div v-else-if="selectedMediaType === 'youtube'" 
    class="relative max-w-full w-full max-h-full aspect-video"
   >
    <iframe 
     :src="getEmbedUrl(selectedMediaUrl)" 
     class="absolute top-0 left-0 w-full h-full rounded-lg"
     frameborder="0" 
     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
     allowfullscreen
     title="مشغل فيديو يوتيوب مكبر"
    ></iframe>
   </div>
   
   <p v-else class="text-white text-xl">لا يمكن عرض هذا النوع من الملفات.</p>
  </div>
 </div>
 </div>
 
  <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAddModal = false"></div>
 <div class="relative bg-white rounded-3xl p-6 w-full max-w-2xl mx-4 shadow-2xl transform transition">
  <div class="flex items-start justify-between border-b pb-3 mb-4">
  <h3 class="text-xl font-bold text-gray-800">إضافة عنصر ميديا جديد</h3>
  <button class="text-gray-500 hover:text-gray-700" @click="showAddModal = false">
   <span class="material-icons">close</span>
  </button>
  </div>

  <form @submit.prevent="addMediaItem" class="mt-4 space-y-4">
  <div>
   <label class="block mb-1 text-sm font-medium text-gray-700">العنوان</label>
   <input v-model="newMedia.title" type="text" required
   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" /> 
  </div>

  <div>
   <label class="block mb-1 text-sm font-medium text-gray-700">الوصف</label>
   <textarea v-model="newMedia.description" rows="3"
   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea> 
  </div>

  <div class="space-y-4 p-4 bg-gray-50 rounded-lg border">
   <p class="text-sm font-semibold text-gray-800">اختيار مصدر الميديا (أحدهما فقط):</p>
   
   <div>
    <label class="block mb-1 text-sm font-medium text-gray-700">رابط خارجي (YouTube, PDF Link, إلخ)</label>
    <input 
    type="url" 
    v-model="newMedia.newMediaUrl"
    @input="handleUrlInput"
    placeholder="أدخل رابط YouTube أو ملف خارجي هنا..."
    class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
   </div>

   <div class="text-center text-gray-400 font-medium">-- أو --</div>
   
   <div>
    <label class="block mb-1 text-sm font-medium text-gray-700">رفع ملف (صورة، PDF، إلخ)</label>
    <input type="file" @change="e => handleFileSelected(e, 'new')"
    class="w-full text-sm text-gray-600" :disabled="newMedia.newMediaUrl.length > 0" />
    
    <p v-if="newMedia.url" class="mt-3 text-sm text-green-600 flex items-center gap-2">
     <span class="material-icons text-base">check_circle</span>
     تم الرفع بنجاح: {{ newMedia.url.substring(0, 50) }}...
    </p>
   </div>
  </div>
  

  <div class="flex justify-end gap-3 pt-4 border-t mt-6">
   <button type="button" @click="showAddModal = false"
   class="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">إلغاء</button>
   <button type="submit" :disabled="isUploading || !(newMedia.url || newMedia.newMediaUrl)"
   class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
   <div v-if="isUploading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
   {{ isUploading ? 'جاري الرفع...' : 'إضافة العنصر' }}
   </button>
  </div>
  </form>
 </div>
 </div>

     <div v-if="showEditModal && editingMedia" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showEditModal = false"></div>
 <div class="relative bg-white rounded-3xl p-6 w-full max-w-2xl mx-4 shadow-2xl transform transition">
  <div class="flex items-start justify-between border-b pb-3 mb-4">
  <h3 class="text-xl font-bold text-gray-800">تعديل الميديا: {{ editingMedia.title }}</h3>
  <button class="text-gray-500 hover:text-gray-700" @click="showEditModal = false">
   <span class="material-icons">close</span>
  </button>
  </div>

  <form @submit.prevent="updateMediaItem" class="mt-4 space-y-4">
  <div>
   <label class="block mb-1 text-sm font-medium text-gray-700">العنوان</label>
   <input v-model="editingMedia.title" type="text" required
   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /> 
  </div>

  <div>
   <label class="block mb-1 text-sm font-medium text-gray-700">الوصف</label>
   <textarea v-model="editingMedia.description" rows="3"
   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea> 
  </div>

  <div class="border-t pt-4">
   <label class="block mb-1 text-sm font-medium text-gray-700">استبدال الملف (اختياري)</label>
   <input type="file" @change="e => handleFileSelected(e, 'edit')"
   class="w-full text-sm text-gray-600" />
   
   <div class="mt-3 text-sm text-gray-500">
    الملف الحالي: <a :href="editingMedia.url" target="_blank" class="text-purple-600 hover:underline break-all">{{ editingMedia.url.substring(0, 60) }}...</a>
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