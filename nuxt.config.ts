import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-28',
  devtools: { enabled: true },

  app: {
    head: {
      // Idioma do documento: sem isso o <html> sai sem `lang` (a11y e SEO).
      // Projeto derivado com outro idioma troca só esta linha.
      htmlAttrs: { lang: 'pt-BR' },
      // `title` é o fallback de página sem `useSeoMeta({ title })`;
      // `titleTemplate` molda o title das que têm (aqui, sem sufixo).
      // Sufixo de marca = trocar para '%s · Meu Projeto'.
      title: 'Nuxt Base',
      titleTemplate: '%s',
    },
  },

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

  fonts: {
    // Família declarada na mão de propósito: o scanner do @nuxt/fonts não enxerga
    // a fonte definida em `@theme inline` do Tailwind 4 (vira `--default-font-family`
    // atrás de um var()) — bug upstream nuxt/fonts#638, corrigido no fontless 0.3 mas
    // ainda não liberado no @nuxt/fonts 0.14. Sem isto, nenhum @font-face é gerado.
    families: [
      { name: 'Inter', provider: 'google', global: true },
    ],
  },

  vite: {
    plugins: [tailwindcss()]
  },

  // Anti-vazamento no client em produção: console.log/info/debug/trace saem do
  // bundle final; warn/error ficam (diagnóstico legítimo — o lint só permite esses).
  // Vite 8 minifica com oxc, cujo dropConsole é tudo-ou-nada; o terser permite a
  // remoção seletiva via pure_funcs. Só em $production — dev continua logando.
  $production: {
    vite: {
      build: {
        minify: 'terser',
        terserOptions: {
          compress: {
            pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
            drop_debugger: true
          }
        }
      }
    }
  },

  colorMode: {
    // Tema claro é o padrão da plataforma (decisão de produto, não do SO do visitante);
    // o toggle do layout continua alternando e persistindo a escolha do usuário
    preference: 'light',
    fallback: 'light',
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
