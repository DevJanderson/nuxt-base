<script setup lang="ts">
defineSlots<{
  header?: () => unknown
  default?: () => unknown
  footer?: () => unknown
}>()
</script>

<template>
  <div class="flex flex-col rounded-box border border-border bg-card text-card-foreground shadow-2xs">
    <div
      v-if="$slots.header"
      class="border-b border-border px-4 py-3 sm:px-5"
    >
      <slot name="header" />
    </div>

    <div class="p-4 sm:p-5">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="border-t border-border px-4 py-3 sm:px-5"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
