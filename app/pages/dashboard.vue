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
            
            <div class="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                <button 
                    @click="exportToExcel" 
                    :disabled="!dashboardData || loading"
                    class="export-button py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    <span class="material-icons text-lg leading-none align-middle mr-1">table_chart</span>
                    تصدير كـ Excel (XLSX)
                </button>
                <button 
                    @click="exportToWord" 
                    :disabled="!dashboardData || loading"
                    class="export-button py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    <span class="material-icons text-lg leading-none align-middle mr-1">article</span>
                    تصدير كـ Word (DOCX)
                </button>
                <button 
                    @click="printReport" 
                    :disabled="!dashboardData || loading"
                    class="export-button py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    <span class="material-icons text-lg leading-none align-middle mr-1">print</span>
                    طباعة (PDF)
                </button>
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
import { ref, onMounted, h, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
// المكتبات التي تحتاج تثبيت: npm install xlsx docx file-saver
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// استيراد المكونات الحقيقية (يجب أن تكون موجودة في مسارها الصحيح):



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

// -------------------
// وظائف التصدير والطباعة
// -------------------

// 1. التصدير كـ Excel (XLSX)
const exportToExcel = () => {
    if (!dashboardData.value) return;

    const data = dashboardData.value;
    const reportDate = new Date().toLocaleString('ar-EG');
    
    const storyData = [
        ['', 'إجمالي القصص', 'قيد المراجعة', 'معتمدة', 'مرفوضة'],
        ['العدد', data.storyCounts.total, data.storyCounts.pending, data.storyCounts.approved, data.storyCounts.rejected]
    ];
    
    const userData = [
        ['', 'إجمالي المستخدمين', 'نشطون في الفترة', 'جدد في الفترة'],
        ['العدد', data.userCounts.total, data.userCounts.activeInPeriod, data.userCounts.newInPeriod]
    ];

    const engagementData = [
        ['', 'إجمالي المشاهدات', 'إجمالي الإعجابات', 'إجمالي المشاركات', 'إجمالي التقييمات', 'متوسط التقييم'],
        ['العدد', data.engagementMetrics.totalViews, data.engagementMetrics.totalLikes, data.engagementMetrics.totalShares, data.engagementMetrics.totalRatings, data.engagementMetrics.averageRating.toFixed(2)]
    ];

    const rateData = [
        ['', 'معدل الإعجاب', 'معدل المشاركة', 'معدل التعليق', 'إجمالي نقاط التفاعل'],
        ['النسبة (٪)', data.engagementRates.viewToLikeRate.toFixed(2), data.engagementRates.viewToShareRate.toFixed(2), data.engagementRates.viewToCommentRate.toFixed(2), data.engagementRates.averageEngagementScore.toFixed(2)]
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(storyData), 'نظرة عامة على القصص');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(userData), 'توزيع المستخدمين');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(engagementData), 'مقاييس التفاعل');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rateData), 'معدلات التفاعل');

    XLSX.writeFile(wb, `تقرير_المدير_${reportDate}.xlsx`);
};

