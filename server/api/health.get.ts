// Rota-referência da base: novos endpoints Nitro seguem este formato
// (arquivo `<nome>.<método>.ts` + defineEventHandler com retorno tipado).
interface HealthResponse {
  status: 'ok'
  service: string
  timestamp: string
}

export default defineEventHandler((): HealthResponse => {
  return {
    status: 'ok',
    service: 'nuxt-base', // renomear junto com o projeto
    timestamp: new Date().toISOString(),
  }
})
