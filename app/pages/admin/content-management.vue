<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center p-8 bg-white rounded-2xl shadow-xl border border-purple-100 max-w-lg">
      <span class="material-icons text-6xl text-purple-600 mb-6 block">library_books</span>
      <h1 class="text-2xl font-bold text-gray-800 mb-4">إدارة المحتوى</h1>
      <p class="text-lg text-gray-600">
        يُدار المحتوى من خلال وظائفه بالموقع
      </p>
      
      <router-link 
        to="/dashboard" 
        class="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
      >
        <span class="material-icons text-sm">arrow_forward</span>
        <span>العودة للوحة التحكم</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['admin-auth']
});
</script>
