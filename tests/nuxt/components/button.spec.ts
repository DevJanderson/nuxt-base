// Teste-referência de COMPONENTE (convenção do CLAUDE.md): novos testes de componente seguem este formato.
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

  it('com to, renderiza <a> (NuxtLink) com href e as classes da variante', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { to: '/login', variant: 'outline' } })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/login')
    expect(link.classes()).toContain('border-border')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('com to e disabled, marca aria-disabled e tabindex -1 sem o atributo disabled nativo', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { to: '/login', disabled: true } })

    const link = wrapper.find('a')
    expect(link.attributes('aria-disabled')).toBe('true')
    expect(link.attributes('tabindex')).toBe('-1')
    expect(link.attributes('disabled')).toBeUndefined()
  })

  it('sem to, continua renderizando <button type=button>', async () => {
    const wrapper = await mountSuspended(UiButton)

    expect(wrapper.find('button').attributes('type')).toBe('button')
    expect(wrapper.find('a').exists()).toBe(false)
  })
})
