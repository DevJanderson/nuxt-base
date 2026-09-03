// Teste-inventário irmão de semantic-tokens.spec.ts: trava a escala de
// empilhamento em tokens (main.css — `--z-*`). Único jeito permitido de usar é
// `z-(--z-x)`; `z-[...]` (arbitrário) e `z-<número>` (escala crua do Tailwind)
// falham — camada nova entra como token novo em main.css, nunca hardcoded.
import { describe, expect, it } from 'vitest'
import type { AllowlistEntry } from './_helpers'
import { describeInventory, findViolations, readMainCss } from './_helpers'

// { file: 'app/...', excerpt: 'trecho exato', reason: 'porquê' }. O varredor só
// olha app/**/*.{vue,ts} (mesmo escopo de semantic-tokens.spec.ts) — main.css, onde
// vive o comentário que cita "z-[n]" como exemplo do padrão proibido, fica de fora,
// então essa menção não aparece aqui como violação nem precisa de allowlist.
const allowlist: AllowlistEntry[] = []

const arbitraryZIndexClass = /\bz-\[[^\]]*\]/g
const rawZIndexClass = /\bz-\d+\b/g

const violations = findViolations([arbitraryZIndexClass, rawZIndexClass])

describeInventory(
  'convenção: z-index só via tokens (z-(--z-x)) em app/**/*.{vue,ts}',
  violations,
  allowlist,
  'z-index bruto encontrado — use um token --z-* de main.css via z-(--z-x) '
  + '(ou crie um token novo); em último caso, documente na allowlist deste teste',
)

// Token inexistente em z-(--z-nome) compila para var() inválido: o navegador ignora a
// declaração e o elemento cai para z-index auto em silêncio (sem erro de build/lint).
const zIndexTokenUsage = /z-\(--z-([\w-]+)\)/g

describe('convenção: todo z-(--z-x) usado existe como token em main.css', () => {
  it('cada nome referenciado em z-(--z-<nome>) tem um --z-<nome>: em main.css', () => {
    const mainCss = readMainCss()
    const names = new Set(
      findViolations([zIndexTokenUsage])
        .map(v => v.excerpt.match(/^z-\(--z-([\w-]+)\)$/)?.[1])
        .filter((name): name is string => Boolean(name)),
    )

    const missing = [...names].filter(name => !new RegExp(`--z-${name}:`).test(mainCss))

    expect(missing, `token(s) --z-* inexistente(s) em main.css, referenciado(s) via `
      + `z-(--z-<nome>) em app/**: ${missing.join(', ')}`).toEqual([])
  })
})
