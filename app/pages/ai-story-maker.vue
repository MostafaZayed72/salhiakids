<template>
  <div dir="rtl" class="min-h-screen bg-gray-50 py-12 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div class="absolute top-[20%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-[-10%] right-[20%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>

    <div class="container mx-auto px-4 relative z-10 max-w-4xl">
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-500">مغامرتك بالذكاء الاصطناعي</span> 🤖
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          اختر قصتك، ارفع صورتك، ودع الذكاء الاصطناعي يصنع لك مغامرة سحرية!
        </p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-purple-100">
        <div class="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 p-8 text-white relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-full bg-white opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E');"></div>
          <h2 class="text-2xl font-bold flex items-center gap-3 relative z-10">
            <span class="material-icons text-4xl">auto_fix_high</span>
            صمم قصتك الآن
          </h2>
        </div>

        <form @submit.prevent="generateStory" class="p-8 space-y-8">
          
          <!-- 1. Select Story Model -->
          <div class="space-y-3">
            <label class="block text-lg font-bold text-gray-800">1. اختر نموذج القصة</label>
            <div class="relative">
              <div v-if="loadingStories" class="absolute inset-y-0 left-0 flex items-center pl-3">
                 <span class="material-icons animate-spin text-purple-500">autorenew</span>
              </div>
              <select v-model="form.customStoryId" required
                class="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 appearance-none bg-white cursor-pointer hover:border-purple-300"
                :class="{'text-gray-500': !form.customStoryId}">
                <option value="" disabled selected>اختر نوع المغامرة...</option>
                <option v-for="story in stories" :key="story.id" :value="story.id">
                  {{ story.title }}
                </option>
              </select>
              <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span class="material-icons text-gray-400">expand_more</span>
              </div>
            </div>
            <p v-if="selectedStoryDescription" class="text-sky-600 bg-sky-50 p-4 rounded-xl text-sm flex items-start gap-2">
              <span class="material-icons text-sm mt-1">info</span>
              {{ selectedStoryDescription }}
            </p>
          </div>

          <!-- 2. Hero Name -->
          <div class="space-y-3">
            <label class="block text-lg font-bold text-gray-800">2. اسم البطل</label>
            <div class="relative group">
              <input v-model="form.heroName" type="text" required
                placeholder="مثال: أحمد، سارة، البطل الشجاع..."
                class="w-full px-5 py-4 pl-12 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 group-hover:border-purple-300" />
              <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">badge</span>
            </div>
          </div>

          <!-- 3. Hero Image -->
          <div class="space-y-3">
            <label class="block text-lg font-bold text-gray-800">3. صورة البطل</label>
            <div @click="triggerImageUpload"
              class="border-3 border-dashed border-gray-300 rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-purple-500 hover:bg-purple-50 group min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden"
              :class="{ 'border-green-500 bg-green-50': imagePreview, 'border-red-300 bg-red-50': uploadError }">
              
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImageSelection" />
              
              <div v-if="isUploading" class="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-purple-600 font-bold">جاري رفع الصورة...</p>
              </div>

              <template v-if="imagePreview">
                <img :src="imagePreview" class="w-40 h-40 object-cover rounded-full shadow-lg border-4 border-white mb-4 animate-pop-in" />
                <button @click.stop="removeImage" class="absolute top-4 right-4 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors shadow-sm">
                  <span class="material-icons">close</span>
                </button>
                <p class="text-green-600 font-bold flex items-center gap-2">
                  <span class="material-icons">check_circle</span>
                  تم اختيار الصورة بنجاح
                </p>
              </template>

              <template v-else>
                <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span class="material-icons text-4xl text-purple-500">add_a_photo</span>
                </div>
                <h3 class="text-xl font-bold text-gray-700 mb-2">اضغط لرفع صورة</h3>
                <p class="text-gray-500 text-sm">يفضل صورة واضحة للوجه للحصول على أفضل النتائج</p>
              </template>
            </div>
            <p v-if="uploadError" class="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span class="material-icons text-sm">error</span>
              {{ uploadError }}
            </p>
          </div>

          <!-- Submit Button -->
          <div class="pt-6">
            <button type="submit" :disabled="isSubmitting || !isFormValid"
              class="w-full bg-gradient-to-r from-purple-600 to-sky-600 text-white font-bold py-5 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-xl overflow-hidden relative">
              <div v-if="isSubmitting" class="absolute inset-0 bg-white/20 animate-pulse"></div>
              <template v-if="isSubmitting">
                <span class="material-icons animate-spin">autorenew</span>
                جاري إنشاء قصتك...
              </template>
              <template v-else>
                <span class="material-icons">auto_awesome</span>
                اصنع قصتي الآن
              </template>
            </button>
          </div>

        </form>
      </div>

      <!-- Feature Highlights -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-center transform hover:-translate-y-1 transition-transform duration-300">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-600">
            <span class="material-icons">face</span>
          </div>
          <h3 class="font-bold text-gray-800 mb-2">أنت البطل</h3>
          <p class="text-gray-500 text-sm">صورتك واسمك هما أساس القصة</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-center transform hover:-translate-y-1 transition-transform duration-300">
          <div class="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-sky-600">
            <span class="material-icons">psychology</span>
          </div>
          <h3 class="font-bold text-gray-800 mb-2">ذكاء اصطناعي</h3>
          <p class="text-gray-500 text-sm">تأليف ورسم فوري باستخدام أحدث التقنيات</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-center transform hover:-translate-y-1 transition-transform duration-300">
          <div class="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-pink-600">
            <span class="material-icons">auto_stories</span>
          </div>
          <h3 class="font-bold text-gray-800 mb-2">قصة فريدة</h3>
          <p class="text-gray-500 text-sm">كل قصة مختلفة عن الأخرى تماماً</p>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isSubmitting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center border-4 border-purple-100">
            <div class="mb-6 relative">
                 <div class="w-24 h-24 mx-auto bg-purple-50 rounded-full flex items-center justify-center">
                    <span class="material-icons text-5xl text-purple-600 animate-pulse">auto_awesome</span>
                 </div>
                 <div class="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin w-24 h-24 mx-auto"></div>
            </div>
            
            <h3 class="text-2xl font-bold text-gray-800 mb-2">جاري تحضير المغامرة</h3>
            <p class="text-gray-500 mb-6 text-sm">أبطالنا يجهزون المشهد... لحظات قليلة!</p>

            <!-- Progress Bar -->
            <div class="relative pt-1">
                <div class="flex mb-2 items-center justify-between">
                    <div>
                        <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                            تقدم
                        </span>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-semibold inline-block text-purple-600">
                            {{ submittingProgress }}%
                        </span>
                    </div>
                </div>
                <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                    <div :style="{ width: submittingProgress + '%' }" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 transition-all duration-300"></div>
                </div>
            </div>
        </div>
    </div>


    <NotificationModal 
      :isOpen="showLoginNotification" 
      :notification="loginNotification"
      @close="showLoginNotification = false" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import NotificationModal from '@/components/NotificationModal.vue';

const router = useRouter();
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// State
const stories = ref([]);
const loadingStories = ref(true);
const isUploading = ref(false);
const isSubmitting = ref(false);
const submittingProgress = ref(0);
const uploadError = ref('');
const fileInput = ref(null);
const showLoginNotification = ref(false);

const loginNotification = reactive({
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
});

const form = reactive({
  customStoryId: '',
  heroName: '',
  heroImageUrl: ''
});
const imagePreview = ref('');

// Computed
const selectedStoryDescription = computed(() => {
  const story = stories.value.find(s => s.id === form.customStoryId);
  return story ? story.description : '';
});

const selectedStoryTitle = computed(() => {
    const story = stories.value.find(s => s.id === form.customStoryId);
    return story ? story.title : '';
});

const isFormValid = computed(() => {
  return form.customStoryId && form.heroName.trim() && form.heroImageUrl;
});

// Methods
const fetchStories = async () => {
    try {
        loadingStories.value = true;
        const response = await axios.post(`${API_BASE}/api/CustomStories/GetAllMatching`, {
            searchPhrase: '',
            orderBy: 'createdAt',
            descending: true,
            pageNumber: 1,
            pageSize: 50 // Fetch enough logic
        });
        stories.value = response.data?.items || [];
    } catch (error) {
        console.error('Error fetching stories:', error);
    } finally {
        loadingStories.value = false;
    }
};

const triggerImageUpload = () => {
  if (!isUploading.value) {
    fileInput.value.click();
  }
};

const handleImageSelection = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    uploadError.value = 'يرجى اختيار ملف صورة صالح';
    return;
  }

  isUploading.value = true;
  uploadError.value = '';
  
  // Show local preview immediately
  const reader = new FileReader();
  reader.onload = (e) => imagePreview.value = e.target.result;
  reader.readAsDataURL(file);

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Get token if exists (optional depending on API, assuming it might need auth)
    const token = getCookie('authToken') || getCookie('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post(`${API_BASE}/api/Upload/UploadImage`, formData, { headers });
    
    // Assuming response structure based on addCustomStory.vue
    const url = response.data?.url || response.data?.data?.url;
    if (url) {
        form.heroImageUrl = url;
    } else {
        throw new Error('Invalid response format');
    }

  } catch (error) {
    console.error('Upload failed:', error);
    uploadError.value = 'فشل رفع الصورة، يرجى المحاولة مرة أخرى';
    imagePreview.value = ''; // Clear preview on error
    form.heroImageUrl = '';
  } finally {
    isUploading.value = false;
  }
};

