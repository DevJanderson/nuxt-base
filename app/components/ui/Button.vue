<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { cva } from 'class-variance-authority'
import { cn } from '~/utils/cn'

// Vocabulário de variantes e tamanhos do kit (README, "Componentes de UI"); o visual
// continua sendo o nosso port do Preline. Escrever a união à mão (em vez de `VariantProps`)
// é de propósito: o compilador de `defineProps` não resolve tipo condicional importado,
// e a chamada `buttonVariants({ variant, size })` abaixo já quebra o typecheck se um
// nome daqui não existir no cva.
type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  /** Presente = renderiza NuxtLink com o mesmo visual, em vez de <button>. */
  to?: RouteLocationRaw
  /** Fundido por `cn()`: classe de fora vence a do componente no mesmo grupo. */
  class?: HTMLAttributes['class']
}>(), {
  variant: 'default',
  size: 'default',
  type: 'button',
  disabled: false,
  to: undefined,
  class: undefined,
})

// Visual portado do Preline (button solid/outline/ghost), tokens semânticos da base.
// `aria-disabled:*` cobre o link desabilitado, que não aceita o atributo nativo `disabled`.
//
// Altura fixa (`h-*`) em vez de padding vertical, na escala densa do kit: 24/28/32/36px.
// O padding horizontal mantém a proporção do Preline (≈0.35 da altura).
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-x-2 rounded-md text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-border text-muted-foreground hover:border-primary hover:text-primary',
        // Preenchimento discreto: o mesmo par do botão de fechar do Modal — o hover
        // escurece o texto, porque numa paleta monocromática clarear o fundo (`/80`)
        // andaria na direção errada no tema claro.
        secondary: 'bg-secondary text-secondary-foreground hover:text-foreground',
        ghost: 'text-primary hover:bg-primary/10',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        'default': 'h-8 px-3',
        'xs': 'h-6 gap-x-1.5 px-2 text-xs',
        'sm': 'h-7 gap-x-1.5 px-2.5 text-xs',
        'lg': 'h-9 px-4',
        'icon': 'size-8',
        'icon-xs': 'size-6 text-xs',
        'icon-sm': 'size-7 text-xs',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const classes = computed(() => cn(buttonVariants({ variant: props.variant, size: props.size }), props.class))

// `.capture`: o listener precisa rodar ANTES do onClick do RouterLink (que navega no
// bubble); `pointer-events-none` só barra o mouse, Enter e leitor de tela ainda clicam.
function onLinkClick(event: MouseEvent) {
  if (props.disabled) event.preventDefault()
}
</script>

<template>
  <NuxtLink
    v-if="to !== undefined"
    :to="to"
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :class="classes"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
    @click.capture="onLinkClick"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled"
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :class="classes"
  >
    <slot />
  </button>
</template>
