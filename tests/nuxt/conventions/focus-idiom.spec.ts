// Teste-inventário irmão de z-index.spec.ts: trava o idioma único de foco do kit —
// `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`.
// O drift que este teste impede é real: Input e Select nasceram com `focus:ring-1` +
// `focus:border-ring` (anel de 1px, aceso também no clique do mouse) enquanto o resto
// do kit usava outline só no teclado; `focus:outline-hidden` num controle apaga o foco
// sem oferecer outro (o Tailwind 4 só o mantém em forced-colors).
import type { AllowlistEntry } from './_helpers'
import { describeInventory, findViolations } from './_helpers'

// { file, excerpt, reason }: o varredor olha app/**/*.{vue,ts}.
const allowlist: AllowlistEntry[] = [
  {
    file: 'app/layouts/default.vue',
    excerpt: 'focus:outline-hidden',
    reason: '<main tabindex="-1"> é o alvo do skip link, não um controle: recebe foco '
      + 'programático e não deve desenhar anel',
  },
]

const mouseFocusRing = /\bfocus:ring-[\w/-]+/g
const mouseFocusBorder = /\bfocus:border-ring\b/g
const hiddenOutline = /\bfocus:outline-hidden\b/g

const violations = findViolations([mouseFocusRing, mouseFocusBorder, hiddenOutline])

describeInventory(
  'convenção: foco visível só pelo idioma focus-visible:outline-* em app/**/*.{vue,ts}',
  violations,
  allowlist,
  'idioma de foco fora do padrão — use focus-visible:outline-2 focus-visible:outline-offset-2 '
  + 'focus-visible:outline-ring (e aria-invalid:focus-visible:outline-destructive no erro); '
  + 'exceção documentada entra na allowlist deste teste',
)
