<script setup>
import { computed } from 'vue'; // تم إضافة الاستيراد اللازم لـ computed

const props = defineProps({
  // V-model bindings
  searchQuery: String,
  showSuggestions: Boolean,
  showAdvancedSearch: Boolean,
  isListening: Boolean,
  // Data props
  voiceTranscript: String,
  searchSuggestions: Array,
  advancedFilters: Object,
  stats: Array,
  // Function props (Events)
  performSearch: Function,
  toggleVoiceSearch: Function,
  handleImageSearch: Function,
  applyAdvancedSearch: Function,
  resetAdvancedFilters: Function,
  handleSearchInput: Function,
  hideSuggestions: Function,
  selectSuggestion: Function,
});

const emit = defineEmits([
  'update:searchQuery',
  'update:showSuggestions',
  'update:showAdvancedSearch',
  'update:isListening',
  'performSearch',
  'toggleVoiceSearch',
  'handleImageSearch',
  'applyAdvancedSearch',
  'resetAdvancedFilters',
  'handleSearchInput',
  'hideSuggestions',
  'selectSuggestion'
]);

// Helper for two-way binding (v-model)
const searchQueryModel = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val),
});

const showAdvancedSearchModel = computed({
  get: () => props.showAdvancedSearch,
  set: (val) => emit('update:showAdvancedSearch', val),
});

const toggleAdvancedSearch = () => {
  showAdvancedSearchModel.value = !showAdvancedSearchModel.value;
};

// Simplified image input click
const triggerImageInput = () => {
  document.getElementById('image-search-input').click();
};
</script>

<template>
  <section class="py-20    relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-200 to-purple-400">
    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-5xl md:text-6xl font-extrabold text-gray-800  mb-6 custom-fade-in-down">
          مكتبة 
          <br class="md:hidden"/>
           <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">قصص الأطفال</span> التفاعلية
        </h1>
        <p class="text-xl text-gray-700  mb-10 custom-fade-in-down delay-200 font-bold">
          اكتشف آلاف القصص التي تنمي الخيال والقيم بأمان ومرح.
        </p>

        <div class="relative w-full shadow-2xl rounded-2xl custom-fade-in-down delay-400">
          <div class="flex items-center  rounded-2xl border-2 border-indigo-500 focus-within:border-red-500 transition-all duration-300">
            
            <span class="material-icons text-gray-400 text-2xl sm:text-3xl mx-2 sm:mx-4">search</span>
            
            <input
              type="text"
              v-model="searchQueryModel"
              @input="emit('handleSearchInput')"
              @focus="emit('update:showSuggestions', true)"
              @blur="emit('hideSuggestions')"
              @keyup.enter="emit('performSearch')"
              :placeholder="isListening ? voiceTranscript : 'ابحث بعنوان القصة أو المؤلف أو الموضوع...'"
              class="flex-grow py-3 sm:py-4 bg-transparent text-gray-800  focus:outline-none placeholder-gray-500  text-base sm:text-lg"
              :class="{'animate-pulse text-indigo-500': isListening}"
              :disabled="isListening"
            >

            <button 
              @click="toggleAdvancedSearch"
              class="p-2 sm:p-4 text-indigo-500 hover:text-indigo-700  transition-colors duration-300"
              :class="{'bg-indigo-50  rounded-lg': showAdvancedSearch}"
              title="البحث المتقدم"
            >
              <span class="material-icons text-xl sm:text-3xl">filter_alt</span>
            </button>

            <button 
              @click="triggerImageInput" 
              class="p-2 sm:p-4 text-green-500 hover:text-green-700  transition-colors duration-300"
              title="البحث بالصورة"
            >
              <span class="material-icons text-xl sm:text-3xl">camera_alt</span>
            </button>
            <input type="file" id="image-search-input" accept="image/*" class="hidden" @change="emit('handleImageSearch', $event)">

            <button 
              @click="emit('toggleVoiceSearch')"
              class="p-1 md:p-2 mr-1 sm:mr-2 rounded-xl transition-all duration-300"
              :class="{'bg-red-500 hover:bg-red-600 text-white': isListening, ' text-indigo-500': !isListening}"
              :title="isListening ? 'إيقاف البحث الصوتي' : 'البحث بالصوت'"
            >
              <span class="material-icons text-2xl sm:text-3xl mt-1" :class="{'animate-ping-slow': isListening}">mic</span>
            </button>
          </div>

          <Transition name="custom-slide-down">
            <div v-if="showSuggestions && searchSuggestions.length > 0" class="absolute top-full right-0 mt-2 w-full bg-white  border border-gray-200  rounded-xl shadow-xl z-50 text-right">
              <div 
                v-for="suggestion in searchSuggestions" 
                :key="suggestion.id"
                @mousedown.prevent="emit('selectSuggestion', suggestion)"
                class="flex items-center gap-3 p-3 cursor-pointer hover:bg-indigo-50  transition-colors duration-200 border-b border-gray-100 "
              >
                <span class="material-icons text-gray-500  text-xl">search</span>
                <span class="text-gray-800 ">{{ suggestion.title }}</span>
                <span class="mr-auto text-xs bg-indigo-100  text-indigo-600  px-2 py-0.5 rounded-full">{{ suggestion.type }}</span>
              </div>
            </div>
          </Transition>
        </div>

        <Transition name="custom-slide-down">
          <div v-if="showAdvancedSearch" class="mt-4 p-6 bg-gray-800 rounded-xl shadow-lg border  border-indigo-900 text-right">
            <h3 class="text-xl font-bold text-white mb-4 border-b pb-2">فلترة متقدمة</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">الموضوع</label>
                    <select v-model="advancedFilters.category" class="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">كل الموضوعات</option>
                        <option value="المغامرات">المغامرات</option>
                        <option value="العلمية">العلمية</option>
                        <option value="الحيوانات">الحيوانات</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">الفئة العمرية</label>
                    <select v-model="advancedFilters.ageGroup" class="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">جميع الأعمار</option>
                        <option value="3-6 سنوات">3-6 سنوات</option>
                        <option value="7-9 سنوات">7-9 سنوات</option>
                        <option value="10+ سنوات">10+ سنوات</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">نوع المحتوى</label>
                    <select v-model="advancedFilters.contentType" class="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">كل الأنواع</option>
                        <option value="صوت">صوت</option>
                        <option value="فيديو">فيديو</option>
                        <option value="pdf">ملف PDF</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end gap-3 mt-4">
                <button @click="emit('resetAdvancedFilters')" class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors duration-300">مسح الفلاتر</button>
                <button @click="emit('applyAdvancedSearch')" class="px-6 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-colors duration-300">تطبيق البحث</button>
            </div>
          </div>
        </Transition>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-2xl mx-auto custom-fade-in-up">
          <div 
            v-for="(stat, index) in stats" 
            :key="index" 
            class="text-center p-4 bg-purple-700 rounded-xl shadow-lg border-b-4 border-purple-600 transform hover:scale-105 transition-transform duration-300"
          >
            <div class="text-3xl font-extrabold text-slate-200 mb-1">{{ stat.value }}</div>
            <div class="text-sm text-gray-300">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>