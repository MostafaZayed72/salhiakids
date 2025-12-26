<template>
  <div dir="rtl" class=" bg-gray-50 flex flex-col font-sans">
    
    <!-- Top Bar: Progress & Status -->
    <header class="bg-white/90 backdrop-blur shadow-sm border-b sticky top-0 z-50 transition-all duration-300">
      <div class="container mx-auto px-4 py-3">
        
        <div class="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 mb-2">
          
          <!-- Right: Back & Title -->
          <div class="flex items-center justify-between w-full md:w-auto md:flex-1">
             <div class="flex items-center gap-3">
                 <button @click="router.push('/')" class="text-gray-500 hover:text-purple-600 transition-colors bg-gray-50 p-2 rounded-full">
                   <span class="material-icons text-xl">arrow_forward</span>
                 </button>
                 <h1 class="font-bold text-gray-800 text-lg leading-tight line-clamp-1">
                   {{ story?.storyName || 'جاري تحميل القصة...' }}
                 </h1>
             </div>
             
             <!-- Mobile Status (Generating) -->
             <div v-if="isGenerating" class="md:hidden">
                <span class="material-icons text-purple-600 animate-spin text-xl">autorenew</span>
             </div>
          </div>

          <!-- Center/Left: Actions & Status -->
          <div class="flex items-center justify-between w-full md:w-auto gap-3">
             
             <!-- PDF Button -->
             <button v-if="storyFullyComplete" @click="downloadPdf" 
                    class="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-6 py-2 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95">
                <span class="material-icons text-lg">picture_as_pdf</span>
                <span>تحميل القصة</span>
             </button>

             <!-- Desktop Status -->
             <div v-if="isGenerating" class="hidden md:flex items-center gap-2 text-sm font-medium text-purple-600 bg-purple-50 px-4 py-2 rounded-xl animate-pulse">
                <span class="material-icons text-sm animate-spin">autorenew</span>
                <span>جاري الكتابة...</span>
             </div>
          </div>

        </div>
        
        <!-- Reading Progress Bar -->
        <div class="relative h-2 bg-gray-100 rounded-full overflow-hidden w-full mt-2" dir="rtl">
          <!-- Force inline gradient to ensure visibility -->
          <div class="absolute top-0 right-0 h-full transition-all duration-500 ease-out shadow-sm"
               :style="{ width: readingProgressPercent + '%', background: 'linear-gradient(to left, #9333ea, #0ea5e9)' }"></div>
        </div>
        
        <!-- Text Progress Indicator -->
        <div class="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
            <span>البداية</span>
            <span>{{ readingProgressPercent }}%</span>
            <span>النهاية</span>
        </div>

      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-2 flex flex-col items-center justify-start">
      
      <div v-if="!story" class="text-center py-20">
         <div class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
         <p class="text-gray-500">جاري الاتصال بعالم الحكايات...</p>
      </div>

      <div v-else-if="currentSlide" class="w-full max-w-5xl perspective-container relative my-2">
        <transition name="page-flip">
             <!-- Slide Content -->
             <div :key="currentSlideIndex" 
                  class="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col transition-all duration-500 border border-gray-100 w-full backface-hidden origin-center min-h-[600px]"
                  :class="{'md:flex-row': currentSlideIndex !== 0}">
                
                  <!-- COVER VIEW (Index 0) -->
                  <div v-if="currentSlideIndex === 0" class="w-full h-full flex flex-col items-center justify-center p-8 bg-[#fffbf0] text-center relative border-[12px] border-double border-[#8b5a2b]">
                      
                      <!-- Decor Corners -->
                      <div class="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-[#8b5a2b] rounded-tl-3xl opacity-60"></div>
                      <div class="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-[#8b5a2b] rounded-tr-3xl opacity-60"></div>
                      <div class="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-[#8b5a2b] rounded-bl-3xl opacity-60"></div>
                      <div class="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-[#8b5a2b] rounded-br-3xl opacity-60"></div>

                      <div class="z-10 max-w-2xl w-full flex flex-col items-center gap-8">
                          
                          <!-- Cover Title -->
                          <div class="space-y-2">
                              <h1 class="text-4xl md:text-6xl font-bold text-[#5c3a1e]" style="font-family: 'Reem Kufi', sans-serif;">
                                  {{ currentSlide.title || 'عنوان القصة' }}
                              </h1>
                              
                              <h2 v-if="story?.heroName" class="text-2xl md:text-3xl text-[#8b5a2b] font-semibold mt-2">
                                  البطل: {{ story.heroName }}
                              </h2>

                              <div class="h-1 w-32 bg-[#8b5a2b] mx-auto rounded-full mt-4"></div>
                          </div>

                          <!-- Cover Image -->
                          <div class="w-64 h-64 md:w-80 md:h-80 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] border-8 border-white overflow-hidden transform hover:scale-105 transition-transform duration-700">
                             <img v-if="currentSlide.imageUrl" 
                                  :src="currentSlide.imageUrl" 
                                  class="w-full h-full object-cover" 
                                  alt="غلاف القصة" />
                             <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <span class="material-icons text-6xl text-gray-400">auto_stories</span>
                             </div>
                          </div>

                          <!-- Description / Intro -->
                          <p class="text-lg md:text-xl text-[#6d4c33] leading-relaxed max-w-lg font-medium">
                              {{ currentSlide.description }}
                          </p>

                          <!-- Start Button Cue -->
                          <button @click="nextSlide" class="mt-4 px-8 py-3 bg-[#8b5a2b] text-[#fffbf0] rounded-full font-bold text-lg hover:bg-[#6d4c33] transition-colors shadow-lg flex items-center gap-2 animate-bounce">
                              <span>ابدأ القراءة</span>
                              <span class="material-icons">menu_book</span>
                          </button>
                      </div>

                      <!-- Background Pattern -->
                      <div class="absolute inset-0 opacity-5 pointer-events-none" 
                           style="background-image: radial-gradient(#8b5a2b 1px, transparent 1px); background-size: 20px 20px;">
                      </div>
                  </div>

                  <!-- STANDARD STORY VIEW (Index > 0) -->
                  <div v-else class="flex flex-col md:flex-row w-full h-full relative group">
                    
                    <!-- Image Section -->
                     <div class="md:w-1/2 relative overflow-hidden bg-gray-100 min-h-[250px] md:min-h-[450px]"
                          :class="{ 'md:order-1': isOddSlide, 'md:order-2': !isOddSlide }">
                        
                        <img v-if="currentSlide.imageUrl" 
                             :src="currentSlide.imageUrl" 
                             class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                             alt="مشهد القصة" />
                        
                        <div v-else class="w-full h-full flex items-center justify-center flex-col gap-4 text-gray-400 bg-gray-50">
                            <span class="material-icons text-6xl animate-pulse">brush</span>
                            <p class="animate-pulse">جاري رسم المشهد...</p>
                        </div>
                        
                        <!-- Slide Number Badge -->
                        <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm z-10">
                          #{{ currentSlideIndex + 1 }}
                        </div>
                     </div>

                     <!-- Text Section -->
                     <div class="md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-white relative"
                          :class="{ 'md:order-2': isOddSlide, 'md:order-1': !isOddSlide }">
                        
                        <!-- Decorative Elements -->
                        <div class="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full opacity-50 -z-0"></div>
                        <div class="absolute bottom-0 left-0 w-24 h-24 bg-sky-50 rounded-tr-full opacity-50 -z-0"></div>

                        <div class="relative z-10">
                          <!-- Title Removed as per request -->
                          <p class="text-base md:text-xl text-gray-600 leading-loose whitespace-pre-line">
                             {{ currentSlide.description }}
                          </p>
                        </div>
                     </div>

                  </div>
             </div>
        </transition>
      </div>

      <!-- Empty State (No slides yet) -->
      <div v-else class="text-center py-20 max-w-lg mx-auto">
         <img src="https://cdni.iconscout.com/illustration/premium/thumb/writer-writing-novel-2975815-2476891.png" class="w-64 h-64 object-contain mx-auto opacity-80 mb-6" /> 
         <h3 class="text-2xl font-bold text-gray-800 mb-2">جاري تأليف قصتك...</h3>
         <p class="text-gray-500">الذكاء الاصطناعي يقوم بكتابة أحداث مثيرة الآن. انتظر قليلاً!</p>
      </div>

    </main>

    <!-- Navigation Footer (Compact) -->
    <footer class="bg-white/95 backdrop-blur border-t py-4 sticky bottom-0 z-40 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)]">
      <div class="container mx-auto px-4 flex items-center justify-between max-w-4xl">
         
         <div class="flex items-center gap-2">
            <button @click="prevSlide" :disabled="currentSlideIndex === 0"
                    class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-700">
                <span class="material-icons">arrow_forward</span>
                <span class="hidden md:inline">السابق</span>
            </button>
         </div>

         <div class="flex flex-col items-center">
            <span class="text-gray-400 text-sm font-medium">
                {{ currentSlideIndex + 1 }} / {{ totalExpectedSlides }}
            </span>
         </div>

         <button @click="nextSlide" :disabled="!canGoNext"
                 class="flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg text-white"
                 :class="canGoNext ? 'bg-gradient-to-r from-purple-600 to-sky-600 hover:scale-105 hover:shadow-purple-500/25' : 'bg-gray-300 cursor-not-allowed'">
            <span class="hidden md:inline">التالي</span>
            <span class="material-icons">arrow_back</span>
         </button>

      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// State
