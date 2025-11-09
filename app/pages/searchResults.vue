<template>
 <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-right">
  <div class="max-w-7xl mx-auto">
    
   <h2 class="text-3xl font-extrabold text-gray-900 mb-8 flex items-center justify-start gap-3">
    <span class="material-icons text-indigo-600 text-4xl">inventory_2</span>
    <span>نتائج البحث ({{ totalItemsCount }} قصة)</span>
   </h2>
   
      <div v-if="loading" class="text-center py-10">
    <div class="flex flex-col items-center justify-center">
     <div class="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3"></div>
     <p class="text-indigo-600 font-medium">جاري جلب القصص المطابقة...</p>
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

   <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div 
     v-for="story in stories" 
     :key="story.id" 
     class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 border-b-4 border-indigo-500"
    >
     <img 
      :src="story.imageUrl || '/images/placeholder.jpg'" 
      alt="صورة القصة" 
      class="w-full h-48 object-cover"
     >
     <div class="p-5 text-right">
      <h3 class="text-lg font-bold text-gray-900 mb-2 truncate">{{ story.title }}</h3>
      <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ story.content }}</p>
      <div class="text-xs text-indigo-600 font-semibold bg-indigo-100 px-2 py-0.5 rounded-full inline-block">
       {{ story.storyCategoryTitle }}
      </div>
      <NuxtLink :to="`/stories/${story.id}`" class="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200 gap-1">
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
                <span class="sr-only">Previous</span>
                <span class="material-icons text-base">chevron_right</span>
            </button>

            <button
                v-for="page in pagesToShow"
                :key="page"
                @click="goToPage(page)"
                :aria-current="page === currentPage ? 'page' : undefined"
                :class="{
                    'z-10 bg-indigo-50 border-indigo-500 text-indigo-600': page === currentPage,
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
                <span class="sr-only">Next</span>
                <span class="material-icons text-base">chevron_left</span>
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

// حالة التصفح
const totalPages = ref(1);
const totalItemsCount = ref(0);
const pageSize = 12; // حجم الصفحة الافتراضي

// رقم الصفحة الحالي: يتم قراءته من الـ URL أو الافتراض على 1
const currentPage = computed(() => {
    // التأكد من أن القيمة عدد صحيح وموجب، وإلا العودة لـ 1
    const page = parseInt(route.query.page);
    return (page && page > 0) ? page : 1;
});

// دالة مساعدة لجلب التوكن
const getToken = () => localStorage.getItem('authToken'); 

// ------------------------------------------------------------------
// 2. دالة جلب نتائج البحث من الـ API (POST)
// ------------------------------------------------------------------
const fetchStories = async () => {
 loading.value = true;
 error.value = null;
 stories.value = [];
  totalPages.value = 1; // إعادة تعيين التصفح

 // قراءة معايير البحث من الـ URL Query Parameters
 const { q, category, ageGroup, contentType } = route.query;
  const pageNumber = currentPage.value;

 // 1. بناء جسم الطلب (Request Body)
 const requestBody = {
  pageNumber: pageNumber, // ⬅️ يستخدم رقم الصفحة الحالي (بدلاً من 0 الثابت)
  pageSize: pageSize, 
  orderBy: "createdAt", 
  descending: true,
  isApproved: true, 

  searchPhrase: q || "", 
  storyCategoryId: category || null,
 };
 
 // 2. تنفيذ طلب POST
 try {
  const response = await axios.post(`${API_BASE}/api/MasterStories/GetAllMatching`, requestBody, {
   headers: {
    'Content-Type': 'application/json',
    ...(getToken() && { Authorization: `Bearer ${getToken()}` })
   }
  });

  // 3. معالجة الاستجابة وتحديث حالة التصفح
  const data = response.data;
  if (data && Array.isArray(data.items)) {
   stories.value = data.items;
      totalPages.value = data.totalPages || 1;
      totalItemsCount.value = data.totalItemsCount || 0;
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
    // التأكد من وجود المستخدم في بداية الصفحة بعد جلب النتائج
    window.scrollTo(0, 0); 
 }
};

// ------------------------------------------------------------------
// 3. منطق التصفح (Pagination Logic)
// ------------------------------------------------------------------

// دالة للانتقال إلى صفحة معينة وتحديث الـ URL
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
        // تحديث الـ query parameter 'page' في الـ URL
        router.push({
            query: { ...route.query, page: page }
        });
    }
};

// Computed property لعرض أزرار الصفحات (لتجنب عرض آلاف الأزرار)
const pagesToShow = computed(() => {
    const pages = [];
    const maxPages = totalPages.value;
    const current = currentPage.value;
    const boundary = 2; // عدد الصفحات التي تعرض قبل وبعد الصفحة الحالية

    // عرض أول صفحة
    if (maxPages > 0) pages.push(1);

    for (let i = 2; i < maxPages; i++) {
        // إضافة نقاط (...) إذا كانت الصفحة بعيدة جداً
        if (i < current - boundary || i > current + boundary) {
            if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        } else {
            pages.push(i);
        }
    }

    // عرض آخر صفحة (إذا لم تكن هي نفسها الصفحة الأولى)
    if (maxPages > 1) {
        if (pages[pages.length - 1] !== '...' && pages[pages.length - 1] !== maxPages) {
             // تجنب عرض الصفحة الأخيرة مرتين
             if (pages.length > 0 && pages[pages.length - 1] !== maxPages) {
                pages.push(maxPages);
             } else if (pages.length === 0) {
                 pages.push(maxPages);
             }
        }
        
    }
    // إصلاح لضمان عرض 1 و آخر صفحة دائماً إذا لم تكن قريبة
    const finalPages = [];
    if (pages.length > 0) finalPages.push(1);
    
    for (const page of pages) {
        if (page !== 1 && page !== maxPages && (finalPages.length === 0 || finalPages[finalPages.length - 1] !== page)) {
            finalPages.push(page);
        }
    }
    if (maxPages > 1 && finalPages[finalPages.length - 1] !== maxPages) finalPages.push(maxPages);
    
    return finalPages.filter((value, index, self) => self.indexOf(value) === index);
});


// ------------------------------------------------------------------
// 4. التنفيذ والمراقبة في Nuxt
// ------------------------------------------------------------------

// ⚠️ عند تحميل المكون لأول مرة، نبدأ جلب القصص
onMounted(fetchStories);

// ⚠️ عند تغيير أي من Query Parameters (يشمل 'page' الآن)، نعيد جلب البيانات
watch(
 () => route.query, 
 fetchStories, 
 { deep: true } 
);
</script>