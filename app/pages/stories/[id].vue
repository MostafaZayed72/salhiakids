<template>
  <div class="story-page-container min-h-screen bg-gray-200  text-right" dir="rtl">

    <!-- Loading State -->
    <div v-if="masterStoryId && isLoading" class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
      <p class="text-xl text-purple-800 font-medium">جاري تجهيز القصة...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="!masterStoryId || !masterStory.id" class="flex flex-col items-center justify-center min-h-[60vh]">
      <span class="material-icons text-6xl text-red-300 mb-4">error_outline</span>
      <p class="text-xl text-red-500 font-bold">عذراً، القصة غير متوفرة حالياً.</p>
      <button @click="router.push('/')"
        class="mt-6 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
        العودة للرئيسية
      </button>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <!-- العمود الأيمن: المحتوى والتفاعلات (يأخذ مساحة أكبر) -->
        <div class="lg:col-span-8 space-y-6">

          <!-- 1. Media Section (المحتوى أولاً) -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
            <div class="media-wrapper bg-black/5 min-h-[300px] flex items-center justify-center relative">

              <!-- Image -->
              <img v-if="storyMediaType === 'image'" :src="masterStory.mediaUrl" :alt="storyTitle"
                class="w-full h-auto max-h-[600px] object-contain mx-auto" />

              <!-- Video / Youtube -->
              <div v-else-if="storyMediaType === 'video' || storyMediaType === 'youtube'" class="w-full aspect-video">
                <iframe :src="getEmbedUrl(masterStory.mediaUrl)" class="w-full h-full" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>

              <!-- Audio -->
              <div v-else-if="storyMediaType === 'audio'"
                class="w-full py-12 px-6 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div class="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <span class="material-icons text-5xl text-purple-500">headphones</span>
                </div>
                <audio controls :src="masterStory.mediaUrl" class="w-full max-w-lg shadow-sm rounded-full"></audio>
              </div>

              <!-- PDF -->
              <div v-else-if="storyMediaType === 'pdf'" class="w-full h-[600px]">
                <iframe :src="masterStory.mediaUrl" class="w-full h-full" title="PDF Viewer"></iframe>
              </div>

              <!-- Default/File -->
              <div v-else class="py-20 text-center">
                <span class="material-icons text-6xl text-gray-300 mb-4">insert_drive_file</span>
                <p class="text-gray-500 mb-4">ملف مرفق</p>
                <a :href="masterStory.mediaUrl" target="_blank"
                  class="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition inline-flex items-center gap-2">
                  <span class="material-icons text-sm">download</span> تحميل الملف
                </a>
              </div>
            </div>
          </div>

          <!-- 2. Interaction Buttons (مفصول عن الإحصائيات) -->
          <div class="flex flex-wrap items-center justify-center gap-4 w-full">
            <button @click="toggleLike"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-sm border"
              :class="isLiked ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'">
              <span class="material-icons" :class="{ 'text-pink-500': isLiked }">{{ isLiked ? 'favorite' :
                'favorite_border' }}</span>
              <span class="font-bold">{{ isLiked ? 'أعجبني' : 'إعجاب' }}</span>
            </button>

            <button @click="toggleFavorite"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-sm border"
              :class="isFavorite ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'">
              <span class="material-icons" :class="{ 'text-yellow-500': isFavorite }">{{ isFavorite ? 'bookmark' :
                'bookmark_border' }}</span>
              <span class="font-bold">{{ isFavorite ? 'في المفضلة' : 'إضافة للمفضلة' }}</span>
            </button>

            <button @click="shareStory"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <span class="material-icons">share</span>
              <span class="font-bold">مشاركة</span>
            </button>

            <a :href="masterStory.mediaUrl" target="_blank" v-if="masterStory.mediaUrl"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <span class="material-icons">open_in_new</span>
              <span class="font-bold">فتح</span>
            </a>
          </div>
          <!-- 3. Statistics Bar (إحصائيات) -->
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 
            grid grid-cols-3 gap-y-4 place-items-center text-center
            sm:flex sm:justify-around sm:items-center sm:gap-0">

            <div class="stat-item col-span-1">
              <h4 class="text-2xl font-extrabold text-gray-800 font-english">{{ masterStory.totalViews || 0 }}</h4>
              <span class="text-xs text-gray-500 flex items-center justify-center gap-1"><span
                  class="material-icons text-[14px]">visibility</span> مشاهدة</span>
            </div>

            <div class="stat-item col-span-1">
              <h4 class="text-2xl font-extrabold text-gray-800 font-english">{{ masterStory.likesCount || 0 }}</h4>
              <span class="text-xs text-gray-500 flex items-center justify-center gap-1"><span
                  class="material-icons text-[14px]">favorite</span> إعجاب</span>
            </div>

            <div class="stat-item col-span-1">
              <h4 class="text-2xl font-extrabold text-gray-800 font-english">{{ masterStory.sharesCount || 0 }}</h4>
              <span class="text-xs text-gray-500 flex items-center justify-center gap-1"><span
                  class="material-icons text-[14px]">share</span> مشاركة</span>
            </div>

            <div class="stat-item col-span-1 sm:ml-0 sm:mr-0">
              <h4 class="text-2xl font-extrabold text-gray-800 font-english">{{ masterStory.averageRating?.toFixed(1) ||
                0 }}</h4>
              <span class="text-xs text-gray-500 flex items-center justify-center gap-1"><span
                  class="material-icons text-[14px]">star</span> تقييم</span>
            </div>

            <div class="stat-item col-span-1">
              <h4 class="text-2xl font-extrabold text-gray-800 font-english">{{ masterStory.commentsCount || 0 }}</h4>
              <span class="text-xs text-gray-500 flex items-center justify-center gap-1"><span
                  class="material-icons text-[14px]">chat_bubble</span> تعليق</span>
            </div>

            <div class="hidden sm:block"></div>

          </div> <!-- 4. Title & Description -->
          <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h1 class="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">{{ storyTitle }}</h1>
            <div class="prose prose-lg max-w-none text-gray-600 leading-relaxed text-justify"
              v-html="masterStory.content"></div>
          </div>

          <!-- 5. Comments & Ratings Section -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <span class="material-icons text-yellow-500">stars</span>
              <h3 class="text-xl font-bold text-gray-800">التقييمات والتعليقات</h3>
            </div>

            <div class="p-6">
              <!-- Rating Input -->
              <div
                class="flex flex-col sm:flex-row items-center justify-between bg-purple-50 p-4 rounded-2xl mb-6 border border-purple-100">
                <span class="text-gray-700 font-bold mb-2 sm:mb-0">ما رأيك في هذه القصة؟</span>
                <div class="flex flex-row gap-1">
                  <button v-for="star in 5" :key="star" @click="submitRating(star)" @mouseover="hoverRating = star"
                    @mouseleave="hoverRating = 0" class="transition-transform hover:scale-110 focus:outline-none">
                    <span class="material-icons text-3xl transition-colors"
                      :class="(star <= (hoverRating || userRating)) ? 'text-yellow-400' : 'text-gray-300'">
                      star_rate
                    </span>
                  </button>
                </div>
              </div>

              <!-- Add Comment -->
              <div class="relative mb-8">
                <textarea v-model="newCommentContent" placeholder="شاركنا رأيك في تعليق..." rows="3"
                  class="w-full pl-4 pr-4 pt-4 pb-12 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-200 rounded-2xl resize-none transition-all outline-none text-gray-700 placeholder-gray-400"></textarea>
                <div class="absolute bottom-3 left-3">
                  <button @click="addComment" :disabled="!newCommentContent.trim()"
                    class="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                    <span>نشر</span>
                    <span class="material-icons text-sm rotate-180">send</span>
                  </button>
                </div>
              </div>

              <!-- Comments List -->
              <div class="space-y-6">
                <div v-if="isCommentsLoading" class="text-center py-8">
                  <span class="material-icons animate-spin text-gray-300 text-3xl">refresh</span>
                </div>
                <div v-else-if="comments.length === 0"
                  class="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <span class="material-icons text-gray-300 text-5xl mb-2">chat_bubble_outline</span>
                  <p class="text-gray-500">كن أول من يشارك برأيه!</p>
                </div>
                <div v-else v-for="comment in comments" :key="comment.id" class="group">
                  <div class="flex gap-4 items-center">

                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                  flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {{ comment.createdByUser ? comment.createdByUser.fullName.charAt(0).toUpperCase() : 'U' }}
                      </div>
                    </div>

                    <div class="flex-grow">
                      <div class="bg-gray-50 rounded-2xl rounded-tr-none p-4 border border-gray-100 relative">
                        <div class="flex justify-between items-start mb-1">
                          <h4 class="font-bold text-purple-600">{{ comment.createdByUser.fullName || 'مستخدم' }}</h4>
                          <span class="text-xs text-gray-400 font-english">{{ new
                            Date(comment.createdAt).toLocaleDateString('en-GB') }}</span>
                        </div>

                        <p class="text-gray-700 leading-relaxed text-sm">{{ comment.content }}</p>

                        <div v-if="String(comment.createdBy) === String(currentUserId) || isAdmin"
                          class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-sm border border-gray-200 flex">
                          <button @click="openEditComment(comment)"
                            class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-r-lg" title="تعديل">
                            <span class="material-icons text-sm">edit</span>
                          </button>
                          <div class="w-px bg-gray-200"></div>
                          <button @click="deleteComment(comment)"
                            class="p-1.5 text-red-500 hover:bg-red-50 rounded-l-lg" title="حذف">
                            <span class="material-icons text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              <!-- Pagination -->
              <div v-if="commentsTotalPages > 1" class="flex justify-center mt-8 gap-2">
                <button @click="goToCommentPage(commentsCurrentPage - 1)" :disabled="commentsCurrentPage === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-30"><span
                    class="material-icons text-sm">chevron_right</span></button>
                <span class="text-sm flex items-center text-gray-500 font-english">{{ commentsCurrentPage }} / {{
                  commentsTotalPages }}</span>
                <button @click="goToCommentPage(commentsCurrentPage + 1)"
                  :disabled="commentsCurrentPage === commentsTotalPages"
                  class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-30"><span
                    class="material-icons text-sm">chevron_left</span></button>
              </div>
            </div>
          </div>

        </div>

        <!-- العمود الأيسر: تفاصيل القصة والتنقل (السايد بار) -->
        <div class="lg:col-span-4 space-y-6">

          <!-- 1. Details Card (تصميم الإطارات) -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
              <span class="material-icons text-purple-600">info</span> تفاصيل القصة
            </h3>

            <div class="grid grid-cols-1 gap-4">
              <div class="detail-box">
                <span class="label">المؤلف</span>
                <span class="value text-purple-700">{{ masterStory.authorName || 'غير معروف' }}</span>
              </div>
              <div class="detail-box">
                <span class="label">الفئة</span>
                <span class="value text-pink-600">{{ masterStory.storyCategoryTitle || 'عام' }}</span>
              </div>
              <div class="detail-box">
                <span class="label">سنة النشر</span>
                <span class="value font-english">{{ masterStory.publishYear || '----' }}</span>
              </div>
              <div class="detail-box">
                <span class="label">تاريخ الإضافة</span>
                <span class="value font-english">{{ masterStory.createdAt ? new
                  Date(masterStory.createdAt).toLocaleDateString('en-GB') : '--/--/----' }}</span>
              </div>
              <div class="detail-box">
                <span class="label">الحالة</span>
                <span class="value text-green-600 bg-green-50 px-2 py-0.5 rounded-md text-xs">منشورة</span>
              </div>
            </div>
          </div>

          <!-- 2. Related Stories -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
              <span class="material-icons text-purple-600">auto_stories</span> قصص قد تعجبك
            </h3>

            <div v-if="relatedStories.length > 0" class="space-y-4">
              <router-link v-for="story in relatedStories" :key="story.id" :to="`/stories/${story.id}`"
                class="flex gap-3 group cursor-pointer">
                <div class="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden relative">
                  <img :src="story.displayImage" :alt="story.title"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div class="flex flex-col justify-center">
                  <h5 class="font-bold text-gray-800 text-sm mb-1 group-hover:text-purple-600 transition line-clamp-2">
                    {{ story.title }}</h5>
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-[12px] text-yellow-400">star</span>
                    <span class="text-xs text-gray-500 font-english">{{ story.averageRating?.toFixed(1) || 0 }}</span>
                  </div>
                </div>
              </router-link>
            </div>
            <div v-else class="text-center text-gray-400 py-4 text-sm">لا توجد قصص مشابهة حالياً</div>
          </div>

          <!-- 3. Navigation Buttons (أسفل السايد بار) -->
          <div class="flex flex-col gap-3">
            <button @click="router.push('/')" class="nav-btn-secondary">
              <span class="material-icons">home</span> العودة للصفحة الرئيسية
            </button>
            <button @click="router.push('/searchResults')" class="nav-btn-secondary">
              <span class="material-icons">search</span> العودة لصفحة البحث
            </button>
            <button @click="router.push('/CustomStory')" class="nav-btn-primary">
              <span class="material-icons">edit_square</span> قصتك المخصصة
            </button>
          </div>

        </div>

      </div>
    </div>

    <!-- Edit Comment Modal -->
    <div v-if="editingComment"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg animate-fade-up">
        <h3 class="text-xl font-bold text-gray-800 mb-4">تعديل التعليق</h3>
        <textarea v-model="editingComment.newContent" rows="4"
          class="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-purple-500 outline-none mb-6 resize-none"></textarea>
        <div class="flex justify-end gap-3">
          <button @click="editingComment = null"
            class="px-6 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition">إلغاء</button>
          <button @click="updateComment" :disabled="!editingComment.newContent.trim()"
            class="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold shadow-lg shadow-purple-200 transition disabled:opacity-50">حفظ
            التعديل</button>
        </div>
      </div>
    </div>
    <NotificationModal :is-open="notification.isOpen.value" :notification="notification.notification.value"
      @close="notification.close" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useRouter } from 'vue-router'
