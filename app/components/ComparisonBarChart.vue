<template>
 <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { computed } from 'vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
 dashboardData: {
  type: Object,
  required: true
 }
});

const chartData = computed(() => {
  const storyCounts = props.dashboardData.storyCounts || {};
  const engagementRates = props.dashboardData.engagementRates || {};

  // --- حساب نسب القصص ---
  // 💡 تصحيح: استخدام totalInPeriod كمرجع للحساب لتحديد توزيع الحالات في الفترة
  // 💡 إضافة حماية من القسمة على صفر: استخدام 1 إذا كان totalInPeriod صفراً أو null/undefined
  const totalStoriesInPeriod = storyCounts.totalInPeriod > 0 ? storyCounts.totalInPeriod : 1; 

  const approvedInPeriod = ((storyCounts.approvedInPeriod ?? 0) / totalStoriesInPeriod) * 100;

  // ❌ تم تصحيح الخطأ هنا: كان الاسم القديم هو pendingInPeriodInPeriod
  const pendingInPeriod = ((storyCounts.pendingInPeriod ?? 0) / totalStoriesInPeriod) * 100;

  const rejectedInPeriod = ((storyCounts.rejectedInPeriod ?? 0) / totalStoriesInPeriod) * 100;

  // --- معدلات التفاعل (تأتي من الخادم كنسبة مئوية، نستخدم عامل الدمج الصفري ?? 0 لتجنب Null) ---
  const likeRate = engagementRates.viewToLikeRate ?? 0;
  const shareRate = engagementRates.viewToShareRate ?? 0;
  const commentRate = engagementRates.viewToCommentRate ?? 0;

  return {
    labels: [
      'معدل الإعجاب/المشاهدة (%)', 'معدل المشاركة/المشاهدة (%)', 'معدل التعليق/المشاهدة (%)', 
      'القصص المعتمدة (بالفترة) (%)', 'القصص المعلقة (بالفترة) (%)', 'القصص المرفوضة (بالفترة) (%)'
    ],
    datasets: [
      {
        label: 'القيمة المئوية',
        data: [likeRate, shareRate, commentRate, approvedInPeriod, pendingInPeriod, rejectedInPeriod],
        backgroundColor: [
          '#EF4444', // أحمر للإعجاب
          '#e75f98', // أخضر للمشاركة
          '#3B82F6', // أزرق للتعليق
          '#10B981', // أخضر للمعتمد
          '#F59E0B', // برتقالي للمعلق
          '#EF4444', // أحمر للمرفوض
        ],
        borderColor: 'transparent',
        borderWidth: 1
      }
    ]
  };
});

const chartOptions = {
  indexAxis: 'y', 
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'كفاءة القصص ومعدلات التفاعل الرئيسية',
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (context.parsed.x !== null) {
            label = (context.label || '') + ': ';
            label += new Intl.NumberFormat('ar', { style: 'decimal' }).format(context.parsed.x.toFixed(2)) + '%';
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      max: 100, 
      ticks: {
        callback: function(value) {
          return value + '%';
        }
      }
    },
    y: {
      grid: { display: false }
    }
  }
};
</script>