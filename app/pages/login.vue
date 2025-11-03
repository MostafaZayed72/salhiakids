<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      
      <div class="bg-gradient-to-br from-purple-500 to-pink-300 rounded-2xl shadow-xl border border-gray-200 p-8">
        
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#1B3C53] to-[#234C6A] mx-auto mb-4 shadow-lg">
            <span class="material-icons text-white text-2xl">login</span>
          </div>
          <h2 class="text-2xl font-bold text-[#1B3C53] mb-2">تسجيل الدخول</h2>
          <p class="text-white">أهلاً بك مجدداً في مكتبة الطفل الرقمية</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          
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
                placeholder="ادخل كلمة المرور"
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
            <NuxtLink to="/ForgotPassword" class="text-xs mt-2 block text-white text-left hover:underline">نسيت كلمة المرور؟</NuxtLink>
          </div>

          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {{ errorMessage }}
          </div>
          
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-[#1B3C53] to-[#234C6A] text-white py-3 px-4 rounded-xl hover:from-[#234C6A] hover:to-[#1B3C53] transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري تسجيل الدخول...</span>
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <span class="material-icons text-lg">login</span>
              <span>تسجيل الدخول</span>
            </span>
          </button>

        </form>

        <div class="flex items-center my-6">
          <div class="flex-1 border-t border-gray-300"></div>
          <span class="px-4 text-sm text-[#456882]">أو</span>
          <div class="flex-1 border-t border-gray-300"></div>
        </div>

        <div class="text-center">
          <p class="text-[#1B3C53]">ليس لديك حساب؟</p>
          <button @click="goToRegister" class="font-semibold mt-2 text-[#1B3C53] hover:underline transition-colors duration-200 flex items-center justify-center gap-2 mx-auto">
            <span class="material-icons text-lg">person_add</span>
            <span>أنشئ حسابك الآن</span>
          </button>
        </div>

      </div>

      <div class="text-center mt-6">
        <router-link to="/" class="inline-flex items-center gap-2 text-[#1B3C53] hover:text-[#234C6A] transition-colors duration-200">
          <span class="material-icons">arrow_back</span>
          <span>الرجوع إلى الرئيسية</span>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie' 
// import axios from 'axios' // إذا كنت تستخدم axios

// ----------------------------------------------------
// 1. تحديد Base URL من متغيرات البيئة
// ----------------------------------------------------
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const LOGIN_ENDPOINT = '/api/identity/login'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const showPassword = ref(false)
    const errorMessage = ref('')
    
    // **بيانات العميل المؤقتة والمطلوبة**
    const TEMP_USER_NAME = 'صالح المحمد' 
    
    const form = ref({
      email: '',
      password: '',
    })

    const handleLogin = async () => {
      if (!form.value.email || !form.value.password) {
        errorMessage.value = 'البريد الإلكتروني وكلمة المرور مطلوبان.'
        return
      }

      loading.value = true
      errorMessage.value = ''

      try {
        const requestBody = {
          email: form.value.email,
          password: form.value.password
        }
        
        // **استخدام `fetch` لإجراء الطلب**
        const response = await fetch(API_BASE_URL + LOGIN_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })
        
        let data = {}
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (response.ok) {
          // **نجاح تسجيل الدخول - معالجة الـ Response**
          
          if (data && data.token) {
            // 1. تحديد الدور الأساسي بناءً على الـ Response
            const primaryRole = data.roles && data.roles.length > 0 
                              ? data.roles[0].toLowerCase() 
                              : 'user' // الدور الافتراضي إذا لم يوجد

            // 2. حفظ التوكن في الكوكيز
            Cookies.set('authToken', data.token, { expires: 7, secure: true, sameSite: 'Strict' }); 

            // 3. بناء وحفظ بيانات المستخدم (استخدام البيانات المؤقتة والبيانات المتاحة)
            const userPayload = {
              // اسم مؤقت حسب الطلب
              name: TEMP_USER_NAME, 
              // استخدام البريد الإلكتروني الذي عاد من الريسبونس
              email: data.email || form.value.email, 
              // استخدام الدور الذي تم استخراجه
              role: primaryRole, 
              // userTypeName: data.userTypeName, // يمكن حفظها كبيانات إضافية
              profileImage: null 
            }
            localStorage.setItem('userData', JSON.stringify(userPayload));
            
            // 4. إرسال حدث التحديث للهيدر
            window.dispatchEvent(new Event('auth-change')); 
            
            // 5. التوجيه بناءً على الدور
            let redirectPath = '/'
            if (primaryRole === 'admin') {
              redirectPath = '/admin'
            } else if (primaryRole === 'employee') {
              redirectPath = '/employee/stories'
            }
            
            router.push(redirectPath)

          } else {
             errorMessage.value = 'تم تسجيل الدخول بنجاح، ولكن لم يتم استقبال التوكن!'
          }
          
        } else {
          // فشل الـ API
          let errorMsg = 'حدث خطأ في تسجيل الدخول. تأكد من البيانات.'
          if (data && data.message) {
            errorMsg = data.message 
          } else if (data && data.errors) {
            errorMsg = Object.values(data.errors).flat().join(' | ')
          }
          
          errorMessage.value = errorMsg || 'خطأ غير معروف في الخادم (HTTP Status: ' + response.status + ')'
        }
        
      } catch (error) {
        errorMessage.value = 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.'
        // مسح الكوكيز في حال وجود أي بقايا
        Cookies.remove('authToken')
        localStorage.removeItem('userData')
      } finally {
        loading.value = false 
      }
    }

    const goToRegister = () => {
      router.push('/register')
    }
    
    return {
      form,
      loading,
      showPassword,
      errorMessage,
      handleLogin,
      goToRegister,
    }
  }
}
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* تنسيقات إضافية للحقول */
input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(27, 60, 83, 0.2);
}
</style>