// Segue o teste-referência de composable (tests/nuxt/composables/use-api.spec.ts).
// useToast guarda a fila em useState('ui:toasts'), que é global ao app de teste:
// zera no beforeEach para um teste não vazar toast para o próximo.
import { beforeEach, describe, expect, it } from 'vitest'
import { useState, useToast } from '#imports'

beforeEach(() => {
  useState('ui:toasts', () => []).value = []
  useState('ui:toast-counter', () => 0).value = 0
})

describe('useToast', () => {
  it.each([
    ['success', 'success'],
    ['error', 'error'],
    ['info', 'info'],
  ] as const)('%s empurra um toast com variant %s e duration padrão 5000', (method, variant) => {
    const toast = useToast()

    toast[method]('Mensagem')

    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]).toMatchObject({ variant, message: 'Mensagem', duration: 5000 })
  })

  it('aceita duration customizada', () => {
    const toast = useToast()

    toast.error('Falhou', { duration: 8000 })

    expect(toast.toasts.value[0]?.duration).toBe(8000)
  })

  it('dismiss remove o toast pelo id', () => {
    const toast = useToast()

    toast.success('Um')
    toast.success('Dois')
    const [first] = toast.toasts.value
    toast.dismiss(first!.id)

    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]?.message).toBe('Dois')
  })
})
