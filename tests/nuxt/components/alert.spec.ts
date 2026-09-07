import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UiAlert } from '#components'

// Seletor da raiz: `.rounded-box` é a classe do container do alerta e não se repete dentro
// dele. `find('div')` pegaria o primeiro div qualquer — um wrapper novo em volta quebraria
// os testes por motivo errado.
const ROOT = '.rounded-box'

describe('UiAlert', () => {
  it('renderiza o conteúdo do slot', async () => {
    const wrapper = await mountSuspended(UiAlert, {
      slots: { default: () => 'Ambiente de demonstração.' },
    })

    expect(wrapper.text()).toContain('Ambiente de demonstração.')
  })

  it('usa a variante info por padrão', async () => {
    const wrapper = await mountSuspended(UiAlert)

    expect(wrapper.get(ROOT).classes()).toContain('bg-muted')
  })

  it.each([
    ['info', 'bg-muted'],
    ['error', 'bg-destructive/10'],
  ] as const)('aplica as classes da variante %s', async (variant, expectedClass) => {
    const wrapper = await mountSuspended(UiAlert, { props: { variant } })

    expect(wrapper.get(ROOT).classes()).toContain(expectedClass)
  })

  it('exibe o título quando a prop title é informada', async () => {
    const wrapper = await mountSuspended(UiAlert, {
      props: { title: 'Erro ao salvar', variant: 'error' },
      slots: { default: () => 'Verifique os campos destacados.' },
    })

    const title = wrapper.find('p')
    expect(title.text()).toBe('Erro ao salvar')
    expect(title.classes()).toContain('font-semibold')
  })

  it('sem title, não renderiza o parágrafo de título', async () => {
    const wrapper = await mountSuspended(UiAlert, {
      slots: { default: () => 'Só a mensagem.' },
    })

    expect(wrapper.find('p').exists()).toBe(false)
  })
})
