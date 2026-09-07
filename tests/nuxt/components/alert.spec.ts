import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UiAlert } from '#components'

// Seletor da raiz: `data-slot` é o gancho estável do kit — não depende de classe
// utilitária, que muda a cada ajuste de visual. `find('div')` pegaria o primeiro div
// qualquer, e um wrapper novo em volta quebraria os testes por motivo errado.
const ROOT = '[data-slot="alert"]'

describe('UiAlert', () => {
  it('renderiza o conteúdo do slot', async () => {
    const wrapper = await mountSuspended(UiAlert, {
      slots: { default: () => 'Ambiente de demonstração.' },
    })

    expect(wrapper.text()).toContain('Ambiente de demonstração.')
  })

  it('usa a variante default por padrão', async () => {
    const wrapper = await mountSuspended(UiAlert)

    const root = wrapper.get(ROOT)
    expect(root.classes()).toContain('bg-muted')
    expect(root.attributes('data-variant')).toBe('default')
  })

  it.each([
    ['default', 'bg-muted'],
    ['destructive', 'bg-destructive/10'],
  ] as const)('aplica as classes da variante %s', async (variant, expectedClass) => {
    const wrapper = await mountSuspended(UiAlert, { props: { variant } })

    expect(wrapper.get(ROOT).classes()).toContain(expectedClass)
  })

  it('exibe o título quando a prop title é informada', async () => {
    const wrapper = await mountSuspended(UiAlert, {
      props: { title: 'Erro ao salvar', variant: 'destructive' },
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
