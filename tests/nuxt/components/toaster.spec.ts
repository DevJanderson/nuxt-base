// Segue o teste-referência de componente (tests/nuxt/components/button.spec.ts).
// A fila vive em useState('ui:toasts'), global ao app de teste — zera no beforeEach.
import { beforeEach, describe, expect, it } from 'vitest'
import { ToastRoot } from 'reka-ui'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UiToaster } from '#components'
import { useState, useToast } from '#imports'

beforeEach(() => {
  useState('ui:toasts', () => []).value = []
  useState('ui:toast-counter', () => 0).value = 0
})

describe('UiToaster', () => {
  // O `aria-live` real fica num live region que o Reka só monta depois de dois rAF (ou de
  // 1s), fora do alcance de uma asserção determinística. O que é nosso — e o que regride se
  // alguém tirar o binding — é o `type`: foreground → assertive, background → polite
  // (reka-ui/dist/Toast/ToastRootImpl.js). Só o erro interrompe a leitura em curso.
  it.each([
    ['error', 'foreground'],
    ['success', 'background'],
    ['info', 'background'],
  ] as const)('toast de %s vira type="%s" no ToastRoot', async (variant, type) => {
    useToast()[variant]('Mensagem')

    const wrapper = await mountSuspended(UiToaster)

    expect(wrapper.findComponent(ToastRoot).props('type')).toBe(type)
  })

  it('o viewport não intercepta clique: pointer-events-none na faixa fixa', async () => {
    const wrapper = await mountSuspended(UiToaster)

    expect(wrapper.find('[role="region"]').html()).toContain('pointer-events-none')
  })
})
