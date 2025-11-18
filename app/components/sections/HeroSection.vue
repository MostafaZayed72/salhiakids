<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// -------------------
// Base URL والأندبوينت
// -------------------
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const CATEGORIES_ENDPOINT = `${API_BASE}/api/StoryCategories/GetAllMatching`;
// 💡 تم توحيد نقطة النهاية إلى GetAllMatching للبحث والاقتراحات
const SUGGESTIONS_ENDPOINT = `${API_BASE}/api/MasterStories/GetAllMatching`; 

// -------------------
// حالة الأقسام
// -------------------
const storyCategories = ref([]);
const selectedCategory = ref('');
const showFilterDropdown = ref(false);

// -------------------
// حالة الاقتراحات (Autocomplete) - داخلي
// -------------------
const suggestions = ref([]);
const showSuggestions = ref(false); 
let debounceTimeout = null; // لأجل تأخير طلب الـ API

// -------------------
// حالة فلتر نوع المحتوى
// -------------------
const selectedMediaType = ref(''); // لحفظ القيمة المختارة (1, 2, 4)
const mediaTypes = ref([
    { value: '1', label: 'صورة' },
    { value: '2', label: 'فيديو' },
    { value: '4', label: 'مستند (PDF)' }
]);

// -------------------
// حالة البحث الصوتي
// -------------------
const isListening = ref(false);
const voiceTranscript = ref('');
let recognition = null; // متغير لحفظ كائن SpeechRecognition

// -------------------
// Props و Emits
// -------------------
const props = defineProps({
    searchQuery: String,
});

const emit = defineEmits([
    'update:searchQuery',
]);

// -------------------
// v-model helper
// -------------------
const searchQueryModel = computed({
    get: () => props.searchQuery,
    set: val => emit('update:searchQuery', val)
});

// -------------------
// جلب التوكن
// -------------------
const getToken = () => localStorage.getItem('authToken');

