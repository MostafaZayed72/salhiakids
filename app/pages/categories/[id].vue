
<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

// ------------------------------------
// Props
// ------------------------------------
const props = defineProps({
 storyCategoryId: {
  type: String,
  required: false,
  default: ''
 }
})

// ------------------------------------
// Helper Function: truncateText
// ------------------------------------
const truncateText = (htmlContent, maxLength) => {
 if (!htmlContent) return ''

 // 1. إزالة جميع وسوم HTML للحصول على النص الخام فقط
 const plainText = htmlContent.replace(/<[^>]+>/g, '')

 // 2. التحقق من طول النص الخام
 if (plainText.length <= maxLength) {
  // إذا كان النص قصير، نعيد المحتوى الأصلي (مع HTML)
  return htmlContent
 }

 // 3. إذا كان النص طويلاً، نجد موضع القطع في النص الخام
 const truncatedPlainText = plainText.substring(0, maxLength)

 // 4. نستخدم النص الخام المقصوص، ونضيف علامة "..."
 return truncatedPlainText + '...'
}

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

// 🌟 حالة الإشعار المخصص (الـ Popup) 🌟
const showCustomAlert = ref(false)
const customAlertMessage = ref('')
const customAlertType = ref('info') // يمكن أن تكون 'success', 'error', 'info'


// 🌟 تحديث نموذج القصة (لإضافة حقل سنة النشر)
const newStory = ref({
 title: '',
 content: '',
 authorName: '',
 mediaType: 0, // 0: لا يوجد, 1: صورة, 2: فيديو (رابط), 3: ملف (PDF)
 mediaUrl: '', // رابط الميديا المرفوعة (صورة، فيديو، ملف)
 coverImageUrl: '', // صورة الغلاف
 fileToUpload: null, // الملف الذي اختاره المستخدم للرفع (للملفات والصور الميديا الجديدة)
 publishYear: null, // سنة النشر
})

const editingStory = ref(null)
const showReviewModal = ref(false)
const totalPages = ref(0)
const currentPage = ref(1)
const searchPhrase = ref('')
const storiesPerPage = 12
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
// Helper: كوكي وتوكن
// ------------------------------------
const getCookie = (name) => {
 const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
 return match ? decodeURIComponent(match[2]) : ''
}
const getToken = () => getCookie('authToken') || getCookie('token') || ''

// ------------------------------------
// Helper: دالة الإشعار المخصص
// ------------------------------------

const displayCustomAlert = (message, type = 'info') => {
 customAlertMessage.value = message;
 customAlertType.value = type;
 showCustomAlert.value = true;
 
 // إخفاء الإشعار تلقائيًا بعد 4 ثوانٍ
 setTimeout(() => {
  showCustomAlert.value = false;
 }, 4000); 
}


// ------------------------------------
// جلب الـ categoryId من الـ URL أو من props
// ------------------------------------
const route = useRoute()
const effectiveCategoryId = ref('')

const resolveCategoryIdFromUrl = () => {
 if (props.storyCategoryId) return props.storyCategoryId
 if (route && route.params) {
  if (route.params.id) return String(route.params.id)
  if (route.params.storyCategoryId) return String(route.params.storyCategoryId)
 }
 if (route && route.query) {
  if (route.query.category) return String(route.query.category)
  if (route.query.storyCategoryId) return String(route.query.storyCategoryId)
 }
 try {
  const u = new URL(window.location.href)
  if (u.searchParams.get('category')) return u.searchParams.get('category')
  if (u.searchParams.get('storyCategoryId')) return u.searchParams.get('storyCategoryId')
  const parts = u.pathname.split('/').filter(Boolean)
  if (parts.length) {
   return parts[parts.length - 1]
  }
 } catch (e) {
  // ignore
 }
 return ''
}

