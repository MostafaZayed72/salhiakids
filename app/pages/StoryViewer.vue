<template>
  <div dir="rtl" class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-colors duration-300 overflow-hidden">
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-12 h-12 bg-purple-300 rounded-full opacity-20 animate-float-1"></div>
      <div class="absolute top-1/3 right-1/4 w-8 h-8 bg-blue-300 rounded-full opacity-30 animate-float-2"></div>
      <div class="absolute bottom-1/4 left-1/3 w-16 h-16 bg-pink-300 rounded-full opacity-25 animate-float-3"></div>
      <div class="absolute bottom-1/3 right-1/3 w-10 h-10 bg-yellow-300 rounded-full opacity-20 animate-float-4"></div>
      <div class="absolute top-1/2 left-1/5 w-2 h-2 bg-white rounded-full opacity-70 animate-twinkle"></div>
      <div class="absolute top-1/5 right-1/5 w-1 h-1 bg-white rounded-full opacity-50 animate-twinkle-delay"></div>
      <div class="absolute bottom-1/5 left-2/5 w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-twinkle"></div>
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-30 animate-sweep"></div>
      <div class="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-30 animate-sweep-delay"></div>
    </div>

    <header class="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 z-40">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <button @click="goBack" class="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 transform hover:scale-105 group">
            <span class="material-icons text-2xl group-hover:animate-bounce">arrow_forward</span>
            <span class="font-medium">العودة</span>
          </button>

          <div class="text-center flex-1 mx-4">
            <h1 class="text-xl font-bold text-gray-800 dark:text-white animate-pulse">
              {{ storyTitle || 'قصة' }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ storyAuthor }}</p>
          </div>

          <div class="flex items-center gap-3">
            <button @click="shareStory" class="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 transform hover:scale-110 hover:rotate-12" title="مشاركة القصة">
              <span class="material-icons text-xl">share</span>
            </button>

            <button @click="toggleAudio" class="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 transform hover:scale-110" :class="{ 'text-purple-600 dark:text-purple-400': isAudioPlaying }" title="تشغيل/إيقاف المؤثرات الصوتية">
              <span class="material-icons text-xl" v-if="isAudioPlaying">volume_up</span>
              <span class="material-icons text-xl" v-else>volume_off</span>
            </button>

            <button @click="showSettings = !showSettings" class="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 transform hover:scale-110 hover:rotate-90">
              <span class="material-icons text-xl">settings</span>
            </button>
          </div>
        </div>

        <transition name="slide-down">
          <div v-if="showSettings" class="mt-4 p-4 bg-white/90 dark:bg-gray-800/90 rounded-2xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
            <div class="grid grid-cols-2 gap-4">
              <button @click="toggleTheme" class="flex items-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <span class="material-icons">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</span>
                <span>{{ isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن' }}</span>
              </button>
              <button @click="toggleAnimations" class="flex items-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <span class="material-icons">{{ animationsEnabled ? 'animation' : 'pause' }}</span>
                <span>{{ animationsEnabled ? 'إيقاف الحركات' : 'تشغيل الحركات' }}</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </header>

    <main class="relative flex-1 py-8 z-30">
      <div class="container mx-auto px-4">
        
        <div v-if="!isLoading" class="max-w-4xl mx-auto mb-8">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">الصفحة {{ currentPage }} من {{ backendTotalPages }}</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ backendTotalPages ? Math.round((currentPage / backendTotalPages) * 100) : 0 }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
            <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg" :style="{ width: `${backendTotalPages ? (currentPage / backendTotalPages) * 100 : 0}%` }"></div>
          </div>
        </div>

        <div v-if="isLoading" class="max-w-4xl mx-auto p-8 bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <div class="text-gray-600 dark:text-gray-300">جاري تحميل القصة...</div>
        </div>

        <div v-else class="max-w-4xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transform hover:shadow-3xl transition-all duration-500">
          <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6 text-white text-center relative overflow-hidden">
            <div class="relative z-10">
              <div class="relative w-32 h-32 mx-auto mb-4 transform hover:scale-110 transition-transform duration-500">
                <div class="relative w-full h-full">
                  <img v-if="childImage" :src="childImage" alt="وجه الطفل" class="absolute top-0 left-0 w-full h-full child-face-mask animate-pulse-gentle">
                </div>
              </div>

              <h2 class="text-3xl font-bold mb-2 animate-fade-in-up">مغامرة {{ childName }}</h2>
              <p class="text-purple-100 text-lg animate-fade-in-up-delay">{{ storyTitle }}</p>
            </div>
          </div>

          <div class="p-8 min-h-96 flex items-center justify-center relative">
            <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-4xl text-purple-300 animate-bounce"><span class="material-icons">auto_awesome</span></div>
            <div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-4xl text-pink-300 animate-bounce-delay"><span class="material-icons">auto_awesome</span></div>

            <transition :name="pageTransition" mode="out-in" @enter="onPageEnter" @leave="onPageLeave">
              <div :key="pageKey" class="text-center w-full">
                <div class="mb-6 transform hover:scale-105 transition-transform duration-500">
                  <div class="relative h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl overflow-hidden mx-auto max-w-md shadow-2xl">
                    <div v-if="!currentPageData.image" class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800">
                      <span class="text-6xl animate-bounce">{{ getPageEmoji(currentPage) }}</span>
                    </div>
                    <img v-else :src="currentPageData.image" :alt="currentPageData.title" class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent"></div>
                    <div class="absolute inset-0 border-2 border-white/50 rounded-2xl animate-pulse-border"></div>
                  </div>
                </div>

                <div class="mb-8">
                  <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in-up">{{ currentPageData.title }}</h3>
                  <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto animate-fade-in-up-delay" v-html="formatStoryText(currentPageData.content)"></p>
                </div>

                <div v-if="isAdmin" class="flex justify-center gap-2 mt-4">
                  <button @click="editCurrentSlide" class="px-3 py-1 bg-blue-500 text-white rounded flex items-center gap-1">
                    <span class="material-icons text-sm">edit</span>تعديل
                  </button>
                  <button @click="deleteCurrentSlide" class="px-3 py-1 bg-red-500 text-white rounded flex items-center gap-1">
                    <span class="material-icons text-sm">delete</span>حذف
                  </button>
                </div>

                <div v-if="currentPageData.soundEffect && isAudioPlaying" class="mb-6 animate-bounce-in">
                  <button @click="playSoundEffect(currentPageData.soundEffect)" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg group">
                    <span class="material-icons text-xl group-hover:animate-spin">play_circle</span>
                    <span class="font-medium">تشغيل المؤثر الصوتي</span>
                  </button>
                </div>

                <div v-if="currentPageData.interactions" class="mt-6 animate-fade-in">
                  <div class="flex justify-center gap-4">
                    <button v-for="interaction in currentPageData.interactions" :key="interaction.id" @click="triggerInteraction(interaction)" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:rotate-3">
                      {{ interaction.label }}
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <div class="border-t border-gray-200/50 dark:border-gray-700/50 p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md">
            <div class="flex items-center justify-between">
              <button @click="previousPage" :disabled="currentPage === 1" :class="['flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform', currentPage === 1 ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white hover:scale-105 hover:shadow-lg group']">
                <span class="material-icons text-xl group-hover:animate-bounce">arrow_forward</span>
                <span>السابق</span>
              </button>

              <div class="flex items-center gap-2">
                <span v-for="page in backendTotalPages" :key="page" @click="goToPage(page)" :class="['w-3 h-3 rounded-full cursor-pointer transition-all duration-300 transform hover:scale-150', page === currentPage ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125 shadow-lg' : 'bg-gray-300 dark:bg-gray-600 hover:bg-purple-300']" :title="`الصفحة ${page}`"></span>
              </div>

              <button @click="nextPage" :disabled="currentPage === backendTotalPages" :class="['flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform', currentPage === backendTotalPages ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-105 hover:shadow-lg group']">
                <span>التالي</span>
                <span class="material-icons text-xl group-hover:animate-bounce">arrow_back</span>
              </button>
            </div>

            <div v-if="isAdmin" class="mt-4 text-center">
              <button @click="showAddModal = true" class="px-4 py-2 bg-green-500 text-white rounded-xl flex items-center gap-2 mx-auto">
                <span class="material-icons">add_circle</span>
                إضافة سلايد جديد
              </button>
            </div>
          </div>
        </div>

        <div v-if="suggestions.length" class="max-w-4xl mx-auto mt-16 animate-fade-in-up">
          <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">قصص أخرى قد تعجبك</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(sug, idx) in suggestions" :key="sug.id" @click="openSuggestion(sug)" class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 group">
              <div class="relative h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl mb-3 overflow-hidden">
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 group-hover:scale-110 transition-transform duration-500">
                  <span class="text-4xl transform group-hover:scale-125 transition-transform duration-300">{{ getSuggestionEmoji(idx) }}</span>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h4 class="font-bold text-gray-800 dark:text-white text-center mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{{ sug.title }}</h4>
              <p class="text-gray-600 dark:text-gray-400 text-sm text-center">{{ sug.createdByUserName || sug.createdBy }}</p>
            </div>
          </div>
        </div>

      </div>
    </main>

    <transition name="zoom">
      <div v-if="showCompletion" class="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20 animate-bounce-in">
          <div class="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span class="material-icons text-white text-4xl animate-spin-slow">celebration</span>
          </div>

          <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in-up">أحسنت!</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6 animate-fade-in-up-delay">لقد أكملت مغامرة {{ childName }} بنجاح. أنت بطل حقيقي!</p>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="text-center animate-fade-in-up" style="animation-delay: 0.2s">
              <div class="text-lg font-bold text-purple-600 dark:text-purple-400">{{ backendTotalPages }}</div>
              <div class="text-gray-500 dark:text-gray-400 text-sm">صفحة</div>
            </div>
            <div class="text-center animate-fade-in-up" style="animation-delay: 0.3s">
              <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ readingTime }}</div>
              <div class="text-gray-500 dark:text-gray-400 text-sm">دقيقة</div>
            </div>
          </div>

          <div class="flex gap-3">
            <button @click="restartStory" class="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style="animation-delay: 0.4s">إعادة</button>
            <button @click="createNewStory" class="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style="animation-delay: 0.5s">قصة جديدة</button>
          </div>
        </div>
      </div>
    </transition>

    <teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full">
          <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">تعديل السلايد</h3>

          <form @submit.prevent="updateSlide">
            <div class="space-y-4">
              <div>
                <label class="block mb-1 text-gray-700 dark:text-gray-300">العنوان</label>
                <input v-model="editingSlide.title" type="text" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" required>
              </div>

              <div>
                <label class="block mb-1 text-gray-700 dark:text-gray-300">الوصف</label>
                <textarea v-model="editingSlide.description" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" rows="3" required></textarea>
              </div>

              <div>
                <label class="block mb-1 text-gray-700 dark:text-gray-300">الصورة</label>
                <div class="relative">
                  <input type="file" accept="image/*" @change="onEditImageSelected" :disabled="isUploadingImage" class="w-full opacity-0 absolute inset-0 cursor-pointer">
                  
                  <button type="button" :disabled="isUploadingImage" class="w-full py-2 border rounded-lg flex items-center justify-center gap-2 transition-colors duration-300" :class="isUploadingImage ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'">
                    <span v-if="isUploadingImage" class="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></span>
                    <span v-else class="material-icons">cloud_upload</span>
                    <span>{{ isUploadingImage ? 'جاري الرفع...' : 'اختر ملف صورة جديدة' }}</span>
                  </button>
                </div>
                <img v-if="editingSlide.imageUrl && !isUploadingImage" :src="editingSlide.imageUrl" class="mt-2 h-32 object-contain mx-auto rounded border border-gray-300 p-1">
                <p v-if="editingSlide.imageUrl && !isUploadingImage" class="text-xs text-center text-gray-500 mt-1">الصورة الحالية</p>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button type="button" @click="showEditModal = false" :disabled="isUploadingImage" class="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors">إلغاء</button>
              <button type="submit" :disabled="isUploadingImage" class="px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1">
                <span v-if="isUploadingImage" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full">
          <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">إضافة سلايد جديد</h3>

          <form @submit.prevent="addSlide">
            <div class="space-y-4">
              <div>
                <label class="block mb-1 text-gray-700 dark:text-gray-300">العنوان</label>
                <input v-model="newSlide.title" type="text" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" required>
              </div>

              <div>
                <label class="block mb-1 text-gray-700 dark:text-gray-300">الوصف</label>
                <textarea v-model="newSlide.description" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" rows="3" required></textarea>
              </div>

              <div>
                <label class="block mb-1 text-gray-700 dark:text-gray-300">الصورة</label>
                <div class="relative">
                  <input type="file" accept="image/*" @change="onNewImageSelected" :disabled="isUploadingImage" class="w-full opacity-0 absolute inset-0 cursor-pointer">
                  
                  <button type="button" :disabled="isUploadingImage" class="w-full py-2 border rounded-lg flex items-center justify-center gap-2 transition-colors duration-300" :class="isUploadingImage ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'">
                    <span v-if="isUploadingImage" class="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></span>
                    <span v-else class="material-icons">cloud_upload</span>
                    <span>{{ isUploadingImage ? 'جاري الرفع...' : 'اختر ملف صورة' }}</span>
                  </button>
                </div>
                <img v-if="newSlide.imageUrl && !isUploadingImage" :src="newSlide.imageUrl" class="mt-2 h-32 object-contain mx-auto rounded border border-gray-300 p-1">
                <p v-if="newSlide.imageUrl && !isUploadingImage" class="text-xs text-center text-gray-500 mt-1">الصورة الحالية</p>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button type="button" @click="showAddModal = false" :disabled="isUploadingImage" class="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors">إلغاء</button>
              <button type="submit" :disabled="isUploadingImage" class="px-4 py-2 bg-green-500 text-white rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1">
                <span v-if="isUploadingImage" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                إضافة السلايد
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// admin & modals
const isAdmin = ref(false)
const showEditModal = ref(false)
const showAddModal = ref(false)
// ملاحظة: editingSlide يجب أن يكون له بنية افتراضية لتجنب الأخطاء
const editingSlide = ref({ id: '', title: '', description: '', imageUrl: '', image: null }) 
const newSlide = ref({ title: '', description: '', imageUrl: '', image: null })

