<script setup lang="ts">
import { TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from 'reka-ui'

withDefaults(defineProps<{
  text: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayDuration?: number
  defaultOpen?: boolean
}>(), {
  side: 'top',
  delayDuration: 300,
  defaultOpen: false,
})
</script>

<template>
  <TooltipProvider :delay-duration="delayDuration">
    <TooltipRoot :default-open="defaultOpen">
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side"
          :side-offset="6"
          class="z-10 rounded-field border border-border bg-card px-2 py-1 text-xs font-medium text-card-foreground opacity-100 shadow-2xs transition-opacity duration-150 starting:opacity-0"
        >
          {{ text }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
