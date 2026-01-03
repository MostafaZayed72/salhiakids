<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const REGISTER_ENDPOINT = '/api/identity/register'

const USER_TYPE_MAP = {
  teacher: 2,
  student: 3
}

// ترجمة أسماء الحقول من الإنجليزية للعربية
const FIELD_TRANSLATIONS = {
  'PhoneNumber': 'رقم الهاتف',
  'FirstName': 'الاسم الأول',
  'LastName': 'الاسم الأخير',
  'Email': 'البريد الإلكتروني',
  'Password': 'كلمة المرور',
  'UserType': 'نوع الحساب'
}

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const errorMessage = ref('')
    const fieldErrors = ref({}) // لتخزين أخطاء الحقول الفردية
    const showSuccessModal = ref(false)
    
    const form = ref({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      accountType: 'teacher', 
      phone: '', 
      agreeTerms: false
    })

    const getNames = (fullName) => {
      const parts = fullName.trim().split(/\s+/)
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || firstName
      return { firstName, lastName }
    }
    
    const validatePhoneNumber = (phone) => {
      // السماح ب + في البداية، وأرقام فقط، والطول بين 10 و 15
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      return phoneRegex.test(phone);
    }

    const validateForm = () => {
      fieldErrors.value = {} // مسح الأخطاء السابقة
      
      if (!form.value.fullName.trim()) {
        errorMessage.value = 'الاسم الكامل مطلوب'
        return false
      }

      const { firstName } = getNames(form.value.fullName)
      if (firstName.length < 3) {
        fieldErrors.value.FirstName = ['الاسم يجب أن يكون بين 3 و 50 حرفًا']
        errorMessage.value = 'يرجى تصحيح الأخطاء في النموذج'
        return false
      }

      if (form.value.password.length < 6) {
        errorMessage.value = 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل'
        return false
      }

      if (form.value.password !== form.value.confirmPassword) {
        errorMessage.value = 'كلمات المرور غير متطابقة'
        return false
      }
      
      if (form.value.phone && !validatePhoneNumber(form.value.phone)) {
        fieldErrors.value.PhoneNumber = ['يرجى إدخال رقم هاتف صحيح (10-15 رقمًا)'];
        errorMessage.value = 'يرجى تصحيح الأخطاء في النموذج';
        return false;
      }

      if (!form.value.agreeTerms) {
        errorMessage.value = 'يجب الموافقة على الشروط والأحكام'
        return false
      }

      errorMessage.value = ''
      return true
    }
    
    const closeModalAndRedirect = () => {
      showSuccessModal.value = false
      router.push('/login') 
    }

    const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''
  fieldErrors.value = {}

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
    
    const response = await fetch(API_BASE_URL + REGISTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    
    // قراءة JSON بغض النظر عن حالة الـ response
    let data = {}
    try {
      data = await response.json()
    } catch (parseError) {
      console.warn('Failed to parse JSON response:', parseError)
      data = {}
    }

    console.log('📋 Response Status:', response.status)
    console.log('📋 Response Data:', data)

    if (response.ok) {
      showSuccessModal.value = true 
    } else {
      // معالجة أخطاء الـ Validation من الـ API
      if (data && data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
        // تخزين الأخطاء في fieldErrors للعرض بجانب الحقول
        fieldErrors.value = data.errors
        
        // بناء رسالة خطأ عامة
        const errorList = Object.entries(data.errors)
          .map(([field, errors]) => {
            const translatedField = FIELD_TRANSLATIONS[field] || field
            let errorTexts = Array.isArray(errors) ? errors : [errors]

            // ترجمة رسالة خطأ الهاتف المحددة من الباك اند
            if (field === 'PhoneNumber') {
              errorTexts = errorTexts.map(enErr => {
                 if (enErr.includes('Please provide a valid phone number')) {
                   return 'يرجى إدخال رقم هاتف صحيح (10-15 رقمًا)';
                 }
                 return enErr;
              });
              // تحديث الخطأ في fieldErrors أيضاً ليظهر مترجماً تحت الحقل مباشرة
              fieldErrors.value.PhoneNumber = errorTexts;
            }

            // ترجمة رسالة خطأ الاسم الأول
            if (field === 'FirstName') {
              errorTexts = errorTexts.map(enErr => {
                 if (enErr.includes('must be between 3 and 50 characters')) {
                   return 'الاسم يجب أن يكون بين 3 و 50 حرفًا';
                 }
                 return enErr;
              });
              fieldErrors.value.FirstName = errorTexts;
            }

            return `<strong>${translatedField}:</strong> ${errorTexts.join(', ')}`
          })
          .join('<br />')
        
        errorMessage.value = errorList
        console.log('✅ Errors processed successfully:', errorList)
      } else if (data && (data.Code === 'EmailAlreadyExists' || data.message === 'Email is already registered')) {
          errorMessage.value = 'البريد الإلكتروني مسجل بالفعل';
      } else if (data && data.Code === 'PhoneNumberAlreadyExists') {
          errorMessage.value = 'هذا الرقم مسجل بالفعل';
          fieldErrors.value.PhoneNumber = ['هذا الرقم مسجل بالفعل'];
      } else if (data && data.message) {
        errorMessage.value = data.message
      } else if (data && data.title) {
        // عرض الـ title بدلاً من رسالة عامة
        errorMessage.value = data.title
      } else {
        errorMessage.value = `خطأ غير معروف (HTTP Status: ${response.status})`
      }
      
      console.error('❌ API Error:', data, response.status)
    }
    
  } catch (error) {
    console.error('❌ Network or Unknown error:', error)
    errorMessage.value = 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.'
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
      fieldErrors,
      showSuccessModal, 
      handleRegister,
      goToLogin,
      closeModalAndRedirect
    }
  }
}
</script>