effectiveCategoryId.value = resolveCategoryIdFromUrl()

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
// 2. التحقق من صلاحيات المشرف وتخزين ID المستخدم
// ------------------------------------
const checkAdminStatus = async () => {
 try {
  const response = await axios.get(`${API_BASE}/api/identity/users/me`, {
   headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
  })
  const data = response.data || {}

  isAdmin.value = Array.isArray(data.roles) ? data.roles.includes('Admin') : (data.userTypeName === 'Admin' || data.userTypeValue === 1)
  currentUserId.value = data.id || null;

 } catch (err) {
  console.warn('Admin check failed:', err)
  isAdmin.value = false
  currentUserId.value = null;
 }
}
// ------------------------------------
// 3. جلب القصص (READ)
// ------------------------------------
const fetchStories = async () => {
 const catId = effectiveCategoryId.value
 if (!catId) {
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
   ApprovalStatus: 1,
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
// 4. رفع الصور والملفات
// ------------------------------------
// لرفع الصور (لصورة الغلاف أو صورة الميديا)
const uploadImage = async (file) => {
 if (!file) return ''
 isUploading.value = true // يبدأ الرفع
 try {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`${API_BASE}/api/Upload/UploadImage`, formData, {
   headers: { Authorization: getToken() ? `Bearer ${getToken()}` : undefined }
  })
  return response.data?.url || ''
 } catch (err) {
  console.error('Upload image failed:', err)
  return ''
 } finally {
  isUploading.value = false // ينتهي الرفع
 }
}

const uploadFile = async (file) => {
 if (!file) return ''
 isUploading.value = true
 try {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`${API_BASE}/api/Upload/UploadFile`, formData, {
   headers: { Authorization: getToken() ? `Bearer ${getToken()}` : undefined }
  })
  return response.data?.url || ''
 } catch (err) {
  console.error('Upload file failed:', err)
  return ''
 } finally {
  isUploading.value = false
 }
}
// التعامل مع رفع صورة الغلاف بشكل منفصل
const handleFileSelected = async (event, targetField) => {
 const file = event.target.files?.[0]
 if (!file || isUploading.value) return

 let currentModel = targetField.startsWith('new') ? newStory.value : editingStory.value
 if (!currentModel) return

 // 1. مسح أي URL قديم قبل الرفع
 currentModel.coverImageUrl = ''
 
 // 2. رفع الملف وانتظار الـ URL
 let url = await uploadImage(file)

 // 3. التحقق من نجاح الرفع
 if (url) {
  // نجح الرفع: تعيين الرابط الجديد
  currentModel.coverImageUrl = url
 } else {
  // فشل الرفع: عرض التنبيه
  displayCustomAlert('فشل رفع الملف. الرجاء التأكد من أن الملف صورة.', 'error');
 }
 
 // إعادة تعيين حقل الملف للسماح باختيار ملف جديد
 event.target.value = ''
}
// التعامل مع اختيار ملفات الميديا الجديدة (قبل الرفع عند الإرسال)
const handleFileUploadSelection = (event, isNew) => {
 const file = event.target.files?.[0]
 if (isNew) {
  newStory.value.fileToUpload = file
  // ملاحظة: لا نغير mediaUrl هنا إلا إذا أردنا معاينة محلية (وهي ليست ضرورية للـ API)
 } else if (editingStory.value) {
  editingStory.value.fileToUpload = file
 }
 // يجب مسح mediaUrl إذا تم اختيار ملف جديد ليتم إرسال رابط الملف المرفوع لاحقًا
 if (file && isNew) newStory.value.mediaUrl = ''
 if (file && !isNew) editingStory.value.mediaUrl = ''
}


