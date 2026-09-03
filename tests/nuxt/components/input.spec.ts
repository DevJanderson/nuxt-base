// Segue o teste-referência de componente (tests/nuxt/components/button.spec.ts).
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UiInput } from '#components'

describe('UiInput', () => {
  it('associa o label ao input por for/id', async () => {
    const wrapper = await mountSuspended(UiInput, {
      props: { label: 'Nome', modelValue: '' },
    })

    const inputId = wrapper.find('input').attributes('id')
    expect(inputId).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(inputId)
  })

  it('com error, marca aria-invalid e aponta aria-describedby para a mensagem de erro', async () => {
    const wrapper = await mountSuspended(UiInput, {
      props: { label: 'Nome', modelValue: '', error: 'Campo obrigatório' },
    })

    const input = wrapper.find('input')
    const errorParagraph = wrapper.find('p')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(errorParagraph.attributes('id'))
    expect(errorParagraph.text()).toBe('Campo obrigatório')
  })

  it('com hint (sem error), aponta aria-describedby para a mensagem de hint', async () => {
    const wrapper = await mountSuspended(UiInput, {
      props: { label: 'Nome', modelValue: '', hint: 'Use o nome completo' },
    })

    const input = wrapper.find('input')
    const hintParagraph = wrapper.find('p')
    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(input.attributes('aria-describedby')).toBe(hintParagraph.attributes('id'))
    expect(hintParagraph.text()).toBe('Use o nome completo')
  })

  it('v-model atualiza o valor ao digitar', async () => {
    const wrapper = await mountSuspended(UiInput, {
      props: { label: 'Nome', modelValue: '' },
    })

    await wrapper.find('input').setValue('Janderson')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Janderson'])
  })
})