const storyId = route.params.id;
const story = ref(null);
const slides = ref([]);
const currentSlideIndex = ref(0);
const pollInterval = ref(null);
const loading = ref(true);

// Computed
const currentSlide = computed(() => slides.value[currentSlideIndex.value] || null);
const totalExpectedSlides = computed(() => {
    // If we have strict slides count from story object, use it.
    if (story.value && typeof story.value.slidesCount === 'number') {
        return story.value.slidesCount;
    }
    // Fallback: If current slides length > 0, assume at least that many.
    // Default to 10 if we know nothing.
    return Math.max(slides.value.length, 10);
});

// Navigation Guards
const canGoNext = computed(() => {
    // Check boundaries
    if (currentSlideIndex.value >= slides.value.length - 1) return false;
    
    // Check next slide readiness
    const nextSlide = slides.value[currentSlideIndex.value + 1];
    if (!nextSlide) return false;
    
    // Condition: Must have image URL and NOT be generating/processing
    // Adjust logic based on exact API status values. Assuming "Generated" or similar, or just check image presence & status != 'Generating'
    const isReady = nextSlide.imageUrl && nextSlide.status !== 'Generating' && nextSlide.status !== 'Failed';
    return isReady;
});

const isOddSlide = computed(() => (currentSlideIndex.value + 1) % 2 !== 0);