// ------------------------------------
// 5. إضافة قصة (CREATE)
// ------------------------------------
const addStory = async () => {
 const catId = effectiveCategoryId.value
 if (!catId || isUploading.value || !newStory.value.title || !newStory.value.content) {
  displayCustomAlert('الرجاء ملء الحقول المطلوبة (بما في ذلك العنوان والمحتوى) والتأكد من عدم وجود عملية رفع قيد التنفيذ.', 'error');
  return
 }

 isUploading.value = true // تعيين حالة الرفع قبل البدء

 const storyPayload = {
  storyCategoryId: catId,
  title: newStory.value.title,
  authorName: newStory.value.authorName,
  content: newStory.value.content,
  coverImageUrl: newStory.value.coverImageUrl,
  mediaType: newStory.value.mediaType,
  mediaUrl: newStory.value.mediaUrl || '',
  publishYear: newStory.value.publishYear || 0,
 }

 // منطق رفع الملفات قبل الإرسال
 let uploadMediaUrl = newStory.value.mediaUrl

 try {
  if (newStory.value.fileToUpload) {
   let uploadedUrl = ''
   if (newStory.value.mediaType === 1) { // صورة ميديا
    uploadedUrl = await uploadImage(newStory.value.fileToUpload)
   } else if (newStory.value.mediaType === 4) { // ملف PDF
    uploadedUrl = await uploadFile(newStory.value.fileToUpload)
   }
   if (uploadedUrl) {
    uploadMediaUrl = uploadedUrl
   } else {
    displayCustomAlert('فشل رفع ملف الميديا. يرجى المحاولة مرة أخرى.', 'error');
    return
   }
  }

  storyPayload.mediaUrl = uploadMediaUrl

  await axios.post(`${API_BASE}/api/MasterStories/Add`, storyPayload, {
   headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
  })

  showAddModal.value = false
  newStory.value = { title: '', authorName:'', content: '', mediaType: 0, mediaUrl: '', coverImageUrl: '', fileToUpload: null, publishYear: null }
  currentPage.value = 1
  await fetchStories()

  displayCustomAlert('تمت إضافة القصة بنجاح وهي في انتظار المراجعة.', 'success');
  showReviewModal.value = true
 } catch (err) {
  console.error('Add story failed:', err.response?.data || err)
  displayCustomAlert('فشلت عملية الإضافة: ' + (err.response?.data?.message || 'خطأ غير معروف.'), 'error');
 } finally {
  isUploading.value = false // إعادة الحالة مهما كان نتيجة العملية
 }
}
// ------------------------------------
// 6. تعديل قصة (UPDATE)
// ------------------------------------
const openEdit = (story) => {
 // 🌟 إعداد الحقول الجديدة عند التعديل
 editingStory.value = {
  ...story,
  fileToUpload: null, // مهم: لإعادة اختيار ملف
  publishYear: story.publishYear || null, // التأكد من تعيين القيمة الحالية
 }
 showEditModal.value = true
}

const updateStory = async () => {
 if (!editingStory.value || isUploading.value) return

 isUploading.value = true // تعيين حالة الرفع قبل البدء

 const storyPayload = {
  id: editingStory.value.id,
  storyCategoryId: effectiveCategoryId.value,
  title: editingStory.value.title,
  authorName: editingStory.value.authorName,
  content: editingStory.value.content,
  coverImageUrl: editingStory.value.coverImageUrl || '',
  mediaType: editingStory.value.mediaType,
  mediaUrl: editingStory.value.mediaUrl || '',
  publishYear: editingStory.value.publishYear || 0,
 }

 // منطق رفع الملفات الجديدة عند التعديل
 let uploadMediaUrl = editingStory.value.mediaUrl

 try {
  if (editingStory.value.fileToUpload) {
   let uploadedUrl = ''
   if (editingStory.value.mediaType === 1) {
    uploadedUrl = await uploadImage(editingStory.value.fileToUpload)
   } else if (editingStory.value.mediaType === 3 || editingStory.value.mediaType === 4) {
    uploadedUrl = await uploadFile(editingStory.value.fileToUpload)
   }
   if (uploadedUrl) {
    uploadMediaUrl = uploadedUrl
   } else {
    displayCustomAlert('فشل رفع ملف الميديا الجديد. يرجى المحاولة مرة أخرى.', 'error');
    return
   }
  }

  storyPayload.mediaUrl = uploadMediaUrl

  await axios.put(`${API_BASE}/api/MasterStories/Update`, storyPayload, {
   headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
  })

  showEditModal.value = false
  editingStory.value = null
  await fetchStories()
  displayCustomAlert('تم تحديث القصة بنجاح!', 'success');
 } catch (err) {
  console.error('Update story failed:', err.response?.data || err)
  displayCustomAlert('فشل تحديث القصة: ' + (err.response?.data?.message || 'خطأ غير معروف'), 'error');
 } finally {
  isUploading.value = false // إعادة الحالة
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
  displayCustomAlert('تم حذف القصة بنجاح.', 'success');
 } catch (err) {
  console.error('Delete story failed:', err.response?.data || err)
  displayCustomAlert('فشل حذف القصة: ' + (err.response?.data?.message || 'خطأ غير معروف'), 'error');
 }
}


