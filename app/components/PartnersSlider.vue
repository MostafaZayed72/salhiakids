<template>
  <section class="py-16 bg-white overflow-hidden" dir="rtl">
    <div class="container mx-auto px-4 mb-8 text-center">
      <h2 class="text-3xl font-bold text-gray-800 mb-2">شركاؤنا الموثوقون</h2>
      <div class="w-24 h-1 bg-purple-600 mx-auto rounded-full"></div>
    </div>

    <div class="slider-container relative w-full">
      <div class="slider-track flex items-center gap-12">
        <!-- Original Set -->
        <div v-for="i in 7" :key="`partner-${i}`" 
             class="slide flex-shrink-0 w-32 h-32 md:w-40 md:h-40 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-4 hover:shadow-md transition-shadow">
          <img 
            :src="`/partners/partner${i}.png`" 
            :alt="`Partner ${i}`" 
            class="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
            @error="handleImageError"
          >
        </div>
        
        <!-- Duplicate Set for Infinite Scroll Effect -->
        <div v-for="i in 7" :key="`partner-dup-${i}`" 
             class="slide flex-shrink-0 w-32 h-32 md:w-40 md:h-40 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-4 hover:shadow-md transition-shadow">
          <img 
            :src="`/partners/partner${i}.png`" 
            :alt="`Partner ${i}`" 
            class="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
            @error="handleImageError"
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const handleImageError = (e) => {
  // Simply hide the image container if image fails to load, to avoid showing "numbers"
  e.target.closest('.slide').style.display = 'none';
};
</script>

<style scoped>
.slider-container {
  overflow: hidden;
  position: relative;
}

.slider-container::before,
.slider-container::after {
  content: "";
  position: absolute;
  top: 0;
  width: 150px;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.slider-container::before {
  left: 0;
  background: linear-gradient(to right, white, transparent);
}

.slider-container::after {
  right: 0;
  background: linear-gradient(to left, white, transparent);
}

.slider-track {
  display: flex;
  width: max-content;
  animation: scroll 30s linear infinite;
}

.slider-track:hover {
  animation-play-state: paused;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%); /* For RTL, we might need to adjust logic, but typically marquee moves one direction. 
                                   Since standard marquee moves right-to-left (translateX -50%), 
                                   but we are in RTL mode... let's test. 
                                   If items are ordered 1..7 1..7, moving -50% (left) shows the duplicates.
                                   */
     transform: translateX(50%);
  }
}
/* Adjust for RTL/LTR if needed. Usually marquee needs to move to reveal the next items.
   If we have [1..7][1..7] and view is on first [1..7], we want to move so that second [1..7] comes in?
   Actually simple standard marquee: transform: translateX(0) -> translateX(-50%) moves content left.
   If dir="rtl", maybe we want it moving right? transform: translateX(0) -> translateX(50%)?
   Let's stick to simple left movement (standard timeline flow) or right movement. 
   Let's try translateX(50%) for RTL feeling (moving towards right).
*/
</style>
