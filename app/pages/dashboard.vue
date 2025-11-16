<template>
<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-right">
    <div class="max-w-7xl mx-auto">
        
        <div class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div class="flex items-center gap-4 mb-4 md:mb-0">
                <span class="material-icons text-purple-600 text-4xl">dashboard</span>
                <h1 class="text-4xl font-extrabold text-gray-900">لوحة تحكم المدير</h1>
            </div>
            
            <div class="flex items-center gap-3">
                <label for="period-select" class="font-medium text-gray-700">الفترة الزمنية:</label>
                <select
                    id="period-select"
                    v-model="selectedPeriod"
                    @change="fetchDashboardData"
                    class="py-2 px-4 border border-gray-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                    <option value="0">الإجمالي (كل المدة)</option>
                    <option value="1">اليوم الأخير</option>
                    <option value="7">آخر 7 أيام</option>
                    <option value="30">آخر 30 يوماً</option>
                    <option value="90">آخر 90 يوماً</option>
                </select>
            </div>
        </div>

        <div v-if="loading" class="text-center py-20">
            <div class="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-purple-600 font-medium text-lg">جاري تحميل لوحة التحكم...</p>
        </div>
        
        <div v-else-if="error" class="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
            <p class="font-bold">خطأ في جلب البيانات!</p>
            <p class="text-sm">{{ error }}</p>
        </div>

        <div v-else-if="dashboardData">
            
            <h2 class="text-2xl font-bold text-gray-800 my-6">📝 نظرة عامة على القصص</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <DashboardCard title="إجمالي القصص" :value="dashboardData.storyCounts.total" icon="book" color="bg-indigo-500" />
                <DashboardCard title="قصص قيد المراجعة" :value="dashboardData.storyCounts.pending" icon="hourglass_empty" color="bg-yellow-500" />
                <DashboardCard title="قصص معتمدة" :value="dashboardData.storyCounts.approved" icon="check_circle" color="bg-green-500" />
                <DashboardCard title="قصص مرفوضة" :value="dashboardData.storyCounts.rejected" icon="cancel" color="bg-red-500" />
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                
                <div class="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span class="material-icons text-blue-600">pie_chart</span> توزيع المستخدمين
                    </h3>
                    <div class="h-80">
                        <UserDoughnutChart :userCounts="dashboardData.userCounts" />
                    </div>
                </div>

                <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span class="material-icons text-red-600">stacked_bar_chart</span> مقارنة نسب الأداء
                    </h3>
                    <div class="h-80">
                        <ComparisonBarChart :dashboardData="dashboardData" />
                    </div>
                </div>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-6">💖 مقاييس التفاعل والأرقام الإجمالية</h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                
                <div class="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span class="material-icons text-blue-600">group</span> تفاصيل المستخدمين
                    </h3>
                    <StatsDetail title="إجمالي المستخدمين" :value="dashboardData.userCounts.total" unit="مستخدم" />
                    <StatsDetail title="نشطون في الفترة" :value="dashboardData.userCounts.activeInPeriod" unit="مستخدم" color="text-green-500" />
                    <StatsDetail title="جدد في الفترة" :value="dashboardData.userCounts.newInPeriod" unit="مستخدم" color="text-indigo-500" />
                </div>

                <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                    <h3 class="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
                        <span class="material-icons text-pink-600">favorite_border</span> الأرقام الإجمالية للتفاعل
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <EngagementStat title="إجمالي المشاهدات" :value="dashboardData.engagementMetrics.totalViews" icon="visibility" color="text-blue-500" />
                        <EngagementStat title="إجمالي الإعجابات" :value="dashboardData.engagementMetrics.totalLikes" icon="thumb_up" color="text-red-500" />
                        <EngagementStat title="إجمالي المشاركات" :value="dashboardData.engagementMetrics.totalShares" icon="share" color="text-green-500" />
                        <EngagementStat title="إجمالي التقييمات" :value="dashboardData.engagementMetrics.totalRatings" icon="star" color="text-yellow-500" />
                    </div>
                </div>
            </div>
            
            <h2 class="text-2xl font-bold text-gray-800 mb-6">⭐ التقييم والمعدلات</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-center items-center">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">متوسط التقييم العام</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-6xl font-extrabold text-purple-600">{{ dashboardData.engagementMetrics.averageRating.toFixed(1) }}</span>
                        <span class="text-3xl text-gray-500">/ 5.0</span>
                    </div>
                    <div class="text-yellow-500 text-3xl mt-2">
                        <span v-for="n in 5" :key="n" class="material-icons">
                            {{ n <= Math.round(dashboardData.engagementMetrics.averageRating) ? 'star' : 'star_border' }}
                        </span>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">معدلات التفاعل (بالنسبة للمشاهدات)</h3>
                    <RateDetail title="معدل الإعجاب" :value="dashboardData.engagementRates.viewToLikeRate" color="text-red-500" />
                    <RateDetail title="معدل المشاركة" :value="dashboardData.engagementRates.viewToShareRate" color="text-green-500" />
                    <RateDetail title="معدل التعليق" :value="dashboardData.engagementRates.viewToCommentRate" color="text-blue-500" />
                    <RateDetail title="إجمالي نقاط التفاعل" :value="dashboardData.engagementRates.averageEngagementScore" color="text-purple-600" />
                </div>
            </div>
        </div>
        
        <div v-else-if="!loading" class="text-center py-20">
            <span class="material-icons text-6xl text-gray-400 mb-4">lock</span>
            <p class="text-xl font-bold text-gray-700 mb-2">غير مصرح لك بالوصول لهذه الصفحة.</p>
            <p class="text-gray-500">ستتم إعادتك للصفحة الرئيسية قريباً.</p>
        </div>
    </div>
    <button 
    @click="roles = true" 
    class="mt-10 block mx-auto text-lg bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