// ------------------------------------
// حالة البحث الصوتي
// ------------------------------------
const isListening = ref(false);
const voiceTranscript = ref('');
let recognition = null; 

// ------------------------------------
// 8. منطق البحث الصوتي الجديد
// ------------------------------------

// دالة لمعالجة النصوص العربية الناتجة عن التعرف على الكلام (تصحيح التاء المربوطة)
const normalizeArabicTranscript = (text) => {
  if (!text || typeof text !== 'string') return text;
  // قائمة استثناءات شائعة لا يجب فيها تحويل 'ه' إلى 'ة'
  const exceptions = ['وجه', 'فيه', 'منه', 'عليه', 'إليه', 'الله', 'هذه', 'عنه', 'معه', 'نفسه', 'مياهه', 'نهاه', 'سماه', 'أباه', 'رآه'];
  let normalized = text.trim();
  const words = normalized.split(/\s+/);
  const correctedWords = words.map(word => {
    const baseWord = word.replace(/['".,]/g, '');
    if (exceptions.includes(baseWord)) { return word; }
    // محاولة تصحيح التاء المربوطة في نهاية الكلمات
    if (word.endsWith('ه')) { return word.substring(0, word.length - 1) + 'ة'; }
    return word;
  });
  return correctedWords.join(' ');
};

const startVoiceSearch = () => {
  // التحقق من دعم المتصفح
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false; // لا يتوقف تلقائياً
    recognition.interimResults = true; // يعرض النتائج المؤقتة
    recognition.lang = 'ar-SA'; // تعيين اللغة العربية

    recognition.onstart = () => {
      isListening.value = true;
      voiceTranscript.value = 'جاري الاستماع...';
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      // تحديث شريط البحث بالنتيجة
      voiceTranscript.value = finalTranscript || interimTranscript;
      searchPhrase.value = finalTranscript || interimTranscript; 
    };

    recognition.onend = () => {
      isListening.value = false;
      const finalQuery = normalizeArabicTranscript(searchPhrase.value); 
      searchPhrase.value = finalQuery; 
      // بعد الانتهاء من الاستماع، يتم بدء البحث
      if (finalQuery && finalQuery.trim() && finalQuery !== 'جاري الاستماع...') {
        handleSearch(); 
      }
    };

    recognition.onerror = (event) => {
      console.error('خطأ في التعرف على الكلام:', event.error);
      isListening.value = false;
      voiceTranscript.value = 'حدث خطأ في التعرف على الكلام';
    };

    recognition.start();
  } else {
    displayCustomAlert('متصفحك لا يدعم التعرف على الكلام. يرجى استخدام Chrome أو Edge.', 'error');
  }
};

const toggleVoiceSearch = () => {
  if (isListening.value) {
    if (recognition) {
      recognition.stop();
    }
    isListening.value = false;
  } else {
    startVoiceSearch();
  }
};

const handleStopListening = () => {
  if (recognition) {
    recognition.stop();
  }
};
// ------------------------------------
// Lifecycle
// ------------------------------------
onMounted(async () => {
 effectiveCategoryId.value = resolveCategoryIdFromUrl()
 await checkAdminStatus()
 await fetchStories()
})

</script>

<template>
<section class="py-12 bg-white ">
 <div class="container mx-auto px-4">
 <div class="text-center mb-12">
  <h2 class="text-4xl font-bold text-gray-800 mb-3">
  قصص <span class="text-purple-600">هذه الفئة</span>
  </h2>
  <p class="text-lg text-gray-600 max-w-2xl mx-auto">
  تصفح القصص المتاحة في هذه الفئة وابدأ مغامرة جديدة.
  </p>

  <div class="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
    
    <div class="relative max-w-2xl mx-auto w-full"> 
        <div class="flex items-center bg-white border-2 border-purple-600 hover:border-pink-500 rounded-xl shadow-xl overflow-hidden h-14 sm:h-16 w-full">
            <span class="material-icons text-gray-400 px-3 sm:px-4">search</span>
            <input
                type="text"
                v-model="searchPhrase"
                @keyup.enter="handleSearch"
                placeholder="ابحث بعنوان القصة..."
                class="flex-grow w-full h-full px-2 text-gray-800 placeholder-gray-400 focus:outline-white"
                :disabled="isListening"
            >
            
            <div class="flex h-full divide-x divide-gray-200" dir="ltr"> <button 
                    @click="toggleVoiceSearch" 
                    class="flex flex-col items-center justify-center w-12 text-red-500 hover:text-red-600 transition-colors duration-200" 
                    :class="{'animate-ping-slow': isListening}"
                >
                    <span class="material-icons text-lg leading-none">{{ isListening ? 'mic_off' : 'mic' }}</span>
                    <span class="text-[10px] font-medium leading-none mt-[1px] hidden sm:block">صوت</span>
                </button>
                
             
            </div>
        </div>

        <Transition name="custom-fade">
            <div v-if="isListening" class="mt-3 p-3 bg-yellow-100 rounded-xl shadow-lg border border-yellow-400 flex items-center justify-between text-center max-w-full mx-auto">
                <span class="text-sm font-bold text-gray-700">جارٍ الاستماع:</span>
                <span class="text-sm font-medium text-gray-800 mx-2 flex-grow text-right">{{ voiceTranscript }}</span>
                <button @click="handleStopListening" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg ml-2 flex-shrink-0">إيقاف</button>
            </div>
        </Transition>
    </div>
     </div>

  <div class="flex flex-col md:flex-row gap-4 justify-center">
  <button @click="showAddModal = true"
   class="w-full md:w-auto  flex flex-row-reverse items-center mt-4 justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-xl transition transform hover:scale-105">
   شارك موهبتك                               <span class="material-icons text-3xl">library_add</span>
 
  </button>

  <button v-if="isAdmin" @click="navigateTo(`/unpublishedStories/${effectiveCategoryId}`)"
   class="w-full md:w-auto inline-flex items-center mt-4 justify-center gap-2 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xl transition transform hover:scale-105">
   القصص غير المنشورة
  </button>


  </div>



 </div>

 <div v-if="isLoading" class="text-center text-gray-700 py-20">
  <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
  <p class="mt-4">جاري تحميل القصص...</p>
 </div>

 <div v-else-if="stories.length > 0"
  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto ">
  <div v-for="story in stories" :key="story.id"
  class="group relative p-4 rounded-2xl bg-gradient-to-br from-purple-300 to-pink-300  hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-md border border-gray-200 cursor-pointer overflow-hidden"
  @click="navigateTo(`/stories/${story.id}`)">
  <div v-if="isAdmin || (currentUserId && currentUserId.toString() === story.createdBy.toString())"
   class="absolute top-3 left-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition">
   <button @click.stop="openEdit(story)"
   class="p-2 bg-blue-500/80 hover:bg-blue-600 rounded-full text-white shadow-lg" title="تعديل">
   <span class="material-icons text-sm">edit</span>
   </button>
   <button @click.stop="deleteStory(story.id)"
   class="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white shadow-lg" title="حذف">
   <span class="material-icons text-sm">delete</span>
   </button>
  </div>

<div class="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-100 shadow-inner relative">
  <img v-if="story.coverImageUrl" :src="story.coverImageUrl" :alt="story.title"
    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">

  <div v-else-if="story.mediaUrl && story.mediaType === 1"
    class="w-full h-full">
    <img :src="story.mediaUrl" :alt="story.title"
      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
  </div>

  <div v-else-if="story.mediaUrl && story.mediaType === 2 && getYouTubeThumbnail(story.mediaUrl)"
    class="w-full h-full relative">
    <img :src="getYouTubeThumbnail(story.mediaUrl)" :alt="story.title"
      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
    <div class="absolute inset-0 flex items-center justify-center bg-black/30">
      <span class="material-icons text-6xl text-white/90 p-2 rounded-full transform group-hover:scale-110 transition">play_circle_filled</span>
    </div>
  </div>

  <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-semibold bg-gray-200">
    <span v-if="story.mediaType === 2" class="material-icons text-5xl text-red-500/80">play_circle_filled</span>
    <span v-else-if="story.mediaType === 4" class="material-icons text-5xl text-blue-500/80">picture_as_pdf</span>
    <span v-else class="material-icons text-5xl">book</span>
  </div>

  </div>
  <h3 class="text-xl font-bold text-gray-800 text-center mb-1 truncate">{{ story.title }}</h3>

  <div class="flex justify-center items-center gap-1 mb-2">
   <span v-for="i in 5" :key="i" class="material-icons text-xl" :class="{
   'text-yellow-300': i <= Math.round(story.averageRating || 0),
   'text-gray-300': i > Math.round(story.averageRating || 0)
   }">
   {{ i <= Math.round(story.averageRating || 0) ? 'star' : 'star_border' }} </span>
    <span v-if="story.averageRating" class="text-sm font-semibold text-gray-700">
    ({{ (story.averageRating || 0).toFixed(1) }})
    </span>
    <span v-else class="text-sm font-semibold text-gray-500">
    (غير مُقيّم)
    </span>
  </div>
  <p class="text-gray-100 text-center text-sm leading-relaxed min-h-[4.5rem]"
   v-html="truncateText(story.content, 120)">
  </p>
  </div>
 </div>

 <div v-else class="text-center py-10 bg-white rounded-xl shadow-lg border-2 border-dashed border-purple-300">
  <span class="material-icons text-6xl text-purple-400">sentiment_dissatisfied</span>
  <p class="mt-4 text-xl font-medium text-gray-700">لا توجد قصص حالياً في هذا القسم.</p>
  <p v-if="isAdmin || (currentUserId && currentUserId.toString() === story.createdBy.toString())"
  class="mt-2 text-sm text-gray-500">بصفتك مشرف، يمكنك البدء بإضافة قصة جديدة باستخدام الزر البنفسجي في الأعلى.
  </p>
  <p v-else class="mt-2 text-sm text-gray-500">حاول البحث في قسم آخر أو عد لاحقاً.</p>
 </div>

 <div v-if="totalPages > 1 && !isLoading" class="flex justify-center items-center gap-4 mt-8">
  <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
  class="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-purple-700">
  السابق
  </button>
  <span class="text-lg font-medium text-gray-700">
  صفحة **{{ currentPage }}** من **{{ totalPages }}**
  </span>
  <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
  class="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-purple-700">
  التالي
  </button>
 </div>
 </div>