const removeImage = () => {
  imagePreview.value = '';
  form.heroImageUrl = '';
  uploadError.value = '';
  if (fileInput.value) fileInput.value.value = '';
};

const generateStory = async () => {
  if (!isFormValid.value) return;

  const token = getCookie('authToken') || getCookie('token');
  if (!token) {
    showLoginNotification.value = true;
    return;
  }

  isSubmitting.value = true;
  submittingProgress.value = 0;
  
  // Simulate progress
  const progressInterval = setInterval(() => {
     if (submittingProgress.value < 90) {
         submittingProgress.value += Math.floor(Math.random() * 5) + 1;
     }
  }, 300);

  try {
    const payload = {
        customStoryId: form.customStoryId,
        storyName: selectedStoryTitle.value, // Using the selected story title
        heroName: form.heroName,
        heroImageUrl: form.heroImageUrl
    };

    const token = getCookie('authToken') || getCookie('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post(`${API_BASE}/api/AIStories/Generate`, payload, { headers });
    
    clearInterval(progressInterval);
    submittingProgress.value = 100;

    if (response.data && response.data.aiStoryId) {
         // Keep spinner for a moment at 100%
         setTimeout(() => {
             router.push(`/ai-story/${response.data.aiStoryId}`);
         }, 800);
    } else {
        throw new Error('No Story ID returned');
    }

  } catch (error) {
    clearInterval(progressInterval);
    isSubmitting.value = false;
    console.error('Generation failed:', error);
    alert('حدث خطأ أثناء بدء القصة. يرجى المحاولة مرة أخرى.');
  }
};

// Utilities
const getCookie = (name) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
};

onMounted(() => {
    fetchStories();
});
</script>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-pop-in {
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}
</style>
