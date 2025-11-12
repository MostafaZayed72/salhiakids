<template>
<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-right">
<div class="max-w-7xl mx-auto">

    <div class="mb-12 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
    <div class="flex items-center gap-4 mb-8">
      <span class="material-icons text-purple-600 text-3xl">search</span>
      <h1 class="text-3xl font-extrabold text-gray-900">نتائج البحث</h1>
    </div>

    <div class="flex flex-col md:flex-row items-center gap-4">
      <div class="relative flex-grow w-full">
        <input 
          type="text" 
          placeholder="ابحث بالموضوع، أو المؤلف، أو العنوان..." 
          class="w-full py-3 pr-12 pl-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors bg-gray-50 text-gray-800"
          v-model="searchPhrase"
          @keyup.enter="performSearch"
          :disabled="isListening"
        >
        <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
      </div>

      <div class="flex items-center gap-3 flex-shrink-0">
        <button 
          @click="toggleVoiceSearch" 
          :class="{'animate-ping-slow bg-red-600': isListening, 'bg-red-500': !isListening}"
          class="flex items-center gap-1 px-4 py-3 text-white rounded-xl hover:bg-red-600 transition-colors shadow-md"
        >
          <span class="material-icons text-xl">{{ isListening ? 'mic_off' : 'mic' }}</span>
          <span class="font-medium">{{ isListening ? 'إيقاف' : 'صوت' }}</span>
        </button>
        <button 
          @click="toggleFilterDropdown" 
          :class="{'bg-purple-600': showFilterDropdown, 'bg-purple-500': !showFilterDropdown}"
          class="flex items-center gap-1 px-4 py-3 text-white rounded-xl hover:bg-purple-600 transition-colors shadow-md"
        >
          <span class="material-icons text-xl">filter_list</span>
          <span class="font-medium">فلتر</span>
        </button>
      </div>
    </div>

    <Transition name="custom-fade">
      <div v-if="isListening" class="mt-3 p-3 bg-yellow-100 rounded-xl shadow-lg border border-yellow-400 flex items-center justify-between text-center shadow-inner">
        <span class="text-sm font-bold text-gray-700">جارٍ الاستماع:</span>
        <span class="text-sm font-medium text-gray-800 mx-2 flex-grow text-right">{{ voiceTranscript }}</span>
        <button @click="handleStopListening" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg ml-2 flex-shrink-0">إيقاف</button>
      </div>
    </Transition>

    <Transition name="custom-slide-down">
      <div v-if="showFilterDropdown" class="mt-4 bg-white border border-gray-200 rounded-xl shadow-xl text-right p-4">
        <label for="category-select" class="block mb-2 font-bold text-gray-700">تصفية حسب القسم:</label>
        <select 
          id="category-select"
          v-model="selectedCategory" 
          @change="performSearch" 
          class="w-full py-3 border border-gray-300 rounded-lg p-2 bg-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
        >
          <option value="">-- جميع الأقسام --</option>
          <option v-for="cat in storyCategories" :key="cat.id" :value="cat.id">{{ cat.title }}</option>
        </select>
      </div>
    </Transition>
 </div>
  
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
    <h2 class="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0 flex items-center gap-3">
      <span class="material-icons text-purple-600 text-4xl">inventory_2</span>
      <span>نتائج البحث ({{ totalItemsCount }} قصة)</span>
    </h2>
    
    <div class="flex items-center text-sm text-gray-600 gap-4 flex-wrap">
      <div class="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
        <span class="material-icons text-base text-purple-500">timer</span>
        <span class="mt-1">الوقت المستغرق: 0.5 ثانية</span>
      </div>
      
            <!-- <div class="flex items-center gap-3 border-r pr-3 border-gray-300">
        <span class="text-sm font-semibold text-gray-700">الكل ({{ totalItemsCount }})</span>
        <span class="text-sm text-gray-500">فيديو ({{ totalVideosCount }})</span>
        <span class="text-sm text-gray-500">صور ({{ totalImagesCount }})</span>
        <span class="text-sm text-gray-500">PDF ({{ totalPdfsCount }})</span>
      </div> -->
    </div>
  </div>
  
  <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
    <div class="flex items-center gap-4">
      <select 
        v-model="orderBy" 
        @change="performSearch"
        class="px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-purple-500"
      >
        <option value="createdAt">الأحدث</option>
        <option value="title">العنوان</option>
        <option value="averageRating">الأعلى تقييماً</option>
      </select>
      <button @click="toggleDescending" class="px-2 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition-colors">
        <span v-if="descending" class="material-icons text-gray-600 ">arrow_downward</span>
        <span v-else class="material-icons text-gray-600 ">arrow_upward</span>
      </button>
    </div>

    <div class="flex items-center border border-gray-300 rounded-lg p-1 bg-white">
      <button @click="viewMode = 'grid'" :class="{'bg-purple-500 text-white shadow-md': viewMode === 'grid', 'text-gray-600 hover:bg-gray-100': viewMode !== 'grid'}" class="p-2 rounded-lg transition-colors">
        <span class="material-icons text-xl">grid_view</span>
      </button>
      <button @click="viewMode = 'list'" :class="{'bg-purple-500 text-white shadow-md': viewMode === 'list', 'text-gray-600 hover:bg-gray-100': viewMode !== 'list'}" class="p-2 rounded-lg transition-colors">
        <span class="material-icons text-xl">view_list</span>
      </button>
    </div>
  </div>

 <div v-if="loading" class="text-center py-10">
 <div class="flex flex-col items-center justify-center">
 <div class="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-3"></div>
 <p class="text-purple-600 font-medium">جاري جلب القصص المطابقة...</p>
 </div>
