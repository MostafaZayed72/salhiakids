// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    prerender: {
      failOnError: false, // ✅ يخلي Nuxt يتجاهل أخطاء الـ 404 أثناء generate
    },
  },

})