<div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAddModal = false"></div>
    
    <div class="relative bg-gradient-to-br from-purple-300 to-pink-300 rounded-3xl p-6 w-full max-w-2xl mx-4 shadow-2xl transform transition max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-start justify-between border-b pb-3 mb-4">
            <h3 class="text-xl font-bold text-gray-800">إضافة قصة جديدة</h3>
            <button class="text-gray-500 hover:text-gray-700" @click="showAddModal = false">
                <span class="material-icons">close</span>
            </button>
        </div>

        <form @submit.prevent="addStory" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">العنوان</label>
                <input v-model="newStory.title" type="text" required
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            
            <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">اسم المؤلف</label>
                <input v-model="newStory.authorName" type="text" required
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div class="md:col-span-2">
                <label class="block mb-1 text-sm font-medium text-gray-700">المحتوى الأساسي (النص)</label>
                <textarea v-model="newStory.content" rows="6" required
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
            </div>
            
            <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">سنة النشر</label>
                <input v-model.number="newStory.publishYear" type="number" 
                placeholder="مثال: 2024"
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">نوع الميديا المرفقة</label>
                <select v-model.number="newStory.mediaType"
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option :value="0">لا يوجد مرفق</option>
                <option :value="1">صورة</option>
                <option :value="2">رابط فيديو (يوتيوب)</option>
                <option :value="4">ملف (PDF)</option>    </select>
            </div>

            <div class="md:col-span-2">
                <label class="block mb-1 text-sm font-medium text-gray-700">صورة الغلاف (اختياري)</label>
                <input type="file" accept="image/*" @change="e => handleFileSelected(e, 'newCover')"
                class="w-full text-sm text-gray-600" />
                <div v-if="newStory.coverImageUrl" class="mt-3">
                    <img :src="newStory.coverImageUrl" alt="Cover Preview" class="w-40 h-24 object-cover rounded-lg border">
                </div>
            </div>

            <template v-if="newStory.mediaType === 1 || newStory.mediaType === 4">
                <div class="md:col-span-2">
                    <label class="block mb-1 text-sm font-medium text-gray-700">رفع {{ newStory.mediaType === 1 ? 'صورة الميديا' : 'ملف PDF' }}</label>
                    <input type="file" 
                    :accept="newStory.mediaType === 1 ? 'image/*' : 'application/pdf'"
                    @change="e => handleFileUploadSelection(e, true)"
                    class="w-full text-sm text-gray-600" />

                    <div v-if="newStory.fileToUpload" class="mt-3 text-sm text-green-600">
                    تم اختيار ملف: **{{ newStory.fileToUpload.name }}** (سيتم رفعه عند الإرسال)
                    </div>
                </div>
            </template>

            <template v-else-if="newStory.mediaType === 2">
                <div class="md:col-span-2">
                    <label class="block mb-1 text-sm font-medium text-gray-700">رابط فيديو YouTube</label>
                    <input v-model="newStory.mediaUrl" type="url" placeholder="مثال: https://www.youtube.com/watch?v=..."
                    class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
            </template>

            <div class="flex justify-end gap-3 pt-4 border-t mt-6 md:col-span-2">
                <button type="button" @click="showAddModal = false"
                class="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">إلغاء</button>
                <button type="submit" :disabled="isUploading"
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                <div v-if="isUploading"
                class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {{ isUploading ? 'جاري الرفع...' : 'إضافة القصة' }}
                </button>
            </div>
        </form>
    </div>
