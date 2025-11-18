<template>
<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-right">
<div class="max-w-7xl mx-auto">

    <div class="mb-12  rounded-2xl  p-6  ">
       
        
        <div class="relative max-w-4xl mx-auto md:mx-auto"> 
            <div class="flex items-center bg-white border-2 border-purple-600 hover:border-pink-500 rounded-xl shadow-xl overflow-hidden h-16 w-full">
                <span class="material-icons text-gray-400 px-3">search</span>
                <input
                    type="text"
                    v-model="searchPhrase"
                    @input="handleSearchInput" 
                    @focus="showSuggestions = true"
                    @blur="setTimeout(() => showSuggestions = false, 100)" 
                    @keyup.enter="performSearch"
                    placeholder="ابحث بالموضوع، أو المؤلف، أو العنوان..."
                    class="flex-grow w-full h-full px-2 text-gray-800 placeholder-gray-400 focus:outline-white"
                    :disabled="isListening"
                >
                
                <div class="flex h-full divide-x divide-gray-200">
                    
                    <button 
                        @click="toggleVoiceSearch" 
                        class="flex flex-col items-center justify-center w-12 text-red-500 hover:text-red-600 transition-colors duration-200" 
                        :class="{'animate-ping-slow': isListening}"
                    >
                        <span class="material-icons text-lg leading-none">{{ isListening ? 'mic_off' : 'mic' }}</span>
                        <span class="text-[10px] font-medium leading-none mt-[1px]">صوت</span>
                    </button>
                    
                    <button 
                        @click="toggleFilterDropdown" 
                        class="flex flex-col items-center justify-center w-12 text-indigo-500 hover:text-indigo-600 transition-colors duration-200"
                    >
                        <span class="material-icons text-purple-600 text-xl">tune</span>
                        <span class="text-[10px] text-purple-600 font-medium leading-none mt-[1px]">فلتر</span>
                    </button>
                </div>
            </div>

            <Transition name="custom-slide-down">
                <div v-if="showSuggestions && suggestions && suggestions.length > 0" 
                     class="absolute top-full right-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 text-right">
                    
                    <div 
                        v-for="suggestion in suggestions" 
                        :key="suggestion.id" 
                        @mousedown.prevent="selectSuggestion(suggestion)" 
                        class="flex items-center gap-3 p-3 cursor-pointer hover:bg-indigo-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                    >
                        <span class="material-icons text-gray-500 text-xl">search</span>
                        <span class="text-gray-800 truncate flex-grow">{{ suggestion.title }}</span>
                        <span class="mr-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{{ suggestion.type }}</span>
                    </div>

                    <div class="p-2 border-t border-gray-200" v-if="searchPhrase.trim().length > 0">
                        <button 
                            @click="viewAllResults" 
                            class="w-full text-center text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors py-2 rounded-lg hover:bg-purple-50"
                        >
                            عرض كل النتائج لـ "{{ searchPhrase }}"
                        </button>
                    </div>
                </div>
            </Transition>
        </div>
        <Transition name="custom-fade">
            <div v-if="isListening" class="mt-3 p-3 bg-yellow-100 rounded-xl shadow-lg border border-yellow-400 flex items-center justify-between text-center max-w-4xl mx-auto">
                <span class="text-sm font-bold text-gray-700">جارٍ الاستماع:</span>
                <span class="text-sm font-medium text-gray-800 mx-2 flex-grow text-right">{{ voiceTranscript }}</span>
                <button @click="handleStopListening" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg ml-2 flex-shrink-0">إيقاف</button>
            </div>
        </Transition>

        <Transition name="custom-slide-down">
            <div v-if="showFilterDropdown" class="mt-4 bg-white border border-gray-200 rounded-xl shadow-xl text-right p-4 max-w-4xl mx-auto">
                
                <label for="category-select" class="block mb-2 font-bold text-gray-700"> حسب القسم:</label>
                <select 
                    id="category-select"
                    v-model="selectedCategory" 
                    @change="performSearch" 
                    class="w-full py-3 border border-gray-300 rounded-lg p-2 bg-white focus:ring-purple-500 focus:border-purple-500 transition-colors mb-4"
                >
                    <option value="">-- جميع الأقسام --</option>
                    <option v-for="cat in storyCategories" :key="cat.id" :value="cat.id">{{ cat.title }}</option>
                </select>

                <label for="media-type-select" class="block mb-2 font-bold text-gray-700"> حسب النوع:</label>
                <select 
                    id="media-type-select"
                    v-model="selectedMediaType" 
                    @change="performSearch" 
                    class="w-full py-3 border border-gray-300 rounded-lg p-2 bg-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                    <option value="">-- جميع الأنواع --</option>
                    <option v-for="type in mediaTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
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
        
        <div class="flex items-center gap-3 border-r pr-3 border-gray-300">
            <span class="text-sm font-semibold text-gray-700">الكل ({{ totalItemsCount }})</span>
            <span class="text-sm text-gray-500">فيديو ({{ totalVideosCount }})</span>
            <span class="text-sm text-gray-500">صور ({{ totalImagesCount }})</span>
            <span class="text-sm text-gray-500">PDF ({{ totalPdfsCount }})</span>
        </div>
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
                'w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden ': viewMode === 'list', 
                'relative w-full aspect-square overflow-hidden': viewMode === 'grid'
            }"
            class="image-container cursor-pointer"
            @click="navigateTo(`/stories/${story.id}`)"
            >
            <img 
                :src="story.coverImageUrl || '/images/placeholder.jpg'" 
                :alt="story.title || 'صورة القصة'" 
                class="w-full h-full object-cover"
                >
            </div>
            <div :class="{'p-0': viewMode === 'list'}" class="p-5 text-right flex-grow" >
            <h3 class="text-lg font-bold text-gray-900 mb-2 truncate">{{ story.title }}</h3>
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ story.content }}</p>
            <div class="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full inline-block">
            {{ story.storyCategoryTitle }}
            </div>
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
const SEARCH_ENDPOINT = `${API_BASE}/api/MasterStories/GetAllMatching`; 
const CATEGORIES_ENDPOINT = `${API_BASE}/api/StoryCategories/GetAllMatching`;

