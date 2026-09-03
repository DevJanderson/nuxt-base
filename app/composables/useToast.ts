export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastOptions {
  /** Título opcional exibido acima da mensagem */
  title?: string
  /** Duração em ms antes do fechamento automático */
  duration?: number
}

export interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
  title?: string
  duration: number
}

const DEFAULT_DURATION = 5000

/**
 * Fila global de toasts. O estado vive em `useState` (SSR-safe) e é
 * renderizado pelo `<UiToaster />` montado no layout default — uma única
 * instância de `ToastProvider`/`ToastViewport` por app.
 *
 * Uso: `const toast = useToast()` → `toast.success('Salvo com sucesso.')`,
 * `toast.error('Falhou.', { title: 'Erro', duration: 8000 })`.
 */
export function useToast() {
  const toasts = useState<ToastItem[]>('ui:toasts', () => [])
  const counter = useState<number>('ui:toast-counter', () => 0)

  function push(variant: ToastVariant, message: string, options?: ToastOptions) {
    counter.value += 1
    toasts.value.push({
      id: counter.value,
      variant,
      message,
      title: options?.title,
      duration: options?.duration ?? DEFAULT_DURATION,
    })
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  return {
    toasts,
    dismiss,
    success: (message: string, options?: ToastOptions) => push('success', message, options),
    error: (message: string, options?: ToastOptions) => push('error', message, options),
    info: (message: string, options?: ToastOptions) => push('info', message, options),
  }
}
