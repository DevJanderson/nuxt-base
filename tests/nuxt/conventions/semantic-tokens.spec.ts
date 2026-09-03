// Teste-inventário (padrão adotado do nuxt-kit): trava em código executável a
// convenção nº 1 da base — "apenas tokens semânticos" (CLAUDE.md). Nos dois
// sentidos: violação nova falha o CI; entrada de allowlist que não corresponde
// mais a nada também falha (allowlist não pode apodrecer).
// Limitação conhecida: os regex abaixo pegam classes utilitárias de paleta
// (bg-red-500, bg-white, bg-[#fff]) mas NÃO cor funcional arbitrária
// (bg-[rgb(...)], bg-[oklch(...)]) nem style inline (style="color: ...") —
// esses casos escapam deste inventário.
import type { AllowlistEntry } from './_helpers'
import { describeInventory, findViolations } from './_helpers'

// Exceções conscientes: { file: 'app/...', excerpt: 'trecho exato', reason: 'porquê' }.
// Ao adicionar uma, escreva o porquê — entrada sem correspondência no código falha o teste.
const allowlist: AllowlistEntry[] = []

const rawPaletteClass
  = /\b(?:bg|text|border|ring|outline|fill|stroke|divide|from|via|to|accent|caret|decoration|placeholder)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|white|black)-?\d{0,3}\b/g
const arbitraryColorClass = /\b(?:bg|text|border|ring|outline|fill|stroke)-\[#[0-9a-f]{3,8}\]/gi

const violations = findViolations([rawPaletteClass, arbitraryColorClass])

describeInventory(
  'convenção: apenas tokens semânticos em app/**/*.{vue,ts}',
  violations,
  allowlist,
  'cor bruta encontrada — use um token semântico do main.css '
  + '(ou crie um token novo); em último caso, documente na allowlist deste teste',
)
