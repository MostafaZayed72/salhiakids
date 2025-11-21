<template>
  <section class="relative py-20 bg-gray-50 overflow-hidden">
    <!-- خلفية ديكورية -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-white animate-pulse opacity-40"
    ></div>

    <div class="container mx-auto px-4 relative z-10">
      <!-- العنوان -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6"
      >
        <div>
          <h2 class="text-4xl font-bold text-gray-800 mb-3">
            أحدث المحتويات المضافة
          </h2>
          <p class="text-lg text-gray-600">
            اكتشف أجمل المحتويات التي انضمت حديثًا إلى مكتبتنا
          </p>
        </div>

        <button 
        @click="navigateTo('/searchResults')"
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <span class="font-medium">استكشف الكل</span>
          <span class="material-icons text-lg">arrow_left</span>
        </button>
      </div>

      <!-- تحميل -->
      <div v-if="isLoading" class="text-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-purple-600 mx-auto"
        ></div>
        <p class="mt-4 text-gray-700">جاري تحميل القصص...</p>
      </div>

      <!-- عرض القصص -->
      <div
        v-else-if="latestStories.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="story in latestStories"
          :key="story.id"
          class="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
        >
          <!-- الصورة -->
          <div
          @click="navigateTo(`/stories/${story.id}`)"
          class="relative h-48 bg-gray-100">
            <img
              v-if="story.coverImageUrl || story.mediaUrl"
              :src="story.coverImageUrl || story.mediaUrl"
              :alt="story.title"
              class="object-cover w-full h-full"
              @error="onImageError"
            />

            <div
              v-else
              class="flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-500 text-5xl"
            >
              <span class="material-icons">menu_book</span>
            </div>

            <!-- شارة جديد -->
            <div
              v-if="isNew(story.createdAt)"
              class="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow"
            >
              جديد
            </div>
          </div>

          <!-- التفاصيل -->
          <div class="p-4 flex flex-col gap-2 bg-gradient-to-r from-purple-600 to-pink-500">
            <h3 class="text-lg font-bold text-gray-100 truncate">
              {{ story.title || 'بدون عنوان' }}
            </h3>

            <p class="text-sm text-gray-300 line-clamp-2 min-h-[2.5rem]">
              {{ story.content || 'لا يوجد وصف' }}
            </p>

            <div
              class="flex items-center justify-between mt-3 text-sm text-gray-200"
            >
              <div class="flex items-center gap-2">
                <span class="material-icons text-base text-purple-500"
                  >person</span
                >
                <span class="truncate">{{
                  story.authorName || 'مستخدم مجهول'
                }}</span>
              </div>
              <span class="text-xs">{{ formatDate(story.createdAt) }}</span>
            </div>

            <div
              class="flex items-center justify-between mt-2 text-xs text-gray-200"
            >
              <span class="flex items-center gap-1">
                <span class="material-icons text-sm text-yellow-500">star</span>
                {{ story.averageRating ? story.averageRating.toFixed(1) : '—' }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-icons text-sm text-pink-400"
                  >comment</span
                >
                {{ story.commentsCount || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- لا توجد بيانات -->
      <div v-else class="text-center py-16">
        <div
          class="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md"
        >
          <span class="material-icons text-purple-600 text-4xl">menu_book</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-3">
          لا توجد قصص حديثة
        </h3>
        <p class="text-gray-600 text-lg">سيتم إضافة قصص جديدة قريبًا</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const latestStories = ref([])
const isLoading = ref(true)

// تنسيق التاريخ
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// تحديد هل القصة جديدة (من أسبوع)
const isNew = (date) => {
  if (!date) return false
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return new Date(date) > weekAgo
}

const onImageError = (e) => {
  e.target.style.display = 'none'
}

// جلب البيانات
const fetchLatestStories = async () => {
  isLoading.value = true
  try {
    const res = await axios.post(`${API_BASE}/api/MasterStories/GetAllMatching`, {
      storyCategoryId: null,
      searchPhrase: '',
      createdBy: null,
      approvalStatus: 1,
      orderBy: 'createdAt',
      descending: true,
      pageNumber: 1,
      pageSize: 6,
    })

    latestStories.value = res.data?.items || []
  } catch (err) {
    console.error('❌ Error fetching stories:', err)
    latestStories.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchLatestStories)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
