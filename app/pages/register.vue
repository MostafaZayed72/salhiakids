<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      
      <div class="bg-gradient-to-br from-pink-500 to-purple-300 rounded-2xl shadow-xl border border-gray-200 p-8">
        
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#1B3C53] to-[#234C6A] mx-auto mb-4 shadow-lg">
            <span class="material-icons text-white text-2xl">person_add</span>
          </div>
          <h2 class="text-2xl font-bold text-[#1B3C53] mb-2">أنشئ حسابك الجديد</h2>
          <p class="text-white">مركز صالح بن صالح - مكتبة الطفل الرقمية</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-6">
          
          <div>
            <label class="block text-sm font-medium mb-2 text-[#1B3C53]">الاسم الكامل</label>
            <div class="relative">
              <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-[#456882] text-lg">person</span>
              <input 
                type="text" 
                v-model="form.fullName"
                required
                placeholder="ادخل اسمك الكامل"
                class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 transition-all duration-200"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-[#1B3C53]">البريد الإلكتروني</label>
            <div class="relative">
              <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-[#456882] text-lg">email</span>
              <input 
                type="email" 
                v-model="form.email"
                required
                placeholder="ادخل بريدك الإلكتروني"
                class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 transition-all duration-200"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-[#1B3C53]">كلمة المرور</label>
            <div class="relative">
              <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-[#456882] text-lg">lock</span>
              <input 
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="اختر كلمة مرور قوية"
                class="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 transition-all duration-200"
              >
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#456882] hover:text-[#1B3C53] transition-colors duration-200"
              >
                <span class="material-icons text-lg">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <p class="text-xs mt-2 text-[#456882]">يجب أن تحتوي على 6 أحرف على الأقل</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-[#1B3C53]">تأكيد كلمة المرور</label>
            <div class="relative">
              <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-[#456882] text-lg">lock</span>
              <input 
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                placeholder="أعد إدخال كلمة المرور"
                class="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 transition-all duration-200"
              >
              <button 
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#456882] hover:text-[#1B3C53] transition-colors duration-200"
              >
                <span class="material-icons text-lg">{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-[#1B3C53]">نوع الحساب</label>
            <div class="relative">
              <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-[#456882] text-lg">person_outline</span>
              <select 
                v-model="form.accountType" 
                class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 appearance-none transition-all duration-200"
              >
                <option value="admin">أدمن</option>
                <option value="teacher">معلم</option>
                <option value="student">طالب</option>
              </select>
            </div>
            <p class="text-xs mt-2 text-[#456882]">ملاحظة: لا يمكن إنشاء حسابات مدير أو موظف من هنا</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-[#1B3C53]">رقم الهاتف (اختياري)</label>
            <div class="relative">
              <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-[#456882] text-lg">phone</span>
              <input 
                type="tel" 
                v-model="form.phone"
                placeholder="ادخل رقم هاتفك"
                class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 transition-all duration-200"
              >
            </div>
          </div>

          <div class="flex items-start gap-3">
            <input 
              type="checkbox" 
              v-model="form.agreeTerms"
              required
              class="mt-1 rounded border-gray-300 focus:ring-[#1B3C53] bg-white"
            >
            <label class="text-sm text-[#1B3C53] flex-1">
              أوافق على 
              <a href="#" class="font-medium text-[#1B3C53] hover:underline transition-colors duration-200">شروط الاستخدام</a>
              و
              <a href="#" class="font-medium text-[#1B3C53] hover:underline transition-colors duration-200">سياسة الخصوصية</a>
            </label>
          </div>

          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {{ errorMessage }}
          </div>

          <button 
            type="submit"
            :disabled="loading || !form.agreeTerms"
            class="w-full bg-gradient-to-r from-[#1B3C53] to-[#234C6A] text-white py-3 px-4 rounded-xl hover:from-[#234C6A] hover:to-[#1B3C53] transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري إنشاء الحساب...</span>
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <span class="material-icons text-lg">person_add</span>
              <span>إنشاء حساب</span>
            </span>
          </button>

        </form>

        <div class="flex items-center my-6">
          <div class="flex-1 border-t border-gray-300"></div>
          <span class="px-4 text-sm text-[#456882]">أو</span>
          <div class="flex-1 border-t border-gray-300"></div>
        </div>

        <div class="text-center">
          <p class="text-[#1B3C53]">لديك حساب بالفعل؟</p>
          <button @click="goToLogin" class="font-semibold mt-2 text-[#1B3C53] hover:underline transition-colors duration-200 flex items-center justify-center gap-2 mx-auto">
            <span class="material-icons text-lg">login</span>
            <span>سجل الدخول الآن</span>
          </button>
        </div>

      </div>

      <div class="text-center mt-6">
        <router-link to="/" class="inline-flex items-center gap-2 text-[#1B3C53] hover:text-[#234C6A] transition-colors duration-200">
          <span class="material-icons">arrow_back</span>
          <span>الرجوع إلى تسجيل الدخول</span>
        </router-link>
      </div>

    </div>
  </div>
  
  <Transition name="modal">
    <div 
      v-if="showSuccessModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" 
      @click.self="closeModalAndRedirect"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 transform transition-all duration-300">
        
        <div class="text-center mb-6">
          <div class="w-16 h-16 rounded-full flex items-center justify-center bg-green-100 text-green-600 mx-auto mb-4 shadow-md">
            <span class="material-icons text-3xl">check_circle</span>
          </div>
          <h3 class="text-xl font-bold text-[#1B3C53]">نجاح التسجيل!</h3>
        </div>
        
        <p class="text-center text-gray-600 mb-8">
          تم إنشاء حسابك بنجاح. سيتم توجيهك إلى الصفحة الرئيسية الآن.
        </p>
        
        <button 
          @click="closeModalAndRedirect" 
          class="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors duration-200 font-semibold shadow-lg"
        >
          موافق (اذهب إلى الرئيسية)
        </button>
        
      </div>
    </div>
  </Transition>

</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// ----------------------------------------------------
// 1. تحديد Base URL من متغيرات البيئة
// ----------------------------------------------------
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const REGISTER_ENDPOINT = '/api/identity/register'

// ----------------------------------------------------
// 2. تعيين User Type Mapping حسب متطلبات الـ API
// ----------------------------------------------------
const USER_TYPE_MAP = {
  admin: 1, 
  teacher: 2,
  student: 3
}

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const errorMessage = ref('')
    const showSuccessModal = ref(false) // متحكم ظهور الـ Modal
    
    const form = ref({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      accountType: 'admin', 
      phone: '', 
      agreeTerms: false
    })

    // دالة مساعدة لتقسيم الاسم الكامل
    const getNames = (fullName) => {
      const parts = fullName.trim().split(/\s+/)
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || firstName
      return { firstName, lastName }
    }
    
    // دالة التحقق من صحة النموذج 
    const validateForm = () => {
      // ... (منطق التحقق) ...
      if (form.value.password.length < 6) {
        errorMessage.value = 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل'
        return false
      }

      if (form.value.password !== form.value.confirmPassword) {
        errorMessage.value = 'كلمات المرور غير متطابقة'
        return false
      }

      if (!form.value.agreeTerms) {
        errorMessage.value = 'يجب الموافقة على الشروط والأحكام'
        return false
      }
      
      if (!form.value.fullName.trim()) {
        errorMessage.value = 'الاسم الكامل مطلوب'
        return false
      }

      errorMessage.value = ''
      return true
    }
    
    // دالة إغلاق الـ Modal والرجوع للرئيسية
    const closeModalAndRedirect = () => {
      showSuccessModal.value = false
      router.push('/login') 
    }

    // ----------------------------------------------------
    // دالة معالجة التسجيل (مُعدلة لإظهار الـ Modal)
    // ----------------------------------------------------
    const handleRegister = async () => {
      if (!validateForm()) return

      loading.value = true
      errorMessage.value = ''

      try {
        const { firstName, lastName } = getNames(form.value.fullName)
        const userType = USER_TYPE_MAP[form.value.accountType] || 1
        
        const requestBody = {
          firstName: firstName,
          lastName: lastName,
          email: form.value.email,
          password: form.value.password,
          phoneNumber: form.value.phone || 'N/A', 
          userType: userType
        }
        
        console.log('API Request Body:', requestBody)
        console.log('API URL:', API_BASE_URL + REGISTER_ENDPOINT)
        
        // **ملاحظة هامة:** إذا كان الـ API_BASE_URL غير معرف (مثل 'undefined')، 
        // أو كان الخادم لا يعمل/يرد، فلن ينجح الطلب.

        const response = await fetch(API_BASE_URL + REGISTER_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })
        
        // التحقق مما إذا كان هناك محتوى في الاستجابة قبل محاولة قراءة JSON
        let data = {}
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (response.ok) {
          // النجاح: إظهار الـ Modal
          showSuccessModal.value = true 
        } else {
          // فشل الـ API
          let errorMsg = 'حدث خطأ في التسجيل.'
          if (data && data.message) {
            errorMsg = data.message 
          } else if (data && data.errors) {
            errorMsg = Object.values(data.errors).flat().join(' | ')
          }
          
          errorMessage.value = errorMsg || 'خطأ غير معروف في الخادم (HTTP Status: ' + response.status + ')'
          console.error('❌ API Error:', data, response.status)
        }
        
      } catch (error) {
        console.error('❌ Network or Unknown error:', error)
        errorMessage.value = 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت أو تأكد من صحة مسار الـ API.'
      } finally {
        loading.value = false 
      }
    }

    const goToLogin = () => {
      router.push('/login')
    }
    
    return {
      form,
      loading,
      showPassword,
      showConfirmPassword,
      errorMessage,
      showSuccessModal, 
      handleRegister,
      goToLogin,
      closeModalAndRedirect
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* تنسيقات إضافية للحقول */
input:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(27, 60, 83, 0.2);
}

/* تحسين مظهر select */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23456882' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: left 0.75rem center;
  background-repeat: no-repeat;
  background-size: 16px 12px;
  padding-left: 2.5rem;
}

/*
  ==================================================
  تنسيقات انتقال الـ Modal 
  (Vue Transition Classes)
  ==================================================
*/
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: all 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}
</style>