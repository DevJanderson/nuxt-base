// Segue o teste-referência de componente (tests/nuxt/components/button.spec.ts).
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UiCheckbox } from '#components'

describe('UiCheckbox', () => {
  it('associa o label ao controle por for/id', async () => {
    const wrapper = await mountSuspended(UiCheckbox, {
      props: { label: 'Aceito os termos', modelValue: false },
    })

    const controlId = wrapper.find('button').attributes('id')
    expect(controlId).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(controlId)
  })

  it('clicar no controle emite o novo valor', async () => {
    const wrapper = await mountSuspended(UiCheckbox, {
      props: { label: 'Aceito os termos', modelValue: false },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('reflete o estado marcado em data-state e mostra o indicador', async () => {
    const wrapper = await mountSuspended(UiCheckbox, {
      props: { label: 'Aceito os termos', modelValue: true },
    })

    const control = wrapper.find('button')
    expect(control.attributes('data-state')).toBe('checked')
    expect(control.attributes('aria-checked')).toBe('true')
    expect(control.html()).toContain('lucide:check')
  })

  it('no estado indeterminate, anuncia aria-checked="mixed" e troca o ícone', async () => {
    const wrapper = await mountSuspended(UiCheckbox, {
      props: { label: 'Todos os assuntos', modelValue: 'indeterminate' },
    })

    const control = wrapper.find('button')
    expect(control.attributes('data-state')).toBe('indeterminate')
    expect(control.attributes('aria-checked')).toBe('mixed')
    expect(control.html()).toContain('lucide:minus')
  })

  it('com error, marca aria-invalid e aponta aria-describedby para a mensagem', async () => {
    const wrapper = await mountSuspended(UiCheckbox, {
      props: { label: 'Aceito os termos', modelValue: false, error: 'Campo obrigatório' },
    })

    const control = wrapper.find('button')
    const message = wrapper.find('p')
    expect(control.attributes('aria-invalid')).toBe('true')
    expect(control.attributes('aria-describedby')).toBe(message.attributes('id'))
    expect(message.text()).toBe('Campo obrigatório')
  })

  it('com hint (sem error), aponta aria-describedby para a mensagem de hint', async () => {
    const wrapper = await mountSuspended(UiCheckbox, {
      props: { label: 'Aceito os termos', modelValue: false, hint: 'Dá para revogar depois' },
    })

    const message = wrapper.find('p')
    expect(wrapper.find('button').attributes('aria-describedby')).toBe(message.attributes('id'))
    expect(message.text()).toBe('Dá para revogar depois')
  })

  it('disabled desabilita o controle e não emite ao clicar', async () => {
    const wrapper = await mountSuspended(UiCheckbox, {
      props: { label: 'Indisponível', modelValue: false, disabled: true },
    })

    const control = wrapper.find('button')
    expect(control.attributes('disabled')).toBeDefined()

    await control.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