</div>

<div v-else-if="error" class="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
 <p class="font-bold">خطأ في الاتصال!</p>
 <p class="text-sm">{{ error }}</p>
</div>

<div v-else-if="stories.length === 0" class="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
 <span class="material-icons text-6xl text-gray-400 mb-4">sentiment_dissatisfied</span>
 <p class="text-xl font-bold text-gray-700 mb-2">عفواً، لا توجد قصص مطابقة</p>
 <p class="text-gray-500">حاول البحث بكلمات مفتاحية مختلفة أو إزالة بعض الفلاتر.</p>
</div>

 <div v-else :class="{'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8': viewMode === 'grid', 'space-y-6': viewMode === 'list'}">
  <div 
 v-for="story in stories" 
 :key="story.id" 
 :class="{'flex gap-4 p-4': viewMode === 'list', 'flex-col': viewMode === 'grid'}"
 class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 border-b-4 border-purple-500"
 >
     <div 
   :class="{
        'w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden': viewMode === 'list', 
        // Fix: استخدام aspect-ratio و object-cover لضمان وضوح الصورة العمودية دون تشويه
        'relative w-full aspect-square overflow-hidden': viewMode === 'grid'
      }"
   class="image-container"
  >
   <img 
    :src="story.imageUrl || '/images/placeholder.jpg'" 
    :alt="story.title || 'صورة القصة'" 
    class="w-full h-full object-cover"
   >
  </div>
 <div :class="{'p-0': viewMode === 'list'}" class="p-5 text-right flex-grow">
 <h3 class="text-lg font-bold text-gray-900 mb-2 truncate">{{ story.title }}</h3>
 <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ story.content }}</p>
 <div class="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full inline-block">
 {{ story.storyCategoryTitle }}
 </div>
 <NuxtLink :to="`/stories/${story.id}`" class="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200 gap-1">
 <span>قراءة القصة</span>
 <span class="material-icons text-base">arrow_forward</span>
 </NuxtLink>
 </div>
 </div>
</div>
 
  <div v-if="totalPages > 1 && stories.length > 0" class="flex justify-center mt-12">
  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination" dir="ltr">
   <button
    @click="goToPage(currentPage - 1)"
    :disabled="currentPage <= 1"
    :class="{'opacity-50 cursor-not-allowed': currentPage <= 1}"
    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
   >
    <span class="sr-only">السابق</span>
    <span class="material-icons text-base">chevron_left</span>
   </button>

   <button
    v-for="page in pagesToShow"
    :key="page"
    @click="goToPage(page)"
    :aria-current="page === currentPage ? 'page' : undefined"
    :class="{
     'z-10 bg-purple-50 border-purple-500 text-purple-600': page === currentPage,
     'bg-white border-gray-300 text-gray-700 hover:bg-gray-50': page !== currentPage,
     'pointer-events-none': page === '...'
    }"
    class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
   >
    {{ page }}
   </button>

   <button
    @click="goToPage(currentPage + 1)"
    :disabled="currentPage >= totalPages"
    :class="{'opacity-50 cursor-not-allowed': currentPage >= totalPages}"
    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
   >
    <span class="sr-only">التالي</span>
    <span class="material-icons text-base">chevron_right</span>
   </button>
  </nav>
 </div>

