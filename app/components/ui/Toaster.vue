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
    <!-- `data-slot` vai no ToastRoot: o ToastProvider, raiz do componente, é só
         provider e não renderiza elemento — o atributo se perderia nele. -->
    <!-- `type` decide o `aria-live` do Reka (ToastRootImpl: foreground → assertive,
         background → polite). Sem ele o default é `foreground` e até um toast de sucesso
         interrompe a leitura em curso; só o erro merece esse corte. -->
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :type="toast.variant === 'error' ? 'foreground' : 'background'"
      :duration="toast.duration"
      data-slot="toast"
      :data-variant="toast.variant"
      class="pointer-events-auto flex w-full items-start gap-x-3 rounded-xl border border-border bg-card p-4 shadow-2xs transition duration-300 motion-reduce:transition-none motion-reduce:duration-0 starting:opacity-0 motion-safe:starting:translate-y-2 data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition data-[swipe=end]:translate-x-(--reka-toast-swipe-end-x) data-[swipe=move]:translate-x-(--reka-toast-swipe-move-x) data-[swipe=move]:transition-none"
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

    <!-- `pointer-events-none` é o par do `pointer-events-auto` do ToastRoot. Sem toast o
         Reka já desliga o viewport sozinho; com toast na tela, é esta classe que libera o
         clique na moldura (`p-4`/`gap-y-3`) em volta dos cards. -->
    <ToastViewport
      label="Notificações ({hotkey})"
      class="pointer-events-none fixed end-0 bottom-0 z-(--z-toast) flex w-full max-w-sm flex-col gap-y-3 p-4"
    />
  </ToastProvider>
</template>
