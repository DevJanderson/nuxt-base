<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  /** Presente = renderiza NuxtLink com o mesmo visual, em vez de <button>. */
  to?: RouteLocationRaw
}>(), {
  variant: 'solid',
  size: 'md',
  type: 'button',
  disabled: false,
  to: undefined,
})

// Visual portado do Preline (button solid/outline/ghost), tokens semânticos da base
const variantClasses: Record<ButtonVariant, string> = {
  solid: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  outline: 'border border-border text-muted-foreground hover:border-primary-hover hover:text-primary-hover',
  ghost: 'text-primary hover:bg-primary/10 hover:text-primary-hover',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-3.5 text-base',
}

// `aria-disabled:*` cobre o link desabilitado, que não aceita o atributo nativo `disabled`.
const baseClasses = 'inline-flex items-center justify-center gap-x-2 rounded-field font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50'

const classes = computed(() => [baseClasses, variantClasses[props.variant], sizeClasses[props.size]])

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
    :class="classes"
  >
    <slot />
  </button>
</template>