<template>
  <div class="bg-gray-50 flex items-center justify-center px-4 py-2 min-h-screen">
    <div class="max-w-3xl w-full"> 
      <div class="bg-gradient-to-br from-pink-500 to-purple-300 rounded-2xl shadow-xl border border-gray-200 p-8">
        
        <div class="text-center mb-6">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#1B3C53] to-[#234C6A] mx-auto mb-4 shadow-lg">
            <span class="material-icons text-white text-2xl">person_add</span>
          </div>
          <h2 class="text-2xl font-bold text-[#1B3C53]">أنشئ حسابك الجديد</h2>
        </div>

        <form @submit.prevent="handleRegister" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          
          <div>
            <label class="block text-sm font-medium mb-2 text-[#1B3C53]">الاسم الكامل</label>
            <div class="relative">
              <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-[#456882] text-lg">person</span>
              <input 
                type="text" 
                v-model="form.fullName"
                required
                placeholder="ادخل اسمك الكامل"
                :class="['w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 transition-all duration-200', 
                  fieldErrors.FirstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                ]"
              >
            </div>
            <p v-if="fieldErrors.FirstName" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm md:col-span-2 shadow-sm">
              {{ fieldErrors.FirstName[0] }}
            </p>
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
                :class="['w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 transition-all duration-200', 
                  fieldErrors.Email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                ]"
              >
            </div>
            <p v-if="fieldErrors.Email" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm md:col-span-2 shadow-sm">
              {{ fieldErrors.Email[0] }}
            </p>
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
                :class="['w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 transition-all duration-200', 
                  fieldErrors.Password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                ]"
              >
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#456882] hover:text-[#1B3C53] transition-colors duration-200"
              >
                <span class="material-icons text-lg">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <p v-if="fieldErrors.Password" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm md:col-span-2 shadow-sm">
              {{ fieldErrors.Password[0] }}
            </p>
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
                class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 transition-all duration-200"
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
                <option value="teacher">معلم</option>
                <option value="student">طالب</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-[#1B3C53]">رقم هاتف المعلم أو ولي الأمر</label>
            <div class="relative">
              <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-[#456882] text-lg">phone</span>
              <input 
                type="tel" 
                v-model="form.phone"
placeholder="ادخل رقم هاتفك (مثال: +966501234567)"
                :class="['w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-[#1B3C53] focus:border-transparent bg-white text-gray-800 transition-all duration-200', 
                  fieldErrors.PhoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                ]"
              >
            </div>
            <p v-if="fieldErrors.PhoneNumber" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm md:col-span-2 shadow-sm">
              {{ fieldErrors.PhoneNumber[0] }}
            </p>
          </div>
          
          <div class="flex items-start gap-3 md:col-span-2">
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

          <!-- رسالة الخطأ العامة (بتنسيق أفضل) -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm md:col-span-2 shadow-sm">
            <div class="flex items-start gap-3">
              <span class="material-icons text-lg flex-shrink-0">error_outline</span>
              <div v-html="errorMessage" class="flex-1"></div>
            </div>
          </div>

          <button 
            type="submit"
            :disabled="loading || !form.agreeTerms"
            class="w-full bg-gradient-to-r from-[#1B3C53] to-[#234C6A] text-white py-3 px-4 rounded-xl hover:from-[#234C6A] hover:to-[#1B3C53] transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 md:col-span-2"
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
          <button @click="goToLogin" class="font-semibold mt-2 text-[#1B3C53] hover:underline transition-colors duration-200 flex items-center justify-center gap-2 mx-auto">
            <span class="material-icons text-lg">login</span>
            <span>سجل الدخول الآن</span>
          </button>
        </div>

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
          تم إنشاء حسابك بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول الآن.
        </p>
        
        <button 
          @click="closeModalAndRedirect" 
          class="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors duration-200 font-semibold shadow-lg"
        >
          موافق (اذهب إلى تسجيل الدخول)
        </button>
        
      </div>
    </div>
  </Transition>

</template>