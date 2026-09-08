<script setup lang="ts">
// Attrs extras (name, autocomplete, required, …) caem no <input>, não no wrapper
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  label?: string
  hint?: string
  error?: string
  type?: string
  placeholder?: string
  disabled?: boolean
}>(), {
  label: undefined,
  hint: undefined,
  error: undefined,
  type: 'text',
  placeholder: undefined,
  disabled: false,
})

const model = defineModel<string>()

const id = useId()
const errorId = `${id}-error`
const hintId = `${id}-hint`

const describedBy = computed(() => {
  if (props.error) {
    return errorId
  }
  return props.hint ? hintId : undefined
})
</script>

<template>
  <div
    data-slot="input"
    class="w-full"
  >
    <label
      v-if="label"
      :for="id"
      class="mb-2 block text-sm font-medium text-foreground"
    >
      {{ label }}
    </label>

    <input
      :id="id"
      v-model="model"
      v-bind="$attrs"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
      class="block h-8 w-full rounded-md border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive disabled:pointer-events-none disabled:opacity-50"
      :class="error ? 'border-destructive' : 'border-input'"
    >

    <!-- `role="alert"` só aqui (e não no <UiAlert>): este <p> nasce junto com o erro, então
         o leitor de tela anuncia a mensagem mesmo sem o foco voltar ao campo. -->
    <p
      v-if="error"
      :id="errorId"
      role="alert"
      class="mt-2 text-sm text-destructive"
    >
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      :id="hintId"
      class="mt-2 text-sm text-muted-foreground"
    >
      {{ hint }}
    </p>
  </div>
</template>