</div>
</div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios'; 

const route = useRoute();
const router = useRouter();

// ------------------------------------------------------------------
// 1. المتغيرات والحالة
// ------------------------------------------------------------------
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const stories = ref([]);
const loading = ref(false);
const error = ref(null);

// حالة العرض والترتيب
const viewMode = ref('grid'); 
const pageSize = 8; 

// حالة البحث والفلترة (متغيرات محلية)
const searchPhrase = ref(route.query.q || "");
const selectedCategory = ref(route.query.category || "");
const orderBy = ref(route.query.orderBy || "createdAt");
const descending = ref(route.query.descending === 'false' ? false : true);

// حالة الفلتر والصوت
const storyCategories = ref([]);
const showFilterDropdown = ref(false);
const isListening = ref(false);
const voiceTranscript = ref('');
let recognition = null; 

// حالة التصفح والإحصائيات
const totalPages = ref(1);
const totalItemsCount = ref(0);
const totalVideosCount = ref(0); 
const totalImagesCount = ref(0); 
const totalPdfsCount = ref(0); 

const currentPage = computed(() => {
 const page = parseInt(route.query.page);
 return (page && page > 0) ? page : 1;
});

const getToken = () => localStorage.getItem('authToken'); 

// ------------------------------------------------------------------
// 2. دالة جلب نتائج البحث من الـ API (POST)
// ------------------------------------------------------------------
const fetchStories = async () => {
loading.value = true;
error.value = null;
stories.value = [];
totalPages.value = 1;
totalItemsCount.value = 0;
totalVideosCount.value = 0; 
totalImagesCount.value = 0; 
totalPdfsCount.value = 0; 

const pageNumber = currentPage.value;

const requestBody = {
pageNumber: pageNumber,
pageSize: pageSize, 
orderBy: orderBy.value, 
descending: descending.value,
ApprovalStatus: 0, 

searchPhrase: searchPhrase.value, 
storyCategoryId: selectedCategory.value || null,
};

try {
const response = await axios.post(`${API_BASE}/api/MasterStories/GetAllMatching`, requestBody, {
headers: {
 'Content-Type': 'application/json',
 ...(getToken() && { Authorization: `Bearer ${getToken()}` })
}
});

const data = response.data;
if (data && Array.isArray(data.items)) {
stories.value = data.items;
 totalPages.value = data.totalPages || 1;
 totalItemsCount.value = data.totalItemsCount || 0;
 // تحديث متغيرات الإحصائيات 
 totalVideosCount.value = data.totalVideosCount || 0; 
 totalImagesCount.value = data.totalImagesCount || 0;
 totalPdfsCount.value = data.totalPdfsCount || 0;
} else {
stories.value = [];
totalPages.value = 1;
totalItemsCount.value = 0;
}
} catch (err) {
console.error('Search API Error:', err);
error.value = 'فشل في جلب نتائج البحث من الخادم.';
} finally {
loading.value = false;
 window.scrollTo(0, 0); 
}
};

// ------------------------------------------------------------------
// 3. منطق البحث والفلترة والترتيب
// ------------------------------------------------------------------

// جلب الأقسام (للفلتر)
const fetchCategories = async () => {
 try {
  const body = {
   searchPhrase: "", orderBy: "title", descending: false, pageNumber: 1, pageSize: 100
  };
  const response = await axios.post(`${API_BASE}/api/StoryCategories/GetAllMatching`, body);
  if (response.data && response.data.items) {
   storyCategories.value = response.data.items.map(item => ({ id: item.id, title: item.title }));
  }
 } catch (error) {
  console.error("Error fetching categories:", error);
 }
};

// عند أي تغيير يؤثر على البحث (كلمة، فلتر، ترتيب)، يتم تحديث الـ URL
const performSearch = () => {
  const query = {};
  if (searchPhrase.value && searchPhrase.value.trim()) query.q = searchPhrase.value.trim();
  if (selectedCategory.value) query.category = selectedCategory.value;
  if (orderBy.value) query.orderBy = orderBy.value;
  if (descending.value !== true) query.descending = false; 
  
  // دائماً نبدأ من الصفحة الأولى عند تغيير معايير البحث
  router.push({ query: { ...query, page: 1 } });
};

