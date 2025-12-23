<template>
  <div class="min-h-screen bg-white p-4 font-sans" dir="rtl">
    <!-- Header Section -->
    <div class="flex justify-between items-start mb-8">
      <!-- Top Right Label -->
      <div class="border border-red-200 bg-red-50 text-gray-800 px-4 py-1 rounded-lg shadow-sm">
        <span class="font-bold text-sm">المجموعة الأولى</span>
      </div>
      
      <!-- Side Decoration (Orange bar on the right) - Simulated with absolute or fixed if needed, but for now just layout -->
    </div>

    <!-- Title -->
    <div class="flex justify-center mb-12">
      <div class="bg-gradient-to-b from-red-600 to-red-500 text-white px-12 py-2 rounded-full shadow-lg border-2 border-yellow-200">
        <h1 class="text-2xl font-bold">الأرقــام</h1>
      </div>
    </div>

    <!-- Numbers List -->
    <div class="max-w-md mx-auto space-y-2">
      <div v-for="item in numbers" :key="item.id" class="flex items-center justify-center relative group">
        
        <!-- Arabic Text -->
        <div class="w-1/3 text-right pl-4">
          <span class="text-3xl font-bold text-gray-800 font-arabic">{{ item.text }}</span>
        </div>

        <!-- Number Digit -->
        <div class="w-1/3 flex justify-center">
          <span 
            class="text-8xl font-black number-3d select-none transition-transform transform group-hover:scale-110 duration-300"
            :style="{ '--gradient-from': item.colorFrom, '--gradient-to': item.colorTo, '--shadow-color': item.shadowColor }"
          >
            {{ item.digit }}
          </span>
        </div>

        <!-- Audio Button -->
        <div class="w-1/3 flex justify-start pr-4">
          <button 
            @click="playAudio(item.id)"
            class="group relative p-3 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-600 hover:text-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
            :aria-label="`تشغيل صوت رقم ${item.text}`"
          >
            <!-- Filled Speaker Icon with Sound Waves -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
              <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
            </svg>
            
            <!-- Pulse effect on hover -->
            <span class="absolute inset-0 rounded-full bg-yellow-400 opacity-0 group-hover:opacity-20 animate-ping"></span>
          </button>
        </div>

      </div>
    </div>

    <!-- Side Orange Bar Decoration (Optional, to match image right side) -->
    <div class="fixed top-20 right-0 h-3/4 w-4 bg-gradient-to-b from-orange-300 to-orange-500 rounded-l-lg opacity-80 hidden md:block"></div>
  </div>
</template>

<script setup>
const numbers = [
  { id: 1, digit: 1, text: 'وَاحِد', colorFrom: '#FF9800', colorTo: '#FFC107', shadowColor: '#E65100' },
  { id: 2, digit: 2, text: 'اثْنَان', colorFrom: '#03A9F4', colorTo: '#00BCD4', shadowColor: '#01579B' },
  { id: 3, digit: 3, text: 'ثَلَاثَة', colorFrom: '#9C27B0', colorTo: '#E040FB', shadowColor: '#4A148C' },
  { id: 4, digit: 4, text: 'أَرْبَعَة', colorFrom: '#4CAF50', colorTo: '#8BC34A', shadowColor: '#1B5E20' },
  { id: 5, digit: 5, text: 'خَمْسَة', colorFrom: '#2196F3', colorTo: '#64B5F6', shadowColor: '#0D47A1' },
  { id: 6, digit: 6, text: 'سِتَّة', colorFrom: '#E91E63', colorTo: '#F48FB1', shadowColor: '#880E4F' },
];

const playAudio = (number) => {
  // Assuming audio files are named 1.mp3, 2.mp3, etc. in the public folder
  const audio = new Audio(`/Recording.mp3`);
  audio.play().catch(error => {
    console.error(`Error playing audio for number ${number}:`, error);
    // Fallback or user notification could go here
  });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

.font-arabic {
  font-family: 'Amiri', serif; /* Or any other nice Arabic font available */
}

.number-3d {
  background: linear-gradient(to bottom, var(--gradient-from), var(--gradient-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(1px 1px 0px var(--shadow-color)) 
          drop-shadow(2px 2px 0px var(--shadow-color))
          drop-shadow(3px 3px 0px var(--shadow-color))
          drop-shadow(4px 4px 2px rgba(0,0,0,0.3));
  /* Fallback for browsers that don't support text clip well */
  @supports not (background-clip: text) {
    color: var(--gradient-from);
    background: none;
  }
}
</style>