<template>
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-right">
        <div class="max-w-7xl mx-auto">

            <div
                class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div class="flex items-center gap-4 mb-4 md:mb-0">
                    <span class="material-icons text-purple-600 text-4xl">dashboard</span>
                    <h1 class="text-4xl font-extrabold text-gray-900">لوحة تحكم المدير</h1>
                </div>

                <div class="flex items-center gap-3">
                    <label for="period-select" class="font-medium text-gray-700">الفترة الزمنية:</label>
                    <select id="period-select" v-model="selectedPeriod" @change="fetchDashboardData"
                        class="py-2 px-4 border border-gray-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500 transition-colors">
                        <option value="0">الإجمالي (كل المدة)</option>
                        <option value="1">اليوم الأخير</option>
                        <option value="7">آخر 7 أيام</option>
                        <option value="30">آخر 30 يوماً</option>
                        <option value="90">آخر 90 يوماً</option>
                    </select>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                    <button @click="exportToExcel" :disabled="!dashboardData || loading"
                        class="export-button py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                        <span class="material-icons text-lg leading-none align-middle mr-1">table_chart</span>
                        تصدير كـ Excel (XLSX)
                    </button>
                    <button @click="exportToWord" :disabled="!dashboardData || loading"
                        class="export-button py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                        <span class="material-icons text-lg leading-none align-middle mr-1">article</span>
                        تصدير كـ Word (DOCX)
                    </button>
                    <button @click="printReport" :disabled="!dashboardData || loading"
                        class="export-button py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                        <span class="material-icons text-lg leading-none align-middle mr-1">print</span>
                        طباعة (PDF)
                    </button>
                </div>
            </div>

            <div v-if="loading" class="text-center py-20">
                <div
                    class="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4">
                </div>
                <p class="text-purple-600 font-medium text-lg">جاري تحميل لوحة التحكم...</p>
            </div>

            <div v-else-if="error" class="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md"
                role="alert">
                <p class="font-bold">خطأ في جلب البيانات!</p>
                <p class="text-sm">{{ error }}</p>
            </div>

            <div v-else-if="dashboardData">

                <!-- 📝 نظرة عامة على القصص -->
                <h2 class="text-2xl font-bold text-gray-800 my-6">📝 نظرة عامة على القصص</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="إجمالي القصص" :value="dashboardData.storyCounts.totalInPeriod" icon="book"
                            color="bg-indigo-500" />
                        <ProgressBar :percentage="100" color="bg-indigo-500" class="mt-4" />
                    </div>
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="قصص قيد المراجعة" :value="dashboardData.storyCounts.pendingInPeriod"
                            icon="hourglass_empty" color="bg-yellow-500" />
                        <ProgressBar
                            :percentage="getPercentage(dashboardData.storyCounts.pendingInPeriod, dashboardData.storyCounts.totalInPeriod)"
                            color="bg-yellow-500" class="mt-4" />
                    </div>
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="قصص معتمدة" :value="dashboardData.storyCounts.approvedInPeriod"
                            icon="check_circle" color="bg-green-500" />
                        <ProgressBar
                            :percentage="getPercentage(dashboardData.storyCounts.approvedInPeriod, dashboardData.storyCounts.totalInPeriod)"
                            color="bg-green-500" class="mt-4" />
                    </div>
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="قصص مرفوضة" :value="dashboardData.storyCounts.rejectedInPeriod"
                            icon="cancel" color="bg-red-500" />
                        <ProgressBar
                            :percentage="getPercentage(dashboardData.storyCounts.rejectedInPeriod, dashboardData.storyCounts.totalInPeriod)"
                            color="bg-red-500" class="mt-4" />
                    </div>
                </div>

                <!-- 👥 نظرة عامة على المستخدمين -->
                <h2 class="text-2xl font-bold text-gray-800 my-6">👥 نظرة عامة على المستخدمين</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="إجمالي المستخدمين" :value="dashboardData.userCounts.total" icon="group"
                            color="bg-blue-500" />
                        <ProgressBar :percentage="100" color="bg-blue-500" class="mt-4" />
                    </div>
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="مستخدمون نشطون" :value="dashboardData.userCounts.activeUsersInPeriod"
                            icon="verified_user" color="bg-green-500" />
                        <ProgressBar
                            :percentage="getPercentage(dashboardData.userCounts.activeUsersInPeriod, dashboardData.userCounts.total)"
                            color="bg-green-500" class="mt-4" />
                    </div>
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="مستخدمون غير نشطين" :value="dashboardData.userCounts.inactiveUsers"
                            icon="person_off" color="bg-gray-500" />
                        <ProgressBar
                            :percentage="getPercentage(dashboardData.userCounts.inactiveUsers, dashboardData.userCounts.total)"
                            color="bg-gray-500" class="mt-4" />
                    </div>
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="جدد في الفترة" :value="dashboardData.userCounts.newInPeriod"
                            icon="person_add" color="bg-purple-500" />
                        <ProgressBar
                            :percentage="getPercentage(dashboardData.userCounts.newInPeriod, dashboardData.userCounts.total)"
                            color="bg-purple-500" class="mt-4" />
                    </div>
                </div>

                <!-- 💖 مقاييس التفاعل والأرقام الإجمالية -->
                <h2 class="text-2xl font-bold text-gray-800 my-6">💖 مقاييس التفاعل والأرقام الإجمالية</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="إجمالي المشاهدات" :value="dashboardData.engagementMetrics.viewsInPeriod"
                            icon="visibility" color="bg-blue-500" />
                        <ProgressBar :percentage="100" color="bg-blue-500" class="mt-4" />
                    </div>
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="إجمالي الإعجابات" :value="dashboardData.engagementMetrics.likesInPeriod"
                            icon="thumb_up" color="bg-red-500" />
                        <ProgressBar
                            :percentage="getPercentage(dashboardData.engagementMetrics.likesInPeriod, dashboardData.engagementMetrics.viewsInPeriod)"
                            color="bg-red-500" class="mt-4" />
                    </div>
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="إجمالي المشاركات" :value="dashboardData.engagementMetrics.sharesInPeriod"
                            icon="share" color="bg-green-500" />
                        <ProgressBar
                            :percentage="getPercentage(dashboardData.engagementMetrics.sharesInPeriod, dashboardData.engagementMetrics.viewsInPeriod)"
                            color="bg-green-500" class="mt-4" />
                    </div>
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <DashboardCard title="إجمالي التعليقات"
                            :value="dashboardData.engagementMetrics.commentsInPeriod" icon="chat_bubble"
                            color="bg-orange-500" />
                        <ProgressBar
                            :percentage="getPercentage(dashboardData.engagementMetrics.commentsInPeriod, dashboardData.engagementMetrics.viewsInPeriod)"
                            color="bg-orange-500" class="mt-4" />
                    </div>
                </div>

                <!-- الرسوم البيانية -->
                <h2 class="text-2xl font-bold text-gray-800 my-6">📊 الرسوم البيانية والتحليلات</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

                    <!-- توزيع المستخدمين -->
                    <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span class="material-icons text-blue-600">pie_chart</span> توزيع المستخدمين
                        </h3>
                        <UserDoughnutChart :userCounts="dashboardData.userCounts" />
                    </div>

                    <!-- توزيع أنواع الوسائط -->
                    <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span class="material-icons text-purple-600">assessment</span> توزيع أنواع الوسائط
                        </h3>
                        <MediaTypeChart :mediaTypeStats="dashboardData.mediaTypeStats" />
                    </div>
                </div>

                <!-- مقارنة نسب الأداء -->
                <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-12">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span class="material-icons text-red-600">stacked_bar_chart</span> مقارنة نسب الأداء
                    </h3>
                    <ComparisonBarChart :dashboardData="dashboardData" />
                </div>

                <!-- ⭐ التقييم والمعدلات -->
                <h2 class="text-2xl font-bold text-gray-800 mb-6">⭐ التقييم والمعدلات</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div
                        class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-center items-center">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">متوسط التقييم العام</h3>
                        <div class="flex items-center gap-2">
                            <span class="text-6xl font-extrabold text-purple-600">{{
                                dashboardData.engagementMetrics.averageRating.toFixed(1) }}</span>
                            <span class="text-3xl text-gray-500">/ 5.0</span>
                        </div>
                        <div class="text-yellow-500 text-3xl mt-2">
                            <span v-for="n in 5" :key="n" class="material-icons">
                                {{ n <= Math.round(dashboardData.engagementMetrics.averageRating) ? 'star'
                                    : 'star_border' }} </span>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">معدلات التفاعل (بالنسبة للمشاهدات)</h3>
                        <RateDetail title="معدل الإعجاب" :value="dashboardData.engagementRates.viewToLikeRate"
                            color="text-red-500" />
                        <RateDetail title="معدل المشاركة" :value="dashboardData.engagementRates.viewToShareRate"
                            color="text-green-500" />
                        <RateDetail title="معدل التعليق" :value="dashboardData.engagementRates.viewToCommentRate"
                            color="text-blue-500" />
                        <RateDetail title="إجمالي نقاط التفاعل"
                            :value="dashboardData.engagementRates.averageEngagementScore" color="text-purple-600" />
                    </div>
                </div>
            </div>

            <div v-else-if="!loading" class="text-center py-20">
                <span class="material-icons text-6xl text-gray-400 mb-4">lock</span>
                <p class="text-xl font-bold text-gray-700 mb-2">غير مصرح لك بالوصول لهذه الصفحة.</p>
                <p class="text-gray-500">ستتم إعادتك للصفحة الرئيسية قريباً.</p>
            </div>
        </div>


        <NotificationModal 
  :is-open="notification.isOpen.value"
  :notification="notification.notification.value"
  @close="notification.close"
