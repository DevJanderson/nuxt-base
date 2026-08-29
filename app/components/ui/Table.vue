<script setup lang="ts">
interface TableColumn {
  key: string
  label: string
}

defineProps<{
  columns: TableColumn[]
  rows: Record<string, unknown>[]
}>()

// Slot opcional por coluna: #cell-[key] recebe { row, value }
defineSlots<{
  [name: `cell-${string}`]: (props: { row: Record<string, unknown>, value: unknown }) => unknown
}>()
</script>

<template>
  <div class="overflow-x-auto rounded-box border border-border">
    <table class="min-w-full divide-y divide-border">
      <thead class="bg-muted">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-4 py-3 text-start text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        <tr
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
          class="even:bg-muted/40"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-4 py-3 text-sm whitespace-nowrap text-foreground"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
            >
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
