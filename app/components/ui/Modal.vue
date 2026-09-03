<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
} from 'reka-ui'

withDefaults(defineProps<{
  title: string
  description?: string
}>(), {
  description: undefined,
})

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger
      v-if="$slots.trigger"
      as-child
    >
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal>
      <!-- Backdrop do Preline (hs-overlay-backdrop) vira DialogOverlay explícito -->
      <DialogOverlay class="fixed inset-0 z-(--z-overlay) bg-foreground/50 transition-opacity duration-300 starting:opacity-0 dark:bg-background/80" />

      <DialogContent
        class="fixed top-1/2 left-1/2 z-(--z-modal) flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-box border border-border bg-card shadow-2xs transition duration-300 starting:translate-y-[calc(-50%-0.5rem)] starting:opacity-0"
      >
        <div class="flex items-center justify-between gap-x-2 border-b border-border px-4 py-3">
          <DialogTitle class="font-semibold text-card-foreground">
            {{ title }}
          </DialogTitle>
          <DialogClose
            class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Fechar"
          >
            <Icon
              name="lucide:x"
              class="size-4"
              aria-hidden="true"
            />
          </DialogClose>
        </div>

        <div class="overflow-y-auto p-4">
          <DialogDescription
            v-if="description"
            class="mb-2 text-sm text-muted-foreground"
          >
            {{ description }}
          </DialogDescription>
          <!-- Sem description o aria-describedby precisa de um id real: título como fallback -->
          <VisuallyHidden
            v-else
            as-child
          >
            <DialogDescription>{{ title }}</DialogDescription>
          </VisuallyHidden>
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="flex items-center justify-end gap-x-2 border-t border-border px-4 py-3"
        >
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