// عند تبديل الاتجاه (descending)
const toggleDescending = () => {
  descending.value = !descending.value;
  performSearch(); // استدعاء performSearch لتحديث الـ URL وإعادة الجلب
};

// دالة للانتقال إلى صفحة معينة وتحديث الـ URL (تستخدمها Pagination)
const goToPage = (page) => {
 if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
  router.push({
   query: { ...route.query, page: page }
  });
 }
};

const toggleFilterDropdown = () => {
 showFilterDropdown.value = !showFilterDropdown.value;
};

// ------------------------------------------------------------------
// 4. منطق البحث الصوتي
// ------------------------------------------------------------------

const startVoiceSearch = () => {
 if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'ar-SA';

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
   voiceTranscript.value = finalTranscript || interimTranscript;
   searchPhrase.value = finalTranscript || interimTranscript; 
  };

  recognition.onend = () => {
   isListening.value = false;
   if (searchPhrase.value && searchPhrase.value.trim() && searchPhrase.value !== 'جاري الاستماع...') {
    performSearch(); 
   }
  };

  recognition.onerror = (event) => {
   console.error('خطأ في التعرف على الكلام:', event.error);
   isListening.value = false;
   voiceTranscript.value = 'حدث خطأ في التعرف على الكلام';
  };

  recognition.start();
 } else {
  alert('متصفحك لا يدعم التعرف على الكلام. يرجى استخدام Chrome أو Edge.');
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

// ------------------------------------------------------------------
// 5. التنفيذ والمراقبة 
// ------------------------------------------------------------------

// دالة مساعدة لتحديث الحالة المحلية من الـ URL query
const updateStateFromRoute = () => {
  searchPhrase.value = route.query.q || "";
  selectedCategory.value = route.query.category || "";
  orderBy.value = route.query.orderBy || "createdAt";
  descending.value = route.query.descending === 'false' ? false : true;
};

// مراقبة route.query بالكامل: عند أي تغيير في الـ URL query، نقوم بتحديث الحالة المحلية ثم إعادة جلب البيانات
watch(
() => route.query, 
(newQuery) => {
  updateStateFromRoute(); 
 fetchStories();
}, 
{ deep: true } 
);

onMounted(() => {
  fetchCategories();
  updateStateFromRoute(); 
  fetchStories();
});

// ------------------------------------------------------------------
// 6. دوال مساعدة أخرى
// ------------------------------------------------------------------
const pagesToShow = computed(() => {
  const pages = [];
  const maxPages = totalPages.value;
  const current = currentPage.value;
  const boundary = 2;

  if (maxPages <= 1) return [];

  if (1 <= maxPages) pages.push(1);

  for (let i = 2; i < maxPages; i++) {
    if (i < current - boundary || i > current + boundary) {
      if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    } else {
      pages.push(i);
    }
  }

  if (maxPages > 1 && pages[pages.length - 1] !== maxPages) pages.push(maxPages);
  
  return pages.filter((value, index, self) => self.indexOf(value) === index);
});
</script>

<style scoped>
/* الأنماط الخاصة بالحركات */
.custom-slide-down-enter-active,
.custom-slide-down-leave-active,
.custom-fade-enter-active,
.custom-fade-leave-active {
 transition: all 0.3s ease-out;
}
.custom-slide-down-enter-from,
.custom-slide-down-leave-to {
 opacity: 0;
 transform: scaleY(0.9);
}
.custom-fade-enter-from,
.custom-fade-leave-to {
 opacity: 0;
}

@keyframes ping-slow {
 0%, 100% { background-color: #ef4444; } /* red-500 */
 50% { background-color: #b91c1c; } /* red-700 */
}
.animate-ping-slow { animation: ping-slow 1.5s cubic-bezier(0,0,0.2,1) infinite; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* ⭐️ النمط الجديد لضمان تناسب الصورة ( aspect-ratio: 1/1 ) */
.aspect-square {
  /* Tailwind CSS aspect-square class */
  aspect-ratio: 1 / 1;
}

.aspect-video {
  /* Tailwind CSS aspect-video class */
  aspect-ratio: 16 / 9;
}
</style>