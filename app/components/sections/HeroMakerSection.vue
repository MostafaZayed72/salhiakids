<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
// (مفترض أن DynamicHeroBackground و AOS موجودين أو تم استيرادهم في مكان آخر)

const emit = defineEmits(['goToCustomStory']);

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
</script>

<template>
 <section class="py-20 bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 relative overflow-hidden">
  <DynamicHeroBackground />

  <div class="absolute top-10 right-10 w-20 h-20 rounded-full opacity-30 custom-ping-slow"></div>
  <div class="absolute bottom-5 left-5 w-16 h-16 rounded-xl opacity-30 custom-float-slow"></div>

  <div class="container mx-auto px-4 relative z-10">
   <div class="text-center mb-16">
    <h2 class="text-4xl font-bold text-white mb-4">
     أنت <span
      class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 custom-text-pulse">بطل
      القصة</span>
    </h2>
    <p class="text-xl text-gray-300 max-w-2xl mx-auto">
     اختر بطلًا خارقًا، أضف صورتك واسمك، وكن النجم في مغامرتك الخاصة!
    </p>
   </div>

   <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
    <div class="relative">
     
            <div v-if="isLoadingStories" class="text-center text-gray-400 py-10">
                <div class="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mx-auto mb-3"></div>
                <p>جاري جلب آخر القصص...</p>
            </div>
            
            <div v-else class="grid grid-cols-2 gap-4">
                <div v-for="(story, index) in customStories" :key="story.id"
      	    class="group cursor-pointer transform hover:scale-105 transition-all duration-500 p-4 bg-gray-800 rounded-xl shadow-lg border border-orange-700"
      	    data-aos="fade-right" :data-aos-delay="index * 100">
      	    <div class="text-center">
                        
                        
      	        <div
        	        class="w-32 h-32 mx-auto mb-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                                <img v-if="story.imageUrl" :src="story.imageUrl" :alt="story.title" class="w-full h-full object-contain p-1">
        	            <span v-else class="material-icons text-white text-3xl">local_police</span>
        	    </div>
                        
        	    <h4 class="text-md font-bold text-white truncate" :title="story.title">{{ story.title }}</h4>
      	    </div>
          </div>
            </div>
                 <div class="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-orange-700">
      <div class="text-center transform hover:scale-110 transition-transform duration-300" data-aos="fade-up">
       <div class="text-2xl font-bold text-orange-400">15+</div>
       <div class="text-gray-300 text-sm">أبطال خارقين</div>
      </div>
      <div class="text-center transform hover:scale-110 transition-transform duration-300" data-aos="fade-up"
       data-aos-delay="100">
       <div class="text-2xl font-bold text-yellow-400">50+</div>
       <div class="text-gray-300 text-sm">قصة تفاعلية</div>
      </div>
      <div class="text-center transform hover:scale-110 transition-transform duration-300" data-aos="fade-up"
       data-aos-delay="200">
       <div class="text-2xl font-bold text-red-400">10K+</div>
       <div class="text-gray-300 text-sm">طفل مستفيد</div>
      </div>
     </div>
    </div>

    <div class="text-right">
     <div class="space-y-6">
      <div class="flex items-start gap-4 transform hover:translate-x-2 transition-transform duration-300"
       data-aos="fade-left">
       <div
        class="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
        <span class="material-icons text-white text-2xl">photo_camera</span>
       </div>
       <div>
        <h4 class="text-xl font-bold text-white mb-2">التقط صورتك</h4>
        <p class="text-gray-300">استخدم الكاميرا أو ارفع صورتك المفضلة لتصبح بطل القصة</p>
       </div>
      </div>
      <div class="flex items-start gap-4 transform hover:translate-x-2 transition-transform duration-300"
       data-aos="fade-left" data-aos-delay="100">
       <div
        class="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
        <span class="material-icons text-white text-2xl">supervisor_account</span>
       </div>
       <div>
        <h4 class="text-xl font-bold text-white mb-2">اختر بطلك</h4>
        <p class="text-gray-300">اختر من مجموعة متنوعة من الأبطال الخارقين المناسبين لأعمار الأطفال</p>
       </div>
      </div>
      <div class="flex items-start gap-4 transform hover:translate-x-2 transition-transform duration-300"
       data-aos="fade-left" data-aos-delay="200">
       <div
        class="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
        <span class="material-icons text-white text-2xl">auto_stories</span>
       </div>
       <div>
        <h4 class="text-xl font-bold text-white mb-2">عش المغامرة</h4>
        <p class="text-gray-300">استمتع بقصة تفاعلية حيث تكون أنت النجم الرئيسي في أحداثها</p>
       </div>
      </div>
     </div>

     <button @click="emit('goToCustomStory')"
      class="mt-8 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
      data-aos="zoom-in" data-aos-delay="300">
      <span class="text-lg">ابدأ مغامرتك</span>
      <span class="material-icons transform rotate-180">arrow_forward</span>
     </button>
    </div>
   </div>
  </div>
 </section>
</template>