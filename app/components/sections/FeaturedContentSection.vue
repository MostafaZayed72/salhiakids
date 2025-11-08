<script setup>
const props = defineProps({
  featuredContents: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['viewContent']);
</script>

<template>
  <section class="py-20 bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
    <!-- <DynamicHeroBackground /> -->

    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-white mb-4">
          محتويات مميزة هذا الأسبوع
        </h2>
        <p class="text-xl text-gray-300">
          مجموعة مختارة من أفضل المحتويات التي يحبها الأطفال
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div v-for="content in featuredContents" :key="content.id" @click="emit('viewContent', content.id)"
          class="group cursor-pointer bg-gradient-to-br from-gray-800 to-amber-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-amber-700 transition-all duration-500 transform hover:-translate-y-2">
          <div class="flex gap-6">
            <div
              class="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <span class="text-4xl">{{ content.emoji }}</span>
            </div>
            <div class="flex-grow text-right">
              <div class="flex items-start justify-between mb-3">
                <h4 class="text-xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
                  {{ content.title }}
                </h4>
                <span
                  class="flex items-center gap-1 bg-amber-900 text-amber-200 px-2 py-1 rounded-full text-sm shadow transform group-hover:scale-110 transition-transform">
                  <span class="material-icons text-sm">star</span>
                  {{ content.rating }}
                </span>
              </div>
              <p class="text-gray-300 mb-4 line-clamp-2">
                {{ content.summary }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 text-sm text-gray-400">
                  <span
                    class="bg-amber-900 text-amber-300 px-2 py-1 rounded transform group-hover:scale-105 transition-transform">
                    {{ content.category }}
                  </span>
                  <span>{{ content.views }} مشاهدة</span>
                </div>
                <span
                  class="material-icons text-gray-400 group-hover:text-amber-600 transform group-hover:translate-x-1 transition-all duration-300">
                  arrow_left
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>