import NotificationModal from '../../components/NotificationModal.vue'
import { useNotification } from '../../composables/useNotification'

const route = useRoute()
const router = useRouter()
const notification = useNotification()
const masterStoryId = ref('')

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const emit = defineEmits(['viewMedia'])
const hoverRating = ref(0)

// ----------------------
// حالة القصة الرئيسية والقصص المشابهة
// ----------------------
const masterStory = ref({})
const storyTitle = ref('جاري تحميل اسم القصة...')
const isAdmin = ref(false)
const editingComment = ref(null)
const currentUserId = ref(null)
const isLoading = ref(true)
const showPopup = ref(false)
const selectedMediaUrl = ref('')
const selectedMediaType = ref('')
const isUploading = ref(false)
const relatedStories = ref([])
const isLiked = ref(false)
const userRating = ref(0)
const isFavorite = ref(false)

// ----------------------
// حالة الميزات التفاعلية (تعليقات)
// ----------------------
const comments = ref([])
const newCommentContent = ref('')
const isCommentsLoading = ref(true)
const commentsTotalPages = ref(0)
const commentsCurrentPage = ref(1)
const commentsPerPage = 5

// ----------------------
// الدوال المساعدة الأساسية
// ----------------------

const shareStory = async () => {
  const storyId = masterStoryId.value;
  const url = window.location.href;
  const title = storyTitle.value;
  const platformId = 10;

  if (!storyId) return;

  if (navigator.share) {
    try {
      await navigator.share({ title: title, url: url });
      await sendShareRequest(storyId, platformId);
      notification.show({
        title: 'تم المشاركة',
        message: 'شكراً لمشاركتك هذه القصة!',
        type: 'success',
        autoClose: true,
        duration: 2000
      })
    } catch (error) {
      console.log('Web Share failed or cancelled:', error);
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      await sendShareRequest(storyId, platformId);
      notification.show({
        title: 'تم النسخ',
        message: `تم نسخ رابط القصة بنجاح`,
        type: 'success',
        autoClose: true,
        duration: 2000
      })
    } catch (error) {
      notification.show({
        title: 'خطأ في النسخ',
        message: `يمكنك نسخ رابط القصة مباشرة من المتصفح`,
        type: 'error',
        actions: [
          {
            label: 'حسناً',
            onClick: () => { },
            style: 'primary'
          }
        ]
      })
    }
  }
}

