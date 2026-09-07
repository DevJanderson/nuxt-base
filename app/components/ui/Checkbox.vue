<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'

// Attrs extras (name, value, required, aria-label, …) caem no controle, não no wrapper
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Rótulo visível. Sem ele, passe `aria-label` — o atributo cai no controle. */
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
}>(), {
  label: undefined,
  hint: undefined,
  error: undefined,
  disabled: false,
})

// 'indeterminate' é o terceiro estado do primitivo (marca-tudo parcial), não um booleano
const model = defineModel<boolean | 'indeterminate'>({ default: false })

// <button> é um elemento rotulável: o for/id associa o <label> ao CheckboxRoot
const id = useId()
const messageId = `${id}-message`

// Erro e hint ocupam o mesmo lugar (o erro vence), então basta um id para os dois
const describedBy = computed(() => (props.error || props.hint ? messageId : undefined))
</script>

<template>
  <div
    data-slot="checkbox"
    class="w-full"
  >
    <div
      class="flex items-start gap-x-3"
      :class="disabled && 'opacity-50'"
    >
      <CheckboxRoot
        :id="id"
        v-model="model"
        v-bind="$attrs"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border bg-card shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
        :class="error ? 'border-destructive' : 'border-border'"
      >
        <CheckboxIndicator class="flex items-center justify-center text-current">
          <Icon
            :name="model === 'indeterminate' ? 'lucide:minus' : 'lucide:check'"
            class="size-3"
            aria-hidden="true"
          />
        </CheckboxIndicator>
      </CheckboxRoot>

      <!-- <label> puro, o mesmo idioma de rotulagem do Input/Select. `select-none` guarda o
           benefício do Label do Reka: marcar e desmarcar rápido não sai selecionando o texto -->
      <label
        v-if="label"
        :for="id"
        class="text-sm font-medium text-foreground select-none"
        :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      >
        {{ label }}
      </label>
    </div>

    <p
      v-if="error"
      :id="messageId"
      class="mt-2 text-sm text-destructive"
    >
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      :id="messageId"
      class="mt-2 text-sm text-muted-foreground"
    >
      {{ hint }}
    </p>
  </div>
</template>