// state
const childName = ref(route.query.name || '')
const childImage = ref('')
const selectedStory = ref(null)
const storyAuthor = ref('')
const storyTitle = computed(() => selectedStory.value?.title || '')
const currentPage = ref(1)
const isAudioPlaying = ref(false)
const showCompletion = ref(false)
const showSettings = ref(false)
const isLoading = ref(true)
const startTime = ref(null)
const isDarkMode = ref(false)
const animationsEnabled = ref(true)
const pageTransition = ref('slide-left')

const suggestions = ref([])
// 💡 حالة التحميل الجديدة
const isUploadingImage = ref(false) 


// helpers
const getCookie = (name) => {
const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
return match ? decodeURIComponent(match[2]) : ''
}
const getToken = () => getCookie('authToken') || getCookie('token') || ''

// backend pagination settings for story items
const ITEMS_PAGE_SIZE = 1
const ITEMS_ORDER_BY = 'createdAt'
const ITEMS_DESCENDING = false // older first
const backendTotalPages = ref(0)
const pageKey = computed(() => `${selectedStory.value?.id || 'none'}-${currentPage.value}`)

// fetch story page (POST body contains id)
const fetchStoryPage = async (storyId, itemsPageNumber = 1) => {
if (!storyId || !API_BASE) return null
const url = `${API_BASE}/api/CustomStories/GetById`
const token = getToken()
const body = {
 id: storyId,
 itemsPageNumber,
 itemsPageSize: ITEMS_PAGE_SIZE,
 itemsOrderBy: ITEMS_ORDER_BY,
 itemsDescending: ITEMS_DESCENDING
}
try {
 const res = await axios.post(url, body, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
 const data = res.data
 const pages = (data.items && Array.isArray(data.items.items)) ? data.items.items.map(it => ({
 id: it.id,
 title: it.title || it.description || data.title || '',
 // هنا نحول الـ description من الـ API إلى content في الـ state
 content: it.description || '', 
 image: it.imageUrl || '',
 soundEffect: it.soundEffect || null,
 interactions: it.interactions || null
 })) : []
 storyAuthor.value = data.createdByUserName || data.createdBy || ''
 return {
 id: data.id,
 title: data.title,
 description: data.description,
 image: data.imageUrl || '',
 items: pages,
 itemsTotalPages: data.items?.totalPages || (pages.length ? 1 : 0)
 }
} catch (err) {
 console.error('fetchStoryPage error', err)
 return null
}
}

// suggestions
const fetchSuggestions = async () => {
if (!API_BASE) return
const url = `${API_BASE}/api/CustomStories/GetAllMatching`
const token = getToken()
const body = { searchPhrase: '', createdBy: '', orderBy: 'createdAt', descending: true, pageNumber: 1, pageSize: 6 }
try {
 const res = await axios.post(url, body, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
 if (res.data && Array.isArray(res.data.items)) {
 suggestions.value = res.data.items
  .filter(i => i.id !== selectedStory.value?.id)
  .map(i => ({ id: i.id, title: i.title, image: i.imageUrl || '', createdByUserName: i.createdByUserName || i.createdBy }))
 }
} catch (err) {
 console.error('fetchSuggestions error', err)
 suggestions.value = []
}
}

// admin: check current user via API
const checkAdminStatus = async () => {
if (!API_BASE) { isAdmin.value = false; return }
const url = `${API_BASE}/api/identity/users/me`
const token = getToken()
try {
 const res = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
 const data = res.data
 // determine admin by roles array or userTypeName/value
 if (data && (Array.isArray(data.roles) ? data.roles.includes('Admin') : data.userTypeName === 'Admin' || data.userTypeValue === 1)) {
 isAdmin.value = true
 } else {
 isAdmin.value = false
 }
} catch (err) {
 console.warn('checkAdminStatus failed', err)
 isAdmin.value = false
}
}

// image upload helper (optional endpoint, adjust if different)
const uploadImage = async (file) => {
if (!file || !API_BASE) return ''
const formData = new FormData()
formData.append('file', file)
try {
 const res = await axios.post(`${API_BASE}/api/Upload/UploadImage`, formData, {
 headers: { Authorization: getToken() ? `Bearer ${getToken()}` : undefined }
 })
 return res.data?.url || ''
} catch (err) {
 console.error('uploadImage failed', err)
 return ''
}
}

// computed & utilities
const totalPages = computed(() => backendTotalPages.value || 0)
const currentPageData = computed(() => {
const items = selectedStory.value?.items || []
// نستخدم الدالة formatStoryText للتنسيق والاستبدال في الـ Template، 
// لذلك نكتفي هنا بإرجاع أول عنصر
const p = items[0] || {}
return p
})
const wordCount = computed(() => {
const content = currentPageData.value.content || ''
return content ? content.split(/\s+/).filter(Boolean).length : 0
})
const readingTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 200)))
const completedPercentage = computed(() => (totalPages.value ? Math.round((currentPage.value / totalPages.value) * 100) : 0))
const storyStats = computed(() => [
{ value: currentPage.value, label: 'الصفحة الحالية' },
{ value: readingTime.value, label: 'دقيقة قراءة' },
{ value: wordCount.value, label: 'كلمة' },
{ value: `${completedPercentage.value}%`, label: 'مكتمل' }
])

