<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-300  shadow-xl border border-gray-200   p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-purple-500/50 
        bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 border border-gray-100">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 shadow-xl">
          <span class="material-icons text-white text-3xl">lock_reset</span>
        </div>
        <h2 class="text-3xl font-extrabold text-purple-700 mb-2">
          نسيت كلمة المرور؟
        </h2>
        <p class="text-sm text-gray-500">
          أدخل بريدك الإلكتروني لكي نرسل لك رابط/رمز إعادة تعيين كلمة المرور.
        </p>
      </div>

      <form @submit.prevent="handleForgotPassword">
        
        <div v-if="successMessage" class="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          <span class="font-medium">تم الإرسال بنجاح:</span> {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <span class="font-medium">خطأ:</span> {{ errorMessage }}
        </div>

        <div class="mb-6 relative">
          <label for="email" class="block mb-2 text-sm font-medium text-gray-900 text-right">
            البريد الإلكتروني
          </label>
          <div class="relative">
             <input 
              type="email" 
              id="email" 
              v-model="email"
              :disabled="loading"
              required
              class="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3.5 text-right transition-all duration-300 pr-10"
              placeholder="example@domain.com"
            >
            <span class="material-icons absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400">
              mail
            </span>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-lg px-5 py-3 text-center transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="material-icons custom-spin-slow">autorenew</span>
          <span v-else class="material-icons">send</span>
          {{ loading ? 'جاري الإرسال...' : 'إرسال رمز الاستعادة' }}
        </button>

        <p class="text-sm font-light text-gray-500 mt-6 text-center">
          هل تذكرت كلمة المرور؟ 
          <router-link to="/login" class="font-medium text-purple-600 hover:underline transition-colors duration-300">
            تسجيل الدخول
          </router-link>
        </p>
        
       

      </form>
    </div>
  </div>
</template>

<script>
// ... (الكود الخاص بـ JavaScript/Scripting يبقى كما هو)
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'ForgotPassword',
  setup() {
    const email = ref('');
    const loading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    
    // استخدام قاعدة الـ URL من متغيرات البيئة
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleForgotPassword = async () => {
      loading.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      try {
        const response = await axios.post(`${BASE_URL}/api/identity/forgot-password`, {
          email: email.value
        });

        if (response.status === 200 || response.status === 204) {
          successMessage.value = 'تم إرسال رمز استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح.';
        } else {
          errorMessage.value = response.data.message || 'فشل في إرسال طلب استعادة كلمة المرور. يرجى المحاولة لاحقاً.';
        }

      } catch (error) {
        console.error('Forgot Password Error:', error);

        if (error.response && error.response.data && error.response.data.message) {
          errorMessage.value = error.response.data.message;
        } else {
          errorMessage.value = 'حدث خطأ غير متوقع. يرجى التحقق من البريد الإلكتروني والمحاولة مرة أخرى.';
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      loading,
      errorMessage,
      successMessage,
      handleForgotPassword,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');


@keyframes custom-spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.custom-spin-slow {
  animation: custom-spin-slow 1s linear infinite;
}
</style>