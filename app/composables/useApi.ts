import type { Ref } from 'vue'
import type { UseFetchOptions } from 'nuxt/app'

/**
 * Formato padronizado dos erros lançados por `useApi`/`useApiData`.
 * Todo erro de resposta vira um `createError()` com esta forma.
 */
export interface ApiError {
  statusCode: number
  statusMessage: string
  data?: unknown
}

/**
 * Wrapper tipado de `$fetch` — a porta única de saída para a API (convenção do CLAUDE.md).
 * baseURL vem de `runtimeConfig.public.apiBase` (Nitro próprio por padrão;
 * troque via NUXT_PUBLIC_API_BASE para consumir API externa).
 *
 * Uso: `const api = useApi()` → `api<User[]>('/users')`.
 * Chame dentro de contexto Nuxt (setup, plugin, middleware).
 */
export function useApi(): typeof $fetch {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()

  // Ponto de encaixe de auth (convenção do CLAUDE.md): sem implementação fixa.
  // Na receita de token contra API externa, o login grava o token neste cookie
  // e toda chamada passa a sair autenticada. Ver receitas no README.
  const authToken = useCookie('auth.token')

  return $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      // Injeta a credencial apenas quando ela existir
      if (authToken.value) {
        options.headers.set('Authorization', `Bearer ${authToken.value}`)
      }
    },

    async onResponseError({ response }) {
      // Ponto de ajuste por projeto: em 401 no client, manda para /login.
      // Remova (ou troque a rota) se o projeto não usar esse fluxo.
      if (import.meta.client && response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }

      // Padroniza o erro: quem consome sempre recebe a forma ApiError
      throw createError({
        statusCode: response.status,
        statusMessage: response.statusText || 'API request failed',
        data: response._data,
      })
    },
  })
}

/**
 * Wrapper fino de `useFetch` para data fetching SSR-friendly em componentes,
 * usando a mesma instância do `useApi` (baseURL, credencial e erros padronizados).
 *
 * Uso: `const { data } = await useApiData<User[]>('/users')`.
 * URL reativa: passe um getter — `useApiData<User>(() => `/users/${id.value}`)`.
 */
export function useApiData<T>(
  url: string | Ref<string> | (() => string),
  options?: UseFetchOptions<T>,
) {
  return useFetch(url, {
    ...options,
    $fetch: useApi(),
  })
}