>
    تعديل أدوار المستخدمين
</button>
<UsersRoles v-if="roles"/>
</div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
// استيراد مكونات الرسوم البيانية

const router = useRouter();
const roles = ref(false);
// -------------------
// الثوابت ونقاط النهاية
// -------------------
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const DASHBOARD_ENDPOINT = `${API_BASE}/api/dashboard/overview`;
const USER_ME_ENDPOINT = `${API_BASE}/api/identity/users/me`; 

// -------------------
// حالة المكون
// -------------------
const loading = ref(true);
const error = ref(null);
const dashboardData = ref(null);
const selectedPeriod = ref("0"); 

// -------------------
// الدوال المساعدة للتوكن والكوكيز
// -------------------
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

const getToken = () => {
    return getCookie('authToken');
};

/**
 * دالة جلب بيانات المستخدم والتحقق من دور المدير (Admin)
 */
const checkUserRole = async () => {
    const token = getToken();
    if (!token) {
        return false;
    }

    try {
        const response = await axios.get(USER_ME_ENDPOINT, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.userTypeName === 'Admin') {
            return true;
        }

    } catch (err) {
        console.error("User Role Check Failed:", err);
        return false;
    }
    
    return false;
};

// -------------------
// جلب بيانات لوحة التحكم
// -------------------
const fetchDashboardData = async () => {
    loading.value = true; 
    error.value = null;

    const isUserAdmin = await checkUserRole();

    if (!isUserAdmin) {
        error.value = "غير مصرح لك بالوصول لهذه الصفحة. سيتم توجيهك للصفحة الرئيسية.";
        loading.value = false;
        setTimeout(() => {
            router.push({ path: '/' });
        }, 3000);
        return;
    }

    try {
        const token = getToken();
        if (!token) { return; }

        const requestBody = {
            period: parseInt(selectedPeriod.value) 
        };

        const response = await axios.post(DASHBOARD_ENDPOINT, requestBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.data) {
            dashboardData.value = response.data.data;
        } else {
            throw new Error("تنسيق بيانات لوحة التحكم غير صحيح.");
        }
    } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            error.value = "انتهت صلاحية جلسة المدير. سيتم تسجيل الخروج.";
            setTimeout(() => {
                router.push({ path: '/' }); 
            }, 3000);
        } else {
            error.value = err.message || 'فشل في الاتصال بالخادم. تحقق من اتصالك بالإنترنت.';
        }
        console.error("Dashboard Fetch Error:", err);
        dashboardData.value = null; 
    } finally {
        loading.value = false;
    }
};

onMounted(fetchDashboardData);

// -------------------
// المكونات الداخلية المصغرة (H-Functions)
// -------------------

const DashboardCard = ({ title, value, icon, color }) => {
  return h('div', { class: `p-5 rounded-2xl text-white shadow-xl ${color}` }, [
    h('div', { class: 'flex items-center justify-between' }, [
      h('span', { class: 'material-icons text-4xl' }, icon),
      h('div', { class: 'text-right' }, [
        h('p', { class: 'text-sm opacity-80' }, title),
        h('p', { class: 'text-3xl font-bold' }, value.toString()),
      ])
    ])
  ]);
};

const StatsDetail = ({ title, value, unit, color = 'text-gray-700' }) => {
  // تم إبقاء هذا المكون للاستخدام في قسم 'تفاصيل المستخدمين'
  return h('div', { class: 'flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0' }, [
    h('span', { class: `font-medium ${color}` }, title),
    h('span', { class: 'font-bold text-lg' }, `${value} ${unit}`),
  ]);
};

const EngagementStat = ({ title, value, icon, color }) => {
  return h('div', { class: 'text-center p-3 border rounded-xl bg-gray-50' }, [
    h('span', { class: `material-icons text-3xl mb-1 ${color}` }, icon),
    h('p', { class: 'text-xl font-bold text-gray-800' }, value.toString()),
    h('p', { class: 'text-xs text-gray-500' }, title),
  ]);
};

const RateDetail = ({ title, value, color }) => {
  return h('div', { class: 'flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0' }, [
    h('span', { class: 'font-medium text-gray-700' }, title),
    h('span', { class: `font-bold text-lg ${color}` }, `${value.toFixed(2)} %`),
  ]);
};
</script>