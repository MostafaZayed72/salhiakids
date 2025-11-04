<template>
  <div dir="rtl" class="min-h-screen bg-gradient-to-br  from-purple-500 to-pink-300 py-8">
    <main class="container mx-auto px-4 py-8 max-w-4xl">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-3">
          إضافة قصة جديدة
        </h1>
        <p class="text-lg text-gray-600">
          أضف قصة جديدة للمكتبة الرقمية
        </p>
      </div>

      <div class="mb-8">
        <div class="bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-bold text-gray-800">تقدم تعبئة النموذج</h2>
            <span class="text-xl font-bold text-[#1B3C53]">{{ progressPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              class="bg-gradient-to-r from-[#1B3C53] to-[#234C6A] h-2.5 rounded-full transition-all duration-500 ease-out"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div class="bg-gradient-to-r from-[#1B3C53] to-[#234C6A] p-6 text-white">
          <div class="flex items-center gap-3">
            <span class="material-icons text-3xl">library_add</span>
            <h2 class="text-xl font-bold">محتوى جديد</h2>
          </div>
        </div>

        <form @submit.prevent="submitForm" class="p-6 space-y-6">

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">عنوان القصة *</label>
            <input 
              v-model="form.title" 
              type="text" 
              required 
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-[#1B3C53] bg-white text-gray-900 transition-all duration-200" 
              placeholder="أدخل عنوان القصة" 
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">وصف القصة *</label>
            <textarea 
              v-model="form.description" 
              rows="4" 
              required 
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-[#1B3C53] bg-white text-gray-900 transition-all duration-200 resize-none" 
              placeholder="أدخل وصفاً مفصلاً للقصة..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-3">صورة الغلاف / المحتوى <span class="text-red-500">*</span></label>

            <div @click="imageInputClick" 
                 class="border-3 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-[#1B3C53] hover:bg-blue-50 h-40 flex flex-col items-center justify-center" 
                 :class="{ 'border-green-500 bg-green-50': imagePreview }">
              
              <template v-if="!imagePreview">
                <span class="material-icons text-4xl text-gray-400 mb-2">image</span>
                <p class="text-sm font-medium text-gray-600">انقر لرفع صورة الغلاف</p>
                <p class="text-xs text-gray-500 mt-1">PNG, JPG, JPEG - الحد 5MB</p>
              </template>

              <template v-else>
                <div class="relative w-full h-full">
                  <img :src="imagePreview" alt="صورة الغلاف" class="w-full h-full object-cover rounded-lg">
                  <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button type="button" @click.stop="removeImage" class="bg-red-500 text-white p-2 rounded-full">
                      <span class="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </template>

              <input ref="imageInput" type="file" accept="image/*" @change="onImageSelected" class="hidden" />
            </div>
          </div>

          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <button type="button" @click="goBack" class="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium">
              <span class="material-icons">arrow_back</span>رجوع
            </button>

            <button type="submit" :disabled="loading" class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1B3C53] to-[#234C6A] text-white rounded-xl hover:from-[#234C6A] hover:to-[#1B3C53] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg">
              <span class="material-icons">{{ loading ? 'autorenew' : 'publish' }}</span>
              {{ loading ? 'جاري النشر...' : 'نشر القصة' }}
            </button>
          </div>
        </form>
      </div>
    </main>

    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <span class="material-icons text-6xl text-green-500 mb-4">check_circle</span>
        <h3 class="text-xl font-bold text-gray-800 mb-2">تم إضافة القصة بنجاح!</h3>
        <p class="text-gray-600 mb-6">ماذا تريد أن تفعل الآن؟</p>
        <div class="space-y-3">
          <button @click="resetFormAndContinue" class="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
            <span class="material-icons">add_box</span> إضافة قصة جديدة
          </button>
          <button @click="goToHome" class="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <span class="material-icons">home</span> العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// API base from .env (Vite)
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// Updated reactive form to match the new API structure
const form = reactive({
  title: '',
  description: '', // Matches new API field
  imageUrl: '', // Holds the file URL after upload
  image_file: null // Holds the file object before upload
})

const loading = ref(false)
const imageInput = ref(null)
const showSuccessModal = ref(false) // New state for success popup

// Progress calculation based on the three required fields
const progressPercentage = computed(() => {
  const fields = ['title', 'description', 'imageUrl']
  const filled = fields.filter(f => {
    const v = form[f]
    // Check if the file object is present if the URL is missing
    if (f === 'imageUrl') return form.image_file || (v && String(v).trim().length > 0)
    return v !== null && v !== undefined && String(v).trim().length > 0
  }).length
  return Math.min(100, Math.round((filled / fields.length) * 100))
})

const imagePreview = computed(() => {
  if (form.image_file) return URL.createObjectURL(form.image_file)
  if (form.imageUrl) return form.imageUrl
  return ''
})

// File helpers
const imageInputClick = () => imageInput.value?.click()

const MAX_IMAGE = 5 * 1024 * 1024 // 5MB limit

const onImageSelected = (e) => {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  if (!f.type.startsWith('image/')) { alert('الملف ليس صورة'); return }
  if (f.size > MAX_IMAGE) { alert('حجم الصورة يتجاوز 5MB'); return }
  form.image_file = f
  form.imageUrl = '' // Clear existing URL if a new file is selected
}

const removeImage = () => { form.image_file = null; form.imageUrl = ''; if(imageInput.value) imageInput.value.value = null; }

// read cookie helper (from previous code)
const getCookie = (name) => {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
  return v ? decodeURIComponent(v.pop()) : ''
}

// upload file helper (from previous code)
const uploadImage = async (file) => {
  const fd = new FormData()
  fd.append('file', file)
  const url = `${API_BASE}/api/Upload/UploadImage`
  const token = getCookie('authToken') || getCookie('token') || ''
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const res = await fetch(url, { method: 'POST', body: fd, headers })
  if (!res.ok) {
    const text = await res.text().catch(()=>res.statusText)
    throw new Error(text || 'Upload failed')
  }
  const data = await res.json()
  // Assuming the API returns the URL in 'url' or 'data.url'
  return data.url || data.data?.url || ''
}

// Submit logic
const submitForm = async () => {
  const required = ['title', 'description']
  const missing = required.filter(f => !form[f])
  if (missing.length) { alert('يرجى ملء جميع الحقول المطلوبة'); return }

  if (!form.image_file && !form.imageUrl) { alert('يرجى رفع صورة الغلاف'); return }

  loading.value = true
  try {
    // 1. Upload the image file first
    if (form.image_file) {
      form.imageUrl = await uploadImage(form.image_file)
    }

    // 2. Prepare JSON payload for the Add API
    const body = {
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl
    }
    
    // The endpoint should be /Add if not specified, let's assume /api/CustomStories/Add
    const apiUrl = `${API_BASE}/api/CustomStories/Add` 
    const token = getCookie('authToken') || getCookie('token') || ''
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }

    const res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(body) })

    if (!res.ok) {
      const errText = await res.text().catch(()=>res.statusText)
      throw new Error(errText || 'فشل إرسال القصة')
    }

    // Handle success
    // const result = await res.json() // If the API returns a response
    
    showSuccessModal.value = true // Show success popup

  } catch (error) {
    console.error(error)
    alert(error.message || 'حدث خطأ أثناء الحفظ')
  } finally {
    loading.value = false
    // Clear the file object after successful upload to ensure subsequent upload is smooth
    if (form.image_file) form.image_file = null
  }
}

// Modal actions
const resetFormAndContinue = () => {
  // Clear all form fields and previews
  form.title = ''
  form.description = ''
  form.imageUrl = ''
  removeImage() // Clears image_file and input ref
  showSuccessModal.value = false
}

const goToHome = () => {
  showSuccessModal.value = false
  router.push('/')
}

const goBack = () => {
  router.back()
}

// The following functions were related to the old complex form and are no longer needed, 
// but kept as placeholders to avoid errors if they were used elsewhere.
// const isEditing = computed(() => false) // Simplified since we are only 'Add'
// const loadStoryData = (id) => {} 
// const saveAsDraft = () => { alert('وظيفة حفظ المسودة غير مدعومة في النموذج المبسّط') }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
* { font-family: 'Tajawal', sans-serif; }
.material-icons { font-family: 'Material Icons'; }
.transition-all { transition: all 0.3s ease; }
</style>