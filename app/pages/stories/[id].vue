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
const isAdmin = ref(false)
const editingComment = ref(null)
const currentUserId = ref(null)
const isLoading = ref(true)
const showPopup = ref(false) 
const selectedMediaUrl = ref('')
const selectedMediaType = ref('') 
const isUploading = ref(false) 
const relatedStories = ref([]) 
const isLiked = ref(false) 
const userRating = ref(0) 

// ----------------------
// حالة الميزات التفاعلية (تعليقات)
// ----------------------
const comments = ref([]) 
const newCommentContent = ref('') 
const isCommentsLoading = ref(true)
const commentsTotalPages = ref(0)
const commentsCurrentPage = ref(1)
const commentsPerPage = 5 

// ----------------------
// الدوال المساعدة الأساسية
// ----------------------

const shareStory = async () => {
    const storyId = masterStoryId.value;
    const url = window.location.href;
    const title = storyTitle.value;
    const platformId = 10;

    if (!storyId) return;

    if (navigator.share) {
        try {
            await navigator.share({ title: title, url: url });
            await sendShareRequest(storyId, platformId);
        } catch (error) {
            console.log('Web Share failed or cancelled:', error);
        }
    } else {
        try {
            await navigator.clipboard.writeText(url);
            alert(`تم نسخ رابط القصة بنجاح: \n\n${url}`);
            await sendShareRequest(storyId, platformId);
        } catch (error) {
            alert(`يمكنك نسخ رابط القصة مباشرة: \n\n${url}\n\n(فشل النسخ التلقائي)`);
        }
    }
}

