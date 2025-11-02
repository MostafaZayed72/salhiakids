<script setup>

const props = defineProps({
  latestContents: {
    type: Array,
    required: true,
  },
  // Passed helper functions
  getContentTypeIcon: Function,
  isNewContent: Function,
  formatDate: Function,
});

const emit = defineEmits(['viewContent', 'goToSearch']);
</script>

<template>
  <section class="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
              <DynamicHeroBackground /> 

    <div class="container mx-auto px-4">
      
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
        <div>
          <h2 class="text-4xl font-bold text-white mb-3">
            أحدث المحتويات المضافة
          </h2>
          <p class="text-xl text-gray-300">
            اكتشف أجمل المحتويات التي انضمت حديثًا إلى مكتبتنا
          </p>
        </div>
        
        <button 
          @click="emit('goToSearch')" 
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span class="font-medium">استكشف الكل</span>
          <span class="material-icons">arrow_left</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SectionsContentCard
          v-for="content in latestContents"
          :key="content.id"
          :content="content"
          :getContentTypeIcon="getContentTypeIcon"
          :isNewContent="isNewContent"
          :formatDate="formatDate"
          @viewContent="emit('viewContent', $event)"
        />
      </div>

      <div v-if="latestContents.length === 0" class="text-center py-16">
        <div class="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span class="material-icons text-gray-400 text-4xl">menu_book</span>
        </div>
        <h3 class="text-2xl font-bold text-white mb-3">لا توجد محتويات حديثة</h3>
        <p class="text-gray-400 text-lg">سيتم إضافة محتويات جديدة قريبًا</p>
      </div>
    </div>
  </section>
</template>