// 2. التصدير كـ Word (DOCX) - التصحيح هنا
const exportToWord = async () => {
    if (!dashboardData.value) {
        console.error("Dashboard data is not available for export.");
        return;
    }

    try {
        const data = dashboardData.value;
        const reportDate = new Date().toLocaleString('ar-EG');
        const sections = [];

        // دالة مساعدة لإنشاء جدول (كما هي)
        const createDocxTable = (header, body) => {
            return new Table({
                alignment: AlignmentType.RIGHT,
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: header.map(text => new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                            shading: { fill: "4F46E5", val: "clear" }, 
                            borders: { top: { style: "single" }, bottom: { style: "single" }, left: { style: "single" }, right: { style: "single" } },
                        })).reverse(), 
                    }),
                    ...body.map(row => 
                        new TableRow({
                            children: row.map(text => 
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: String(text) })], alignment: AlignmentType.RIGHT })],
                                    borders: { top: { style: "single" }, bottom: { style: "single" }, left: { style: "single" }, right: { style: "single" } },
                                })
                            ).reverse(), 
                        })
                    ),
                ],
                properties: { bidirectional: true } 
            });
        };

        // 1. العنوان
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({ text: "تقرير لوحة تحكم المدير", size: 50, bold: true, color: "4F46E5" }),
                    new TextRun({ text: `\nالتاريخ: ${reportDate}\n`, size: 20, break: 1 }),
                ],
                alignment: AlignmentType.RIGHT,
                heading: HeadingLevel.TITLE,
            }),
        );
        
        // 2. نظرة عامة على القصص
        sections.push(
            new Paragraph({ children: [new TextRun({ text: "\n2. نظرة عامة على القصص", size: 32, bold: true })], alignment: AlignmentType.RIGHT, spacing: { before: 200 } }),
            createDocxTable(
                ['إجمالي القصص', 'قيد المراجعة', 'معتمدة', 'مرفوضة'],
                [[data.storyCounts.total, data.storyCounts.pending, data.storyCounts.approved, data.storyCounts.rejected]]
            )
        );
        
        // 3. توزيع المستخدمين
        sections.push(
            new Paragraph({ children: [new TextRun({ text: "\n3. توزيع المستخدمين", size: 32, bold: true })], alignment: AlignmentType.RIGHT, spacing: { before: 200 } }),
            createDocxTable(
                ['إجمالي المستخدمين', 'نشطون في الفترة', 'جدد في الفترة'],
                [[data.userCounts.total, data.userCounts.activeInPeriod, data.userCounts.newInPeriod]]
            )
        );
        
        // 4. مقاييس التفاعل
        sections.push(
            new Paragraph({ children: [new TextRun({ text: "\n4. مقاييس التفاعل والأرقام الإجمالية", size: 32, bold: true })], alignment: AlignmentType.RIGHT, spacing: { before: 200 } }),
            createDocxTable(
                ['إجمالي المشاهدات', 'إجمالي الإعجابات', 'إجمالي المشاركات', 'متوسط التقييم'],
                [[data.engagementMetrics.totalViews, data.engagementMetrics.totalLikes, data.engagementMetrics.totalShares, data.engagementMetrics.averageRating.toFixed(2)]]
            )
        );

        const doc = new Document({
            sections: [{ children: sections }],
            properties: { bidirectional: true } 
        });

        // 💡 نقطة التصحيح: استخدام Packer.toBlob بدلاً من Packer.toBuffer لضمان التوافق الأفضل مع المتصفح
        // ثم حفظه باستخدام file-saver
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `تقرير_المدير_${reportDate}.docx`);
        

    } catch (e) {
        console.error("Word Export Error:", e);
        alert(`فشل تصدير Word. تحقق من الكونسول. (الخطأ: ${e.message})`);
    }
};


// 3. وظيفة الطباعة (لتركها خياراً)
const printReport = () => {
    window.print();
};

onMounted(fetchDashboardData);

// -------------------
// المكونات الداخلية المصغرة (H-Functions)
// -------------------

const DashboardCard = defineComponent({
//... (تعريف المكون كما هو)
    props: ['title', 'value', 'icon', 'color'],
    setup(props) {
        return () => h('div', { class: `p-5 rounded-2xl text-white shadow-xl ${props.color}` }, [
            h('div', { class: 'flex items-center justify-between' }, [
                h('span', { class: 'material-icons text-4xl' }, props.icon),
                h('div', { class: 'text-right' }, [
                    h('p', { class: 'text-sm opacity-80' }, props.title),
                    h('p', { class: 'text-3xl font-bold' }, props.value.toString()),
                ])
            ])
        ]);
    }
});

const StatsDetail = defineComponent({
//... (تعريف المكون كما هو)
    props: ['title', 'value', 'unit', 'color'],
    setup(props) {
        const detailColor = props.color || 'text-gray-700';
        return () => h('div', { class: 'flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0' }, [
            h('span', { class: `font-medium ${detailColor}` }, props.title),
            h('span', { class: 'font-bold text-lg' }, `${props.value} ${props.unit}`),
        ]);
    }
});

const EngagementStat = defineComponent({
//... (تعريف المكون كما هو)
    props: ['title', 'value', 'icon', 'color'],
    setup(props) {
        return () => h('div', { class: 'text-center p-3 border rounded-xl bg-gray-50' }, [
            h('span', { class: `material-icons text-3xl mb-1 ${props.color}` }, props.icon),
            h('p', { class: 'text-xl font-bold text-gray-800' }, props.value.toString()),
            h('p', { class: 'text-xs text-gray-500' }, props.title),
        ]);
    }
});

const RateDetail = defineComponent({
//... (تعريف المكون كما هو)
    props: ['title', 'value', 'color'],
    setup(props) {
        return () => h('div', { class: 'flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0' }, [
            h('span', { class: 'font-medium text-gray-700' }, props.title),
            h('span', { class: `font-bold text-lg ${props.color}` }, `${props.value.toFixed(2)} %`),
        ]);
    }
});
</script>

<style>
/* ... (أنماط الطباعة CSS كما هي) ... */
@media print {
    .material-icons,
    .max-w-7xl + button, 
    .mb-10 .flex.items-center.gap-3, 
    .export-button {
        display: none !important;
    }
    .min-h-screen {
        min-height: auto !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }
    body, .bg-gray-50, .bg-white {
        background-color: white !important;
        color: #000 !important;
        box-shadow: none !important;
        border: none !important;
    }
    .shadow-xl, .shadow-md, .border {
        box-shadow: none !important;
        border: none !important;
    }
    .max-w-7xl {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
    }
}
</style>