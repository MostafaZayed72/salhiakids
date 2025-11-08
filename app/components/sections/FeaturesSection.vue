<script setup>
const props = defineProps({
  features: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <section class="py-20 bg-gradient-to-br  from-green-900 via-blue-900 to-purple-900">
    <!-- <DynamicHeroBackground /> -->

    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-white mb-4">
          لماذا تختار <span class="text-blue-400">مكتبتنا؟</span>
        </h2>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          نقدم تجربة قراءة استثنائية تجمع بين المتعة والتعليم في بيئة آمنة
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div v-for="(feature, index) in features" :key="index"
          class="group text-center p-8 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-700 hover:from-green-600 hover:to-blue-600 transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl border border-gray-700">
          <div
            class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-500 shadow-lg">
            <span class="material-icons text-white text-3xl group-hover:text-green-500">{{ feature.icon }}</span>
          </div>

          <h3 class="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors duration-500">
            {{ feature.title }}
          </h3>

          <p class="text-gray-300 leading-relaxed group-hover:text-gray-100 transition-colors duration-500">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>