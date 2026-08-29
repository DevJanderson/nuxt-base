// Guardrail de regressão do kit: TODO componente de app/components/ui/ monta e
// renderiza com props mínimas. Quebrou a API de um componente (prop obrigatória
// nova, rename, erro de setup) → este teste falha antes de chegar em produção.
// Componente novo no kit entra aqui no mesmo commit (a skill novo-componente-ui manda).
import type { Component } from 'vue'
import { describe, expect, it } from 'vitest'
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
  ['UiBadge', UiBadge, {}, { default: () => 'Novo' }],
  ['UiCard', UiCard, {}, { default: () => 'Conteúdo' }],
  ['UiInput', UiInput, { label: 'Nome', modelValue: '' }, {}],
  ['UiSelect', UiSelect, {
    label: 'Opção',
    items: [{ label: 'A', value: 'a' }],
    modelValue: '',
  }, {}],
  ['UiModal', UiModal, { title: 'Título', open: true }, { default: () => 'Corpo' }],
  ['UiTable', UiTable, {
    columns: [{ key: 'name', label: 'Nome' }],
    rows: [{ name: 'Linha 1' }],
  }, {}],
  ['UiToaster', UiToaster, {}, {}],
  ['UiTooltip', UiTooltip, { text: 'Dica' }, { default: () => h('button', 'Alvo') }],
]

describe('kit UI — smoke de regressão', () => {
  it.each(cases)('%s monta e renderiza', async (_name, component, props, slots) => {
    const wrapper = await mountSuspended(component, { props, slots })

    expect(wrapper.exists()).toBe(true)
  })
})