const sendShareRequest = async (storyId, platformId) => {
      try {
        const body = { masterStoryId: storyId, platform: platformId };
        
        await axios.post(`${API_BASE}/api/StoryShares/Share`, body, {
            headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {} 
        });
        
        // إعادة جلب بيانات القصة بالكامل لتحديث SharesCount (مهم إرسال التوكن هنا أيضاً)
        await fetchStoryTitle(storyId);
    } catch (err) {
        console.error('Share request failed:', err);
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
// جلب البيانات الرئيسية (تم إضافة الـ Token)
// ----------------------
const fetchStoryTitle = async (storyId) => {
    if (!storyId) {
        storyTitle.value = 'القصة غير متوفرة';
        masterStory.value = {};
        isLiked.value = false;
        return;
    }
    try {
        // 🚨🚨🚨 تصحيح المشكلة 3: إضافة الـ Header لتحديد حالة الإعجاب للمستخدم
        const response = await axios.post(`${API_BASE}/api/MasterStories/GetById`, { id: storyId }, {
            headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {} 
        });
        
        const storyData = response.data || {};
        masterStory.value = storyData;

        storyTitle.value = masterStory.value.title || 'قصة بدون عنوان';
        
        // تحديث حالة الإعجاب بناءً على الرد الجديد (لن يكون null إذا كان التوكن صالحاً)
        isLiked.value = storyData.isLikedByCurrentUser === true;
        
    } catch (err) {
        console.error('Error fetching story title:', err);
        storyTitle.value = 'خطأ في تحميل اسم القصة';
        masterStory.value = {};
        isLiked.value = false;
    }
}

const fetchRelatedStories = async (storyCategoryId, currentStoryId) => {
  if (!storyCategoryId) {
    relatedStories.value = [];
    return;
  }

  try {
    const body = {
      storyCategoryId: storyCategoryId,
      ApprovalStatus: 0,
      orderBy: "createdAt",
      descending: true,
      pageNumber: 1,
      pageSize: 50 
    };

    const response = await axios.post(`${API_BASE}/api/MasterStories/GetAllMatching`, body);
    
    const stories = Array.isArray(response.data?.items) ? response.data.items : [];

    const processStoryForDisplay = (story) => {
      if (story.coverImageUrl) return story.coverImageUrl;
      if (story.mediaTypeName === 'Video' || story.mediaUrl?.includes('youtube.com')) {
        const videoIdMatch = story.mediaUrl.match(/(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*)/);
        if (videoIdMatch && videoIdMatch[2].length === 11) return `https://img.youtube.com/vi/${videoIdMatch[2]}/hqdefault.jpg`;
      }
      if (story.mediaTypeName === 'Document' || story.mediaUrl?.toLowerCase().endsWith('.pdf')) return '/pdf-icon-placeholder.png'; 
      if (story.mediaUrl) return story.mediaUrl;
      return '/default-story-placeholder.jpg'; 
    };

    relatedStories.value = stories
      .filter(s => s.id !== currentStoryId)
      .slice(0, 5) 
      .map(story => ({
        ...story,
        displayImage: processStoryForDisplay(story) 
      }));

  } catch (err) {
    console.error('Error fetching related stories:', err);
    relatedStories.value = [];
  }
}


// ----------------------
// منطق الإعجاب (Like Logic)
// ----------------------
const toggleLike = async () => {
    const storyId = masterStoryId.value;
    
    if (!getToken() || !storyId) {
        alert('يجب تسجيل الدخول للإعجاب بالقصة.');
        return;
    }

    try {
        const body = { masterStoryId: storyId };

        await axios.post(`${API_BASE}/api/StoryLikes/Toggle`, body, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });

        // إعادة جلب بيانات القصة بالكامل لتحديث LikesCount و isLikedByCurrentUser
        await fetchStoryTitle(storyId); 
        
       
        
    } catch (err) {
        console.error('Like toggle failed:', err);
        const errorMessage = err.response?.data?.message || 'فشل في تحديث حالة الإعجاب.';
        alert(errorMessage);
    }
}

// ----------------------
// منطق التقييم (Rating Logic)
// ----------------------
const fetchRating = async (storyId) => {
    if (!getToken() || !storyId) { userRating.value = 0; return }
    try {
        // تجلب تقييم المستخدم الخاص (وهو ليس متوفراً في GetById)
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

    const isUpdating = userRating.value > 0;
    
    try {
        const body = { masterStoryId: storyId, rating: rating };

        if (isUpdating) {
            await axios.put(`${API_BASE}/api/StoryRatings/Update`, body, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
        } else {
            await axios.post(`${API_BASE}/api/StoryRatings/Add`, body, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
        }

        userRating.value = rating;
        
        await fetchStoryTitle(storyId);
        
    } catch (err) {
        console.error('Rating failed:', err);
        alert('فشل في تسجيل التقييم.');
    }
}

// ----------------------
// منطق المستخدم والـ Admin (تم تصحيح Endpoint)
// ----------------------
const checkAdminStatus = async () => { 
    const token = getToken();
    if (!token) {
        isAdmin.value = false;
        currentUserId.value = null; 
        return;
    }
    try {
        // 🚨🚨🚨 تصحيح المشكلة 2: استخدام الـ Endpoint الصحيح 'me' (GET)
        const response = await axios.get(`${API_BASE}/api/identity/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const user = response.data;
        
        currentUserId.value = user.id; 
        // افتراض أن حقل الأدمن هو 'isAdmin' أو يمكن التحقق من 'roles'
        isAdmin.value = user.isAdmin === true || user.roles?.includes('Admin') || false; 
    } catch (err) {
        isAdmin.value = false;
        currentUserId.value = null;
        console.error('Failed to fetch user (me) data:', err);
    }
}


const openEditComment = (comment) => { 
    editingComment.value = { ...comment, newContent: comment.content };
}
const updateComment = async () => { 
    if (!editingComment.value) return;
    const body = { 
        id: editingComment.value.id, 
        content: editingComment.value.newContent 
    };
    try {
        await axios.put(`${API_BASE}/api/StoryComments/Update`, body, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        editingComment.value = null;
        await fetchComments();
    } catch (err) {
        console.error('Update comment failed:', err);
        alert('فشل في تعديل التعليق.');
    }
}
const deleteComment = async (comment) => { 
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    try {
        await axios.delete(`${API_BASE}/api/StoryComments/Delete/${comment.id}`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        await fetchComments();
    } catch (err) {
        console.error('Delete comment failed:', err);
        alert('فشل في حذف التعليق.');
    }
}


const storyMediaType = computed(() => { 
    const url = masterStory.value.mediaUrl?.toLowerCase();
    if (!url) return 'none';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.match(/\.(jpeg|jpg|png|gif|webp)$/)) return 'image';
    if (url.match(/\.(mp4|webm|ogg)$/)) return 'video';
    if (url.match(/\.(mp3|wav|oga)$/)) return 'audio';
    if (url.endsWith('.pdf')) return 'pdf';
    return 'file';
})
const getEmbedUrl = (url) => { 
    if (!url) return '';
    const youtubeMatch = url.match(/(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*)/);
    if (youtubeMatch && youtubeMatch[2].length === 11) {
        return `https://www.youtube.com/embed/${youtubeMatch[2]}`;
    }
    return url; 
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
const response = await axios.post(`${API_BASE}/api/StoryComments/GetAllMatching`, body) 

comments.value = Array.isArray(response.data?.items) ? response.data.items : []
commentsTotalPages.value = response.data?.totalPages || 0

// إعادة جلب Story Title لتحديث Comments Count
await fetchStoryTitle(storyId);

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


const goToCommentPage = (page) => {
if (page >= 1 && page <= commentsTotalPages.value) {
commentsCurrentPage.value = page
fetchComments()
}
}


// ----------------------
// تهيئة البيانات والمراقبة
// ----------------------
const trackView = (storyId) => {
    if (!storyId) return;

    // 🕒 استخدام setTimeout لتأخير الريكويست 3 ثواني (3000 ملي ثانية)
    setTimeout(async () => {
        try {
            // استخدام POST وإرسال ID في الرابط
            await axios.post(`${API_BASE}/api/StoryViews/${storyId}/views`),
                null, 
                { withCredentials: true } 

            console.log(`View tracked successfully for story ID: ${storyId}`);
            
          
         
            await fetchStoryTitle(storyId); 

        } catch (err) {
            // من الطبيعي ألا تتطلب هذه الـ API توكن، لكنها قد تفشل لأسباب أخرى
            console.error('Failed to track story view:', err);
        }
    }, 3000); // 3000 ملي ثانية = 3 ثواني
}
const initializeData = async (id) => {
  isLoading.value = true;
  if (!id) return;

  // 1. جلب بيانات المستخدم أولاً (يجب أن يتم أولاً لمعرفة ID المستخدم والتوكن)
  await checkAdminStatus(); 
  
  // 2. جلب القصة مع إرسال التوكن للحصول على حالة الإعجاب والتقييم المتوسط الصحيحة
  await fetchStoryTitle(id);

  // 3. جلب القصص المشابهة
  const categoryId = masterStory.value?.storyCategoryId;
  if (categoryId) {
   await fetchRelatedStories(categoryId, id);
  }
  
  // 4. جلب تقييم المستخدم الحالي (التقييم المحدد)
  await fetchRating(id);

  // 5. جلب التعليقات (القائمة مع الصفحات)
  await fetchComments();

  trackView(id);
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

<div v-else class="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row-reverse gap-6">

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
    <span class="font-semibold text-gray-800">تاريخ الرفع:</span> <span class="text-pink-600">{{ masterStory.createdAt ? new Date(masterStory.createdAt).toLocaleDateString('ar-EG') : 'غير متوفر' }}</span>
    </div>
    <div class="info-line-light" v-if="masterStory.publishYear">
    <span class="font-semibold text-gray-800">سنة النشر:</span> <span class="text-pink-600">{{ masterStory.publishYear}}</span>
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
        <img 
          :src="story.displayImage" 
          :alt="story.title" 
          class="mt-2 w-full h-40 object-contain rounded-md border border-gray-300 shadow-sm"
          >
      </router-link>
    </div>
    
    <div v-else class="text-center text-sm text-gray-500 py-2">
      لا توجد قصص أخرى في نفس الفئة.
    </div>
</div>
</div>

  <div class="lg:flex-1 order-2  mx-auto">
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
      <span class="material-icons text-purple-500 text-2xl">visibility</span> 
      <p class="text-gray-800 font-bold">{{ masterStory.totalViews || 0 }}</p>
      <p class="text-xs text-gray-500">مشاهدة</p>
    </div>
    <div class="text-center">
      <span class="material-icons text-pink-500 text-2xl">star_half</span>
      <p class="text-gray-800 font-bold">{{ masterStory.averageRating?.toFixed(1) || 0 }}</p>
      <p class="text-xs text-gray-500">التقييم</p>
    </div>
    
    <div class="text-center">
      <span class="material-icons text-blue-500 text-2xl">thumb_up_off_alt</span>
      <p class="text-gray-800 font-bold">{{ masterStory.likesCount || 0 }}</p>
      <p class="text-xs text-gray-500">إعجاب</p>
    </div>

    <button @click="shareStory" class="text-center transition-transform hover:scale-105">
      <span class="material-icons text-green-500 text-2xl">share</span>
      <p class="text-gray-800 font-bold">{{ masterStory.sharesCount || 0 }}</p>
      <p class="text-xs text-gray-600">مشاركة</p>
    </button>
    
    <div 
      @click="toggleLike" 
      class="text-center transition-transform hover:scale-105 cursor-pointer"
      v-if="masterStory.isLikedByCurrentUser !== null"
    >
      <span class="material-icons text-2xl" :class="isLiked ? 'text-blue-600' : 'text-gray-400'">{{ isLiked ? 'thumb_up_alt' : 'thumb_up_off_alt' }}</span>
      <p class="text-xs" :class="isLiked ? 'text-blue-600' : 'text-gray-600'">إعجاب</p>
    </div>
    <div v-else class="text-center">
      <span class="material-icons text-2xl text-gray-400">thumb_up_off_alt</span>
      <p class="text-xs text-gray-400">إعجاب (تسجيل دخول)</p>
    </div>

    <div class="text-center">
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