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

  it('usa a variante default no tamanho default', async () => {
    const wrapper = await mountSuspended(UiButton)

    const button = wrapper.find('button')
    expect(button.classes()).toContain('bg-primary')
    expect(button.classes()).toEqual(expect.arrayContaining(['h-8', 'text-sm']))
  })

  it.each([
    ['default', 'bg-primary'],
    ['outline', 'border-border'],
    ['secondary', 'bg-secondary'],
    ['ghost', 'text-primary'],
    ['destructive', 'bg-destructive'],
    ['link', 'underline-offset-4'],
  ] as const)('aplica as classes da variante %s', async (variant, expectedClass) => {
    const wrapper = await mountSuspended(UiButton, { props: { variant } })

    expect(wrapper.find('button').classes()).toContain(expectedClass)
  })

  // Escala densa de alturas: a altura é fixa (`h-*`/`size-*`), não padding vertical.
  it.each([
    ['xs', 'h-6'],
    ['sm', 'h-7'],
    ['default', 'h-8'],
    ['lg', 'h-9'],
    ['icon-xs', 'size-6'],
    ['icon-sm', 'size-7'],
    ['icon', 'size-8'],
    ['icon-lg', 'size-9'],
  ] as const)('aplica a altura fixa do tamanho %s', async (size, expectedClass) => {
    const wrapper = await mountSuspended(UiButton, { props: { size } })

    expect(wrapper.find('button').classes()).toContain(expectedClass)
  })

  it.each([
    ['xs', 'text-xs'],
    ['sm', 'text-xs'],
    ['default', 'text-sm'],
    ['lg', 'text-sm'],
  ] as const)('usa %s com %s', async (size, expectedClass) => {
    const wrapper = await mountSuspended(UiButton, { props: { size } })

    expect(wrapper.find('button').classes()).toContain(expectedClass)
  })

  // `data-slot` (e `data-variant`/`data-size`) é o gancho estável para estilizar de fora
  // e para selecionar a raiz nos testes, sem depender de classe utilitária do momento.
  it('marca a raiz com data-slot, data-variant e data-size', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { variant: 'ghost', size: 'lg' } })

    const button = wrapper.find('[data-slot="button"]')
    expect(button.exists()).toBe(true)
    expect(button.attributes('data-variant')).toBe('ghost')
    expect(button.attributes('data-size')).toBe('lg')
  })

  // O `cn()` (twMerge) é o que faz a classe de fora vencer: sem ele sairiam `h-8 h-10`
  // no atributo e o vencedor dependeria da ordem das regras no CSS gerado.
  it('funde a prop class, e a de fora vence no mesmo grupo de utility', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { class: 'h-10 w-full' } })

    const classes = wrapper.find('button').classes()
    expect(classes).toEqual(expect.arrayContaining(['h-10', 'w-full']))
    expect(classes).not.toContain('h-8')
  })

  it('desabilita o botão nativo com a prop disabled', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { disabled: true } })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('com to, renderiza <a> (NuxtLink) com href e as classes da variante', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { to: '/login', variant: 'outline' } })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/login')
    expect(link.attributes('data-slot')).toBe('button')
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
