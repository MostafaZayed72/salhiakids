<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// ----------------------------------------------------
// 1. الحالة والمتغيرات
// ----------------------------------------------------
const searchQuery = ref('');
const showSuggestions = ref(false);
const showAdvancedSearch = ref(false);
const isListening = ref(false);
const voiceTranscript = ref('');
const searchSuggestions = ref([]);
const advancedFilters = ref({
  category: '',
  ageGroup: '',
  contentType: ''
});
const allContents = ref([]);
let recognition = null; // لأجل Web Speech API

// ----------------------------------------------------
// 2. البيانات الثابتة (يتم تمريرها كمُدخلات للمكونات)
// ----------------------------------------------------
const featuredCategories = [
  // ... (نفس بيانات الفئات من الجزء الخامس) ...
  { id: 1, name: 'المغامرات', icon: 'explore', description: 'رحلات مثيرة لاكتشاف عوالم جديدة', count: 156 },
  { id: 2, name: 'الحيوانات', icon: 'pets', description: 'عالم الحيوان بأسلوب شيق وممتع', count: 89 },
  { id: 3, name: 'التعليمية', icon: 'school', description: 'تعلم مع المتعة في كل محتوى', count: 203 },
  { id: 4, name: 'الدينية', icon: 'mosque', description: 'قيم إسلامية بأسلوب مبسط', count: 134 },
  { id: 5, name: 'الخيال', icon: 'auto_awesome', description: 'عوالم سحرية وخيالية رائعة', count: 78 },
  { id: 6, name: 'التاريخية', icon: 'history', description: 'رحلة عبر الزمن إلى الماضي', count: 67 },
  { id: 7, name: 'العلمية', icon: 'science', description: 'اكتشافات علمية مبسطة', count: 92 },
  { id: 8, name: 'الاجتماعية', icon: 'diversity_3', description: 'تعزيز القيم والسلوكيات', count: 145 }
];

const featuredHeroes = [
  // ... (نفس بيانات الأبطال من الجزء الخامس) ...
  { id: 1, name: 'الفارس الشجاع', category: 'المغامرات', description: 'فارس شجاع يدافع عن المظلومين' },
  { id: 2, name: 'المستكشف العظيم', category: 'الاستكشاف', description: 'يستكشف عوالم جديدة وغريبة' },
  { id: 3, name: 'حارس الطبيعة', category: 'البيئة', description: 'يحمي الحيوانات والطبيعة' },
  { id: 4, name: 'بطل العلم', category: 'العلم', description: 'يحل المشكلات باستخدام العلم' }
];

const stats = [
  // ... (نفس بيانات الإحصائيات من الجزء الخامس) ...
  { value: '1,250+', label: 'محتوى مميز' },
  { value: '50,000+', label: 'مستفيد نشط' },
  { value: '25+', label: 'موضوع متنوع' },
  { value: '4.8/5', label: 'تقييم المستخدمين' }
];

const features = [
  // ... (نفس بيانات الميزات من الجزء الخامس) ...
  { icon: 'security', title: 'بيئة آمنة', description: 'جميع المحتويات مفحوصة ومناسبة للعمر تحت إشراف متخصصين في تربية الأطفال' },
  { icon: 'touch_app', title: 'تفاعل ممتع', description: 'تصميم تفاعلي يجذب انتباه الأطفال ويحفز خيالهم بطريقة مبتكرة' },
  { icon: 'collections_bookmark', title: 'مكتبة شاملة', description: 'آلاف المحتويات المتنوعة تغطي جميع الاهتمامات والفئات العمرية' }
];

// ----------------------------------------------------
// 3. الخصائص المحسوبة (Computed Properties)
// ----------------------------------------------------
const latestContents = computed(() => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return allContents.value
    .filter(content => new Date(content.created_at) >= oneWeekAgo && content.status === 'published')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);
});

const featuredContents = computed(() => {
  return allContents.value
    .filter(content => content.rating >= 4.5 && content.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);
});

// ----------------------------------------------------
// 4. الدوال المساعدة (Helper Functions)
// ----------------------------------------------------