// Completion for PDF
const storyFullyComplete = computed(() => {
    if (!story.value) return false;
    const count = story.value.slidesCount;
    if (!count) return false;
    
    // Must have all slides
    if (slides.value.length < count) return false;
    // All must be ready
    return slides.value.every(s => s.imageUrl && s.status !== 'Generating' && s.status !== 'Failed');
});

const readingProgressPercent = computed(() => {
    const total = parseInt(totalExpectedSlides.value) || 10;
    const current = currentSlideIndex.value + 1; // 1-based index
    if (total <= 0) return 0;
    return Math.min(100, Math.round((current / total) * 100));
});

const isGenerating = computed(() => !storyFullyComplete.value);

const hasNextSlide = computed(() => {
    return currentSlideIndex.value < slides.value.length - 1;
});

const hasAllSlides = computed(() => {
    return story.value && slides.value.length >= story.value.slidesCount;
});

// Methods
const fetchStory = async () => {
    try {
        const token = getCookie('authToken') || getCookie('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.post(`${API_BASE}/api/AIStories/GetById`, {
            id: storyId,
            slidesPageNumber: 1,
            slidesPageSize: 100,
            slidesOrderBy: 'index', 
            slidesDescending: true 
        }, { headers });

        if (response.data) {
            story.value = response.data;
            if (response.data.slides && Array.isArray(response.data.slides.items)) {
                // Sort by index
                let fetchedSlides = response.data.slides.items.sort((a, b) => a.index - b.index);
                
                // --- Retry Logic ---
                fetchedSlides.forEach(slide => {
                    if (slide.status === 'Failed') {
                        retrySlide(slide.id);
                    }
                });
                
                slides.value = fetchedSlides; 
            }
        }
    } catch (error) {
        console.error('Error fetching story:', error);
    } finally {
        loading.value = false;
    }
};

