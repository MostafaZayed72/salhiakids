<template>
  <div dir="rtl" class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4 max-w-3xl">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.go(-1)" class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors">
          <span class="material-icons">arrow_forward</span>
        </button>
        <h1 class="text-3xl font-bold text-gray-800">إعدادات النظام</h1>
      </div>

      <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-purple-100 p-8">
        <div class="mb-8 text-center">
            <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                <span class="material-icons text-4xl">settings</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">قيود إنشاء القصص</h2>
            <p class="text-gray-500 mt-2">تحكم في عدد القصص المسموح بإنشائها خلال فترة زمنية محددة</p>
        </div>

        <div v-if="loading" class="text-center py-12">
             <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
             <p class="text-gray-500">جاري تحميل الإعدادات...</p>
        </div>

        <form v-else @submit.prevent="saveSettings" class="space-y-6">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Limit Count -->
                <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700">عدد القصص المسموح به</label>
                    <div class="relative">
                        <input v-model.number="form.aiStoryLimitCount" type="number" required min="0"
                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 pl-12"
                            placeholder="مثال: 5" />
                        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">filter_none</span>
                    </div>
                    <p class="text-xs text-gray-500">عدد القصص التي يمكن للطفل إنشاؤها في الفترة المحددة. (0 = غير محدود)</p>
                </div>

                <!-- Limit Days -->
                <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700">الفترة الزمنية (بالأيام)</label>
                    <div class="relative">
                        <input v-model.number="form.aiStoryLimitDays" type="number" required min="0"
                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 pl-12"
                            placeholder="مثال: 30" />
                        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">date_range</span>
                    </div>
                    <p class="text-xs text-gray-500">عدد الأيام التي يتم فيها حساب الحد الأقصى.</p>
                </div>
            </div>

            <!-- Messages -->
            <div v-if="successMessage" class="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2">
                <span class="material-icons text-green-500">check_circle</span>
                {{ successMessage }}
            </div>
            
            <div v-if="errorMessage" class="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2">
                <span class="material-icons text-red-500">error</span>
                {{ errorMessage }}
            </div>

            <!-- Actions -->
            <div class="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                <button type="button" @click="fetchSettings" class="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                    إلغاء التغييرات
                </button>
                <button type="submit" :disabled="saving"
                    class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    <span v-if="saving" class="material-icons animate-spin text-sm">autorenew</span>
                    <span>حفظ الإعدادات</span>
                </button>
            </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Cookies from 'js-cookie';

const router = useRouter();
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const loading = ref(true);
const saving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const form = reactive({
    aiStoryLimitCount: 0,
    aiStoryLimitDays: 0
});

const getHeaders = () => {
    const token = Cookies.get('authToken') || Cookies.get('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchSettings = async () => {
    try {
        loading.value = true;
        errorMessage.value = '';
        const response = await axios.get(`${API_BASE}/api/SystemSettings`, { headers: getHeaders() });
        
        if (response.data) {
            form.aiStoryLimitCount = response.data.aiStoryLimitCount || 0;
            form.aiStoryLimitDays = response.data.aiStoryLimitDays || 0;
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        errorMessage.value = 'فشل تحميل الإعدادات. يرجى المحاولة مرة أخرى.';
    } finally {
        loading.value = false;
    }
};

const saveSettings = async () => {
    try {
        saving.value = true;
        successMessage.value = '';
        errorMessage.value = '';
        
        await axios.put(`${API_BASE}/api/SystemSettings`, 
            {
                aiStoryLimitCount: form.aiStoryLimitCount,
                aiStoryLimitDays: form.aiStoryLimitDays
            }, 
            { headers: getHeaders() }
        );

        successMessage.value = 'تم حفظ الإعدادات بنجاح!';
        
        // Hide success message after 3 seconds
        setTimeout(() => {
            successMessage.value = '';
        }, 3000);

    } catch (error) {
        console.error('Error saving settings:', error);
        errorMessage.value = 'فشل حفظ الإعدادات. يرجى التأكد من الصلاحيات والمحاولة مرة أخرى.';
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    fetchSettings();
});
</script>
