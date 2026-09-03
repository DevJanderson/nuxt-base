// app/error.vue não é um componente do kit (não passa por #components); importa
// o arquivo direto via alias '~' (== app/), como Toaster.vue faz com '~/composables/useToast'.
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createError } from '#imports'
import ErrorPage from '~/error.vue'

describe('error.vue', () => {
  it('404 mostra "Página não encontrada"', async () => {
    const wrapper = await mountSuspended(ErrorPage, {
      props: { error: createError({ statusCode: 404, statusMessage: 'Not Found' }) },
    })

    expect(wrapper.text()).toContain('Página não encontrada')
  })

  it('500 mostra "Algo deu errado" e o statusMessage', async () => {
    const wrapper = await mountSuspended(ErrorPage, {
      props: { error: createError({ statusCode: 500, statusMessage: 'Falha no servidor' }) },
    })

    expect(wrapper.text()).toContain('Algo deu errado')
    expect(wrapper.text()).toContain('Falha no servidor')
  })
})
