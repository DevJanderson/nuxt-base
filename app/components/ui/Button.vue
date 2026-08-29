<script setup lang="ts">
type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  variant: 'solid',
  size: 'md',
  type: 'button',
  disabled: false,
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
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-x-2 rounded-field font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
    :class="[variantClasses[variant], sizeClasses[size]]"
  >
    <slot />
  </button>
</template>
