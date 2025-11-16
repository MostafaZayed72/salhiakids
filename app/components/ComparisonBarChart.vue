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
    const storyCounts = props.dashboardData.storyCounts;
    const engagementRates = props.dashboardData.engagementRates;

    // --- حساب نسب القصص ---
    const totalStories = storyCounts.total > 0 ? storyCounts.total : 1;
    const approved = (storyCounts.approved / totalStories) * 100;
    const pending = (storyCounts.pending / totalStories) * 100;
    const rejected = (storyCounts.rejected / totalStories) * 100;

    // --- معدلات التفاعل (تأتي من الخادم كنسبة مئوية) ---
    const likeRate = engagementRates.viewToLikeRate;
    const shareRate = engagementRates.viewToShareRate;
    const commentRate = engagementRates.viewToCommentRate;

    return {
        labels: [
            'معدل الإعجاب/المشاهدة (%)', 'معدل المشاركة/المشاهدة (%)', 'معدل التعليق/المشاهدة (%)', 
            'القصص المعتمدة (%)', 'القصص المعلقة (%)', 'القصص المرفوضة (%)'
        ],
        datasets: [
            {
                label: 'القيمة المئوية',
                data: [likeRate, shareRate, commentRate, approved, pending, rejected],
                backgroundColor: [
                    '#EF4444', // أحمر للإعجاب
                    '#10B981', // أخضر للمشاركة
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
    indexAxis: 'y', // الأعمدة أفقية
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        title: {
            display: true,
            text: 'كفاءة القصص ومعدلات التفاعل الرئيسية',
            font: {
                size: 14,
                family: 'Tajawal, sans-serif'
            }
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
            max: 100, // الحد الأقصى 100%
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