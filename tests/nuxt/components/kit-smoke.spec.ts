// Guardrail de regressão do kit: TODO componente de app/components/ui/ monta e
// renderiza com props mínimas. Quebrou a API de um componente (prop obrigatória
// nova, rename, erro de setup) → este teste falha antes de chegar em produção.
// Componente novo no kit entra aqui no mesmo commit (a skill novo-componente-ui manda).
import type { Component } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import {
  UiBadge,
  UiButton,
  UiCard,
  UiInput,
  UiModal,
  UiSelect,
  UiTable,
  UiToaster,
  UiTooltip,
} from '#components'

const cases: Array<[string, Component, Record<string, unknown>, Record<string, () => unknown>]> = [
  ['UiButton', UiButton, {}, { default: () => 'Ação' }],
  ['UiButton (link)', UiButton, { to: '/' }, { default: () => 'Link' }],
  ['UiBadge', UiBadge, {}, { default: () => 'Novo' }],
  ['UiCard', UiCard, {}, { default: () => 'Conteúdo' }],
  ['UiInput', UiInput, { label: 'Nome', modelValue: '' }, {}],
  ['UiSelect', UiSelect, {
    label: 'Opção',
    items: [{ label: 'A', value: 'a' }],
    modelValue: '',
  }, {}],
  // B18: sem description, Modal.vue usa VisuallyHidden+título como descrição de
  // fallback para o aria-describedby — o caso sem description volta a ser coberto aqui.
  ['UiModal', UiModal, { title: 'Título', open: true }, { default: () => 'Corpo' }],
  ['UiTable', UiTable, {
    columns: [{ key: 'name', label: 'Nome' }],
    rows: [{ name: 'Linha 1' }],
  }, {}],
  ['UiToaster', UiToaster, {}, {}],
  ['UiTooltip', UiTooltip, { text: 'Dica' }, { default: () => h('button', 'Alvo') }],
]

// Terceiros (ex.: Nuxt Icon buscando ícone fora de cache) também usam console.warn/error;
// só nos importa ruído do próprio Vue ou do Reka UI, que indicaria regressão real do kit.
// O aviso real do Reka não leva "[Vue warn]" nem a palavra "reka" — é
// 'Warning: Missing `Description` or `aria-describedby="undefined"` for DialogContent.' —
// por isso o filtro também pega mensagens que começam com "Warning:" ou citam aria-describedby.
function relevantMessages(spy: ReturnType<typeof vi.spyOn>): string[] {
  return spy.mock.calls
    .map((args: unknown[]) => args.map(String).join(' '))
    .filter((message: string) => /\[vue warn\]|reka|^warning:|aria-describedby/i.test(message))
}

describe('kit UI — smoke de regressão', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it.each(cases)('%s monta, renderiza markup e não gera avisos/erros do Vue ou do Reka', async (_name, component, props, slots) => {
    const wrapper = await mountSuspended(component, { props, slots })

    expect(wrapper.html().trim()).not.toBe('')

    const messages = [...relevantMessages(warnSpy), ...relevantMessages(errorSpy)]
    expect(messages, `console.warn/error do Vue/Reka inesperado: ${JSON.stringify(messages)}`).toEqual([])
  })
})
