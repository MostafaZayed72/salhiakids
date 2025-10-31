<template>
  <footer class="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-700 text-white py-12 relative overflow-hidden">
    <div class="container mx-auto px-4 lg:px-6 z-10 relative">
      
      <!-- المحتوى الرئيسي -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        
        <!-- معلومات المكتبة -->
        <div class="lg:col-span-2">
          <div class="flex items-center gap-3 mb-6 transform hover:scale-105 transition-all duration-300">
            <div class="bg-white/20 rounded-2xl p-3 shadow-lg custom-rotate-slow">
              <span class="material-icons text-white text-2xl">auto_stories</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white custom-text-pulse">مكتبة مركز صالح بن صالح الرقمية</h3>
              <p class="text-purple-200 text-lg">نحو جيل قارئ ومبدع</p>
            </div>
          </div>
          
          <p class="text-purple-200 text-base leading-relaxed mb-6 max-w-xl">
            مكتبة رقمية متخصصة في تقديم محتوى تعليمي وترفيهي متميز للأطفال، 
            تهدف إلى تنمية مهارات القراءة والإبداع لدى النشء.
          </p>

          <!-- شركاؤنا -->
          <div>
            <h4 class="text-lg font-bold text-white mb-4">شركاؤنا</h4>
            <div class="flex flex-wrap gap-4">
              <div 
                v-for="partner in partners" 
                :key="partner.name"
                class="bg-white/10 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-110 hover:-translate-y-1 shadow-lg"
              >
                <div class="w-24 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {{ partner.name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- روابط سريعة -->
        <div>
          <div class="flex items-center gap-3 mb-6 transform hover:scale-105 transition-all duration-300">
            <div class="bg-white/20 rounded-2xl p-2 shadow-lg">
              <span class="material-icons text-white">link</span>
            </div>
            <h4 class="text-xl font-bold text-white">روابط سريعة</h4>
          </div>
          
          <div class="space-y-3">
            <router-link
              v-for="link in quickLinks"
              :key="link.name"
              :to="link.path"
              class="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/50 hover:to-pink-600/50 transition-all duration-300 group transform hover:translate-x-2"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <span class="material-icons text-white text-sm">{{ link.icon }}</span>
              </div>
              <span class="text-purple-200 group-hover:text-white transition-colors duration-300 font-medium">
                {{ link.name }}
              </span>
              <span class="material-icons text-purple-400 group-hover:text-white transform group-hover:-translate-x-1 transition-all duration-300 text-sm">
                chevron_left
              </span>
            </router-link>
          </div>
        </div>

        <!-- تواصل معنا -->
        <div>
          <div class="flex items-center gap-3 mb-6 transform hover:scale-105 transition-all duration-300">
            <div class="bg-white/20 rounded-2xl p-2 shadow-lg">
              <span class="material-icons text-white">contact_mail</span>
            </div>
            <h4 class="text-xl font-bold text-white">تواصل معنا</h4>
          </div>

          <div class="space-y-4">
            <div 
              v-for="contact in contacts" 
              :key="contact.type"
              class="flex items-start gap-3 group transform hover:translate-x-2 transition-transform duration-300"
            >
              <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md mt-1 flex-shrink-0">
                <span class="material-icons text-white text-sm">{{ contact.icon }}</span>
              </div>
              <div class="flex-1">
                <p class="text-white font-bold text-sm mb-1">{{ contact.title }}</p>
                <a 
                  v-if="contact.type === 'email' || contact.type === 'phone'"
                  :href="contact.type === 'email' ? `mailto:${contact.value}` : `tel:${contact.value}`"
                  class="text-purple-200 hover:text-white transition-all duration-300 text-sm hover:underline"
                >
                  {{ contact.value }}
                </a>
                <p v-else class="text-purple-200 text-sm">{{ contact.value }}</p>
              </div>
            </div>
          </div>

          <!-- وسائل التواصل الاجتماعي -->
          <div class="mt-6">
            <h4 class="text-lg font-bold text-white mb-4">تابعنا</h4>
            <div class="flex gap-3">
              <a
                v-for="social in socialLinks"
                :key="social.name"
                :href="social.url"
                target="_blank"
                class="w-12 h-12 rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-300 flex items-center justify-center transform hover:scale-110 hover:-translate-y-1 shadow-lg"
                :title="social.name"
              >
                <span class="material-icons text-white text-lg">{{ social.icon }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- قسم حقوق النشر -->
      <div class="border-t border-white/20 pt-8 flex flex-col lg:flex-row items-center justify-between gap-4">
        <p class="text-purple-200 text-sm text-center lg:text-right">
          مكتبة مركز صالح بن صالح الرقمية للطفل © {{ currentYear }} جميع الحقوق محفوظة
        </p>
        
        <div class="flex flex-wrap justify-center gap-6">
          <router-link
            v-for="policy in policies"
            :key="policy.name"
            :to="policy.path"
            class="text-purple-200 hover:text-white transition-all duration-300 text-sm hover:underline transform hover:scale-105"
          >
            {{ policy.name }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- خلفيات زخرفية -->
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5 blur-3xl custom-float"></div>
      <div class="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5 blur-3xl custom-float-delayed"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5 blur-3xl custom-pulse-slow"></div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())

const partners = [
  {
    name: 'هيئة المكتبات',
    logo: '/images/partners/moc-logo.png',
    url: 'https://libraries.moc.gov.sa/'
  },
  {
    name: 'رؤية 2030',
    logo: '/images/partners/vision-2030.png',
    url: 'https://www.vision2030.gov.sa/'
  },
  {
    name: 'المركز الوطني',
    logo: '/images/partners/ncnp-logo.png',
    url: 'https://ncnp.gov.sa/'
  }
]

const quickLinks = [
  { name: 'الرئيسية', path: '/', icon: 'home' },
  { name: 'من نحن', path: '/about', icon: 'info' },
  { name: 'المكتبة الرقمية', path: '/library', icon: 'library_books' },
  { name: 'الفعاليات', path: '/events', icon: 'event' },
  { name: 'المحتوى التعليمي', path: '/education', icon: 'school' },
  { name: 'اتصل بنا', path: '/contact', icon: 'contact_support' }
]

const contacts = [
  { 
    type: 'email', 
    title: 'البريد الإلكتروني', 
    value: 'salhia@salhia.org.sa', 
    icon: 'email' 
  },
  { 
    type: 'phone', 
    title: 'الهاتف', 
    value: '+966553647554', 
    icon: 'phone' 
  },
  { 
    type: 'location', 
    title: 'العنوان', 
    value: 'القصيم - عنيزة - حي الهدا', 
    icon: 'location_on' 
  }
]

const socialLinks = [
  { name: 'يوتيوب', url: 'https://www.youtube.com/@binsalhcenter', icon: 'play_circle' },
  { name: 'تويتر', url: 'https://x.com/alsalhiasa', icon: 'alternate_email' },
  { name: 'فيسبوك', url: '#', icon: 'facebook' },
  { name: 'انستجرام', url: '#', icon: 'photo_camera' }
]

const policies = [
  { name: 'سياسة الخصوصية', path: '/privacy' },
  { name: 'الشروط والأحكام', path: '/terms' },
  { name: 'خريطة الموقع', path: '/sitemap' }
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* تطبيق الخط العربي */
footer {
  font-family: 'Tajawal', sans-serif;
}

/* حركات مخصصة */
@keyframes custom-rotate-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes custom-text-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes custom-float {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-20px) translateX(10px); }
}

@keyframes custom-float-delayed {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(15px) translateX(-10px); }
}

@keyframes custom-pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.1; transform: scale(1.1); }
}

.custom-rotate-slow {
  animation: custom-rotate-slow 10s linear infinite;
}

.custom-text-pulse {
  animation: custom-text-pulse 3s ease-in-out infinite;
}

.custom-float {
  animation: custom-float 8s ease-in-out infinite;
}

.custom-float-delayed {
  animation: custom-float-delayed 10s ease-in-out infinite;
}

.custom-pulse-slow {
  animation: custom-pulse-slow 4s ease-in-out infinite;
}

/* تحسينات للروابط */
.router-link-active {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3));
}

/* تحسينات للاستجابة على الأجهزة الصغيرة */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .text-2xl {
    font-size: 1.5rem;
  }
  
  .space-y-4 > * {
    margin-bottom: 1rem;
  }
}

/* تحسينات للظلال والزوايا */
.rounded-2xl {
  border-radius: 1rem;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

/* تحسينات التدرج اللوني */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* تحسينات للخطوط */
.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

/* تحسينات للتباعد */
.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>