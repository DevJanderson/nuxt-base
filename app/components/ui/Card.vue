<script setup lang="ts">
defineSlots<{
  header?: () => unknown
  default?: () => unknown
  footer?: () => unknown
}>()
</script>

<template>
  <div
    data-slot="card"
    class="flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-2xs"
  >
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
