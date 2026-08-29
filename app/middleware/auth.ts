// Middleware NOMEADO (não global) — proteja páginas com definePageMeta({ middleware: 'auth' }).
// Esqueleto sem auth implementada (SPEC §6): hoje deixa tudo passar.
// Ao implementar, escolha UMA das receitas abaixo (detalhes no README).
export default defineNuxtRouteMiddleware(() => {
  // Receita 1 — sessão no servidor (nuxt-auth-utils):
  // const { loggedIn } = useUserSession()
  // if (!loggedIn.value) return navigateTo('/login')

  // Receita 2 — token contra API externa (mesmo cookie lido pelo useApi):
  // const token = useCookie('auth.token')
  // if (!token.value) return navigateTo('/login')
})