const retrySlide = async (slideId) => {
    try {
        console.log(`Retrying slide ${slideId}...`);
        const token = getCookie('authToken') || getCookie('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.post(`${API_BASE}/api/AIStories/Slides/${slideId}/Retry`, {}, { headers });
    } catch (e) {
        console.error(`Failed to retry slide ${slideId}`, e);
    }
};

const pollStory = () => {
    fetchStory();
    pollInterval.value = setInterval(() => {
        fetchStory();
        // Stop polling ONLY if story is fully complete
        if (storyFullyComplete.value) {
            clearInterval(pollInterval.value);
        }
    }, 4000); 
};

const nextSlide = () => {
    if (canGoNext.value) {
        currentSlideIndex.value++;
        scrollToTop();
    }
};

const prevSlide = () => {
    if (currentSlideIndex.value > 0) {
        currentSlideIndex.value--;
        scrollToTop();
    }
};

const downloadPdf = () => {
   const token = getCookie('authToken') || getCookie('token');
   const url = `${API_BASE}/api/AIStories/DownloadPdf/${storyId}`;
   
   axios.get(url, { 
       responseType: 'blob',
       headers: token ? { Authorization: `Bearer ${token}` } : {} 
   }).then((response) => {
       const href = URL.createObjectURL(response.data);
       const link = document.createElement('a');
       link.href = href;
       link.setAttribute('download', `${story.value?.storyName || 'Story'}.pdf`);
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       URL.revokeObjectURL(href);
   }).catch(console.error);
};

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const getCookie = (name) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
};

// Preload next image to make navigation instant
watch(currentSlideIndex, (newVal) => {
    const next = slides.value[newVal + 1];
    if (next && next.imageUrl) {
        const img = new Image();
        img.src = next.imageUrl;
    }
});

// Lifecycle
onMounted(() => {
    pollStory();
});

onUnmounted(() => {
    if (pollInterval.value) clearInterval(pollInterval.value);
});
</script>

<style scoped>
/* Page Flip Animation */
.page-flip-enter-active {
  transition: all 0.6s ease-out;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  transform-style: preserve-3d;
}

.page-flip-leave-active {
  transition: all 0.6s ease-in;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 5;
  transform-style: preserve-3d;
}

.page-flip-enter-from {
  transform: rotateY(-90deg);
  opacity: 0;
}
.page-flip-enter-to {
  transform: rotateY(0deg);
  opacity: 1;
}

.page-flip-leave-from {
  transform: rotateY(0deg);
  opacity: 1;
}
.page-flip-leave-to {
  transform: rotateY(90deg);
  opacity: 0;
}

.perspective-container {
    perspective: 1500px;
}

.backface-hidden {
    backface-visibility: hidden;
}

/* ... existing animations ... */
.animate-shimmer {
    animation: shimmer 1.5s infinite linear;
}
@keyframes shimmer {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}

.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