/>

    </div>
</template>

<script setup>
import { ref, onMounted, h, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

const router = useRouter();


const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const DASHBOARD_ENDPOINT = `${API_BASE}/api/dashboard/overview`;
const USER_ME_ENDPOINT = `${API_BASE}/api/identity/users/me`;

const loading = ref(true);
const error = ref(null);
const dashboardData = ref(null);
const selectedPeriod = ref("0");

// دالة حساب النسبة المئوية
const getPercentage = (value, total) => {
    if (total === 0 || !total) return 0;
    return Math.round((value / total) * 100);
};

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

const getToken = () => {
    return getCookie('authToken');
};

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

        const requestConfig = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                period: parseInt(selectedPeriod.value)
            }
        };

        const response = await axios.post(DASHBOARD_ENDPOINT, null, requestConfig);

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

const exportToExcel = () => {
    if (!dashboardData.value) return;

    const data = dashboardData.value;
    const reportDate = new Date().toLocaleString('ar-EG');

    const storyData = [
        ['', 'إجمالي القصص', 'قيد المراجعة', 'معتمدة', 'مرفوضة'],
        ['العدد', data.storyCounts.totalInPeriod, data.storyCounts.pendingInPeriod, data.storyCounts.approvedInPeriod, data.storyCounts.rejectedInPeriod]
    ];

    const userData = [
        ['', 'إجمالي المستخدمين', 'نشطون', 'غير نشطين', 'جدد في الفترة'],
        ['العدد', data.userCounts.total, data.userCounts.activeUsers, data.userCounts.inactiveUsers, data.userCounts.newInPeriod]
    ];

    const engagementData = [
        ['', 'إجمالي المشاهدات', 'إجمالي الإعجابات', 'إجمالي المشاركات', 'إجمالي التعليقات', 'إجمالي التقييمات', 'متوسط التقييم'],
        ['العدد', data.engagementMetrics.totalViews, data.engagementMetrics.totalLikes, data.engagementMetrics.totalShares, data.engagementMetrics.totalComments, data.engagementMetrics.ratingsInPeriod, data.engagementMetrics.averageRating.toFixed(2)]
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
const notification = useNotification()

const exportToWord = async () => {
    if (!dashboardData.value) {
        console.error("Dashboard data is not available for export.");
        return;
    }

    try {
        const data = dashboardData.value;
        const reportDate = new Date().toLocaleString('ar-EG');
        const sections = [];

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

        sections.push(
            new Paragraph({ children: [new TextRun({ text: "\n1. نظرة عامة على القصص", size: 32, bold: true })], alignment: AlignmentType.RIGHT, spacing: { before: 200 } }),
            createDocxTable(
                ['إجمالي القصص', 'قيد المراجعة', 'معتمدة', 'مرفوضة'],
                [[data.storyCounts.totalInPeriod, data.storyCounts.pendingInPeriod, data.storyCounts.approvedInPeriod, data.storyCounts.rejectedInPeriod]]
            )
        );

        sections.push(
            new Paragraph({ children: [new TextRun({ text: "\n2. توزيع المستخدمين", size: 32, bold: true })], alignment: AlignmentType.RIGHT, spacing: { before: 200 } }),
            createDocxTable(
                ['إجمالي المستخدمين', 'نشطون', 'غير نشطين', 'جدد في الفترة'],
                [[data.userCounts.total, data.userCounts.activeUsers, data.userCounts.inactiveUsers, data.userCounts.newInPeriod]]
            )
        );

        sections.push(
            new Paragraph({ children: [new TextRun({ text: "\n3. مقاييس التفاعل والأرقام الإجمالية", size: 32, bold: true })], alignment: AlignmentType.RIGHT, spacing: { before: 200 } }),
            createDocxTable(
                ['إجمالي المشاهدات', 'إجمالي الإعجابات', 'إجمالي المشاركات', 'إجمالي التعليقات', 'متوسط التقييم'],
                [[data.engagementMetrics.totalViews, data.engagementMetrics.totalLikes, data.engagementMetrics.totalShares, data.engagementMetrics.totalComments, data.engagementMetrics.averageRating.toFixed(2)]]
            )
        );

        const doc = new Document({
            sections: [{ children: sections }],
            properties: { bidirectional: true }
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `تقرير_المدير_${reportDate}.docx`);

    } catch (e) {
        console.error("Word Export Error:", e);
notification.show({
      title: 'خطأ',
      message: `فشل تصدير Word. تحقق من الكونسول. (الخطأ: ${e.message})`,
      type: 'error',
      actions: [
        { label: 'حسناً', onClick: () => {}, style: 'primary' }
      ]
    })    }
};

const printReport = () => {
    window.print();
};

onMounted(fetchDashboardData);

// ==================
// المكونات الداخلية
// ==================

const DashboardCard = defineComponent({
    props: ['title', 'value', 'icon', 'color'],
    setup(props) {
        return () => h('div', { class: `p-5 rounded-2xl text-white ${props.color}` }, [
            h('div', { class: 'flex items-center justify-between' }, [
                h('div', { class: 'text-right' }, [
                    h('p', { class: 'text-sm opacity-80' }, props.title),
                    h('p', { class: 'text-3xl font-bold' }, props.value.toString()),
                ]),
                h('span', { class: 'material-icons text-4xl' }, props.icon),
            ])
        ]);
    }
});

// مكون شريط التقدم (Progress Bar)
const ProgressBar = defineComponent({
    props: ['percentage', 'color'],
    setup(props) {
        return () => h('div', { class: 'w-full bg-gray-200 rounded-full h-3 overflow-hidden' }, [
            h('div', {
                class: `h-full transition-all duration-1000 ease-out ${props.color}`,
                style: { width: `${props.percentage}%` }
            })
        ]);
    }
});

const StatsDetail = defineComponent({
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
    props: ['title', 'value', 'color'],
    setup(props) {
        return () => h('div', { class: 'flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0' }, [
            h('span', { class: 'font-medium text-gray-700' }, props.title),
            h('span', { class: `font-bold text-lg ${props.color}` }, `${props.value.toFixed(2)} %`),
        ]);
    }
});

// مكون الرسم البياني الدائري (توزيع المستخدمين)
const UserDoughnutChart = defineComponent({
    props: ['userCounts'],
    setup(props) {
        const activePercentage = props.userCounts?.total > 0
            ? ((props.userCounts?.activeUsers / props.userCounts?.total) * 100).toFixed(0)
            : 0;
        const inactivePercentage = 100 - activePercentage;

        return () => h('div', { class: 'w-full flex flex-col items-center justify-center' }, [
            h('div', { class: 'relative w-48 h-48 mb-6' }, [
                h('svg', {
                    viewBox: '0 0 100 100',
                    class: 'w-full h-full transform -rotate-90',
                    style: { filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }
                }, [
                    h('circle', {
                        cx: 50,
                        cy: 50,
                        r: 45,
                        fill: 'none',
                        stroke: '#10b981',
                        'stroke-width': 8,
                        'stroke-dasharray': `${(activePercentage / 100) * 282.7} 282.7`,
                    }),
                    h('circle', {
                        cx: 50,
                        cy: 50,
                        r: 45,
                        fill: 'none',
                        stroke: '#ef4444',
                        'stroke-width': 8,
                        'stroke-dasharray': `${(inactivePercentage / 100) * 282.7} 282.7`,
                        'stroke-dashoffset': `-${(activePercentage / 100) * 282.7}`,
                    })
                ]),
                h('div', { class: 'absolute inset-0 flex items-center justify-center flex-col' }, [
                    h('p', { class: 'text-2xl font-bold text-gray-800' }, `${props.userCounts?.total || 0}`),
                    h('p', { class: 'text-xs text-gray-500' }, 'إجمالي'),
                ])
            ]),
            h('div', { class: 'flex gap-8 w-full justify-center' }, [
                h('div', { class: 'text-center' }, [
                    h('div', { class: 'w-6 h-6 rounded-full bg-green-500 mx-auto mb-2' }),
                    h('p', { class: 'text-2xl font-bold text-green-500' }, props.userCounts?.activeUsers || 0),
                    h('p', { class: 'text-xs text-gray-500' }, 'نشطون'),
                ]),
                h('div', { class: 'text-center' }, [
                    h('div', { class: 'w-6 h-6 rounded-full bg-red-500 mx-auto mb-2' }),
                    h('p', { class: 'text-2xl font-bold text-red-500' }, props.userCounts?.inactiveUsers || 0),
                    h('p', { class: 'text-xs text-gray-500' }, 'غير نشطين'),
                ]),
            ])
        ]);
    }
});

// مكون توزيع أنواع الوسائط
const MediaTypeChart = defineComponent({
    props: ['mediaTypeStats'],
    setup(props) {
        const total = Object.values(props.mediaTypeStats || {}).reduce((a, b) => a + b, 0);
        const types = Object.entries(props.mediaTypeStats || {}).map(([type, count]) => ({
            type,
            count,
            percentage: total > 0 ? ((count / total) * 100).toFixed(0) : 0
        }));

        const colors = {
            'Image': 'bg-blue-500',
            'Video': 'bg-purple-500',
            'Document': 'bg-orange-500',
            'Audio': 'bg-green-500'
        };

        return () => h('div', { class: 'w-full' }, [
            ...types.map(item => h('div', { class: 'mb-6' }, [
                h('div', { class: 'flex items-center justify-between mb-2' }, [
                    h('span', { class: 'font-medium text-gray-700' }, item.type),
                    h('span', { class: 'font-bold text-gray-900' }, `${item.count} (${item.percentage}%)`)
                ]),
                h('div', { class: 'w-full bg-gray-200 rounded-full h-3 overflow-hidden' }, [
                    h('div', {
                        class: `h-full transition-all duration-500 ${colors[item.type] || 'bg-gray-500'}`,
                        style: { width: `${item.percentage}%` }
                    })
                ])
            ]))
        ]);
    }
});

// مكون مقارنة نسب الأداء
const ComparisonBarChart = defineComponent({
    props: ['dashboardData'],
    setup(props) {
        const rates = [
            { label: 'معدل الإعجاب', value: props.dashboardData?.engagementRates?.viewToLikeRate || 0, color: 'bg-red-500', icon: 'thumb_up' },
            { label: 'معدل المشاركة', value: props.dashboardData?.engagementRates?.viewToShareRate || 0, color: 'bg-green-500', icon: 'share' },
            { label: 'معدل التعليق', value: props.dashboardData?.engagementRates?.viewToCommentRate || 0, color: 'bg-blue-500', icon: 'comment' },
        ];

        return () => h('div', { class: 'w-full space-y-6' }, [
            ...rates.map(rate => h('div', { class: 'flex items-center gap-4' }, [
                h('div', { class: 'w-32' }, [
                    h('div', { class: 'flex items-center gap-2 mb-2' }, [
                        h('span', { class: 'material-icons text-lg text-gray-600' }, rate.icon),
                        h('p', { class: 'text-sm font-semibold text-gray-700' }, rate.label),
                    ]),
                ]),
                h('div', { class: 'flex-1' }, [
                    h('div', { class: 'w-full bg-gray-200 rounded-full h-4 overflow-hidden' }, [
                        h('div', {
                            class: `h-full transition-all duration-500 ${rate.color}`,
                            style: { width: `${Math.min(rate.value * 5, 100)}%` }
                        })
                    ])
                ]),
                h('p', { class: 'w-16 text-right font-bold text-gray-900' }, `${rate.value.toFixed(2)}%`)
            ]))
        ]);
    }
});
</script>

<style scoped>
@media print {

    .material-icons,
    .max-w-7xl+button,
    .mb-10 .flex.items-center.gap-3,
    .export-button {
        display: none !important;
    }

    .min-h-screen {
        min-height: auto !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }

    body,
    .bg-gray-50,
    .bg-white {
        background-color: white !important;
        color: #000 !important;
        box-shadow: none !important;
        border: none !important;
    }

    .shadow-xl,
    .shadow-md,
    .border {
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