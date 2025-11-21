<script setup>
const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  // Helper functions passed from parent
  getContentTypeIcon: Function,
  isNewContent: Function,
  formatDate: Function,
});

const emit = defineEmits(['viewContent']);
</script>

<template>
  <div 
    @click="emit('viewContent', content.id)"
    class="group cursor-pointer transform hover:-translate-y-4 transition-all duration-500"
  >
    <div class="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-700 h-full flex flex-col group-hover:border-purple-400">
      
      <div class="relative h-48 bg-gradient-to-br from-indigo-900 to-purple-900 overflow-hidden">
        <div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
        <span class="absolute top-4 right-4 text-5xl transform group-hover:scale-110 transition-transform duration-300">{{ content.emoji }}</span>
        
        <div v-if="isNewContent(content.created_at)" class="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          جديد
        </div>
        
        <div class="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-full p-2 shadow-lg">
          <span class="material-icons text-purple-500 text-lg">{{ getContentTypeIcon(content.content_type) }}</span>
        </div>
        
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="bg-white bg-opacity-90 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <span class="material-icons text-purple-500 text-2xl">play_arrow</span>
          </div>
        </div>
      </div>
      
      <div class="p-6 flex-grow text-right">
        <h4 class="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors duration-300">
          {{ content.title }}
        </h4>
        
        <p class="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
          {{ content.summary }}
        </p>
        
        <div class="flex items-center justify-between mb-3">
          <span class="bg-purple-900 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
            {{ content.age_group }}
          </span>
          <span class="text-gray-400 text-xs">{{ content.author }}</span>
        </div>

        <div class="flex items-center justify-between text-xs text-gray-400">
          <span class="bg-gray-700 px-2 py-1 rounded transform group-hover:scale-105 transition-transform">{{ content.category }}</span>
          <span>{{ formatDate(content.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>