<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
    <h1 class="text-3xl font-semibold mb-4">تجربة استدعاء API 🌦️</h1>

    <button
      @click="fetchWeather"
      class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4"
    >
      استدعاء API
    </button>

    <div v-if="loading" class="text-gray-500">جاري التحميل...</div>

    <div v-if="error" class="text-red-600 mt-2">
      خطأ أثناء جلب البيانات: {{ error }}
    </div>

    <pre v-if="weather" class="bg-gray-200 p-4 rounded-lg text-left w-full max-w-lg overflow-auto">
      {{ weather }}
    </pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const weather = ref(null)
const error = ref(null)
const loading = ref(false)

async function fetchWeather() {
  loading.value = true
  error.value = null
  weather.value = null

  try {
    const res = await fetch('https://salhiakids.premiumasp.net/api/weatherforecast')
    if (!res.ok) throw new Error('HTTP error ' + res.status)
    const data = await res.json()
    weather.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