const stories = ref([]);
const loading = ref(false);
const error = ref(null);

// حالة العرض والترتيب
const viewMode = ref('grid'); 
const pageSize = 8; 

// حالة البحث والفلترة (متغيرات محلية)
const searchPhrase = ref(route.query.q || "");
const selectedCategory = ref(route.query.category || "");
const selectedMediaType = ref(route.query.mediaType || ""); 
const orderBy = ref(route.query.orderBy || "createdAt");
const descending = ref(route.query.descending === 'false' ? false : true);

// حالة الفلتر والصوت
const storyCategories = ref([]);
const mediaTypes = ref([
    { value: '1', label: 'صورة' },
    { value: '2', label: 'فيديو' },
    { value: '4', label: 'مستند (PDF)' }
]);

const showFilterDropdown = ref(false);

// حالة الاقتراحات (Autocomplete)
const suggestions = ref([]);
const showSuggestions = ref(false); 
let debounceTimeout = null; 

// حالة البحث الصوتي
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
// 2. دوال البحث والإكمال التلقائي
// ------------------------------------------------------------------

// جلب الاقتراحات (Autocomplete)
const fetchSuggestions = async (query) => {
    if (!query || query.trim().length < 3) {
        suggestions.value = [];
        showSuggestions.value = false;
        return;
    }

    try {
        const token = getToken();
        const requestBody = { 
            searchPhrase: query,
            pageNumber: 1,
            pageSize: 10, 
            orderBy: "createdAt", 
            descending: true,
            ApprovalStatus: 1,
        };

        const response = await axios.post(SEARCH_ENDPOINT, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (response.data && response.data.items) {
            suggestions.value = response.data.items.slice(0, 10).map(item => ({
                id: item.id,
                title: item.title,
                type: item.storyCategoryTitle || 'قصة', 
            }));
            showSuggestions.value = suggestions.value.length > 0;
        } else {
            suggestions.value = [];
            showSuggestions.value = false;
        }
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        suggestions.value = [];
        showSuggestions.value = false;
    }
};

// معالجة إدخال البحث (Debouncing)
const handleSearchInput = () => {
    if (!searchPhrase.value) {
        suggestions.value = [];
        showSuggestions.value = false;
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        fetchSuggestions(searchPhrase.value);
    }, 300); 
};


