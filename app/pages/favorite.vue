<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCookie } from '#app'; 

// ----------------------------------------------------
// 1. الثوابت والإعدادات وجلب التوكن
// ----------------------------------------------------
const router = useRouter();
const config = useRuntimeConfig();

const AUTH_TOKEN_NAME = 'authToken'; 

const API_BASE_URL = config.public.apiBaseUrl || 'https://salhiakids.premiumasp.net';
const API_ENDPOINT = `${API_BASE_URL}/api/FavoriteStories/Get`;

// ----------------------------------------------------
// 2. حالات إدارة البيانات والواجهة
// ----------------------------------------------------
const stories = ref([]);
const loading = ref(true);
const error = ref(null);
const totalItems = ref(0);

// 3. حالات إدارة الفلترة والترقيم
const searchPhrase = ref('');
const pageNumber = ref(1);
const pageSize = ref(10); 
const orderBy = ref('creationDate'); 
const descending = ref(true); 

const totalPages = computed(() => {
 return Math.ceil(totalItems.value / pageSize.value);
});

// ----------------------------------------------------
// 4. دالة جلب القصص المفضلة (API Call - مع التوكن)
// ----------------------------------------------------
const fetchFavoriteStories = async () => {
 loading.value = true;
 error.value = null;

 const token = useCookie(AUTH_TOKEN_NAME).value;
 
 if (!token) {
  error.value = 'الوصول غير مصرح به. يرجى تسجيل الدخول.';
  loading.value = false;
  return;
 }

 const requestBody = {
  pageNumber: pageNumber.value,
  pageSize: pageSize.value,
  searchPhrase: searchPhrase.value,
  orderBy: orderBy.value,
  descending: descending.value,
 };

 try {
  const response = await $fetch(API_ENDPOINT, {
   method: 'POST',
   body: requestBody,
   headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
   },
   ignoreResponseError: true, 
  });
  
  if (response.statusCode >= 400 || response.status >= 400) {
   const status = response.statusCode || response.status;
   throw new Error(`API Error: Status ${status}`);
  }

  stories.value = response.items || [];
  totalItems.value = response.totalCount || 0;

 } catch (err) {
  console.error('Failed to fetch favorite stories:', err);
  
  if (err.message && (err.message.includes('401') || err.message.includes('403') || err.message.includes('Unauthorized'))) {
   error.value = 'انتهت صلاحية الجلسة أو الوصول غير مصرح به. يرجى تسجيل الدخول مجدداً.';
  } else {
   error.value = `حدث خطأ أثناء جلب القصص المفضلة.`;
  }

  stories.value = [];
  totalItems.value = 0;
 } finally {
  loading.value = false;
 }
};

// ----------------------------------------------------
// 5. المراقبة والجلب الأولي
// ----------------------------------------------------
watch([searchPhrase, orderBy, descending], () => {
 if (pageNumber.value !== 1) {
  pageNumber.value = 1;
 } else {
  fetchFavoriteStories();
 }
}, { debounce: 500 });

watch(pageNumber, () => {
 fetchFavoriteStories();
});

onMounted(() => {
 fetchFavoriteStories();
});

// ----------------------------------------------------
// 6. التحويل للمسار المطلوب
// ----------------------------------------------------
const handleStoryClick = (storyId) => {
 // استخدام router.push للتوجيه إلى صفحة القصة
 router.push(`/stories/${storyId}`);
};

// ----------------------------------------------------
// 7. دوال مساعدة للعرض
// ----------------------------------------------------
const isVideo = (url) => {
  if (!url) return false;
  // إزالة Query Parameters للتحقق من الامتداد
  const cleanUrl = url.split('?')[0].toLowerCase();
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some(ext => cleanUrl.endsWith(ext));
};

const handleImageError = (e) => {
  e.target.src = '/hero.jpeg'; // استخدام صورة موجودة فعلياً كبديل
};
</script>

