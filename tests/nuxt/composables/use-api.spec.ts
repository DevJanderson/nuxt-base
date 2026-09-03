// Teste-referência de COMPOSABLE (convenção do CLAUDE.md): novos testes de composable seguem este formato.
// `registerEndpoint` sobe um handler no Nitro mockado do ambiente de teste — o `$fetch`
// global (base do useApi) passa a resolver essas rotas sem rede real.
import { describe, expect, it } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { createError, nextTick, useApi, useCookie } from '#imports'

interface PingResponse {
  pong: boolean
}

// baseURL do useApi é runtimeConfig.public.apiBase ('/api'): registrar o caminho completo
registerEndpoint('/api/ping', () => ({ pong: true }))

registerEndpoint('/api/error', () => {
  throw createError({ statusCode: 422, statusMessage: 'Unprocessable Entity' })
})

registerEndpoint('/api/authorized', event => ({
  authorization: event.headers.get('authorization'),
}))

describe('useApi', () => {
  it('retorna dados tipados na chamada feliz', async () => {
    const api = useApi()

    const data = await api<PingResponse>('/ping')

    expect(data).toEqual({ pong: true })
  })

  it('rejeita respostas de erro no formato padronizado (ApiError)', async () => {
    const api = useApi()

    const error = await api('/error').then(
      () => {
        throw new Error('a chamada deveria ter rejeitado')
      },
      (caught: unknown) => caught as { statusCode: number, statusMessage: string },
    )

    expect(error.statusCode).toBe(422)
    expect(error.statusMessage).toBe('Unprocessable Entity')
  })

  it('não envia Authorization sem o cookie auth.token', async () => {
    const api = useApi()

    const data = await api<{ authorization: string | null }>('/authorized')

    expect(data.authorization).toBeNull()
  })

  it('injeta Authorization Bearer quando o cookie auth.token existe', async () => {
    const token = useCookie('auth.token')
    token.value = 'token-de-teste'
    // o write de useCookie em document.cookie acontece num watcher — esperar o flush
    await nextTick()

    try {
      const api = useApi()

      const data = await api<{ authorization: string | null }>('/authorized')

      expect(data.authorization).toBe('Bearer token-de-teste')
    }
    finally {
      token.value = null
      await nextTick()
    }
  })
})