const sendShareRequest = async (storyId, platformId) => {
  try {
    const body = { masterStoryId: storyId, platform: platformId };

    await axios.post(`${API_BASE}/api/StoryShares/Share`, body, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    });

    await fetchStoryTitle(storyId);
  } catch (err) {
    console.error('Share request failed:', err);
  }
}

const getCookie = (name) => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : ''
}

const getToken = () => getCookie('authToken') || getCookie('token') || ''

const resolveStoryIdFromUrl = () => {
  if (route && route.params) {
    if (route.params.id) return String(route.params.id)
    if (route.params.masterStoryId) return String(route.params.masterStoryId)
  }
  return ''
}

const redirectBack = () => {
  notification.show({
    title: 'القصة غير منشورة',
    message: 'القصة غير منشورة. سيتم إعادتك للصفحة السابقة.',
    type: 'warning',
    actions: [
      {
        label: 'العودة',
        onClick: () => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push('/');
          }
        },
        style: 'primary',
        icon: 'home'
      }
    ]
  })
}

// ----------------------
// جلب البيانات الرئيسية
// ----------------------
const fetchStoryTitle = async (storyId) => {
  if (!storyId) {
    storyTitle.value = 'القصة غير متوفرة';
    masterStory.value = {};
    isLiked.value = false;
    isFavorite.value = false;
    return;
  }

  try {
    const response = await axios.post(`${API_BASE}/api/MasterStories/GetById`, { id: storyId }, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    });

    const storyData = response.data || {};

    if (storyData.approvalStatus === 0) {
      throw new Error('STORY_PENDING');
    }

    masterStory.value = storyData;
    storyTitle.value = masterStory.value.title || 'قصة بدون عنوان';
    isLiked.value = storyData.isLikedByCurrentUser === true;
    isFavorite.value = storyData.isFavoriteByCurrentUser === true;

  } catch (err) {
    console.error('Error fetching story title:', err);

    if (err.message === 'STORY_PENDING') {
      storyTitle.value = 'القصة معلقة وغير منشورة.';
    } else {
      storyTitle.value = 'خطأ في تحميل اسم القصة';
    }

    masterStory.value = {};
    isLiked.value = false;
    isFavorite.value = false;
  }
}

