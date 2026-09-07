<script setup lang="ts">
type AlertVariant = 'info' | 'error'

withDefaults(defineProps<{
  variant?: AlertVariant
  /** Título opcional exibido acima da mensagem */
  title?: string
}>(), {
  variant: 'info',
  title: undefined,
})

// Mesmo par ícone/cor do Toaster: a mesma mensagem se lê igual no toast e na página.
const icons: Record<AlertVariant, string> = {
  info: 'lucide:info',
  error: 'lucide:circle-alert',
}

// Visual portado do Preline (alert soft), tokens semânticos da base.
// O contrato de tokens não tem cor de informação: info usa muted.
const variantClasses: Record<AlertVariant, string> = {
  info: 'border-border bg-muted text-foreground',
  error: 'border-destructive/40 bg-destructive/10 text-foreground',
}

const iconClasses: Record<AlertVariant, string> = {
  info: 'text-muted-foreground',
  error: 'text-destructive',
}
</script>

<template>
  <!-- Mensagem estática, renderizada junto com a página: sem role="alert"/"status".
       Live region que já existe no load não é anunciada como novidade (ou atropela a
       leitura da página); mensagem que aparece em resposta a uma ação é toast
       (`useToast()`), que já é live region pelo Reka. -->
  <div
    class="flex items-start gap-x-3 rounded-box border p-4 text-sm"
    :class="variantClasses[variant]"
  >
    <Icon
      :name="icons[variant]"
      class="mt-0.5 size-5 shrink-0"
      :class="iconClasses[variant]"
      aria-hidden="true"
    />

    <div class="min-w-0 flex-1">
      <p
        v-if="title"
        class="font-semibold"
      >
        {{ title }}
      </p>
      <div :class="title ? 'mt-1 text-muted-foreground' : undefined">
        <slot />
      </div>
    </div>
  </div>
</template>
