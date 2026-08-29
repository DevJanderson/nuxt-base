// Teste-referência de COMPONENTE (SPEC §7): novos testes de componente seguem este formato.
// `mountSuspended` monta o componente com o runtime do Nuxt (auto-imports, plugins);
// `#components` expõe os componentes auto-importados (UiButton = app/components/ui/Button.vue).
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UiButton } from '#components'

describe('UiButton', () => {
  it('renderiza o conteúdo do slot', async () => {
    const wrapper = await mountSuspended(UiButton, {
      slots: { default: () => 'Salvar' },
    })

    expect(wrapper.find('button').text()).toBe('Salvar')
  })

  it('usa a variante solid por padrão', async () => {
    const wrapper = await mountSuspended(UiButton)

    expect(wrapper.find('button').classes()).toContain('bg-primary')
  })

  it.each([
    ['outline', 'border-border'],
    ['ghost', 'text-primary'],
    ['destructive', 'bg-destructive'],
  ] as const)('aplica as classes da variante %s', async (variant, expectedClass) => {
    const wrapper = await mountSuspended(UiButton, { props: { variant } })

    expect(wrapper.find('button').classes()).toContain(expectedClass)
  })

  it('desabilita o botão nativo com a prop disabled', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { disabled: true } })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
