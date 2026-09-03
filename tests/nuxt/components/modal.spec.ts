// Segue o teste-referência de componente (tests/nuxt/components/button.spec.ts).
// O conteúdo do modal renderiza via DialogPortal (Reka) direto no document.body,
// por isso as asserções de conteúdo aberto olham document.body, não o wrapper;
// e o portal acumula markup entre testes — afterEach limpa document.body.
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UiModal } from '#components'

describe('UiModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('fechado não renderiza o título no body', async () => {
    const wrapper = await mountSuspended(UiModal, {
      props: { title: 'Título fechado', description: 'Descrição', open: false },
      slots: { trigger: () => h('button', 'Abrir'), default: () => 'Corpo' },
    })

    // controle positivo: o wrapper montou e o gatilho existe — a asserção
    // abaixo não passa apenas porque nada foi renderizado
    expect(wrapper.find('button').text()).toBe('Abrir')
    expect(document.body.textContent).not.toContain('Título fechado')
  })

  it('aberto renderiza título e descrição no document.body via portal', async () => {
    await mountSuspended(UiModal, {
      props: { title: 'Título aberto', description: 'Descrição do modal', open: true },
      slots: { default: () => 'Corpo' },
    })

    expect(document.body.textContent).toContain('Título aberto')
    expect(document.body.textContent).toContain('Descrição do modal')
  })

  it('aberto expõe role dialog', async () => {
    await mountSuspended(UiModal, {
      props: { title: 'Título', description: 'Descrição', open: true },
      slots: { default: () => 'Corpo' },
    })

    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
  })
})
