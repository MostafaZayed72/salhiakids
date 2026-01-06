<template>
  <div class="bg-gray-50 min-h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header / Banner -->
      <div class="bg-gradient-to-r from-[#1B3C53] to-[#234C6A] p-6 text-center">
        <h2 class="text-2xl font-bold text-white mb-2">تأكيد البريد الإلكتروني</h2>
        <p class="text-blue-100 text-sm">جاري التحقق من صحة بريدك الإلكتروني...</p>
      </div>

      <div class="p-8">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="w-16 h-16 border-4 border-[#1B3C53] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600 font-medium">يرجى الانتظار لحظات...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="text-center py-4">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="material-icons text-green-600 text-5xl">check_circle</span>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">تم تأكيد البريد بنجاح!</h3>
          <p class="text-gray-600 mb-8 leading-relaxed">
            شكراً لك، تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول والبدء في استخدام منصتنا.
          </p>
          <button 
            @click="goToLogin" 
            class="w-full bg-[#1B3C53] text-white py-3 px-6 rounded-xl hover:bg-[#234C6A] transition-colors duration-200 font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <span class="material-icons">login</span>
            <span>تسجيل الدخول الآن</span>
          </button>
        </div>

        <!-- Error State -->
        <div v-else class="text-center py-4">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="material-icons text-red-600 text-5xl">error_outline</span>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">فشل التحقق</h3>
          <p class="text-gray-600 mb-8 leading-relaxed">
            {{ message || 'عذراً، حدث خطأ أثناء محاولة تأكيد بريدك الإلكتروني. قد يكون الرابط منتهي الصلاحية أو غير صحيح.' }}
          </p>
          <div class="space-y-3">
            <button 
              @click="retry" 
              class="w-full bg-white border-2 border-[#1B3C53] text-[#1B3C53] py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-semibold flex items-center justify-center gap-2"
            >
              <span class="material-icons">refresh</span>
              <span>إعادة المحاولة</span>
            </button>
             <button 
              @click="goToHome" 
              class="w-full text-gray-500 hover:text-gray-700 font-medium text-sm"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const success = ref(false)
const message = ref('')

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '' // Fallback if not set
const CONFIRM_ENDPOINT = '/api/identity/confirm-email'

const verifyEmail = async () => {
  const { email, token } = route.query

  // Basic validation before API call
  if (!email || !token) {
    loading.value = false
    success.value = false
    message.value = 'رابط التحقق غير صالح (بيانات ناقصة).'
    return
  }

  try {
    // Construct URL with query parameters manually to be safe with relative/absolute utility
    const queryString = `?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
    const finalUrl = `${API_BASE_URL}${CONFIRM_ENDPOINT}${queryString}`

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (response.ok) {
      success.value = true
    } else {
      success.value = false
      // Try to parse error message
      try {
        const data = await response.json()
        message.value = data.message || data.error || 'فشلت عملية التحقق.'
      } catch (e) {
        message.value = `حدث خطأ غير متوقع (${response.status})`
      }
    }
  } catch (error) {
    success.value = false
    message.value = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.'
    console.error('Verification error:', error)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const goToHome = () => {
    router.push('/')
}

const retry = () => {
    loading.value = true;
    verifyEmail();
}

onMounted(() => {
  verifyEmail()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>
