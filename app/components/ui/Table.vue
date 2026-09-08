<script setup lang="ts">
interface TableColumn {
  key: string
  label: string
}

withDefaults(defineProps<{
  columns: TableColumn[]
  rows: Record<string, unknown>[]
  /** Nome acessível da tabela: vira `<caption class="sr-only">` e rotula a região rolável. */
  caption?: string
}>(), {
  caption: undefined,
})

// Com `caption`, a região rolável é nomeada pelo próprio <caption> (aria-labelledby):
// um nome só, anunciado uma vez; sem caption, cai no rótulo genérico.
const captionId = useId()

// Slot opcional por coluna: #cell-[key] recebe { row, value }
defineSlots<{
  [name: `cell-${string}`]: (props: { row: Record<string, unknown>, value: unknown }) => unknown
}>()
</script>

<template>
  <!-- `tabindex="0"`: com coluna fora da tela, quem usa só teclado precisa de um elemento
       focável para rolar na horizontal (WCAG 2.1.1). Região sem nome é ruído no leitor de
       tela, então o `role="region"` vem sempre acompanhado de `aria-label`. -->
  <div
    data-slot="table"
    role="region"
    tabindex="0"
    :aria-labelledby="caption ? captionId : undefined"
    :aria-label="caption ? undefined : 'Tabela de dados'"
    class="overflow-x-auto rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  >
    <table class="min-w-full divide-y divide-border">
      <!-- `sr-only` e não `hidden`: a legenda nomeia a tabela na lista do leitor de tela
           sem mudar o desenho. Legenda visível = passar outra classe daqui. -->
      <caption
        v-if="caption"
        :id="captionId"
        class="sr-only"
      >
        {{ caption }}
      </caption>
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
