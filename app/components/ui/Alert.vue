<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '~/utils/cn'

// Vocabulário do kit, o mesmo do Badge e do Button: `default` e `destructive`.
type AlertVariant = 'default' | 'destructive'

const props = withDefaults(defineProps<{
  variant?: AlertVariant
  /** Título opcional exibido acima da mensagem */
  title?: string
  /** Fundido por `cn()`: classe de fora vence a do componente no mesmo grupo. */
  class?: HTMLAttributes['class']
}>(), {
  variant: 'default',
  title: undefined,
  class: undefined,
})

// Visual portado do Preline (alert soft), tokens semânticos da base.
// O contrato de tokens não tem cor de informação: a variante default usa muted.
const alertVariants = cva(
  'flex items-start gap-x-3 rounded-xl border p-4 text-sm',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted text-foreground',
        destructive: 'border-destructive/40 bg-destructive/10 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const classes = computed(() => cn(alertVariants({ variant: props.variant }), props.class))

// Mesmo par ícone/cor do Toaster: a mesma mensagem se lê igual no toast e na página.
// Ficam fora do cva porque pintam o ícone, um nó filho — não a raiz.
const icons: Record<AlertVariant, string> = {
  default: 'lucide:info',
  destructive: 'lucide:circle-alert',
}

const iconClasses: Record<AlertVariant, string> = {
  default: 'text-muted-foreground',
  destructive: 'text-destructive',
}
</script>

<template>
  <!-- Mensagem estática, renderizada junto com a página: sem role="alert"/"status".
       Live region que já existe no load não é anunciada como novidade (ou atropela a
       leitura da página); mensagem que aparece em resposta a uma ação é toast
       (`useToast()`), que já é live region pelo Reka. -->
  <div
    data-slot="alert"
    :data-variant="variant"
    :class="classes"
  >
    <Icon
      :name="icons[variant]"
      class="mt-0.5 size-5 shrink-0"
      :class="iconClasses[variant]"
      aria-hidden="true"
    />

    <div class="min-w-0 flex-1">
      <p
        v-if="title"
        class="font-semibold"
      >
        {{ title }}
      </p>
      <div :class="title ? 'mt-1 text-muted-foreground' : undefined">
        <slot />
      </div>
    </div>
  </div>
</template>
