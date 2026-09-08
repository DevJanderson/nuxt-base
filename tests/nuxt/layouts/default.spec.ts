// Segue o teste-referência de componente (tests/nuxt/components/button.spec.ts), aplicado
// ao layout: o skip link só cumpre o WCAG 2.4.1 se for o PRIMEIRO focável da página e
// apontar para um alvo que exista — as duas coisas quebram em silêncio numa refatoração.
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DefaultLayout from '~/layouts/default.vue'

describe('layout default', () => {
  it('o primeiro elemento focável da página é o skip link, escondido fora do foco', async () => {
    const wrapper = await mountSuspended(DefaultLayout, { slots: { default: () => 'Conteúdo' } })

    // Qualquer focável antes dele (botão, input, link) quebra o WCAG 2.4.1 em silêncio
    const first = wrapper.findAll('a, button, input, select, textarea, [tabindex="0"]')[0]!
    expect(first.text()).toBe('Pular para o conteúdo')
    expect(first.attributes('href')).toBe('#conteudo')
    expect(first.classes()).toContain('sr-only')
    expect(first.classes()).toContain('focus:not-sr-only')
  })

  it('o alvo do skip link existe no <main> e recebe foco', async () => {
    const wrapper = await mountSuspended(DefaultLayout, { slots: { default: () => 'Conteúdo' } })

    const main = wrapper.find('main')
    expect(main.attributes('id')).toBe('conteudo')
    expect(main.attributes('tabindex')).toBe('-1')
  })
})