// 💡 الدالة المُحدَّثة لاستبدال اسم البطل وتنسيق النص
const formatStoryText = (text) => {
    if (!text) return ''

    // 1. استبدال المتغير "اسم_البطل" بالقيمة المخزنة في childName.value
    // نستخدم تعبير عادي مع g للاستبدال الشامل لكل مرات الظهور
    let formattedText = String(text).replace(/اسم_البطل/g, childName.value || '')

    // 2. تطبيق تنسيق الأسطر الجديدة
    formattedText = formattedText.replace(/\n/g, '<br>')

    return formattedText
}

const getPageEmoji = (page) => {
const emojis = ['🌳', '🐰', '🌊', '🎉', '🚀', '👽', '🕳️', '🏆']
return emojis[(page - 1) % emojis.length] || '📖'
}
const getSuggestionEmoji = (idx) => ['🐾','🏰','🤖','📚','🌟','✨'][idx % 6] || '📚'

// navigation & interactions
const loadStory = async (id, page = 1) => {
if (!id) {
 console.warn('No story id provided in query')
 isLoading.value = false
 return
}
isLoading.value = true
selectedStory.value = null
currentPage.value = page
try {
 const full = await fetchStoryPage(id, page)
 if (full) {
 selectedStory.value = { id: full.id, title: full.title, description: full.description, image: full.image, items: full.items }
 backendTotalPages.value = full.itemsTotalPages || 0
 startTime.value = Date.now()
 await fetchSuggestions()
 } else {
 alert('تعذر تحميل القصة من السيرفر.')
 }
} finally {
 isLoading.value = false
}
}

