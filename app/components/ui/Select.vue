<script setup lang="ts">
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'

interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  items: SelectOption[]
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
}>(), {
  label: undefined,
  placeholder: 'Selecione…',
  error: undefined,
  disabled: false,
})

const model = defineModel<string>()

// <button> é um elemento rotulável: o for/id associa o label ao trigger
const id = useId()
const errorId = `${id}-error`

const describedBy = computed(() => (props.error ? errorId : undefined))
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

    <SelectRoot
      v-model="model"
      :disabled="disabled"
    >
      <SelectTrigger
        :id="id"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        class="flex w-full items-center justify-between gap-x-2 rounded-field border bg-card px-4 py-2.5 text-start text-foreground focus:ring-1 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[placeholder]:text-muted-foreground sm:py-3 sm:text-sm"
        :class="error
          ? 'border-destructive focus:border-destructive focus:ring-destructive'
          : 'border-border focus:border-ring focus:ring-ring'"
      >
        <SelectValue
          class="truncate"
          :placeholder="placeholder"
        />
        <SelectIcon as-child>
          <Icon
            name="lucide:chevron-down"
            class="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </SelectIcon>
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          position="popper"
          :side-offset="4"
          class="z-50 max-h-(--reka-select-content-available-height) w-(--reka-select-trigger-width) overflow-hidden rounded-field border border-border bg-card shadow-md"
        >
          <SelectViewport class="p-1">
            <SelectItem
              v-for="item in items"
              :key="item.value"
              :value="item.value"
              :disabled="item.disabled"
              class="flex w-full cursor-pointer items-center justify-between gap-x-2 rounded-field px-3 py-2 text-sm text-foreground select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-muted data-[highlighted]:outline-hidden"
            >
              <SelectItemText>{{ item.label }}</SelectItemText>
              <SelectItemIndicator>
                <Icon
                  name="lucide:check"
                  class="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              </SelectItemIndicator>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>

    <p
      v-if="error"
      :id="errorId"
      class="mt-2 text-sm text-destructive"
    >
      {{ error }}
    </p>
  </div>
</template>
