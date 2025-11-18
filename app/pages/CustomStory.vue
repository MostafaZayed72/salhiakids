<template>
  <div dir="rtl" class="min-h-screen  transition-colors duration-300">
    
    <main class="flex-1 py-8">
      <div class="container mx-auto px-4">
        
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold text-gray-800 mb-6">
            اختر <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">قصتك الخاصة</span>
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            اختر قصة، أضف صورتك واسمك، وكن أنت نجم المغامرة!
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          <div class="bg-white rounded-3xl p-8 shadow-2xl border border-pink-200">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">تخصيص القصة</h2>
            
            <div class="mb-8">
              <label class="block text-lg font-medium text-gray-700 mb-4">اختر القصة القالب (الصفحة {{ currentPage }} من {{ totalPages }})</label>
              
              <div v-if="isLoadingStories" class="text-center py-4">
                  <div class="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mx-auto mb-2"></div>
                  <p class="text-gray-600 text-sm">جاري تحميل القصص...</p>
              </div>

              <div v-else>
                  <div v-if="availableStories.length > 0" class="grid grid-cols-2 gap-4">
                    <div 
                      v-for="story in availableStories" 
                      :key="story.id"
                      @click="selectStoryTemplate(story)"
                      :class="[
                        'cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 transform hover:scale-105',
                        selectedStory?.id === story.id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-pink-200 hover:border-purple-300 bg-white'
                      ]"
                    >
                      <div class="relative h-32 bg-pink-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                        <img 
                          :src="story.image" 
                          :alt="story.title"
                          class="max-w-full max-h-full object-contain"
                        >
                      </div>
                      <h4 class="font-bold text-gray-800 text-center line-clamp-1">{{ story.title }}</h4>
                      <p class="text-gray-600 text-xs text-center mt-1 line-clamp-1">{{ story.description || 'قصة' }}</p>
                    </div>
                  </div>
                  
                  <div v-else class="text-center text-gray-500 py-4">
                    <p>لم يتم العثور على قصص متاحة. (تحقق من الـ API)</p>
                  </div>
              </div>

              <div v-if="totalPages > 1 && !isLoadingStories" class="flex justify-center items-center gap-4 mt-6">
                <button 
                  @click="changePage(currentPage - 1)" 
                  :disabled="currentPage === 1"
                  class="p-2 rounded-full transition-colors duration-300"
                  :class="currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600 text-white'"
                >
                  <span class="material-icons">arrow_forward_ios</span>
                </button>
                
                <span class="text-lg font-medium text-gray-700">
                  {{ currentPage }} / {{ totalPages }}
                </span>

                <button 
                  @click="changePage(currentPage + 1)" 
                  :disabled="currentPage === totalPages"
                  class="p-2 rounded-full transition-colors duration-300"
                  :class="currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600 text-white'"
                >
                  <span class="material-icons">arrow_back_ios</span>
                </button>
              </div>

            </div>

            <div class="mb-8 border-t pt-6 border-pink-200">
              <label class="block text-lg font-medium text-gray-700 mb-4">أضف صورتك (لتكون بطل القصة)</label>
              
              <div class="flex gap-4 mb-4">
                <div class="flex-1">
                  <input type="file" ref="fileInput" accept="image/*" @change="handleImageUpload" class="hidden">
                  <button @click="$refs.fileInput.click()" class="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-colors duration-300 flex items-center justify-center gap-2">
                    <span class="material-icons">cloud_upload</span> رفع صورة
                  </button>
                </div>
                
              </div>

              <div v-if="childImage" class="mt-4">
                <div class="relative w-32 h-32 mx-auto bg-gray-100 rounded-2xl overflow-hidden border-2 border-purple-500">
                  <img :src="childImage" alt="صورة الطفل" class="w-full h-full object-cover">
                  <button @click="removeImage" class="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                    <span class="material-icons text-sm">close</span>
                  </button>
                </div>
              </div>

              <div v-if="isCameraActive" class="mt-4">
                <div class="relative bg-black rounded-2xl overflow-hidden">
                  <video ref="cameraVideo" autoplay playsinline muted class="w-full h-64 object-cover"></video>
                  <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                    <button @click="switchCamera" class="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                      <span class="material-icons">flip_camera_android</span>
                    </button>
                    <button @click="capturePhoto" class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <span class="material-icons text-3xl text-gray-800">camera</span>
                    </button>
                  </div>
                </div>
                <p class="text-center text-gray-600 mt-2 text-sm">اضغط على زر الكاميرا لالتقاط الصورة</p>
              </div>
            </div>

            <div class="mb-8 border-t pt-6 border-pink-200">
              <label class="block text-lg font-medium text-gray-700 mb-3">اكتب اسمك</label>
              <input type="text" v-model="childName" placeholder="اكتب اسمك هنا..." class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 text-center" maxlength="20">
              <div class="text-right text-sm text-gray-500 mt-2">{{ childName.length }}/20</div>
            </div>

            <button @click="createStory" :disabled="!isFormValid" :class="['w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300', isFormValid ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transform hover:scale-105 shadow-lg hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed']">
              <span v-if="!isGenerating">ابدأ قصتك المخصصة 🚀</span>
              <span v-else class="flex items-center justify-center gap-2">
                <span class="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></span>
                جاري إنشاء قصتك...
              </span>
            </button>
          </div>

          <div class="bg-white rounded-3xl p-8 shadow-2xl border border-pink-200">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">معاينة القصة</h2>
            
            <div class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 min-h-96 flex flex-col items-center justify-center">
              
              <div v-if="!selectedStory || !childName" class="text-center text-gray-500">
                <span class="material-icons text-6xl mb-4">auto_stories</span>
                <p class="text-lg">اختر قصتك واكتب اسمك لترى المعاينة</p>
              </div>

              <div v-else class="text-center w-full">
                <div class="bg-white rounded-2xl p-6 shadow-lg mb-6">
                  <div class="relative h-48 bg-gradient-to-br from-purple-300 to-pink-400 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="relative w-32 h-32">
                        <!-- <img 
                          :src="selectedStory.image" 
                          :alt="selectedStory.title"
                          class="max-w-full max-h-full object-contain rounded-full border-4 border-white"
                        > -->
                        <img v-if="childImage" :src="childImage" alt="وجه الطفل" class="absolute top-0 left-0 w-full h-full  rounded child-face-mask">
                      </div>
                    </div>
                  </div>
                  
                  <h3 class="text-2xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {{ selectedStory.title }} مع {{ childName }}
                  </h3>
                  <p class="text-gray-600 line-clamp-3">
                    {{ selectedStory.description || 'قصة مغامرة مثيرة مليئة بالتحديات والإنجازات' }}
                  </p>
                  
                  <!-- <div class="flex justify-center gap-2 mt-4">
                    <span 
                      v-if="selectedStory.ageGroup"
                      class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {{ selectedStory.ageGroup }}
                    </span>
                    <span 
                      v-if="selectedStory.heroName"
                      class="bg-pink-500 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {{ selectedStory.heroName }}
                    </span>
                  </div> -->
                </div>

                <!-- <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div class="text-center">
                    <span class="material-icons text-purple-500">schedule</span>
                    <div>{{ selectedStory.duration || 'غير محدد' }}</div>
                  </div>
                  <div class="text-center">
                    <span class="material-icons text-pink-500">star</span>
                    <div>{{ selectedStory.rating || 'N/A' }}</div>
                  </div>
                </div> -->
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios' 

