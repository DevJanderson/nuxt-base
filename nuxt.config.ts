import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-28',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/test-utils/module',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode'
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()]
  },

  colorMode: {
    classSuffix: ''
  },

  runtimeConfig: {
    public: {
      // Aponta para o Nitro próprio por padrão; troque via NUXT_PUBLIC_API_BASE
      // para consumir uma API externa (ver receitas no README)
      apiBase: '/api'
    }
  }
})
