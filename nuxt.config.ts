// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@unocss/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt'
  ],

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
    }
  },

    // Global CSS
    css: [
        '@/assets/styles/main.ts',
    ],

  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English'
      }
    ],
    defaultLocale: 'en'
  }
})