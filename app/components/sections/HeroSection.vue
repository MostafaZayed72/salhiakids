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

// -------------------
// حالة الأقسام
// -------------------
const storyCategories = ref([]);
const selectedCategory = ref('');
const showFilterDropdown = ref(false);

// -------------------
// حالة البحث الصوتي
// -------------------
const isListening = ref(false);
const voiceTranscript = ref('');
let recognition = null; // متغير لحفظ كائن SpeechRecognition

// -------------------
// Props و Emits (تعديل: تم إضافة isListening و voiceTranscript إلى Emits)
// -------------------
const props = defineProps({
    searchQuery: String,
    showSuggestions: Boolean,
    searchSuggestions: Array
});

const emit = defineEmits([
    'update:searchQuery',
    'update:showSuggestions',
    'handleSearchInput',
    'hideSuggestions',
    'selectSuggestion',
    // ⭐️ يجب إزالة 'toggleVoiceSearch' من Emits إذا كنا سننفذه محليًا
]);

// -------------------
// v-model helper
// -------------------
const searchQueryModel = computed({
    get: () => props.searchQuery,
    set: val => emit('update:searchQuery', val)
});

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

    if (Object.keys(query).length === 0) return;

    router.push({ path: '/searchResults', query }).catch(err => {
        if (err.name !== 'NavigationDuplicated') throw err;
    });
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

        // ⭐️ الانتقال التلقائي هنا
        recognition.onend = () => {
            isListening.value = false;
            // يتم استدعاء performSearch فقط إذا كان هناك نص حقيقي تم التقاطه
            if (searchQueryModel.value && searchQueryModel.value.trim() && searchQueryModel.value !== 'جاري الاستماع...') {
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
        recognition.stop(); // سيؤدي هذا إلى تشغيل recognition.onend
    }
};
</script>

<template>
<section class="pt-32 pb-10 flex flex-col justify-center items-center relative bg-white overflow-hidden">
    
    <div class="absolute top-10 left-10 w-4 h-4 bg-pink-300 rounded-full"></div>
    <div class="absolute top-20 right-10 w-6 h-6 bg-yellow-300 rounded-full"></div>

    <div class="mb-4">
        <img src="/hero.jpeg" alt="child" class="w-[80%] mx-auto md:w-full md:h-64 object-contain border-2 border-pink-500 rounded-lg">
    </div>

    <div class="text-center mb-6">
        <h2 class="text-3xl md:text-4xl font-extrabold text-green-600">منصة الطفل الرقمية</h2>
        <p class="text-sm md:text-base text-pink-500">تعلم بمرح... واكتشف بذكاء</p>
    </div>

<div class="relative w-[95%] md:w-full max-w-lg">
    <div class="flex items-center bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden h-12">
        <span class="material-icons text-gray-400 px-3">search</span>
        <input
            type="text"
            v-model="searchQueryModel"
            @input="emit('handleSearchInput')"
            @focus="emit('update:showSuggestions', true)"
            @blur="emit('hideSuggestions')"
            @keyup.enter="performSearch"
            placeholder="ابحث بالموضوع، أو المؤلف، أو العنوان..."
            class="flex-grow h-full px-2 text-gray-800 placeholder-gray-400 focus:outline-none"
            :disabled="isListening"
        >
        
        <div class="flex h-full divide-x divide-gray-200">
            
            <button 
                @click="toggleVoiceSearch" 
                class="flex flex-col items-center justify-center  text-red-500 hover:text-red-600 transition-colors duration-200" 
                :class="{'animate-ping-slow': isListening}"
            >
                <span class="material-icons text-lg leading-none">mic</span>
                <span class="text-[10px] font-medium leading-none mt-[1px]">صوت</span>
            </button>
            
            <button 
                @click="toggleFilterDropdown" 
                class="flex flex-col items-center justify-center w-12 text-indigo-500 hover:text-indigo-600 transition-colors duration-200"
            >
                <span class="material-icons text-lg leading-none">filter_alt</span>
                <span class="text-[10px] font-medium leading-none mt-[1px]">فلتر</span>
            </button>
        </div>
    </div>

    <Transition name="custom-slide-down">
        <div v-if="showSuggestions && searchSuggestions && searchSuggestions.length > 0" class="absolute top-full right-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 text-right">
            <div v-for="suggestion in searchSuggestions" :key="suggestion.id" @mousedown.prevent="emit('selectSuggestion', suggestion)" class="flex items-center gap-3 p-3 cursor-pointer hover:bg-indigo-50 transition-colors duration-200 border-b border-gray-100">
                <span class="material-icons text-gray-500 text-xl">search</span>
                <span class="text-gray-800 ">{{ suggestion.title }}</span>
                <span class="mr-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{{ suggestion.type }}</span>
            </div>
        </div>
    </Transition>

    <Transition name="custom-slide-down">
        <div v-if="showFilterDropdown" class="absolute top-full right-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 text-right p-3">
            <label class="block mb-2 font-semibold">اختر القسم:</label>
            <select v-model="selectedCategory" @change="performSearch" class="w-full border rounded p-1">
                <option value="">-- جميع الأقسام --</option>
                <option v-for="cat in storyCategories" :key="cat.id" :value="cat.id">{{ cat.title }}</option>
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
