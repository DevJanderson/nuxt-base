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
  <div class="w-full">
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
      class="block w-full rounded-field border bg-card px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 sm:py-3 sm:text-sm"
      :class="error
        ? 'border-destructive focus:border-destructive focus:ring-destructive'
        : 'border-border focus:border-ring focus:ring-ring'"
    >

    <p
      v-if="error"
      :id="errorId"
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
