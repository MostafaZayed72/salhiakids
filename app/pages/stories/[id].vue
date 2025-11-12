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
// حالة القصة الرئيسية والميديا والقصص المشابهة (تحديث)
// ----------------------
const masterStory = ref({}) // ⭐️ لحفظ كل بيانات القصة (تم إضافته)
const storyTitle = ref('جاري تحميل اسم القصة...')
const mediaItems = ref([])
const isAdmin = ref(false)
const editingComment = ref(null)
const currentUserId = ref(null)
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
// ... (باقي الدوال)

// ----------------------
// منطق المشاركة (Share Logic)
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

// ... (باقي الدوال)
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
        masterStory.value = response.data || {};
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
// جلب عناصر الميديا (من الكود الأصلي)
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
    // Endpoint: api/MediaItems/GetAllMatching
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
// ... (كود الرفع من الكود الأصلي)
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
// ... (كود معالجة الملفات من الكود الأصلي)
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
// ... (كود إضافة الميديا من الكود الأصلي)
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
    // Endpoint: api/MediaItems/Add
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
// ... (كود تحديث الميديا من الكود الأصلي)
    if (!editingMedia.value || isUploading.value) return

    try {
        const body = {
        id: editingMedia.value.id, 
        title: editingMedia.value.title,
        description: editingMedia.value.description || '',
        url: editingMedia.value.url 
        }
        // Endpoint: api/MediaItems/Update
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
// ... (كود حذف الميديا من الكود الأصلي)
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟ سيتم حذفه نهائياً.')) return
    try {
        // Endpoint: api/MediaItems/Delete/{id}
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
// ... (كود فتح النافذة المنبثقة من الكود الأصلي)
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
// ... (كود تحديد الأيقونة من الكود الأصلي)
    if (!url) return 'insert_drive_file'
    url = url.toLowerCase().split('?')[0]
    if (url.match(/\.(jpe?g|png|gif|webp|svg)$/i)) return 'image'
    if (url.match(/(youtu\.be|youtube\.com)/i)) return 'videocam' 
    if (url.match(/\.(mp3|wav|aac)$/i)) return 'volume_up'
    if (url.match(/\.(pdf)$/i)) return 'picture_as_pdf'
    return 'insert_drive_file'
}

const getEmbedUrl = (url) => {
// ... (كود جلب رابط التضمين من الكود الأصلي)
   if (!url) return '';
   const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
   const match = url.match(regExp);
   if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
   }
   return url.startsWith('http') ? url : '';
}

// ----------------------
// منطق التقييم (Rating Logic) (من الكود الأصلي)
// ----------------------

const fetchRating = async (storyId) => {
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
// منطق المفضلة (Favorite Logic) (من الكود الأصلي)
// ----------------------

const toggleFavorite = async () => {
    const storyId = masterStoryId.value
    if (!getToken() || !storyId) {
        alert('يجب تسجيل الدخول لإضافة/إزالة المفضلة.')
        return
    }

    try {
        if (isFavorite.value) {
            // Endpoint: /api/FavoriteStories/Remove (DELETE)
            const endpoint = `/api/FavoriteStories/Remove` 
            const body = { masterStoryIds: [storyId] } 

            await axios.delete(`${API_BASE}${endpoint}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
                data: body // هام جداً لـ DELETE مع Body
            })

        } else {
            // Endpoint: /api/FavoriteStories/Add (POST)
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
    if (!getToken() || !storyId) {
        isFavorite.value = false
        return
    }

    try {
        // Endpoint: /api/FavoriteStories/Get
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
// منطق التعليقات (Comments Logic) (من الكود الأصلي)
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
        fetchMediaItems(),
        fetchRating(id), 
        checkFavoriteStatus(id), 
        fetchComments() // هذه الدالة الآن تستخدم currentUserId
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
 currentPage.value = 1
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
    
    <div v-else class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      
      <div class="lg:w-72 w-full flex-shrink-0 order-1">
        <div class="bg-white rounded-xl shadow-xl p-4 border border-gray-200 sticky top-4 story-sidebar-light">
          
          <h3 class="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2 text-center">تفاصيل القصة</h3>
          
          <div class="space-y-3 text-sm text-gray-700">
            <div class="info-line-light">
              <span class="font-semibold text-gray-800">المؤلف:</span> <span class="text-pink-600">{{ masterStory.authorName || 'غير معروف' }}</span>
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
                </router-link>
            </div>
            <div v-else class="text-center text-sm text-gray-500 py-2">
                لا توجد قصص أخرى في نفس الفئة.
            </div>
        </div>
      </div>

      <div class="lg:flex-1 order-2 w-[90%] text-center mx-auto">
        <div class="bg-white rounded-xl shadow-2xl p-6 border border-gray-200 ">
          
          <div class="text-center pb-4 mb-4 border-b border-gray-300">
            <h1 class="text-2xl font-bold text-gray-800 mb-4">{{ storyTitle }}</h1> 
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
              <div class="text-center">
                  <span class="material-icons text-blue-500 text-2xl">comment</span>
                  <p class="text-gray-800 font-bold">{{ comments.length }}</p>
                  <p class="text-xs text-gray-500">التعليقات</p>
              </div>
          </div>
          
          <h3 class="text-xl font-bold text-gray-800 mb-3">عن القصة</h3>
          <div class="story-image-container-light mb-6 rounded-lg overflow-hidden border border-gray-300">
             <img :src="masterStory.imageUrl || '/default-story-placeholder.jpg'" :alt="storyTitle" class="w-full h-full object-contain bg-gray-50">
          </div>
          <div class="  text-lg leading-relaxed text-gray-700 text-justify mb-8  break-words whitespace-normal overflow-hidden">
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

        <div v-if="String(comment.createdBy) === String(currentUserId) || isAdmin"  class="mt-2 flex space-x-3 space-x-reverse text-sm">
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

<style scoped>
/* التنسيق للغة العربية وتحديد اتجاه الصفحة */
.story-page-container {
 direction: rtl;
 text-align: right;
}

/* تنسيق حاوية الصورة */
.story-image-container-light {
 height: 350px; 
 display: flex;
 justify-content: center;
 align-items: center;
 background-color: #f9f9f9; 
}
.story-image-container-light img {
 object-fit: contain; 
 width: auto; 
 max-width: 100%;
}

/* تنسيق خطوط المعلومات الجانبية */
.info-line-light {
 background-color: #f3f4f6; 
 padding: 8px;
 border-radius: 6px;
 display: flex;
 justify-content: space-between;
}

/* تثبيت اللوحة الجانبية عند التمرير */
@media (min-width: 1024px) {
 .sticky {
 position: sticky;
 top: 2rem;
 }
}

/* تحسين تنسيق محتوى القصة النصي */
.story-content-text-light {
 line-height: 1.8;
 font-size: 1.1rem;
 color: #333; 
 text-align: justify; 
}
.story-content-text-light p {
 margin-bottom: 1.5em;
 text-indent: 1.5em;
}

/* تنسيق النجوم */
.material-icons.text-yellow-500 {
 color: #f59e0b;
}
</style>