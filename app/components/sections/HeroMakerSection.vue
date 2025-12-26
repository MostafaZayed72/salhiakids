<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
import NotificationModal from '@/components/NotificationModal.vue';
// (مفترض أن DynamicHeroBackground و AOS موجودين أو تم استيرادهم في مكان آخر)

const emit = defineEmits(['goToCustomStory']);
const router = useRouter();

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const customStories = ref([]); 
const isLoadingStories = ref(true);

const fetchCustomStories = async () => {
    try {
        isLoadingStories.value = true;
        const body = {
            searchPhrase: '',
            orderBy: 'createdAt', 
            descending: true,
            pageNumber: 1,
            pageSize: 4 
        };

        const response = await axios.post(`${API_BASE}/api/CustomStories/GetAllMatching`, body);

        customStories.value = Array.isArray(response.data?.items) ? response.data.items : [];
        
    } catch (err) {
        console.error('Error fetching custom stories:', err.response?.data || err);
        customStories.value = [];
    } finally {
        isLoadingStories.value = false;
    }
};

onMounted(() => {
    fetchCustomStories();
});

const showLoginNotification = ref(false);

const loginNotification = {
  title: 'تسجيل الدخول مطلوب',
  message: 'عذراً، يجب عليك تسجيل الدخول أولاً لتتمكن من إنشاء قصتك الخاصة.',
  type: 'warning',
  actions: [
    {
      label: 'تسجيل الدخول',
      onClick: () => router.push('/login'),
      style: 'primary',
      icon: 'login'
    },
    {
      label: 'إلغاء',
      onClick: () => showLoginNotification.value = false,
      style: 'secondary'
    }
  ]
};

const handleStartAdventure = () => {
    const token = Cookies.get('authToken') || Cookies.get('token');
    if (!token) {
        showLoginNotification.value = true;
    } else {
        router.push('/ai-story-maker');
    }
};
</script>

<template>
 <section class="py-20 bg-white relative overflow-hidden"> <DynamicHeroBackground />

  <div class="absolute top-10 right-10 w-20 h-20 rounded-full bg-purple-200 opacity-50 custom-ping-slow"></div>
  <div class="absolute bottom-5 left-5 w-16 h-16 rounded-xl bg-sky-200 opacity-50 custom-float-slow"></div>

  <div class="container mx-auto px-4 relative z-10">
   <div class="text-center mb-16">
    <h2 class="text-4xl font-bold text-gray-800 mb-4"> أنت <span
      class="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-purple-500 custom-text-pulse">بطل
      القصة</span>
    </h2>
    <p class="text-xl text-gray-600 max-w-2xl mx-auto">    أضف صورتك واسمك، وكن النجم في مغامرتك الخاصة!
    </p>
   </div>

   <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
    <div class="relative">
      
      <div v-if="isLoadingStories" class="text-center text-gray-500 py-10"> <div class="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent mx-auto mb-3"></div>
        <p>جاري جلب آخر القصص...</p>
      </div>
      
      <div v-else class="grid grid-cols-2 gap-4">
        <div v-for="(story, index) in customStories" :key="story.id"
        class="group cursor-pointer transform hover:scale-105 transition-all duration-500 p-4 bg-gray-800 rounded-xl shadow-lg border border-purple-600"
        data-aos="fade-right" :data-aos-delay="index * 100">
        <div class="text-center">
            
          <div
            class="w-32 h-32 mx-auto  bg-gradient-to-r from-sky-400 to-purple-400 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                <img v-if="story.imageUrl" :src="story.imageUrl" :alt="story.title" class="w-full h-full object-contain p-1">
            <span v-else class="material-icons text-white text-3xl">local_police</span>
          </div>
            
          <h4 class="text-md font-bold text-white truncate" :title="story.title">{{ story.title }}</h4>
        </div>
      </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-300"> <div class="text-center transform hover:scale-110 transition-transform duration-300" data-aos="fade-up">
        <div class="text-2xl font-bold text-purple-600">15+</div> <div class="text-gray-700 text-sm">شخصية</div> </div>
      <div class="text-center transform hover:scale-110 transition-transform duration-300" data-aos="fade-up"
        data-aos-delay="100">
        <div class="text-2xl font-bold text-sky-500">50+</div> <div class="text-gray-700 text-sm">قصة تفاعلية</div> </div>
      <div class="text-center transform hover:scale-110 transition-transform duration-300" data-aos="fade-up"
        data-aos-delay="200">
        <div class="text-2xl font-bold text-pink-500">10K+</div> <div class="text-gray-700 text-sm">طفل مستفيد</div> </div>
      </div>
    </div>

    <div class="text-right">
      <div class="space-y-6">
      <div class="flex items-start gap-4 transform hover:translate-x-2 transition-transform duration-300"
        data-aos="fade-left">
        <div
        class="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
        <span class="material-icons text-white text-2xl">photo_camera</span>
        </div>
        <div>
        <h4 class="text-xl font-bold text-gray-800 mb-2">التقط صورتك</h4> <p class="text-gray-600">استخدم الكاميرا أو ارفع صورتك المفضلة لتصبح بطل القصة</p> </div>
      </div>
      <div class="flex items-start gap-4 transform hover:translate-x-2 transition-transform duration-300"
        data-aos="fade-left" data-aos-delay="100">
        <div
        class="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
        <span class="material-icons text-white text-2xl">supervisor_account</span>
        </div>
        <div>
        <h4 class="text-xl font-bold text-gray-800 mb-2">اكتب اسمك</h4> 
        <p class="text-gray-600">اكتب اسمك لتصبح انت محور جميع الأحداث</p> </div>
      </div>
      <div class="flex items-start gap-4 transform hover:translate-x-2 transition-transform duration-300"
        data-aos="fade-left" data-aos-delay="200">
        <div
        class="w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
        <span class="material-icons text-white text-2xl">auto_stories</span>
        </div>
        <div>
        <h4 class="text-xl font-bold text-gray-800 mb-2">عش المغامرة</h4> <p class="text-gray-600">استمتع بقصة تفاعلية حيث تكون أنت النجم الرئيسي في أحداثها</p> </div>
      </div>
      </div>

      <button @click="emit('goToCustomStory')"
      class="mt-8 w-full bg-gradient-to-r from-purple-600 to-sky-500 hover:from-purple-700 hover:to-sky-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
      data-aos="zoom-in" data-aos-delay="300">
      <span class="text-lg">ابدأ مغامرتك</span>
      <span class="material-icons transform rotate-180">arrow_forward</span>
      </button>

      <button @click="handleStartAdventure"
      class="mt-4 w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
      data-aos="zoom-in" data-aos-delay="400">
      <span class="text-lg">ابدأ مغامرتك بالذكاء الصناعي</span>
      <span class="material-icons">auto_awesome</span>
      </button>
    </div>
   </div>
  </div>
     <NotificationModal 
      :isOpen="showLoginNotification" 
      :notification="loginNotification"
      @close="showLoginNotification = false" 
    />
 </section>
</template>