</div>
<div v-if="showEditModal && editingStory" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showEditModal = false"></div>
    
    <div class="relative bg-gradient-to-br from-purple-300 to-pink-300 rounded-3xl p-6 w-full max-w-2xl mx-4 shadow-2xl transform transition max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-start justify-between border-b pb-3 mb-4">
            <h3 class="text-xl font-bold text-gray-800">تعديل القصة: {{ editingStory.title }}</h3>
            <button class="text-gray-500 hover:text-gray-700" @click="showEditModal = false">
                <span class="material-icons">close</span>
            </button>
        </div>

        <form @submit.prevent="updateStory" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">العنوان</label>
                <input v-model="editingStory.title" type="text" required
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">اسم المؤلف</label>
                <input v-model="editingStory.authorName" type="text" required
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div class="md:col-span-2">
                <label class="block mb-1 text-sm font-medium text-gray-700">المحتوى الأساسي (النص)</label>
                <textarea v-model="editingStory.content" rows="6" required
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            
            <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">سنة النشر</label>
                <input v-model.number="editingStory.publishYear" type="number" 
                placeholder="مثال: 2024"
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">نوع الميديا المرفقة</label>
                <select v-model.number="editingStory.mediaType"
                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option :value="0">لا يوجد مرفق</option>
                <option :value="1">صورة</option>
                <option :value="2">رابط فيديو (يوتيوب)</option>
                <option :value="4">ملف (PDF)</option>
                </select>
            </div>

            <div class="md:col-span-2">
                <label class="block mb-1 text-sm font-medium text-gray-700">صورة الغلاف الحالية (اختياري للتغيير)</label>
                <input type="file" accept="image/*" @change="e => handleFileSelected(e, 'editCover')"
                class="w-full text-sm text-gray-600" />
                <div v-if="editingStory.coverImageUrl" class="mt-3">
                    <img :src="editingStory.coverImageUrl" alt="Cover Preview" class="w-40 h-24 object-cover rounded-lg border">
                </div>
            </div>

            <template v-if="editingStory.mediaType === 1 || editingStory.mediaType === 4">
                <div class="md:col-span-2">
                    <label class="block mb-1 text-sm font-medium text-gray-700">رفع {{ editingStory.mediaType === 1 ? 'صورة الميديا' : 'ملف PDF' }} (اختياري لتغيير الحالي)</label>
                    <input type="file" 
                    :accept="editingStory.mediaType === 1 ? 'image/*' : 'application/pdf'"
                    @change="e => handleFileUploadSelection(e, false)"
                    class="w-full text-sm text-gray-600" />

                    <div v-if="editingStory.mediaUrl && !editingStory.fileToUpload" class="mt-3 text-sm text-gray-500">
                    الرابط الحالي: <a :href="editingStory.mediaUrl" target="_blank" class="text-blue-500 truncate inline-block max-w-full">
                    {{ editingStory.mediaUrl }}
                    </a>
                    </div>
                    <div v-if="editingStory.fileToUpload" class="mt-3 text-sm text-green-600">
                    تم اختيار ملف جديد: **{{ editingStory.fileToUpload.name }}** (سيتم رفعه عند الإرسال)
                    </div>
                </div>
            </template>

            <template v-else-if="editingStory.mediaType === 2">
                <div class="md:col-span-2">
                    <label class="block mb-1 text-sm font-medium text-gray-700">رابط فيديو YouTube</label>
                    <input v-model="editingStory.mediaUrl" type="url" placeholder="مثال: https://www.youtube.com/watch?v=..."
                    class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </template>

            <div class="flex justify-end gap-3 pt-4 border-t mt-6 md:col-span-2">
                <button type="button" @click="showEditModal = false"
                class="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">إلغاء</button>
                <button type="submit" :disabled="isUploading"
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                <div v-if="isUploading"
                class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {{ isUploading ? 'جاري الرفع...' : 'حفظ التغييرات' }}
                </button>
            </div>
        </form>
    </div>
