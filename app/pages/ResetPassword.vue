<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-300  shadow-xl border border-gray-200  p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-pink-500/50
        bg-gradient-to-br from-white via-pink-50/50 to-purple-50/50 border border-gray-100">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-600 to-purple-600 shadow-xl">
          <span class="material-icons text-white text-3xl">vpn_key</span>
        </div>
        <h2 class="text-3xl font-extrabold text-pink-700 mb-2">
          تعيين كلمة مرور جديدة
        </h2>
        <p class="text-sm text-gray-500">
          أدخل الإيميل، الرمز الذي وصلك، وكلمة المرور الجديدة.
        </p>
      </div>

      <form @submit.prevent="handleResetPassword">
        
        <div v-if="successMessage" class="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          <span class="font-medium">نجاح:</span> {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <span class="font-medium">خطأ:</span> {{ errorMessage }}
        </div>

        <div class="mb-4 relative">
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

        <div class="mb-4 relative">
          <label for="token" class="block mb-2 text-sm font-medium text-gray-900 text-right">
            رمز الاستعادة
          </label>
          <div class="relative">
            <input 
              type="text" 
              id="token" 
              v-model="token"
              :disabled="loading"
              required
              class="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3.5 text-right transition-all duration-300 pr-10"
              placeholder="الرمز المكون من 6 أرقام/أحرف"
            >
            <span class="material-icons absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400">
              code
            </span>
          </div>
        </div>

        <div class="mb-6 relative">
          <label for="newPassword" class="block mb-2 text-sm font-medium text-gray-900 text-right">
            كلمة المرور الجديدة
          </label>
          <div class="relative">
            <input 
              :type="passwordFieldType"
              id="newPassword" 
              v-model="newPassword"
              :disabled="loading"
              required
              minlength="6"
              class="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3.5 text-right transition-all duration-300 pr-10"
              placeholder="أدخل كلمة مرور جديدة"
            >
            <button type="button" @click="togglePasswordVisibility" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-300">
              <span class="material-icons text-lg">
                {{ passwordFieldType === 'password' ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
            </div>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-lg px-5 py-3 text-center transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="material-icons custom-spin-slow">autorenew</span>
          <span v-else class="material-icons">check_circle</span>
          {{ loading ? 'جاري التعيين...' : 'تعيين كلمة المرور' }}
        </button>

        <p class="text-sm font-light text-gray-500 mt-6 text-center">
          هل تحتاج لرمز استعادة؟ 
          <router-link to="/ForgotPassword" class="font-medium text-purple-600 hover:underline transition-colors duration-300">
            اطلب رمزاً جديداً
          </router-link>
        </p>

      </form>
    </div>
  </div>
</template>

<script>
// ... (الكود الخاص بـ JavaScript/Scripting يبقى كما هو)
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'ResetPassword',
  setup() {
    const router = useRouter();
    const email = ref('');
    const token = ref('');
    const newPassword = ref('');
    const loading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const passwordFieldType = ref('password');
    
    // استخدام قاعدة الـ URL من متغيرات البيئة
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const togglePasswordVisibility = () => {
      passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
    };

    const handleResetPassword = async () => {
      loading.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      if (newPassword.value.length < 6) {
        errorMessage.value = 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.';
        loading.value = false;
        return;
      }

      try {
        const payload = {
          email: email.value,
          token: token.value,
          newPassword: newPassword.value
        };

        const response = await axios.post(`${BASE_URL}/api/identity/reset-password`, payload);

        if (response.status === 200 || response.status === 204) {
          successMessage.value = 'تم تعيين كلمة المرور بنجاح. سيتم توجيهك لصفحة تسجيل الدخول.';
          
          setTimeout(() => {
            router.push('/login');
          }, 3000); 

        } else {
          errorMessage.value = response.data.message || 'فشل في تعيين كلمة المرور. يرجى التأكد من الرمز.';
        }

      } catch (error) {
        console.error('Reset Password Error:', error);

        if (error.response && error.response.data && error.response.data.message) {
          errorMessage.value = error.response.data.message;
        } else {
          errorMessage.value = 'حدث خطأ غير متوقع. يرجى التحقق من البيانات والمحاولة مرة أخرى.';
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      token,
      newPassword,
      loading,
      errorMessage,
      successMessage,
      passwordFieldType,
      togglePasswordVisibility,
      handleResetPassword,
    };
  },
};
</script>

<style scoped>
/* (الأنماط تبقى كما هي) */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');


@keyframes custom-spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.custom-spin-slow {
  animation: custom-spin-slow 1s linear infinite;
}
</style>