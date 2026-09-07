<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '~/utils/cn'

// Vocabulário do kit: `default` é o rótulo em destaque, `secondary` o discreto.
// As classes continuam as do port do Preline.
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const props = withDefaults(defineProps<{
  variant?: BadgeVariant
  /** Fundido por `cn()`: classe de fora vence a do componente no mesmo grupo. */
  class?: HTMLAttributes['class']
}>(), {
  variant: 'default',
  class: undefined,
})

const badgeVariants = cva(
  'inline-flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-primary text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const classes = computed(() => cn(badgeVariants({ variant: props.variant }), props.class))
</script>

<template>
  <span
    data-slot="badge"
    :data-variant="variant"
    :class="classes"
  >
    <slot />
  </span>
</template>