const getContentTypeIcon = (type) => {
  const icons = {
    'صوت': 'audiotrack',
    'صورة': 'image',
    'فيديو': 'play_circle',
    'pdf': 'picture_as_pdf'
  };
  return icons[type] || 'menu_book';
};

const isNewContent = (createdAt) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return new Date(createdAt) >= threeDaysAgo;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// ----------------------------------------------------
// 5. وظائف التفاعل (Search & Routing)
// ----------------------------------------------------

const performSearch = () => {
  if (!searchQuery.value.trim()) {
    router.push('/search');
    return;
  }
  router.push({ path: '/search', query: { q: searchQuery.value } });
};

const applyAdvancedSearch = () => {
  const query = {};
  if (searchQuery.value.trim()) query.q = searchQuery.value;
  if (advancedFilters.value.category) query.category = advancedFilters.value.category;
  if (advancedFilters.value.ageGroup) query.ageGroup = advancedFilters.value.ageGroup;
  if (advancedFilters.value.contentType) query.type = advancedFilters.value.contentType;

  router.push({ path: '/search', query: query });
};

const resetAdvancedFilters = () => {
  advancedFilters.value = { category: '', ageGroup: '', contentType: '' };
};

const searchByCategory = (category) => {
  router.push({ path: '/search', query: { category: category } });
};

const viewContent = (contentId) => {
  router.push(`/content/${contentId}`);
};

const goToCustomStory = () => {
  router.push('/custom-story');
};

const goToSearch = () => {
  router.push('/search');
};

const generateSearchSuggestions = (query) => {
  // ... (نفس منطق توليد الاقتراحات من الجزء السادس) ...
  if (!query || query.length < 2) {
    searchSuggestions.value = [];
    return;
  }
  const suggestions = allContents.value
    .filter(content => 
      content.title.toLowerCase().includes(query.toLowerCase()) ||
      content.author.toLowerCase().includes(query.toLowerCase()) ||
      content.category.toLowerCase().includes(query.toLowerCase())
    )
    .map(content => ({
      id: content.id,
      title: content.title,
      type: content.content_type,
      category: content.category
    }))
    .slice(0, 6);

  searchSuggestions.value = suggestions;
};

const handleSearchInput = () => {
  generateSearchSuggestions(searchQuery.value);
  showSuggestions.value = true;
};

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.title;
  showSuggestions.value = false;
  performSearch();
};

const hideSuggestions = () => {
  setTimeout(() => { showSuggestions.value = false; }, 200);
};

// ... (منطق البحث بالصوت والصورة: toggleVoiceSearch, startVoiceSearch, stopVoiceSearch, handleImageSearch) ...
// في ملف index.vue

const toggleVoiceSearch = () => {
  if (isListening.value) {
    stopVoiceSearch()
  } else {
    startVoiceSearch()
  }
}

// دالة البدء
const startVoiceSearch = () => {
  // التأكد من دعم المتصفح
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (SpeechRecognition) {
    recognition = new SpeechRecognition()
    recognition.lang = 'ar-EG' // مهم: تحديد اللغة العربية
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onstart = () => {
      isListening.value = true
      voiceTranscript.value = 'استمع...'
    }

recognition.onresult = (event) => {
    let interimTranscript = ''
    let finalTranscript = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }
    
    // يتم تحديث النص المرحلي أو النهائي في حقل البحث
    voiceTranscript.value = interimTranscript || finalTranscript
    
    if (finalTranscript) {
      // 1. تحديث حقل البحث بالقيمة النهائية
      searchQuery.value = finalTranscript.trim()
      
      // 2. إزالة استدعاء performSearch() هنا.
      // الآن، سيظل النص في الحقل، ولن يتم البحث حتى يضغط المستخدم على زر البحث.
    }
  }

  recognition.onend = () => {
    isListening.value = false
    // عند الانتهاء، نقوم بإفراغ نص حالة الاستماع إذا لم يكن هناك نتيجة
    if (voiceTranscript.value === 'استمع...' || voiceTranscript.value === 'لم يتم التعرف على كلام') {
        voiceTranscript.value = '' // إزالة رسالة الحالة
    }
  }
    recognition.onerror = (event) => {
      console.error('خطأ في التعرف على الكلام:', event.error)
      isListening.value = false
      voiceTranscript.value = 'حدث خطأ في التعرف على الكلام'
    }

    recognition.start()
  } else {
    alert('متصفحك لا يدعم التعرف على الكلام. يرجى استخدام Chrome أو Edge.')
  }
}

