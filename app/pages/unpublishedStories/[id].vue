<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router' // ✅ تأكد من الاستيراد الصحيح

// ------------------------------------
// تعريف الـ Router والـ Route
// ------------------------------------
const route = useRoute() 
const router = useRouter() // ✅ استخدام useRouter لجعل دالة router متاحة

// ------------------------------------
// Props (للحفاظ على التناسق إن لزم الأمر)
// ------------------------------------
const props = defineProps({
 storyCategoryId: {
  type: String,
  required: false,
  default: ''
 }
})

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// ------------------------------------
// State
// ------------------------------------
const stories = ref([])
const isAdmin = ref(false)

     <div v-else class="text-center py-10 bg-white rounded-xl shadow-lg border-2 border-dashed border-red-300">
      <span class="material-icons text-6xl text-green-400">task_alt</span>
      <p class="mt-4 text-xl font-medium text-gray-700">لا توجد قصص غير منشورة حالياً في هذه الفئة.</p>
     </div>
     
     <div v-if="totalPages > 1 && !isLoading" class="flex justify-center items-center gap-4 mt-8">
      <button
       @click="goToPage(currentPage - 1)"
       :disabled="currentPage === 1"
       class="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-red-700"
      >
       السابق
      </button>
      <span class="text-lg font-medium text-gray-700">
       صفحة **{{ currentPage }}** من **{{ totalPages }}**
      </span>
      <button
       @click="goToPage(currentPage + 1)"
       :disabled="currentPage === totalPages"
       class="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-red-700"
      >
       التالي
      </button>
     </div>
        </div>
   <NotificationModal :is-open="notification.isOpen.value" :notification="notification.notification.value" @close="notification.close" />
  </div>
 </section>
</template>

<style scoped>
.line-clamp-3 {
 display: -webkit-box;
 -webkit-line-clamp: 3;
 -webkit-box-orient: vertical;
 overflow: hidden;
}
</style>