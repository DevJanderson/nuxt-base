<script setup lang="ts">
import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from 'reka-ui'
import type { ToastVariant } from '~/composables/useToast'

const { toasts, dismiss } = useToast()

const icons: Record<ToastVariant, string> = {
  success: 'lucide:circle-check',
  error: 'lucide:circle-alert',
  info: 'lucide:info',
}

// O contrato de tokens não tem cor de sucesso: success usa primary
const iconClasses: Record<ToastVariant, string> = {
  success: 'text-primary',
  error: 'text-destructive',
  info: 'text-muted-foreground',
}

function onOpenChange(open: boolean, id: number) {
  if (!open) {
    dismiss(id)
  }
}
</script>

<template>
  <ToastProvider
    label="Notificação"
    swipe-direction="right"
  >
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :duration="toast.duration"
      class="pointer-events-auto flex w-full items-start gap-x-3 rounded-box border border-border bg-card p-4 shadow-2xs transition duration-300 starting:translate-y-2 starting:opacity-0 data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition data-[swipe=end]:translate-x-(--reka-toast-swipe-end-x) data-[swipe=move]:translate-x-(--reka-toast-swipe-move-x) data-[swipe=move]:transition-none"
      @update:open="onOpenChange($event, toast.id)"
    >
      <Icon
        :name="icons[toast.variant]"
        class="mt-0.5 size-5 shrink-0"
        :class="iconClasses[toast.variant]"
        aria-hidden="true"
      />

      <div class="min-w-0 flex-1">
        <ToastTitle
          v-if="toast.title"
          class="text-sm font-semibold text-card-foreground"
        >
          {{ toast.title }}
        </ToastTitle>
        <ToastDescription
          class="text-sm"
          :class="toast.title ? 'text-muted-foreground' : 'text-card-foreground'"
        >
          {{ toast.message }}
        </ToastDescription>
      </div>

      <ToastClose
        class="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Fechar notificação"
      >
        <Icon
          name="lucide:x"
          class="size-3.5"
          aria-hidden="true"
        />
      </ToastClose>
    </ToastRoot>

    <ToastViewport
      label="Notificações ({hotkey})"
      class="fixed end-0 bottom-0 z-[60] flex w-full max-w-sm flex-col gap-y-3 p-4"
    />
  </ToastProvider>
</template>
