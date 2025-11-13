<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const masterStoryId = ref('') 

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const emit = defineEmits(['viewMedia']) 
const hoverRating = ref(0)

// ----------------------
// حالة القصة الرئيسية والقصص المشابهة
// ----------------------
const masterStory = ref({}) 
const storyTitle = ref('جاري تحميل اسم القصة...')
// ❌ تم حذف mediaItems
const isAdmin = ref(false)
const editingComment = ref(null)
const currentUserId = ref(null)
const isLoading = ref(true)
const showPopup = ref(false) 
const selectedMediaUrl = ref('')
const selectedMediaType = ref('') 
const isUploading = ref(false) // تم الاحتفاظ بها مؤقتاً إذا كان هناك رفع صور آخر

// ❌ تم حذف newMedia, editingMedia
// ❌ تم حذف totalPages, currentPage, searchPhrase, itemsPerPage

// ⭐️ متغير جديد لتخزين القصص المشابهة
const relatedStories = ref([])

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

const shareStory = () => {
    const url = window.location.href;
    const title = storyTitle.value;

    if (navigator.share) {
        // ⭐️ استخدام Web Share API (الأفضل والأسرع)
        navigator.share({
            title: title,
            url: url,
        }).then(() => {
            console.log('مشاركة ناجحة!');
        }).catch((error) => {
            // يتم استدعاء هذا في حال ألغى المستخدم المشاركة أو فشلت
            console.log('فشلت المشاركة:', error);
        });
    } else {
        // ⭐️ خيار بديل في حال عدم دعم المتصفح
        alert(`يمكنك نسخ رابط القصة مباشرة: \n\n${url}\n\n(المتصفح لا يدعم واجهة Web Share API)`);
        // يمكن هنا أيضاً فتح قائمة منبثقة مصممة بشكل أفضل بدلاً من alert
    }
}

