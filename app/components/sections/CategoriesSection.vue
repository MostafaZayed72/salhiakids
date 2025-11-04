<script setup>
const props = defineProps({
  featuredCategories: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['searchByCategory']);
</script>

<template>
  <section class="py-20  bg-gray-900">
              <!-- <DynamicHeroBackground /> -->

    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-white mb-4">
          اكتشف حسب <span class="text-indigo-400">الموضوع</span>
        </h2>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          اختر من مجموعتنا الواسعة من الموضوعات الممتعة والمفيدة لأطفالك.
        </p>
      </div>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <div 
          v-for="category in featuredCategories" 
          :key="category.id"
          @click="emit('searchByCategory', category.name)"
          class="group cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-700 hover:from-indigo-800 hover:to-purple-800 transition-all duration-500 transform hover:-translate-y-2 shadow-lg hover:shadow-xl border border-gray-700 text-center"
        >
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500 flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-500 shadow-lg">
            <span class="material-icons text-white text-3xl">{{ category.icon }}</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors duration-500">
            {{ category.name }}
          </h3>
          <p class="text-gray-400 text-sm mb-2">{{ category.count }}+ قصة</p>
          <p class="text-gray-500 text-xs line-clamp-2">{{ category.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>