const nextPage = async () => {
if (currentPage.value < backendTotalPages.value) {
 pageTransition.value = 'slide-left'
 currentPage.value++
 await loadStory(selectedStory.value.id, currentPage.value)
} else {
 completeStory()
}
}
const previousPage = async () => {
if (currentPage.value > 1) {
 pageTransition.value = 'slide-right'
 currentPage.value--
 await loadStory(selectedStory.value.id, currentPage.value)
}
}
const goToPage = async (page) => {
if (page >= 1 && page <= backendTotalPages.value) {
 pageTransition.value = page > currentPage.value ? 'slide-left' : 'slide-right'
 currentPage.value = page
 await loadStory(selectedStory.value.id, page)
}
}

const toggleAudio = () => { isAudioPlaying.value = !isAudioPlaying.value }
const playSoundEffect = (effect) => {
if (!isAudioPlaying.value) return
try {
 const audioContext = new (window.AudioContext || window.webkitAudioContext)()
 const osc = audioContext.createOscillator()
 const gain = audioContext.createGain()
 osc.connect(gain); gain.connect(audioContext.destination)
 osc.type = 'sine'; osc.frequency.setValueAtTime(440, audioContext.currentTime)
 gain.gain.setValueAtTime(0.1, audioContext.currentTime)
 osc.start(); osc.stop(audioContext.currentTime + 1)
} catch (e) {
 console.warn('Audio not supported', e)
}
}
const triggerInteraction = (interaction) => { console.log('interaction', interaction) }
const shareStory = async () => {
try {
 if (navigator.share) {
 await navigator.share({ title: storyTitle.value || '', text: selectedStory.value?.description || '', url: window.location.href })
 } else {
 await navigator.clipboard.writeText(window.location.href)
 alert('تم نسخ رابط القصة!')
 }
} catch (e) {
 console.error(e)
}
}
const completeStory = () => {
showCompletion.value = true
const duration = Math.round((Date.now() - (startTime.value || Date.now())) / 1000 / 60)
console.log('مدة القراءة (دقائق):', duration)
}
const restartStory = () => { currentPage.value = 1; showCompletion.value = false; startTime.value = Date.now(); if (selectedStory.value?.id) loadStory(selectedStory.value.id, 1) }
const createNewStory = () => { router.push('/custom-story') }
const goBack = () => { router.back() }
const openSuggestion = (sug) => { loadStory(sug.id, 1) }