export default {
  name: 'CustomStory',
  setup() {
    const router = useRouter()
    
    // حالة البيانات والتحميل والـ Pagination
    const availableStories = ref([])
    const isLoadingStories = ref(true) 
    const currentPage = ref(1)
    const pageSize = 6 
    const totalPages = ref(1)

    // حالة التطبيق
    const childName = ref('')
    const childImage = ref('')
    const selectedStory = ref(null) 
    const isGenerating = ref(false)
    const isCameraActive = ref(false)
    const cameraStream = ref(null)
    const cameraVideo = ref(null)
    const fileInput = ref(null)
    const currentFacingMode = ref('user')


    // الحسابات
    const isFormValid = computed(() => {
      // ⚠️ التحقق: يجب أن تكون القصة مختارة (ليست null) والاسم غير فارغ
      // 💡 إذا كنت قد أكملت جميع الخطوات الثلاث ولا يزال معطلاً، قم بتغيير الشرط مؤقتاً للتأكد من المشكلة:
      // return childName.value.trim().length > 0
      
      // وإلا، ابقِ الشرط كما هو للتأكد من اختيار القصة
      return selectedStory.value && childName.value.trim().length > 0
    })

    // الدوال الأساسية
    const selectStoryTemplate = (story) => {
        // 💡 نقطة التصحيح الرئيسية: يجب أن تكون قيمة 'story' هنا كائنة
        if (story && story.id) {
            selectedStory.value = story
            console.log('Story Selected (SUCCESS):', selectedStory.value.title, 'ID:', selectedStory.value.id); 
            console.log('isFormValid:', isFormValid.value); // تأكد من أن هذا يصبح 'true'
        } else {
             console.error('Story object is invalid or missing ID on click.');
        }
    }

    // 🌟 دالة جلب القصص الجاهزة (مع Pagination)
    const fetchAvailableStories = async (page = 1) => {
        isLoadingStories.value = true
        
        const BASE_URL = import.meta.env.VITE_API_BASE_URL
        const ENDPOINT = '/api/CustomStories/GetAllMatching' 
        const API_URL = `${BASE_URL}${ENDPOINT}` 
        
        if (!BASE_URL) {
            console.error('VITE_API_BASE_URL is not defined.')
            isLoadingStories.value = false
            return
        }

        const requestBody = {
            "searchPhrase": "",
            "createdBy": "",
            "orderBy": "createdAt", 
            "descending": true,
            "pageNumber": page, 
            "pageSize": pageSize 
        }

        try {
            const response = await axios.post(API_URL, requestBody)
            
            if (response.data && response.data.items) {
                availableStories.value = response.data.items.map(story => ({
                    id: story.id,
                    title: story.title || 'قصة مخصصة', 
                    ageGroup: story.ageGroup || 'جديدة', 
                    description: story.description || story.title || 'قصة قصيرة جديدة ومثيرة.',
                    heroName: story.heroTitle || 'بطل عام', 
                    duration: story.duration || '10-15 دقيقة',
                    rating: '5.0', 
                    image: story.imageUrl || 'https://via.placeholder.com/150?text=Story' 
                }))
                
                // تحديث حالة Pagination
                currentPage.value = page
                totalPages.value = response.data.totalPages || 1
            } else {
                 availableStories.value = []
                 currentPage.value = 1
                 totalPages.value = 1
            }
        } catch (error) {
            console.error('Error fetching available stories:', error)
        } finally {
            isLoadingStories.value = false
        }
    }

    // دالة تغيير الصفحة
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        fetchAvailableStories(page)
        selectedStory.value = null
      }
    }
    
    // دوال الكاميرا وتحميل الصور (مُختصرة)
    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => { childImage.value = e.target.result }
        reader.readAsDataURL(file)
        stopCamera()
      }
    }

    const startCamera = async () => { 
      if (isCameraActive.value) { stopCamera(); return }
      try {
        const constraints = { video: { facingMode: currentFacingMode.value, width: { ideal: 1280 }, height: { ideal: 720 } } }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        cameraStream.value = stream
        isCameraActive.value = true
        if (cameraVideo.value) { cameraVideo.value.srcObject = stream }
      } catch (error) {
        console.error('خطأ في تشغيل الكاميرا:', error)
        alert('تعذر الوصول إلى الكاميرا. يرجى التأكد من السماح بالوصول.')
      }
    }

    const switchCamera = async () => { 
      if (!isCameraActive.value) return
      currentFacingMode.value = currentFacingMode.value === 'user' ? 'environment' : 'user'
      stopCamera()
      setTimeout(() => { startCamera() }, 100)
    }

    const stopCamera = () => { 
      if (cameraStream.value) {
        cameraStream.value.getTracks().forEach(track => { track.stop() })
        cameraStream.value = null
      }
      isCameraActive.value = false
    }

    const capturePhoto = () => { 
      if (cameraVideo.value && cameraVideo.value.readyState === cameraVideo.value.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = cameraVideo.value.videoWidth
        canvas.height = cameraVideo.value.videoHeight
        if (currentFacingMode.value === 'user') { context.translate(canvas.width, 0); context.scale(-1, 1) }
        context.drawImage(cameraVideo.value, 0, 0, canvas.width, canvas.height)
        childImage.value = canvas.toDataURL('image/png')
        stopCamera()
      }
    }

    const removeImage = () => { childImage.value = '' }

    const createStory = async () => { 
      if (!isFormValid.value) return
      
      isGenerating.value = true
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const storyData = {
          childName: childName.value,
          childImage: childImage.value,
          storyTemplateId: selectedStory.value.id,
          storyTitle: selectedStory.value.title,
        }
        const storageKey = `child_image_${Date.now()}` // مفتاح فريد
        if (storyData.childImage) {
            localStorage.setItem(storageKey, storyData.childImage)
        }
        router.push({
          path: '/StoryViewer',
          query: {
            name: storyData.childName,
imageKey: storyData.childImage ? storageKey : undefined, // نمرر المفتاح
      templateId: storyData.storyTemplateId          }
        })

      } catch (error) {
        console.error('خطأ في إنشاء القصة:', error)
      } finally {
        isGenerating.value = false
      }
    }
    
    // دورة الحياة
    onMounted(() => {
      fetchAvailableStories(1) 
    })

    onUnmounted(() => {
      stopCamera()
    })

    // إرجاع جميع الدوال والمتغيرات
    return {
      availableStories, isLoadingStories,
      currentPage, totalPages, changePage,
      childName, childImage,
      selectedStory, isGenerating,
      isCameraActive, cameraVideo, fileInput,
      isFormValid,
      // الدوال
      selectStoryTemplate, handleImageUpload, startCamera,
      switchCamera, capturePhoto, removeImage,
      createStory, stopCamera
    }
  }
}
</script>

<style scoped>
/* خطوط قصاصة النص لضمان عدم وجود سكرول أفقي */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

video {
  transform: scaleX(-1);
}

.child-face-mask {
  mask-repeat: no-repeat;
  mask-position: center;
}
</style>