// دالة الإيقاف
const stopVoiceSearch = () => {
  if (recognition) {
    recognition.stop()
  }
  isListening.value = false
}
// ----------------------------------------------------
// 6. جلب البيانات (Data Fetching)
// ----------------------------------------------------
const loadContents = async () => {
  // هذا هو المكان الذي يجب أن يتم فيه استبدال البيانات التجريبية باستدعاء API حقيقي
  allContents.value = [
    { id: 1, title: 'الأسد الشجاع', author: 'أحمد محمد', category: 'الحيوانات', age_group: '3-6 سنوات', content_type: 'صوت', status: 'published', emoji: '🦁', summary: 'محتوى تعليمي عن الشجاعة والصداقة في الغابة', rating: 4.8, views: 1245, created_at: new Date().toISOString() },
    { id: 2, title: 'مغامرات في الفضاء', author: 'سارة أحمد', category: 'العلمية', age_group: '7-9 سنوات', content_type: 'فيديو', status: 'published', emoji: '🚀', summary: 'رحلة فضائية لاكتشاف الكواكب والمجرات', rating: 4.9, views: 892, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 3, title: 'الحروف العربية', author: 'فاطمة علي', category: 'التعليمية', age_group: '3-6 سنوات', content_type: 'صوت', status: 'published', emoji: '📚', summary: 'تعلم الحروف العربية بطريقة ممتعة', rating: 4.7, views: 1567, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 4, title: 'الحديقة السحرية', author: 'محمد حسن', category: 'الخيال', age_group: '7-9 سنوات', content_type: 'فيديو', status: 'published', emoji: '🌳', summary: 'مغامرة في حديقة مليئة بالأسرار', rating: 4.9, views: 2034, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
  ];
};

onMounted(() => {
  loadContents();
});

// ملاحظة: تم حذف منطق Web Speech API هنا للاختصار في عرض المكون المجمع
// ولكن يجب أن يكون كاملاً في ملف index.vue الفعلي.

</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 relative">
    <main >
      <Header />
      <SectionsHeroSection 
        v-model:searchQuery="searchQuery"
        v-model:showSuggestions="showSuggestions"
        v-model:showAdvancedSearch="showAdvancedSearch"
        v-model:isListening="isListening"
        :voiceTranscript="voiceTranscript"
        :searchSuggestions="searchSuggestions"
        :advancedFilters="advancedFilters"
        :stats="stats"
        @performSearch="performSearch"
        @toggleVoiceSearch="toggleVoiceSearch"
        @handleImageSearch="handleImageSearch"
        @applyAdvancedSearch="applyAdvancedSearch"
        @resetAdvancedFilters="resetAdvancedFilters"
        @handleSearchInput="handleSearchInput"
        @hideSuggestions="hideSuggestions"
        @selectSuggestion="selectSuggestion"
      />

      <div class="container mx-auto px-4 py-20">
        
        <SectionsCategoriesSection 
          :featuredCategories="featuredCategories"
          @searchByCategory="searchByCategory"
        />
        
        <SectionsHeroMakerSection 
          :featuredHeroes="featuredHeroes"
          @goToCustomStory="goToCustomStory"
        />
        
      </div>
      
      <SectionsFeaturesSection 
        :features="features"
      />

      <SectionsLatestContentSection
        :latestContents="latestContents"
        :getContentTypeIcon="getContentTypeIcon"
        :isNewContent="isNewContent"
        :formatDate="formatDate"
        @viewContent="viewContent"
        @goToSearch="goToSearch"
      />

      <SectionsFeaturedContentSection
        :featuredContents="featuredContents"
        @viewContent="viewContent"
      />
      
    </main>
  </div>
</template>

<style scoped>
/* جميع التنسيقات العامة والخطوط والحركات المخصصة (من الجزء السابع) تبقى هنا */
/* لضمان تطبيق الحركات على كل المكونات */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
/* ... (بقية التنسيقات والحركات المخصصة) ... */
</style>