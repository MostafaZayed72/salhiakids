<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCookie } from '#app'; // لاستخدام useCookie لقراءة التوكن

// ----------------------------------------------------
// 1. الثوابت والإعدادات وجلب التوكن
// ----------------------------------------------------
const router = useRouter();
const config = useRuntimeConfig();

// اسم مفتاح التوكن في الكوكيز، تم تأكيده من كود تسجيل الدخول
const AUTH_TOKEN_NAME = 'authToken'; 

// جلب الـ Base URL من الإعدادات العامة
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

// حساب إجمالي عدد الصفحات
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / pageSize.value);
});

// ----------------------------------------------------
// 4. دالة جلب القصص المفضلة (API Call - مع التوكن)
// ----------------------------------------------------
const fetchFavoriteStories = async () => {
  loading.value = true;
  error.value = null;

  // قراءة التوكن من الكوكيز
  const token = useCookie(AUTH_TOKEN_NAME).value;
  
  if (!token) {
    error.value = 'الوصول غير مصرح به. يرجى تسجيل الدخول.';
    loading.value = false;
    // يمكن إضافة توجيه لصفحة تسجيل الدخول هنا: router.push('/login'); 
    return;
  }

  // بناء الـ Body للطلب
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
      // إضافة التوكن إلى رأس الطلب
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // منع Throwing على أخطاء HTTP لـ 4xx
      ignoreResponseError: true, 
    });
    
    // التحقق من رمز الحالة يدوياً إذا استخدمنا ignoreResponseError
    if (response.statusCode >= 400 || response.status >= 400) {
       const status = response.statusCode || response.status;
       throw new Error(`API Error: Status ${status}`);
    }

    stories.value = response.items || [];
    totalItems.value = response.totalCount || 0;

  } catch (err) {
    console.error('Failed to fetch favorite stories:', err);
    
    // فحص رسالة الخطأ لتحديد ما إذا كانت مشكلة مصادقة (401)
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
  // عند تغيير الفلتر، نعود للصفحة الأولى
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
  router.push(`/stories/${storyId}`);
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
          class="story-card"
          @click="handleStoryClick(story.masterStoryId)"
        >
          <img 
            :src="story.imageUrl || '/default-placeholder.jpg'" 
            :alt="story.title" 
            class="story-image"
          />
          <h3 class="story-title">{{ story.title }}</h3>
          <p class="story-summary">{{ story.summary }}</p>
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
  text-align: right;
}
.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
.controls-bar {
  display: flex;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.story-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.2s;
  overflow: hidden;
  text-align: right;
  background-color: #fff;
}
.story-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
.story-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
}
.story-title {
  font-size: 1.2em;
  margin: 10px 0 5px 0;
  color: #2c3e50;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.story-summary {
  font-size: 0.9em;
  color: #7f8c8d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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