// Admin functions: edit / delete / add
const editCurrentSlide = () => {
  // تعيين القيم الحالية من currentPageData
  const src = currentPageData.value
  
  editingSlide.value = {
    id: src.id || '',
    title: src.title || '',
    // الوصف هو content في الـ state (الذي يرجع description من الـ API)
    description: src.content || '', 
    // الصورة هي image في الـ state (الذي يرجع imageUrl من الـ API)
    imageUrl: src.image || '' 
  }
  showEditModal.value = true
}

const onEditImageSelected = async (e) => {
  const file = e.target.files && e.target.files[0]
  if (file) {
    isUploadingImage.value = true // 💡 تفعيل حالة التحميل
    const url = await uploadImage(file)
    if (url) {
      // ensure form field updated
      if (!editingSlide.value) editingSlide.value = {}
      editingSlide.value.imageUrl = url
    }
    isUploadingImage.value = false // 💡 إيقاف حالة التحميل
  }
}

const updateSlide = async () => {
  if (!editingSlide.value) return
  if (isUploadingImage.value) return // منع الإرسال أثناء الرفع

  try {
    await axios.put(`${API_BASE}/api/CustomStoryItems/Update`, {
      id: editingSlide.value.id,
      title: editingSlide.value.title,
      description: editingSlide.value.description || '', 
      imageUrl: editingSlide.value.imageUrl || ''
    }, { headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {} })
    
    showEditModal.value = false
    // إعادة تحميل الصفحة الحالية لتعكس التعديلات الجديدة
    await loadStory(selectedStory.value.id, currentPage.value) 
  } catch (err) {
    console.error('updateSlide failed', err)
    alert('فشل تحديث السلايد')
  }
}