// -------------------
// جلب الأقسام باستخدام POST body
// -------------------
const fetchCategories = async () => {
    try {
        const body = {
            searchPhrase: "",
            orderBy: "title",
            descending: false,
            pageNumber: 1,
            pageSize: 100
        };

        const response = await axios.post(CATEGORIES_ENDPOINT, body);
        if (response.data && response.data.items) {
            storyCategories.value = response.data.items.map(item => ({
                id: item.id,
                title: item.title
            }));
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
};

onMounted(fetchCategories);

// -------------------
// جلب الاقتراحات (Autocomplete)
// -------------------
const fetchSuggestions = async (query) => {
    // 💡 الشرط الجديد: يجب إدخال 3 أحرف على الأقل
    if (!query || query.trim().length < 3) {
        suggestions.value = [];
        showSuggestions.value = false;
        return;
    }

    try {
        const token = getToken();
        // إعداد Body request لاستخدام GetAllMatching
        const requestBody = { 
            searchPhrase: query,
            pageNumber: 1,
            pageSize: 10, // 💡 طلب عدد قليل من النتائج لغرض الاقتراحات
            orderBy: "createdAt", 
            descending: true,
            ApprovalStatus: 1, // نفترض أننا نبحث عن قصص معتمدة
        };

        const response = await axios.post(SUGGESTIONS_ENDPOINT, requestBody, {
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

// -------------------
// معالجة إدخال البحث (Debouncing)
// -------------------
const handleSearchInput = () => {
    // إخفاء القائمة عند مسح النص
    if (!searchQueryModel.value) {
        suggestions.value = [];
        showSuggestions.value = false;
    }

    // تأخير الطلب لتجنب الإرسال مع كل ضغطة مفتاح
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        fetchSuggestions(searchQueryModel.value);
    }, 300); 
};


// -------------------
// منطق التعامل مع الاقتراحات
// -------------------

const selectSuggestion = (suggestion) => {
    // التوجيه إلى مسار القصة عند الضغط على الاقتراح
    router.push({ path: `/stories/${suggestion.id}` });
    showSuggestions.value = false;
};

const viewAllResults = () => {
    // التوجيه إلى صفحة نتائج البحث بالكلمة المدخلة
    performSearch();
    showSuggestions.value = false;
};

// -------------------
// التحكم بالفلتر Dropdown
// -------------------
const toggleFilterDropdown = () => {
    showFilterDropdown.value = !showFilterDropdown.value;
};

// -------------------
// منطق البحث
// -------------------
const performSearch = () => {
    const query = {};
    if (searchQueryModel.value && searchQueryModel.value.trim()) query.q = searchQueryModel.value.trim();
    if (selectedCategory.value) query.category = selectedCategory.value;
    
    // إضافة فلتر نوع المحتوى إلى الكويري
    if (selectedMediaType.value) {
        query.mediaType = selectedMediaType.value; 
    }

    if (Object.keys(query).length === 0) return;
    
    // إغلاق الاقتراحات عند البحث الكامل
    showSuggestions.value = false;

    router.push({ path: '/searchResults', query }).catch(err => {
        if (err.name !== 'NavigationDuplicated') throw err;
    });
};

// -------------------
// وظيفة معالجة النص المُلتقط وتصحيح الهاء إلى تاء مربوطة (كما هي)
// -------------------
const normalizeArabicTranscript = (text) => {
    if (!text || typeof text !== 'string') return text;
    // قائمة الكلمات الشائعة التي تنتهي بهاء أصلية ولا يجب تغييرها
    const exceptions = ['وجه', 'فيه', 'منه', 'عليه', 'إليه', 'الله', 'هذه', 'عنه', 'معه', 'نفسه', 'مياهه', 'نهاه', 'سماه', 'أباه', 'رآه'];

    let normalized = text.trim();
    
    // تقسيم النص إلى كلمات والعمل على كل كلمة
    const words = normalized.split(/\s+/);
    const correctedWords = words.map(word => {
        // نحول الكلمة إلى حالة أساسية للمقارنة
        const baseWord = word.replace(/['".,]/g, '');

        if (exceptions.includes(baseWord)) {
            return word;
        }
        
        // التصحيح: إذا انتهت الكلمة بالهاء (ه) أو الهاء المربوطة (ة) بدون نقاط، نصححها إلى تاء مربوطة (ة)
        if (word.endsWith('ه')) {
             return word.substring(0, word.length - 1) + 'ة';
        }
        
        return word;
    });

    return correctedWords.join(' ');
};


// -------------------
// البحث الصوتي باستخدام Web Speech API
// -------------------
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

            // يتم تحديث كل من النص الظاهر ومربع البحث
            voiceTranscript.value = finalTranscript || interimTranscript;
            searchQueryModel.value = finalTranscript || interimTranscript;
        };

        // الانتقال التلقائي هنا
        recognition.onend = () => {
            isListening.value = false;
                    
            // تطبيق التصحيح هنا 
            const finalQuery = normalizeArabicTranscript(searchQueryModel.value);
            searchQueryModel.value = finalQuery; // تحديث النموذج بالقيمة المصححة

            // يتم استدعاء performSearch فقط إذا كان هناك نص حقيقي تم التقاطه
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

// -------------------
// وظيفة تشغيل/إيقاف البحث الصوتي
// -------------------
const toggleVoiceSearch = () => {
    if (isListening.value) {
        // إيقاف التسجيل يدوياً
        if (recognition) {
            recognition.stop();
        }
        isListening.value = false;
    } else {
        // بدء التسجيل
        startVoiceSearch();
    }
};

// -------------------
// إيقاف البحث الصوتي يدوياً وزر 'إيقاف'
// -------------------
const handleStopListening = () => {
    if (recognition) {
        recognition.stop();
    }
};
</script>
<template>
<section class="py-8 flex flex-col justify-center items-center relative bg-white overflow-hidden">
    
    <div class="absolute top-10 left-10 w-4 h-4 bg-pink-300 rounded-full"></div>
    <div class="absolute top-20 right-10 w-6 h-6 bg-yellow-300 rounded-full"></div>

    <div >
        <img src="/hero.jpeg" alt="child" class="w-[80%] mx-auto md:w-full md:h-64 object-contain rounded-lg">
    </div>

    <div class="text-center mb-4">
<h2 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-purple-500 custom-text-pulse mb-4"> منصة <span
    class="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-purple-500 custom-text-pulse">الطفل
    الرقمية</span>
    </h2>       <p class="text-sm md:text-base text-pink-500">تعلم بمرح... واكتشف بذكاء</p>
    </div>

<div class="relative md:w-[50%] ">
    <div class="flex items-center bg-white border-2 border-purple-600 hover:border-pink-500 rounded-xl shadow-xl overflow-hidden h-20 w-full">
        <span class="material-icons text-gray-400 px-3">search</span>
        <input
            type="text"
            v-model="searchQueryModel"
            @input="handleSearchInput" @focus="showSuggestions = true"
            @blur="setTimeout(() => showSuggestions = false, 100)" @keyup.enter="performSearch"
            placeholder="ابحث بالموضوع، أو المؤلف، أو العنوان..."
            class="flex-grow w-full h-full px-2 text-gray-800 placeholder-gray-400 focus:outline-white"
            :disabled="isListening"
        >
        
        <div class="flex h-full divide-x divide-gray-200">
            
            <button 
                @click="toggleVoiceSearch" 
                class="flex flex-col items-center justify-center text-red-500 hover:text-red-600 transition-colors duration-200" 
                :class="{'animate-ping-slow': isListening}"
            >
                <span class="material-icons text-lg leading-none">mic</span>
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
             class="mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 text-right">
            
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

            <div class="p-2 border-t border-gray-200" v-if="searchQueryModel.trim().length > 0">
                <button 
                    @click="viewAllResults" 
                    class="w-full text-center text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors py-2 rounded-lg hover:bg-purple-50"
                >
                    عرض كل النتائج لـ "{{ searchQueryModel }}"
                </button>
            </div>
        </div>
    </Transition>

    <Transition name="custom-slide-down z-50">
        <div v-if="showFilterDropdown" class="z-50    mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl  text-right p-3">
            
            <label class="block mb-2 font-semibold">حسب القسم:</label>
            <select v-model="selectedCategory" @change="performSearch" class="w-full border rounded p-1 mb-4">
                <option value="">-- جميع الأقسام --</option>
                <option v-for="cat in storyCategories" :key="cat.id" :value="cat.id">{{ cat.title }}</option>
            </select>

            <label class="block mb-2 font-semibold z-50">حسب النوع:</label>
            <select v-model="selectedMediaType" @change="performSearch" class="w-full border rounded p-1">
                <option value="">-- جميع الأنواع --</option>
                <option v-for="type in mediaTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>

        </div>
    </Transition>
</div>
    <Transition name="custom-fade">
        <div v-if="isListening" class="mt-3 p-3 bg-yellow-100 rounded-xl shadow-lg border border-yellow-400 flex items-center justify-center text-center w-full max-w-lg">
            <span class="text-sm font-bold text-gray-700">جارٍ الاستماع...</span>
            <span class="text-sm text-gray-700 mx-2">{{ voiceTranscript }}</span>
            <button @click="handleStopListening" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg ml-2">إيقاف</button>
        </div>
    </Transition>

</section>
</template>
<style scoped>
.custom-slide-down-enter-active,
.custom-slide-down-leave-active {
    transition: all 0.3s ease-out;
    transform-origin: top;
}
.custom-slide-down-enter-from,
.custom-slide-down-leave-to {
    opacity: 0;
    transform: scaleY(0.9);
}

.custom-fade-enter-active,
.custom-fade-leave-active {
    transition: opacity 0.3s ease;
}
.custom-fade-enter-from,
.custom-fade-leave-to {
    opacity: 0;
}

@keyframes ping-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}
.animate-ping-slow { animation: ping-slow 1.5s cubic-bezier(0,0,0.2,1) infinite; }
</style>