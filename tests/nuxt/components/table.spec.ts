// Segue o teste-referência de componente (tests/nuxt/components/button.spec.ts).
// Cobre o contrato de acessibilidade da tabela: a região rolável é alcançável por
// teclado (WCAG 2.1.1) e tem nome, e a `caption` vira legenda só para leitor de tela.
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UiTable } from '#components'

const columns = [{ key: 'name', label: 'Nome' }]
const rows = [{ name: 'Ana Souza' }]

function mountTable(props: Record<string, unknown> = {}) {
  return mountSuspended(UiTable, { props: { columns, rows, ...props } })
}

describe('UiTable', () => {
  it('o wrapper rolável é focável e vira região nomeada', async () => {
    const region = (await mountTable()).find('[data-slot="table"]')

    expect(region.attributes('tabindex')).toBe('0')
    expect(region.attributes('role')).toBe('region')
    expect(region.attributes('aria-label')).toBe('Tabela de dados')
  })

  it('sem caption não renderiza <caption>', async () => {
    expect((await mountTable()).find('caption').exists()).toBe(false)
  })

  it('com caption, nomeia a região e renderiza a legenda em sr-only', async () => {
    const wrapper = await mountTable({ caption: 'Usuários cadastrados' })

    expect(wrapper.find('[data-slot="table"]').attributes('aria-label')).toBe('Usuários cadastrados')
    const caption = wrapper.find('caption')
    expect(caption.text()).toBe('Usuários cadastrados')
    expect(caption.classes()).toContain('sr-only')
  })

  it('cabeçalho de coluna declara scope="col"', async () => {
    expect((await mountTable()).find('th').attributes('scope')).toBe('col')
  })
})