const deleteCurrentSlide = async () => {
if (!currentPageData.value?.id) return
if (!confirm('هل أنت متأكد من حذف هذا السلايد؟')) return
try {
 await axios.delete(`${API_BASE}/api/CustomStoryItems/Delete/${currentPageData.value.id}`, { headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {} })
 // after delete reload current or previous page
 const nextPageIndex = Math.max(1, Math.min(currentPage.value, backendTotalPages.value - 1 || 1))
 await loadStory(selectedStory.value.id, nextPageIndex)
} catch (err) {
 console.error('deleteCurrentSlide failed', err)
 alert('فشل حذف السلايد')
}
}
const onNewImageSelected = async (e) => {
const file = e.target.files[0]
if (file) {
  isUploadingImage.value = true // 💡 تفعيل حالة التحميل
 const url = await uploadImage(file)
 if (url) newSlide.value.imageUrl = url
  isUploadingImage.value = false // 💡 إيقاف حالة التحميل
}
}
const addSlide = async () => {
if (!selectedStory.value?.id) return
if (isUploadingImage.value) return // منع الإرسال أثناء الرفع

try {
 await axios.post(`${API_BASE}/api/CustomStoryItems/Add`, {
 customStoryId: selectedStory.value.id,
 title: newSlide.value.title,
 description: newSlide.value.description,
 imageUrl: newSlide.value.imageUrl || ''
 }, { headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {} })
 showAddModal.value = false
 newSlide.value = { title: '', description: '', imageUrl: '', image: null }
 // reload last page to show new slide (backendTotalPages updated on reload)
 await loadStory(selectedStory.value.id, backendTotalPages.value + 1)
} catch (err) {
 console.error('addSlide failed', err)
 alert('فشل إضافة السلايد')
}
}

