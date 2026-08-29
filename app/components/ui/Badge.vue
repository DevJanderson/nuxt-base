<script setup lang="ts">
type BadgeVariant = 'neutral' | 'primary' | 'destructive' | 'outline'

withDefaults(defineProps<{
  variant?: BadgeVariant
}>(), {
  variant: 'neutral',
})

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-primary text-primary',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
    :class="variantClasses[variant]"
  >
    <slot />
  </span>
</template>