const fetchRelatedStories = async (storyCategoryId, currentStoryId) => {
  if (!storyCategoryId) {
    relatedStories.value = [];
    return;
  }

  try {
    const body = {
      storyCategoryId: storyCategoryId,
      ApprovalStatus: 1,
      orderBy: "createdAt",
      descending: true,
      pageNumber: 1,
      pageSize: 50
    };

    const response = await axios.post(`${API_BASE}/api/MasterStories/GetAllMatching`, body);

    const stories = Array.isArray(response.data?.items) ? response.data.items : [];

    const processStoryForDisplay = (story) => {
      if (story.coverImageUrl) return story.coverImageUrl;
      if (story.mediaTypeName === 'Video' || story.mediaUrl?.includes('youtube.com')) {
        const videoIdMatch = story.mediaUrl.match(/(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*)/);
        if (videoIdMatch && videoIdMatch[2].length === 11) return `https://img.youtube.com/vi/${videoIdMatch[2]}/hqdefault.jpg`;
      }
      if (story.mediaTypeName === 'Document' || story.mediaUrl?.toLowerCase().endsWith('.pdf')) return '/pdf-icon-placeholder.png';
      if (story.mediaUrl) return story.mediaUrl;
      return '/default-story-placeholder.jpg';
    };

    relatedStories.value = stories
      .filter(s => s.id !== currentStoryId)
      .slice(0, 5)
      .map(story => ({
        ...story,
        displayImage: processStoryForDisplay(story)
      }));

  } catch (err) {
    console.error('Error fetching related stories:', err);
    relatedStories.value = [];
  }
}