// lifecycle
onMounted(async () => {
  childName.value = route.query.name || ''
  const imageKey = route.query.imageKey
if (imageKey) {
  const storedImage = localStorage.getItem(imageKey)
  if (storedImage) {
    childImage.value = storedImage
  }
}
await checkAdminStatus()
const id = route.query.templateId || route.query.story || route.query.id || route.query.template
const page = Number(route.query.page) || 1
loadStory(id, page)
isDarkMode.value = document.documentElement.classList.contains('dark')
})

watch(route, (r) => {
const id = r.query.templateId || r.query.story || r.query.id
const page = Number(r.query.page) || 1
if (id) loadStory(id, page)
})
</script>
<style scoped>
/* حركات الصفحات */
.slide-left-enter-active { animation: slideInLeft 0.6s ease-out; }
.slide-left-leave-active { animation: slideOutLeft 0.6s ease-in; }
.slide-right-enter-active { animation: slideInRight 0.6s ease-out; }
.slide-right-leave-active { animation: slideOutRight 0.6s ease-in; }

@keyframes slideInLeft { from { opacity: 0; transform: translateX(50px);} to { opacity:1; transform: translateX(0);} }
@keyframes slideOutLeft { from { opacity:1; transform: translateX(0);} to { opacity:0; transform: translateX(-50px);} }
@keyframes slideInRight { from { opacity:0; transform: translateX(-50px);} to { opacity:1; transform: translateX(0);} }
@keyframes slideOutRight { from { opacity:1; transform: translateX(0);} to { opacity:0; transform: translateX(50px);} }

/* الخلفية وحركات صغيرة */
@keyframes float-1 { 0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-20px) rotate(180deg)} }
@keyframes float-2 { 0%,100%{transform:translate(0,0)}50%{transform:translate(-15px,15px) rotate(-90deg)} }
@keyframes float-3 { 0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(10px,-10px) scale(1.1)} }
@keyframes float-4 { 0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,10px) rotate(90deg)} }
@keyframes twinkle { 0%,100%{opacity:0.3}50%{opacity:1} }
@keyframes twinkle-delay { 0%,100%{opacity:0.5}50%{opacity:0.8} }
@keyframes sweep { 0%{transform:translateX(-100%)}100%{transform:translateX(100%)} }
@keyframes sweep-delay { 0%{transform:translateY(-100%)}100%{transform:translateY(100%)} }

.animate-float-1 { animation: float-1 6s ease-in-out infinite; }
.animate-float-2 { animation: float-2 8s ease-in-out infinite; }
.animate-float-3 { animation: float-3 10s ease-in-out infinite; }
.animate-float-4 { animation: float-4 7s ease-in-out infinite; }
.animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
.animate-twinkle-delay { animation: twinkle 4s ease-in-out infinite 1s; }
.animate-sweep { animation: sweep 8s linear infinite; }
.animate-sweep-delay { animation: sweep-delay 6s linear infinite 2s; }

.child-face-mask { mask-repeat: no-repeat; mask-position: center; }
.hover-lift { transition: transform 0.2s ease; }
.hover-lift:hover { transform: translateY(-2px); }

.shadow-3xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.backdrop-blur-md { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

.line-clamp-1 { display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; }
.line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.line-clamp-3 { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
</style>