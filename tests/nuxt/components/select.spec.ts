// Segue o teste-referência de componente (tests/nuxt/components/button.spec.ts).
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UiSelect } from '#components'

const items = [
  { label: 'Opção A', value: 'a' },
  { label: 'Opção B', value: 'b' },
]

describe('UiSelect', () => {
  it('associa o label ao trigger por for/id', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      props: { label: 'Opção', items, modelValue: '' },
    })

    const triggerId = wrapper.find('button').attributes('id')
    expect(triggerId).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(triggerId)
  })

  it('sem valor selecionado, exibe o placeholder', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      props: { label: 'Opção', items, placeholder: 'Escolha…', modelValue: '' },
    })

    expect(wrapper.find('button').text()).toContain('Escolha…')
  })

  it('com error, marca aria-invalid no trigger', async () => {
    const wrapper = await mountSuspended(UiSelect, {
      props: { label: 'Opção', items, modelValue: '', error: 'Selecione uma opção' },
    })

    const trigger = wrapper.find('button')
    expect(trigger.attributes('aria-invalid')).toBe('true')
    expect(trigger.attributes('aria-describedby')).toBe(wrapper.find('p').attributes('id'))
  })
})
