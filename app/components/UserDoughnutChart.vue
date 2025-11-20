<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import { computed } from 'vue';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const props = defineProps({
  userCounts: {
    type: Object,
    required: true,
    default: () => ({
      total: 0,
      activeInPeriod: 0,
      newInPeriod: 0
    })
  }
});

const chartData = computed(() => {
  const { total, newInPeriod } = props.userCounts;
  
  // القدامى = الإجمالي - الجدد
  const oldUsers = total - newInPeriod;

  return {
    labels: ['جدد في الفترة', 'قدامى (المسجلين سابقاً)'],
    datasets: [
      {
        backgroundColor: ['#4F46E5', '#A78BFA'], // ألوان بنفسجية
        data: [newInPeriod, oldUsers]
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
          usePointStyle: true,
      }
    },
    title: {
      display: true,
      text: 'توزيع المستخدمين (إجمالي)',
    }
  }
};
</script>