// ------------------------------------------------------------------
// 3. دالة جلب نتائج البحث من الـ API (POST)
// ------------------------------------------------------------------
const fetchStories = async () => {
    loading.value = true;
    error.value = null;
    stories.value = [];
    totalPages.value = 1;
    totalItemsCount.value = 0;
    // 💡 إعادة تصفير العدادات قبل كل عملية جلب
    totalVideosCount.value = 0; 
    totalImagesCount.value = 0; 
    totalPdfsCount.value = 0; 

    const pageNumber = currentPage.value;

    const requestBody = {
        pageNumber: pageNumber,
        pageSize: pageSize, 
        orderBy: orderBy.value, 
        descending: descending.value,
        ApprovalStatus: 1, 

        searchPhrase: searchPhrase.value, 
        storyCategoryId: selectedCategory.value || null,
        mediaType: selectedMediaType.value ? parseInt(selectedMediaType.value) : null,
    };

    try {
        const response = await axios.post(SEARCH_ENDPOINT, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                ...(getToken() && { Authorization: `Bearer ${getToken()}` })
            }
        });

        const data = response.data;
        if (data && Array.isArray(data.items)) {
            
            // 💡 منطق حساب أعداد الميديا يدوياً
            let videoCount = 0;
            let imageCount = 0;
            let pdfCount = 0;

            data.items.forEach(story => {
                if (story.mediaType === 1) { // Image
                    imageCount++;
                } else if (story.mediaType === 2) { // Video
                    videoCount++;
                } else if (story.mediaType === 4) { // Document/PDF
                    pdfCount++;
                }
                // يمكن إضافة حالة لـ (mediaType === 3) إذا كان Audio
            });

            stories.value = data.items;
            totalPages.value = data.totalPages || 1;
            totalItemsCount.value = data.totalItemsCount || 0;
            
            // تعيين القيم المحسوبة للمتغيرات التفاعلية
            totalVideosCount.value = videoCount; 
            totalImagesCount.value = imageCount;
            totalPdfsCount.value = pdfCount;
            
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
// 4. منطق البحث والفلترة والترتيب
// ------------------------------------------------------------------

// جلب الأقسام (للفلتر)
const fetchCategories = async () => {
    try {
        const body = {
            searchPhrase: "", orderBy: "title", descending: false, pageNumber: 1, pageSize: 100
        };
        const response = await axios.post(CATEGORIES_ENDPOINT, body);
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
    if (selectedMediaType.value) query.mediaType = selectedMediaType.value;
    if (orderBy.value) query.orderBy = orderBy.value;
    if (descending.value !== true) query.descending = false; 
    
    showSuggestions.value = false;
    
    router.push({ query: { ...query, page: 1 } });
};

// عند تبديل الاتجاه (descending)
const toggleDescending = () => {
    descending.value = !descending.value;
    performSearch(); 
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
// 5. منطق التعامل مع الاقتراحات
// ------------------------------------------------------------------

const selectSuggestion = (suggestion) => {
    router.push({ path: `/stories/${suggestion.id}` });
    showSuggestions.value = false;
};

const viewAllResults = () => {
    performSearch();
    showSuggestions.value = false;
};


// ------------------------------------------------------------------
// 6. منطق البحث الصوتي
// ------------------------------------------------------------------

const normalizeArabicTranscript = (text) => {
    if (!text || typeof text !== 'string') return text;
    const exceptions = ['وجه', 'فيه', 'منه', 'عليه', 'إليه', 'الله', 'هذه', 'عنه', 'معه', 'نفسه', 'مياهه', 'نهاه', 'سماه', 'أباه', 'رآه'];
    let normalized = text.trim();
    const words = normalized.split(/\s+/);
    const correctedWords = words.map(word => {
        const baseWord = word.replace(/['".,]/g, '');
        if (exceptions.includes(baseWord)) { return word; }
        if (word.endsWith('ه')) { return word.substring(0, word.length - 1) + 'ة'; }
        return word;
    });
    return correctedWords.join(' ');
};

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
            const finalQuery = normalizeArabicTranscript(searchPhrase.value); 
            searchPhrase.value = finalQuery; 
            if (finalQuery && finalQuery.trim() && finalQuery !== 'جاري الاستماع...') {
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
// 7. التنفيذ والمراقبة 
// ------------------------------------------------------------------

// دالة مساعدة لتحديث الحالة المحلية من الـ URL query
const updateStateFromRoute = () => {
    searchPhrase.value = route.query.q || "";
    selectedCategory.value = route.query.category || "";
    selectedMediaType.value = route.query.mediaType || "";
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
// 8. دوال مساعدة أخرى (Pagination)
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

// دالة للانتقال إلى مسار معين عند الضغط على البطاقة
const navigateTo = (path) => {
    router.push(path);
};
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

/* نمط الحركة البطيئة للميكروفون */
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
.aspect-square {
    aspect-ratio: 1 / 1;
}

.aspect-video {
    aspect-ratio: 16 / 9;
}
</style>