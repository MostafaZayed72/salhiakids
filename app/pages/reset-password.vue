<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-300 shadow-xl border border-gray-200 p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-pink-500/50
        bg-gradient-to-br from-white via-pink-50/50 to-purple-50/50 border border-gray-100">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-600 to-purple-600 shadow-xl">
          <span class="material-icons text-white text-3xl">vpn_key</span>
        </div>
        <h2 class="text-3xl font-extrabold text-pink-700 mb-2">
          تعيين كلمة مرور جديدة
        </h2>
        <p v-if="!isSuccess" class="text-sm text-gray-500">
          أدخل كلمة المرور الجديدة وتأكيدها.
        </p>
      </div>

      <!-- Success State -->
      <div v-if="isSuccess" class="text-center">
        <div class="mb-6 p-4 text-green-700 bg-green-100 rounded-lg flex flex-col items-center justify-center gap-2" role="alert">
          <span class="material-icons text-4xl mb-2">check_circle</span>
          <span class="font-medium text-lg">تم تغيير كلمة المرور بنجاح</span>
        </div>
        <router-link 
          to="/login" 
          class="w-full inline-flex justify-center items-center text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-lg px-5 py-3 text-center transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          العودة لتسجيل الدخول
        </router-link>
      </div>

      <!-- Form State -->
      <form v-else @submit.prevent="handleResetPassword">
        
        <div v-if="errorMessage" class="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <span class="font-medium">خطأ:</span> {{ errorMessage }}
        </div>

        <div class="mb-4 relative">
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

        <div class="mb-6 relative">
          <label for="confirmPassword" class="block mb-2 text-sm font-medium text-gray-900 text-right">
            تأكيد كلمة المرور
          </label>
          <div class="relative">
            <input 
              :type="confirmPasswordFieldType"
              id="confirmPassword" 
              v-model="confirmPassword"
              :disabled="loading"
              required
              minlength="6"
              class="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3.5 text-right transition-all duration-300 pr-10"
              placeholder="أعد إدخال كلمة المرور"
            >
            <button type="button" @click="toggleConfirmPasswordVisibility" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-300">
              <span class="material-icons text-lg">
                {{ confirmPasswordFieldType === 'password' ? 'visibility_off' : 'visibility' }}
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

      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

export default {
  name: 'ResetPassword',
  setup() {
    const route = useRoute();
    const email = ref('');
    const token = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const loading = ref(false);
    const errorMessage = ref('');
    const isSuccess = ref(false);
    const passwordFieldType = ref('password');
    const confirmPasswordFieldType = ref('password');
    
    // استخدام قاعدة الـ URL من متغيرات البيئة
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    onMounted(() => {
      // Extract email and token from URL
      email.value = route.query.email || '';
      token.value = route.query.token || '';

      if (!email.value || !token.value) {
        errorMessage.value = 'رابط استعادة كلمة المرور غير صالح أو ناقص.';
      }
    });

    const togglePasswordVisibility = () => {
      passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
    };

    const toggleConfirmPasswordVisibility = () => {
      confirmPasswordFieldType.value = confirmPasswordFieldType.value === 'password' ? 'text' : 'password';
    };

    const handleResetPassword = async () => {
      loading.value = true;
      errorMessage.value = '';

      // Validation
      if (!email.value || !token.value) {
        errorMessage.value = 'البيانات المطلوبة (البريد الإلكتروني أو الرمز) مفقودة.';
        loading.value = false;
        return;
      }

      if (newPassword.value.length < 6) {
        errorMessage.value = 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.';
        loading.value = false;
        return;
      }

      if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = 'كلمتا المرور غير متطابقتين.';
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
          isSuccess.value = true;
        } else {
          errorMessage.value = response.data.message || 'فشل في تعيين كلمة المرور.';
        }

      } catch (error) {
        console.error('Reset Password Error:', error);

        if (error.response && error.response.data && error.response.data.message) {
          errorMessage.value = error.response.data.message;
        } else {
          errorMessage.value = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      newPassword,
      confirmPassword,
      loading,
      errorMessage,
      isSuccess,
      passwordFieldType,
      confirmPasswordFieldType,
      togglePasswordVisibility,
      toggleConfirmPasswordVisibility,
      handleResetPassword,
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