<template>
 <div class="favorite-stories-container">
  <h1 class="page-title">❤️ قصصك المفضلة</h1>

  <div class="controls-bar">
   <input
    type="text"
    placeholder="ابحث في القصص المفضلة..."
    v-model="searchPhrase"
    class="search-input"
   />
   <select v-model="orderBy" class="order-select">
    <option value="creationDate">تاريخ الإضافة</option>
    <option value="title">العنوان</option>
    </select>
   <button 
    @click="descending = !descending"
    class="sort-button"
   >
    {{ descending ? 'ترتيب تنازلي (↓)' : 'ترتيب تصاعدي (↑)' }}
   </button>
  </div>
  
  <p v-if="loading" class="loading-state">جاري تحميل القصص...</p>
  <p v-else-if="error" class="error-state">{{ error }}</p>

  <template v-else>
   <p v-if="stories.length === 0 && !searchPhrase && !orderBy" class="empty-state">
    لم تقم بإضافة أي قصص إلى المفضلة بعد. ابدأ باستكشاف القصص!
   </p>
   <p v-else-if="stories.length === 0" class="empty-state">
    لا توجد قصص مفضلة مطابقة لمعايير البحث الحالية.
   </p>
   
   <div v-else class="stories-grid">
    <div
     v-for="story in stories"
     :key="story.id"
     class="bg-white cursor-pointer rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 border-b-4 border-purple-500 flex flex-col h-full"
     @click="handleStoryClick(story.masterStoryId)"
    >
     
     <div class="relative w-full aspect-square overflow-hidden bg-gray-100 group">
       <!-- عرض الفيديو إذا كان الرابط فيديو -->
       <video
        v-if="isVideo(story.imageUrl || story.coverImageUrl)"
        :src="story.imageUrl || story.coverImageUrl"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        muted
        loop
        playsinline
        onmouseover="this.play()" 
        onmouseout="this.pause()"
       ></video>

       <!-- عرض الصورة إذا لم يكن فيديو -->
       <img 
        v-else
        :src="story.imageUrl || story.coverImageUrl || '/hero.jpeg'" 
        :alt="story.title" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        @error="handleImageError"
       />
     </div>

     <div class="p-5 text-right flex-grow flex flex-col min-w-0">
       <h3 class="text-lg font-bold text-gray-900 mb-2 truncate">{{ story.title }}</h3>
       <p class="text-gray-600 text-sm line-clamp-3 mb-3">{{ story.summary }}</p>
     </div>
    </div>
   </div>
  </template>


  <div v-if="!loading && totalPages > 1" class="pagination-controls">
   <button 
    @click="pageNumber--" 
    :disabled="pageNumber === 1"
    class="page-button"
   >
    &laquo; السابق
   </button>
   
   <span class="page-info">
    صفحة {{ pageNumber }} من {{ totalPages }}
   </span>
   
   <button 
    @click="pageNumber++" 
    :disabled="pageNumber === totalPages"
    class="page-button"
   >
    التالي &raquo;
   </button>
  </div>
 </div>
</template>

<style scoped>
/* التنسيقات (Styles) */
.favorite-stories-container {
 max-width: 1200px;
 margin: 0 auto;
 padding: 20px;
 direction: rtl; 
 text-align: right; /* يحافظ على اتجاه الصفحة الرئيسي */
}
.page-title {
 text-align: center;
 margin-bottom: 30px;
 color: #333;
}
.controls-bar {
 display: flex;
 flex-wrap: wrap;
 gap: 15px;
 margin-bottom: 25px;
 align-items: center;
}
.search-input, .order-select {
 padding: 10px;
 border-radius: 6px;
 border: 1px solid #ddd;
 flex-grow: 1;
}
.order-select {
 flex-grow: 0;
 min-width: 150px;
}
.sort-button {
 padding: 10px 15px;
 border-radius: 6px;
 border: none;
 background-color: #007bff;
 color: white;
 cursor: pointer;
 transition: background-color 0.2s;
}
.sort-button:hover {
  background-color: #0056b3;
}
.stories-grid {
 display: grid;
 grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
 gap: 20px;
}
.story-card {
 border: 1px solid #eee;
 border-radius: 8px;
 padding: 15px;
 cursor: pointer;
 transition: box-shadow 0.3s, transform 0.2s;
 overflow: hidden;
 
  /* ⭐️ تعديل: توسيط المحتوى النصي داخل البطاقة */
 text-align: center; 
 background-color: #fff;
}
.story-card:hover {
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
 transform: translateY(-2px);
}
.story-image {
 width: 100%;
 height: 150px;
 
  /* ⭐️ تعديل: عرض الصورة بالكامل دون قص */
 object-fit: contain; 
  
  /* يجب وضع خلفية للبطاقة أو للصورة لأن 'contain' قد يترك مساحات فارغة */
  background-color: #f8f8f8; 
  
 border-radius: 6px;
 margin-bottom: 10px;
}
.story-title {
 font-size: 1.2em;
 margin: 10px 0 5px 0;
 color: #2c3e50;
  
  /* ⭐️ تعديل: السماح بظهور العنوان كاملاً لضمان التوسيط الجيد */
  white-space: normal; 
  overflow: hidden;
  text-overflow: ellipsis;
  
 text-align: center; /* التأكيد على التوسيط */
}
.story-summary {
 font-size: 0.9em;
 color: #7f8c8d;
 display: -webkit-box;
 -webkit-line-clamp: 3;
 line-clamp: 3;
 -webkit-box-orient: vertical;
 overflow: hidden;
  text-align: right; /* المحتوى النصي العادي يكون محاذي لليمين (لغة عربية) */
}
.pagination-controls {
 display: flex;
 justify-content: center;
 align-items: center;
 margin-top: 30px;
 gap: 10px;
}
.page-button {
 padding: 10px 18px;
 border-radius: 6px;
 border: 1px solid #007bff;
 background-color: white;
 color: #007bff;
 cursor: pointer;
 transition: all 0.2s;
}
.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8f8f8;
}
.page-button:not(:disabled):hover {
  background-color: #007bff;
  color: white;
}
.page-info {
 padding: 0 10px;
 font-weight: bold;
}
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px;
  font-size: 1.1em;
  color: #95a5a6;
}
.error-state {
  color: #e74c3c;
  background-color: #fceae9;
  border-radius: 8px;
  border: 1px solid #e74c3c;
}
</style>