<script setup>
const props = defineProps({
  features: {
    type: Array,
    required: true,
  },
});
</script>

<template>
   <section class="py-20  "> 
  <DynamicHeroBackground />

  <div class="container mx-auto px-4">
   <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-800 mb-4">
          لماذا تعتبر <span class="text-purple-600">منصتنا</span> التجربة المثالية لطفلك؟
    </h2>
    <p class="text-xl text-gray-600 max-w-2xl mx-auto">
نقدم تجربة رقمية استثنائية تجمع بين المتعة والتعليم في بيئة آمنة    </p>
   </div>

   <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    <div v-for="(feature, index) in features" :key="index"
          class="group text-center p-8 rounded-2xl bg-white hover:bg-purple-50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl border border-gray-200">
     
     <div
            class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:scale-110 transition-all duration-500 shadow-lg">
      <span class="material-icons text-white text-3xl group-hover:text-white">{{ feature.icon }}</span>
     </div>

          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors duration-500">
      {{ feature.title }}
     </h3>

     <p class="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500">
      {{ feature.description }}
     </p>
    </div>
   </div>
  </div>
 </section>
</template>