</div> <Transition name="modal">
 <div v-if="showReviewModal"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
  @click.self="showReviewModal = false">
  <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 transform transition-all duration-300">

  <div class="text-center mb-6">
   <div
   class="w-16 h-16 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600 mx-auto mb-4 shadow-md">
   <span class="material-icons text-3xl">rate_review</span>
   </div>
   <h3 class="text-xl font-bold text-gray-800">شكراً لك!</h3>
  </div>

  <p class="text-center text-gray-600 mb-8">
   ✅ تم استلام قصتك بنجاح.
   <br>
   **قصتك قيد المراجعة حالياً من قبل المشرفين، وسيتم نشرها قريباً.**
  </p>

  <button @click="showReviewModal = false"
   class="w-full bg-yellow-500 text-white py-3 rounded-xl hover:bg-yellow-600 transition-colors duration-200 font-semibold shadow-lg">
   فهمت (إغلاق)
  </button>

  </div>
 </div>
 </Transition>

<transition name="fade">
<div v-if="showCustomAlert" class="fixed inset-0 flex items-start justify-center pt-20 z-[9999] pointer-events-none">
    <div 
        :class="{
            'bg-green-500': customAlertType === 'success',
            'bg-red-500': customAlertType === 'error',
            'bg-blue-500': customAlertType === 'info'
        }"
        class="text-white px-6 py-3 rounded-lg shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 max-w-sm w-full mx-4 pointer-events-auto"
        role="alert"
    >
        <div class="flex items-center">
            <span v-if="customAlertType === 'success'" class="material-icons ml-2 text-2xl">check_circle</span>
            <span v-else-if="customAlertType === 'error'" class="material-icons ml-2 text-2xl">error</span>
            <span v-else class="material-icons ml-2 text-2xl">info</span>
            <p class="font-semibold text-lg">{{ customAlertMessage }}</p>
        </div>
    </div>
</div>
</transition>
</section>
</template>



<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>