const getCookie = (name) => {
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

// ----------------------
// جلب البيانات الرئيسية
// ----------------------

// ⭐️ تحديث: جلب كامل بيانات القصة وحفظها في masterStory.value
const fetchStoryTitle = async (storyId) => {
  if (!storyId) {
    storyTitle.value = 'القصة غير متوفرة';
    masterStory.value = {};
    return;
  }
  try {
    // Endpoint: api/MasterStories/GetById (صحيح)
    const response = await axios.post(`${API_BASE}/api/MasterStories/GetById`, { id: storyId })
    // لاحظ: إذا كان GetById يرجع Items[0]، فهذا يعني أننا نحتاج إلى masterStory.value = response.data.items[0] || {}
        // نفترض أنه يرجع الكائن مباشرة:
    masterStory.value = response.data || {};
        // إذا كان GetById يرجع نفس هيكل GetAllMatching (بمصفوفة Items)، فاستخدم الكود التالي:
        // masterStory.value = Array.isArray(response.data?.items) ? response.data.items[0] : response.data || {};

    storyTitle.value = masterStory.value.title || 'قصة بدون عنوان'
  } catch (err) {
    console.error('Error fetching story title:', err)
    storyTitle.value = 'خطأ في تحميل اسم القصة'
    masterStory.value = {}
  }
}

// ⭐️ دالة جلب القصص المشابهة (المطلوبة)
const fetchRelatedStories = async (storyCategoryId, currentStoryId) => {
  if (!storyCategoryId) {
    relatedStories.value = [];
    return;
  }

  try {
    // Endpoint: api/MasterStories/GetAllMatching (صحيح)
    const body = {
      storyCategoryId: storyCategoryId,
      ApprovalStatus: 0,
      orderBy: "createdAt",
      descending: true,
      pageNumber: 1,
      pageSize: 50 // جلب بحد أقصى 50 قصة كما طلبت
    };

    const response = await axios.post(`${API_BASE}/api/MasterStories/GetAllMatching`, body);

    // تصفية القصة الحالية من القائمة وعرض أول 5 (للتصميم الجانبي)
    const stories = Array.isArray(response.data?.items) ? response.data.items : [];
    relatedStories.value = stories.filter(s => s.id !== currentStoryId).slice(0, 5); 

  } catch (err) {
    console.error('Error fetching related stories:', err);
    relatedStories.value = [];
  }
}


const openEditComment = (comment) => {
  // التأكد من أن المستخدم الحالي هو صاحب التعليق
  if (comment.createdBy === currentUserId.value || isAdmin.value) {
    // نسخ بيانات التعليق لتجنب التعديل المباشر على الحالة الأصلية
    editingComment.value = { ...comment, newContent: comment.content };
  } else {
    alert('لا تملك صلاحية تعديل هذا التعليق.');
  }
}

// ⭐️ دالة إرسال التعديل
const updateComment = async () => {
  if (!editingComment.value || !getToken()) return;

  const content = editingComment.value.newContent.trim();
  if (!content) return;

  try {
    const body = { id: editingComment.value.id, content: content };
    
    // Endpoint: /api/StoryComments/Update
    await axios.put(`${API_BASE}/api/StoryComments/Update`, body, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    
    editingComment.value = null; // إغلاق نموذج التعديل
    await fetchComments(); // إعادة جلب التعليقات المحدثة
    alert('تم تعديل التعليق بنجاح.');
  } catch (err) {
    console.error('Update comment failed:', err);
    alert('فشل في تعديل التعليق: ' + (err.response?.data?.message || 'خطأ غير معروف.'));
  }
}

// ⭐️ تحديث: دالة الحذف (للتأكد من الصلاحية قبل الحذف)
const deleteComment = async (comment) => {
  // التحقق مرة أخرى من أن المستخدم الحالي هو صاحب التعليق أو مسؤول
  if (comment.createdBy !== currentUserId.value && !isAdmin.value) {
    alert('لا تملك صلاحية حذف هذا التعليق.');
    return;
  }
  
  if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return
  
  try {
  await axios.delete(`${API_BASE}/api/StoryComments/Delete/${comment.id}`, {
   headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
  })
  await fetchComments() 
  alert('تم حذف التعليق بنجاح.')
 } catch (err) {
  console.error('Delete comment failed:', err)
  alert('فشل في حذف التعليق.')
 }
}
// ----------------------
// الدوال الوظيفية
// ----------------------

// التحقق من حالة الإدارة (من الكود الأصلي)
const checkAdminStatus = async () => {
try {
 if (!API_BASE) { isAdmin.value = false; currentUserId.value = null; return }
 // تأكد من وجود التوكن، وإلا ستفشل وتعيّن currentUserId = null 
 if (!getToken()) {
  isAdmin.value = false; 
  currentUserId.value = null;
  return;
 }
 
 // Endpoint: api/identity/users/me
 const response = await axios.get(`${API_BASE}/api/identity/users/me`, {
 headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
 })
 const data = response.data || {}
 isAdmin.value = Array.isArray(data.roles) ? data.roles.includes('Admin') : (data.userTypeName === 'Admin' || data.userTypeValue === 1)
 currentUserId.value = data.id || null // 👈 يجب أن يكون هنا ID المستخدم
} catch (err) {
 console.warn('Admin check failed:', err)
 isAdmin.value = false
 currentUserId.value = null // 👈 إعادة التعيين في حالة الفشل
}
}

// ❌ تم حذف fetchMediaItems
// ❌ تم حذف goToPage
// ❌ تم حذف handleSearch
// ❌ تم حذف uploadFile
// ❌ تم حذف handleFileSelected
// ❌ تم حذف addMediaItem
// ❌ تم حذف handleUrlInput
// ❌ تم حذف openEdit
// ❌ تم حذف updateMediaItem
// ❌ تم حذف deleteMediaItem
// ❌ تم حذف openMediaPopup (تم دمجه في computed property)
// ❌ تم حذف closePopup
// ❌ تم حذف getIconForUrl (تم دمجه في computed property)

// ⭐️ خاصية حاسوبية جديدة لتحديد نوع الميديا الرئيسية
const storyMediaType = computed(() => {
    const type = masterStory.value.mediaTypeName;
    const url = masterStory.value.mediaUrl;

    if (!url || !type) return 'none';
    
    // الاعتماد على النوع الصريح القادم من الـ API أولاً
    if (type === 'Image') return 'image';
    if (type === 'Video' || type === 'YouTube') return 'video'; 
    if (type === 'Audio') return 'audio';
    
    // معالجة ملفات PDF بشكل خاص ضمن "File" أو "Document"
    if (type === 'File' || type === 'Document') {
        if (url.toLowerCase().endsWith('.pdf')) return 'pdf';
        // يمكنك إضافة أنواع أخرى من الملفات هنا إذا لزم الأمر
        return 'file';
    }

    // fallback: التحقق من الرابط إذا لم يكن النوع واضحاً
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';

    return 'file'; // نوع ملف غير محدد
});

const getEmbedUrl = (url) => {
 if (!url) return '';
    // ...
 // منطق تحويل رابط يوتيوب العادي إلى رابط تضمين (embed)
 const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
 const match = url.match(regExp);
 if (match && match[2].length === 11) {
  return `https://www.youtube.com/embed/${match[2]}`; // ⭐️ هذا هو التنسيق الصحيح
 }
 // إذا كان رابط فيديو عادي أو رابط تضمين بالفعل
 return url.startsWith('http') ? url : '';
}

// ----------------------
// منطق التقييم (Rating Logic) (من الكود الأصلي)
// ----------------------

const fetchRating = async (storyId) => {
// ... (باقي الكود كما هو)
if (!getToken() || !storyId) return

try {
// Endpoint: api/StoryRatings/GetRating
const response = await axios.post(`${API_BASE}/api/StoryRatings/GetRating`, { masterStoryId: storyId }, {
headers: { Authorization: `Bearer ${getToken()}` }
})
userRating.value = response.data?.rating || 0
} catch (err) {
userRating.value = 0
}
}

const submitRating = async (rating) => {
// ... (باقي الكود كما هو)
const storyId = masterStoryId.value
if (!getToken() || !storyId) {
alert('يجب تسجيل الدخول لإضافة تقييم.')
return
}

try {
const body = { masterStoryId: storyId, rating: rating }

if (userRating.value > 0) {
// Endpoint: api/StoryRatings/Update
await axios.put(`${API_BASE}/api/StoryRatings/Update`, body, {
headers: { Authorization: `Bearer ${getToken()}` }
})
} else {
// Endpoint: api/StoryRatings/Add
await axios.post(`${API_BASE}/api/StoryRatings/Add`, body, {
headers: { Authorization: `Bearer ${getToken()}` }
})
}

userRating.value = rating
// ⭐️ تحديث بيانات القصة لجلب متوسط التقييم الجديد
    await fetchStoryTitle(storyId);
alert('تم تسجيل تقييمك بنجاح.')
} catch (err) {
console.error('Rating failed:', err)
alert('فشل في تسجيل التقييم.')
}
}

// ----------------------
// منطق المفضلة والتعليقات (باقي الكود كما هو)
// ----------------------

const toggleFavorite = async () => {
    // ... الكود كما هو ...
    const storyId = masterStoryId.value
    if (!getToken() || !storyId) {
        alert('يجب تسجيل الدخول لإضافة/إزالة المفضلة.')
        return
    }

    try {
        if (isFavorite.value) {
            const endpoint = `/api/FavoriteStories/Remove` 
            const body = { masterStoryIds: [storyId] } 

            await axios.delete(`${API_BASE}${endpoint}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
                data: body 
            })

        } else {
            const endpoint = '/api/FavoriteStories/Add'
            const body = { masterStoryIds: [storyId] }

            await axios.post(`${API_BASE}${endpoint}`, body, {
                headers: { Authorization: `Bearer ${getToken()}` }
            })
        }

        isFavorite.value = !isFavorite.value
        alert(isFavorite.value ? 'تمت الإضافة إلى المفضلة! ❤️' : 'تمت الإزالة من المفضلة.')

    } catch (err) {
        console.error('Favorite toggle failed:', err)
        const errorMessage = err.response?.data?.message || 'فشل في تحديث المفضلة.'
        alert(errorMessage)
    }
}


const checkFavoriteStatus = async (storyId) => {
    // ... الكود كما هو ...
    if (!getToken() || !storyId) {
        isFavorite.value = false
        return
    }

    try {
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
    // Endpoint: api/StoryComments/GetAllMatching
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
    // Endpoint: api/StoryComments/Add
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
  isLoading.value = true;
  if (!id) return;

  // 1. جلب بيانات المستخدم أولاً لتعيين currentUserId
  await checkAdminStatus(); 
  
  // 2. جلب القصة أولاً للحصول على storyCategoryId
  await fetchStoryTitle(id);

  // 3. جلب القصص المشابهة بناءً على الفئة
  const categoryId = masterStory.value?.storyCategoryId;
  if (categoryId) {
    await fetchRelatedStories(categoryId, id);
  }
  
  // 4. باقي المهام يمكن أن تُنفّذ بالتوازي
  await Promise.all([
    // ❌ تم حذف fetchMediaItems()
    fetchRating(id), 
    checkFavoriteStatus(id), 
    fetchComments() 
  ]);

  isLoading.value = false;
};
onMounted(async () => {
masterStoryId.value = resolveStoryIdFromUrl();
})

watch(
() => route.params.masterStoryId || route.params.id, 
async (newId) => {
if (newId) {
masterStoryId.value = newId
// ❌ تم حذف currentPage.value = 1
commentsCurrentPage.value = 1
await initializeData(newId) 
}
},
{ immediate: true }
)
</script>

<template>
<div class="story-page-container min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gray-100">
  
 <div v-if="masterStoryId && isLoading" class="text-center py-20 text-xl text-gray-600">جاري تحميل محتوى القصة...</div>
 <div v-else-if="!masterStoryId || !masterStory.id" class="text-center py-20 text-xl text-red-500">عذراً، القصة غير متوفرة أو معرف القصة غير صحيح.</div>
 
 <div v-else class="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse gap-6">
 
   <div class="lg:w-72 w-full flex-shrink-0 order-1">
  
    <div class="bg-white rounded-xl shadow-xl p-4 border border-gray-200 sticky top-4 story-sidebar-light">
  
     <NuxtLink to="/" class="w-full block mb-4">
   <button 
   class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-full shadow-lg hover:bg-purple-700 transition-colors transform hover:scale-105"
   aria-label="العودة للصفحة الرئيسية"
   >
   <span class="material-icons text-xl">home</span>
   <span class="inline">العودة للصفحة الرئيسية</span>
   </button>
  </NuxtLink>

  <h3 class="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2 text-center">تفاصيل القصة</h3>
  
  <div class="space-y-3 text-sm text-gray-700">
   <div class="info-line-light">
   <span class="font-semibold text-gray-800">المؤلف:</span> <span class="text-pink-600">{{ masterStory.author?.fullName || 'غير معروف' }}</span>
   </div>
   <div class="info-line-light">
   <span class="font-semibold text-gray-800">الفئة:</span> <span class="text-pink-600">{{ masterStory.storyCategoryTitle || 'غير مصنف' }}</span>
   </div>
   <div class="info-line-light">
   <span class="font-semibold text-gray-800">النشر:</span> <span class="text-pink-600">{{ masterStory.createdAt ? new Date(masterStory.createdAt).toLocaleDateString('ar-EG') : 'غير متوفر' }}</span>
   </div>
  </div>
  
  </div>

    <div class="bg-white rounded-xl shadow-xl p-4 mt-6 border border-gray-200 story-sidebar-light">
   <h3 class="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2 text-center">قصص مشابهة</h3>
   <div v-if="relatedStories.length > 0" class="space-y-2">
    <router-link
     v-for="story in relatedStories"
     :key="story.id"
     :to="`/stories/${story.id}`"
     class="bg-gray-100 p-2 rounded-lg text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition block cursor-pointer"
    >
     {{ story.title }}
     <img :src="story.coverImageUrl" :alt="story.title" class="mt-2 w-full h-20 object-cover rounded-md">
    </router-link>
   </div>
   <div v-else class="text-center text-sm text-gray-500 py-2">
    لا توجد قصص أخرى في نفس الفئة.
   </div>
  </div>
 </div>

   <div class="lg:flex-1 order-2 w-[90%] mx-auto">
  <div class="bg-white rounded-xl shadow-2xl p-6 border border-gray-200 ">
  
     <div class="text-center pb-4 mb-4 border-b border-gray-300">
   <h1 class="text-2xl font-bold text-gray-800 mb-4">{{ storyTitle }}</h1> 
  </div>

     
  
  

      <div class="media-display-container mb-8 p-4 bg-gray-50 rounded-xl border border-gray-300">
          
          <div v-if="storyMediaType === 'image'" class="flex justify-center">
              <img :src="masterStory.mediaUrl" :alt="storyTitle" class="max-h-96 object-contain rounded-lg shadow-md border" />
          </div>

          <div v-else-if="storyMediaType === 'video' || storyMediaType === 'youtube'" class="aspect-video">
              <iframe 
                  :src="getEmbedUrl(masterStory.mediaUrl)" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen 
                  class="w-full h-full rounded-lg shadow-xl"
              ></iframe>
          </div>

          <div v-else-if="storyMediaType === 'audio'" class="flex justify-center py-6">
              <audio controls :src="masterStory.mediaUrl" class="w-full max-w-lg shadow-lg rounded-full"></audio>
          </div>

          <div v-else-if="storyMediaType === 'pdf'" class="pdf-viewer-container">
              <p class="text-center text-lg text-gray-700 mb-4 flex items-center justify-center">
                  <span class="material-icons text-red-500 text-3xl ml-2">picture_as_pdf</span>
                  ملف PDF قابل للتصفح
              </p>
              <div class="flex justify-center gap-4 mb-6">
                  <a :href="masterStory.mediaUrl" target="_blank" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center text-sm font-semibold">
                      <span class="material-icons text-xl ml-1">open_in_new</span> فتح في نافذة جديدة
                  </a>
                  
              </div>
              <div class="mt-4 border border-gray-400 rounded-lg overflow-hidden h-[600px] w-full mx-auto shadow-inner">
                  <iframe :src="masterStory.mediaUrl" class="w-full h-full" title="PDF Viewer"></iframe>
              </div>
          </div>

          <div v-else-if="storyMediaType === 'none'" class="text-center py-4 text-gray-500">
              لا يوجد محتوى وسائط رئيسي مرتبط بهذه القصة.
          </div>
          <div v-else class="text-center py-4 text-gray-500">
              <span class="material-icons text-4xl text-gray-400 mb-2">insert_drive_file</span>
              <p>هذا ملف من نوع ({{ masterStory.mediaTypeName || 'غير معروف' }}). يمكنك فتحه/تحميله مباشرة.</p>
               <a :href="masterStory.mediaUrl" target="_blank" class="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition inline-flex items-center text-sm font-semibold">
                      <span class="material-icons text-xl ml-1">open_in_new</span> فتح الملف
                  </a>
          </div>

      </div>
        <div class="flex items-center justify-around py-4 bg-gray-100 rounded-lg shadow-inner mb-6 border border-gray-200">
   <div class="text-center">
    <span class="material-icons text-pink-500 text-2xl">star_half</span>
    <p class="text-gray-800 font-bold">{{ masterStory.averageRating?.toFixed(1) || 0 }}</p>
    <p class="text-xs text-gray-500">التقييم</p>
   </div>
   <button @click="shareStory" class="text-center transition-transform hover:scale-105">
  <span class="material-icons text-green-500 text-2xl">share</span>
  <p class="text-xs text-gray-600">مشاركة</p>
  </button>
   <button @click="toggleFavorite" class="text-center transition-transform hover:scale-105">
    <span class="material-icons text-2xl" :class="isFavorite ? 'text-red-500' : 'text-gray-400'">{{ isFavorite ? 'favorite' : 'favorite_border' }}</span>
    <p class="text-xs" :class="isFavorite ? 'text-red-500' : 'text-gray-600'">المفضلة</p>
   </button>
   <div >
    <span class="material-icons text-blue-500 text-2xl">comment</span>
    <p class="text-gray-800 font-bold">{{ masterStory.commentsCount || 0 }}</p>
    <p class="text-xs text-gray-500">التعليقات</p>
   </div>
  </div>
  <div class="text-lg leading-relaxed text-gray-700 text-justify mb-8 break-words whitespace-normal overflow-hidden">
       <div v-html="masterStory.content" class="story-content-text-light"></div>
  </div>

     <h3 class="text-xl font-bold text-gray-800 mb-6 mt-8 border-t border-gray-200 pt-4">التعليقات والتقييمات</h3>
  
     <div class="p-4 bg-gray-100 rounded-xl mb-6 border border-gray-200">
   <span class="block text-right text-sm font-semibold mb-3 text-gray-800">قيم القصة:</span>
   <div class="flex justify-end text-3xl cursor-pointer">
    <span 
     v-for="star in 5" 
     :key="star" 
     @click="submitRating(star)"
     @mouseover="hoverRating = star"
     @mouseleave="hoverRating = 0"
     class="material-icons transition-colors duration-150"
     :class="{'text-yellow-500': star <= (hoverRating || userRating), 'text-gray-300': star > (hoverRating || userRating)}"
    >
     star
    </span>
   </div>
  </div>
  
     <div class="mb-8 p-4 bg-gray-100 rounded-xl border border-gray-200">
   <h4 class="text-gray-800 font-semibold mb-2">أضف تعليقك</h4>
   <textarea 
    v-model="newCommentContent" 
    placeholder="اكتب تعليقك على القصة..." 
    rows="3"
    class="w-full p-3 border border-gray-300 bg-white text-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500 transition-colors resize-none"
   ></textarea>
   <button 
    @click="addComment" 
    :disabled="!newCommentContent.trim()"
    class="mt-2 px-6 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 shadow-md"
   >
    نشر التعليق
   </button>
  </div>

     <div v-if="isCommentsLoading" class="text-center py-8 text-gray-500">جاري تحميل التعليقات...</div>
<div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">لا توجد تعليقات بعد.</div>
<div v-else class="space-y-4">
 <div v-for="comment in comments" :key="comment.id" class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
  <div class="flex justify-between items-center mb-2">
   <p class="font-semibold text-gray-800 flex items-center">
    <span class="material-icons text-purple-600 text-lg ml-2">account_circle</span>
    {{ comment.createdByUserName || 'مستخدم' }}
   </p>
   <span class="text-xs text-gray-500">{{ new Date(comment.createdAt).toLocaleDateString('ar-EG') }}</span>
  </div>
  <p class="mt-1 text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>

  <div v-if="String(comment.createdBy) === String(currentUserId) || isAdmin" class="mt-2 flex space-x-3 space-x-reverse text-sm">
   <button 
    @click="openEditComment(comment)" 
    class="text-blue-500 hover:underline"
   >
    تعديل
   </button>
   <span class="text-gray-400">|</span>
   <button 
    @click="deleteComment(comment)" 
    class="text-red-500 hover:underline"
   >
    حذف
   </button>
  </div>
  </div>
</div>

     <div v-if="commentsTotalPages > 1" class="flex justify-center mt-6 space-x-2">
   <button 
    @click="goToCommentPage(commentsCurrentPage - 1)" 
    :disabled="commentsCurrentPage === 1"
    class="px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
   >
    السابق
   </button>
   <span class="px-3 py-1 text-sm text-gray-600">
    صفحة {{ commentsCurrentPage }} من {{ commentsTotalPages }}
   </span>
   <button 
    @click="goToCommentPage(commentsCurrentPage + 1)" 
    :disabled="commentsCurrentPage === commentsTotalPages"
    class="px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
   >
    التالي
   </button>
  </div>
  </div>
 </div>
 
 </div>
  <div v-if="editingComment" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
  <h3 class="text-xl font-bold text-gray-800 mb-4">تعديل التعليق</h3>
  
  <textarea 
   v-model="editingComment.newContent" 
   placeholder="اكتب تعديلك هنا..." 
   rows="4"
   class="w-full p-3 border border-gray-300 bg-white text-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500 transition-colors resize-none mb-4"
  ></textarea>
  
  <div class="flex justify-end space-x-3 space-x-reverse">
   <button 
    @click="editingComment = null" 
    class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
   >
    إلغاء
   </button>
   <button 
    @click="updateComment" 
    :disabled="!editingComment.newContent.trim()"
    class="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
   >
    حفظ التعديل
   </button>
  </div>
 </div>
</div>
</div>
</template>