// ----------------------
// منطق الإعجاب (Like Logic)
// ----------------------
const toggleLike = async () => {
  const storyId = masterStoryId.value;

  if (!getToken() || !storyId) {
    notification.show({
      title: 'تنبيه',
      message: 'يجب تسجيل الدخول للإعجاب بالقصة.',
      type: 'warning',
      actions: [
        {
          label: 'تسجيل الدخول',
          onClick: () => router.push('/login'),
          style: 'primary'
        },
        {
          label: 'إلغاء',
          onClick: () => { },
          style: 'secondary'
        }
      ]
    })
    return;
  }

  try {
    const body = { masterStoryId: storyId };

    await axios.post(`${API_BASE}/api/StoryLikes/Toggle`, body, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    await fetchStoryTitle(storyId);
  } catch (err) {
    console.error('Like toggle failed:', err);
    const errorMessage = err.response?.data?.message || 'فشل في تحديث حالة الإعجاب.';
    notification.show({
      title: 'خطأ',
      message: errorMessage,
      type: 'error',
      actions: [
        {
          label: 'حسناً',
          onClick: () => { },
          style: 'primary'
        }
      ]
    })
  }
}

// ----------------------
// منطق المفضلة (Favorite Logic)
// ----------------------
const toggleFavorite = async () => {
  const storyId = masterStoryId.value;

  if (!getToken() || !storyId) {
    notification.show({
      title: 'تنبيه',
      message: 'يجب تسجيل الدخول للإضافة إلى المفضلة.',
      type: 'warning',
      actions: [
        {
          label: 'تسجيل الدخول',
          onClick: () => router.push('/login'),
          style: 'primary'
        },
        {
          label: 'إلغاء',
          onClick: () => { },
          style: 'secondary'
        }
      ]
    })
    return;
  }

  try {
    const headers = getToken() ? { Authorization: `Bearer ${getToken()}` } : {};
    const body = { masterStoryIds: [storyId] };

    if (isFavorite.value) {
      await axios.delete(`${API_BASE}/api/FavoriteStories/Remove`, { data: body, headers });
    } else {
      await axios.post(`${API_BASE}/api/FavoriteStories/Add`, body, { headers });
    }

    await fetchStoryTitle(storyId);
  } catch (err) {
    console.error('Favorite toggle failed:', err);
    const errorMessage = err.response?.data?.message || 'فشل في تحديث حالة المفضلة.';
    notification.show({
      title: 'خطأ',
      message: errorMessage,
      type: 'error',
      actions: [
        {
          label: 'حسناً',
          onClick: () => { },
          style: 'primary'
        }
      ]
    })
  }
}

// ----------------------
// منطق التقييم (Rating Logic)
// ----------------------
const fetchRating = async (storyId) => {
  if (!getToken() || !storyId) {
    userRating.value = 0;
    return;
  }

  try {
    const response = await axios.post(`${API_BASE}/api/StoryRatings/GetRating`, { masterStoryId: storyId }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    userRating.value = response.data?.rating || 0
  } catch (err) {
    userRating.value = 0
  }
}

const submitRating = async (rating) => {
  const storyId = masterStoryId.value

  if (!getToken() || !storyId) {
    notification.show({
      title: 'تنبيه',
      message: 'يجب تسجيل الدخول لإضافة تقييم.',
      type: 'warning',
      actions: [
        {
          label: 'تسجيل الدخول',
          onClick: () => router.push('/login'),
          style: 'primary'
        },
        {
          label: 'إلغاء',
          onClick: () => { },
          style: 'secondary'
        }
      ]
    })
    return
  }

  const isUpdating = userRating.value > 0;

  try {
    const body = { masterStoryId: storyId, rating: rating };

    if (isUpdating) {
      await axios.put(`${API_BASE}/api/StoryRatings/Update`, body, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
    } else {
      await axios.post(`${API_BASE}/api/StoryRatings/Add`, body, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
    }

    userRating.value = rating;
    await fetchStoryTitle(storyId);

    notification.show({
      title: 'نجاح',
      message: 'تم حفظ تقييمك بنجاح.',
      type: 'success',
      autoClose: true,
      duration: 2000
    })
  } catch (err) {
    console.error('Rating failed:', err);
    notification.show({
      title: 'خطأ',
      message: 'فشل في تسجيل التقييم.',
      type: 'error',
      actions: [
        {
          label: 'حسناً',
          onClick: () => { },
          style: 'primary'
        }
      ]
    })
  }
}

// ----------------------
// منطق المستخدم والـ Admin
// ----------------------
const checkAdminStatus = async () => {
  const token = getToken();
  if (!token) {
    isAdmin.value = false;
    currentUserId.value = null;
    return;
  }

  try {
    const response = await axios.get(`${API_BASE}/api/identity/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = response.data;

    currentUserId.value = user.id;
    isAdmin.value = user.isAdmin === true || user.roles?.includes('Admin') || false;
  } catch (err) {
    isAdmin.value = false;
    currentUserId.value = null;
    console.error('Failed to fetch user (me) data:', err);
  }
}

const openEditComment = (comment) => {
  editingComment.value = { ...comment, newContent: comment.content };
}

const updateComment = async () => {
  if (!editingComment.value) return;
  const body = {
    id: editingComment.value.id,
    content: editingComment.value.newContent
  };

  try {
    await axios.put(`${API_BASE}/api/StoryComments/Update`, body, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    editingComment.value = null;
    await fetchComments();

    notification.show({
      title: 'نجاح',
      message: 'تم حفظ التعديل.',
      type: 'success',
      autoClose: true,
      duration: 2000
    })
  } catch (err) {
    console.error('Update comment failed:', err);
    notification.show({
      title: 'خطأ',
      message: 'فشل في تعديل التعليق.',
      type: 'error',
      actions: [
        {
          label: 'حسناً',
          onClick: () => { },
          style: 'primary'
        }
      ]
    })
  }
}

const deleteComment = async (comment) => {
  notification.show({
    title: 'تأكيد الحذف',
    message: 'هل أنت متأكد من حذف هذا التعليق؟',
    type: 'warning',
    actions: [
      {
        label: 'إلغاء',
        onClick: () => { },
        style: 'secondary'
      },
      {
        label: 'حذف',
        onClick: async () => {
          try {
            await axios.delete(`${API_BASE}/api/StoryComments/Delete/${comment.id}`, {
              headers: { Authorization: `Bearer ${getToken()}` }
            });
            await fetchComments();
            notification.show({
              title: 'نجاح',
              message: 'تم حذف التعليق.',
              type: 'success',
              autoClose: true,
              duration: 2000
            })
          } catch (err) {
            console.error('Delete comment failed:', err);
            notification.show({
              title: 'خطأ',
              message: 'فشل في حذف التعليق.',
              type: 'error',
              actions: [
                {
                  label: 'حسناً',
                  onClick: () => { },
                  style: 'primary'
                }
              ]
            })
          }
        },
        style: 'primary'
      }
    ]
  })
}

// ----------------------
// Computed Properties
// ----------------------
const storyMediaType = computed(() => {
  const url = masterStory.value.mediaUrl?.toLowerCase();
  if (!url) return 'none';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.match(/\.(jpeg|jpg|png|gif|webp)$/)) return 'image';
  if (url.match(/\.(mp4|webm|ogg)$/)) return 'video';
  if (url.match(/\.(mp3|wav|oga)$/)) return 'audio';
  if (url.endsWith('.pdf')) return 'pdf';
  return 'file';
})

const getEmbedUrl = (url) => {
  if (!url) return '';
  const youtubeMatch = url.match(/(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*)/);
  if (youtubeMatch && youtubeMatch[2].length === 11) {
    return `https://www.youtube.com/embed/${youtubeMatch[2]}?rel=0`;
  }
  return url;
}

// ----------------------
// Comments Management
// ----------------------
const fetchComments = async () => {
  const storyId = masterStoryId.value
  if (!storyId) return

  isCommentsLoading.value = true
  try {
    const body = {
      masterStoryId: storyId,
      searchPhrase: '',
      orderBy: "createdAt",
      descending: true,
      pageNumber: commentsCurrentPage.value,
      pageSize: commentsPerPage
    }
    const response = await axios.post(`${API_BASE}/api/StoryComments/GetAllMatching`, body)

    comments.value = Array.isArray(response.data?.items) ? response.data.items : []
    commentsTotalPages.value = response.data?.totalPages || 0

    await fetchStoryTitle(storyId);

  } catch (err) {
    console.error('Error fetching comments:', err)
    comments.value = []
  } finally {
    isCommentsLoading.value = false
  }
}

const addComment = async () => {
  const storyId = masterStoryId.value

  if (!getToken() || !storyId) {
    notification.show({
      title: 'تنبيه',
      message: 'يجب تسجيل الدخول لإضافة تعليق.',
      type: 'warning',
      actions: [
        {
          label: 'تسجيل الدخول',
          onClick: () => router.push('/login'),
          style: 'primary'
        },
        {
          label: 'إلغاء',
          onClick: () => { },
          style: 'secondary'
        }
      ]
    })
    return
  }

  const content = newCommentContent.value.trim()
  if (!content) return

  try {
    const body = { masterStoryId: storyId, content: content }
    await axios.post(`${API_BASE}/api/StoryComments/Add`, body, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })

    newCommentContent.value = ''
    commentsCurrentPage.value = 1
    await fetchComments()

    notification.show({
      title: 'نجاح',
      message: 'تم نشر التعليق.',
      type: 'success',
      autoClose: true,
      duration: 2000
    })
  } catch (err) {
    console.error('Add comment failed:', err)
    notification.show({
      title: 'خطأ',
      message: 'فشل في إضافة التعليق.',
      type: 'error',
      actions: [
        {
          label: 'حسناً',
          onClick: () => { },
          style: 'primary'
        }
      ]
    })
  }
}

const goToCommentPage = (page) => {
  if (page >= 1 && page <= commentsTotalPages.value) {
    commentsCurrentPage.value = page
    fetchComments()
  }
}

// ----------------------
// Initialization & Tracking
// ----------------------
const trackView = (storyId) => {
  if (!storyId) return;

  setTimeout(async () => {
    try {
      const anonId = getOrCreateAnonIdFromCookie();

      await axios.post(
        `${API_BASE}/api/StoryViews/${storyId}/views`,
        {},
        {
          headers: {
            'X-Visitor-Id': anonId,
          }
        }
      );

      console.log(`View tracked successfully for story ID: ${storyId}`);
    } catch (err) {
      console.error("Failed to track story view:", err);
    }
  }, 3000);
};

const ANON_COOKIE_NAME = 'story_anon_id';
const ANON_COOKIE_MAX_AGE_DAYS = 180;

const getAnonCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const setAnonCookie = (name, value, days) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setDate(expires.getDate() + (days || ANON_COOKIE_MAX_AGE_DAYS));
  document.cookie =
    `${name}=${encodeURIComponent(value)};` +
    `expires=${expires.toUTCString()};` +
    `path=/;` +
    `SameSite=Lax;`;
};

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getOrCreateAnonIdFromCookie = () => {
  let anonId = getAnonCookie(ANON_COOKIE_NAME);
  if (!anonId) {
    anonId = generateUUID();
    setAnonCookie(ANON_COOKIE_NAME, anonId, ANON_COOKIE_MAX_AGE_DAYS);
  }
  return anonId;
};

const initializeData = async (id) => {
  isLoading.value = true;
  if (!id) return;

  await checkAdminStatus();
  await fetchStoryTitle(id);

  if (!masterStory.value.id && storyTitle.value.includes('القصة معلقة')) {
    redirectBack();
    isLoading.value = false;
    return;
  }

  const categoryId = masterStory.value?.storyCategoryId;
  if (categoryId) {
    await fetchRelatedStories(categoryId, id);
  }

  await fetchRating(id);
  await fetchComments();

  trackView(id);
  isLoading.value = false;
};

onMounted(async () => {
  notification.close()

  masterStoryId.value = resolveStoryIdFromUrl();
})

watch(
  () => route.params.masterStoryId || route.params.id,
  async (newId) => {
    if (newId) {
      masterStoryId.value = newId
      commentsCurrentPage.value = 1
      await initializeData(newId)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.font-english {
  font-family: sans-serif;
  /* Use system font for numbers */
}

/* Custom Scrollbar if needed */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Components Styles */
.detail-box {
  @apply flex flex-col bg-gray-50 border border-gray-200 rounded-xl p-3 text-center hover:border-purple-200 hover:bg-purple-50/50 transition-colors;
}

.detail-box .label {
  @apply text-xs text-gray-400 mb-1 block;
}

.detail-box .value {
  @apply text-sm font-bold text-gray-800 block truncate;
}

.nav-btn-secondary {
  @apply w-full py-3 px-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 hover:text-purple-600 hover:border-purple-200 transition-all flex items-center justify-center gap-2 shadow-sm;
}

.nav-btn-primary {
  @apply w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5;
}

.animate-fade-up {
  animation: fadeUp 0.3s ease-out forwards;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
