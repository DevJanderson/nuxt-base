// Fusão de classes usada por todo componente com variantes: `clsx` resolve o condicional
// (string, array, objeto) e `twMerge` desempata utilities do mesmo grupo, mantendo a última.
//
// É o que faz `props.class` valer mais que a classe do componente: sem o twMerge,
// `<UiButton class="h-10">` sairia com `h-8 h-10` e o vencedor dependeria da ordem em
// que o Tailwind gerou as regras no CSS — não da ordem do atributo.
//
// Importado explicitamente (`import { cn } from '~/utils/cn'`) mesmo com o auto-import
// do Nuxt: dentro de um `cva(...)` a origem da função precisa estar visível na leitura.
import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
