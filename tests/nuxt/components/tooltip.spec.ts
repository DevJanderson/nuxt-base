// Segue o teste-referência de componente (tests/nuxt/components/button.spec.ts).
// O conteúdo do tooltip renderiza via TooltipPortal (Reka) direto no <body>,
// por isso as asserções de conteúdo olham document.body, não o wrapper; e o
// portal acumula markup entre testes — afterEach limpa document.body.
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UiTooltip } from '#components'

describe('UiTooltip', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renderiza o gatilho do slot', async () => {
    const wrapper = await mountSuspended(UiTooltip, {
      props: { text: 'Dica' },
      slots: { default: () => h('button', 'Alvo') },
    })

    expect(wrapper.find('button').text()).toBe('Alvo')
  })

  it('não exibe o conteúdo enquanto fechado', async () => {
    await mountSuspended(UiTooltip, {
      props: { text: 'Dica oculta' },
      slots: { default: () => h('button', 'Alvo') },
    })

    expect(document.body.textContent).not.toContain('Dica oculta')
  })

  it('exibe o conteúdo no portal quando aberto por padrão', async () => {
    await mountSuspended(UiTooltip, {
      props: { text: 'Dica visível', defaultOpen: true, delayDuration: 0 },
      slots: { default: () => h('button', 'Alvo') },
    })

    expect(document.body.textContent).toContain('Dica visível')
  })
})
