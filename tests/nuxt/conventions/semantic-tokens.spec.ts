// Teste-inventário (padrão adotado do nuxt-kit): trava em código executável a
// convenção nº 1 da base — "apenas tokens semânticos" (CLAUDE.md). Nos dois
// sentidos: violação nova falha o CI; entrada de allowlist que não corresponde
// mais a nada também falha (allowlist não pode apodrecer).
// Limitação conhecida: os regex abaixo pegam classes utilitárias de paleta
// (bg-red-500, bg-white, bg-[#fff]) mas NÃO cor funcional arbitrária
// (bg-[rgb(...)], bg-[oklch(...)]) nem style inline (style="color: ...") —
// esses casos escapam deste inventário.
import { describe, expect, it } from 'vitest'
import type { AllowlistEntry } from './_helpers'
import { describeInventory, findViolations, readMainCss } from './_helpers'

// Exceções conscientes: { file: 'app/...', excerpt: 'trecho exato', reason: 'porquê' }.
// Ao adicionar uma, escreva o porquê — entrada sem correspondência no código falha o teste.
const allowlist: AllowlistEntry[] = []

const utilityPrefix = '(?:bg|text|border|ring|outline|fill|stroke|divide|from|via|to|accent|caret|decoration|placeholder)'

const rawPaletteClass
  = new RegExp(`\\b${utilityPrefix}-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|white|black)-?\\d{0,3}\\b`, 'g')
const arbitraryColorClass = /\b(?:bg|text|border|ring|outline|fill|stroke)-\[#[0-9a-f]{3,8}\]/gi

const violations = findViolations([rawPaletteClass, arbitraryColorClass])

describeInventory(
  'convenção: apenas tokens semânticos em app/**/*.{vue,ts}',
  violations,
  allowlist,
  'cor bruta encontrada — use um token semântico do main.css '
  + '(ou crie um token novo); em último caso, documente na allowlist deste teste',
)

// ── vocabulário aposentado ──────────────────────────────────────────────────────────────
// `primary-hover` saiu (o hover virou `bg-primary/90`) e a escala de raio de três nomes
// (`box`/`field`/`selector`) virou a escala derivada de `--radius` (sm/md/lg/xl). Classe
// aposentada não quebra o build: o Tailwind simplesmente não gera a regra e o elemento
// fica sem raio/cor em silêncio — por isso ela precisa falhar aqui.
const retiredAllowlist: AllowlistEntry[] = []

const retiredTokenClass = new RegExp(`\\b${utilityPrefix}-primary-hover\\b|\\brounded-(?:box|field|selector)\\b`, 'g')

describeInventory(
  'convenção: nenhum token aposentado em app/**/*.{vue,ts}',
  findViolations([retiredTokenClass]),
  retiredAllowlist,
  'token aposentado encontrado — troque pelo equivalente atual da tabela de tokens do README',
)

// ── contrato do main.css ────────────────────────────────────────────────────────────────
// O inventário acima olha o uso; este olha a fonte. Sem ele, remover um token do main.css
// passa despercebido enquanto nenhum componente o usar — e o próximo que usar cai no mesmo
// silêncio do parágrafo acima.
const mainCss = readMainCss()

const semanticColorTokens = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
]

const retiredTokens = ['--primary-hover', '--radius-box', '--radius-field', '--radius-selector']

const radiusSteps = ['sm', 'md', 'lg', 'xl']

/** Conteúdo de um bloco de primeiro nível do main.css (`:root`, `.dark`, `@theme inline`). */
function cssBlock(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return mainCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? ''
}

function missingDeclarations(block: string, names: string[]): string[] {
  return names.filter(name => !new RegExp(`${name}:`).test(block))
}

describe('convenção: contrato de tokens do main.css', () => {
  // Token declarado só num dos temas é o bug clássico: no tema faltante o var() não
  // resolve e a utility sai sem cor, sem erro de build.
  it.each([':root', '.dark'])('%s define todos os tokens semânticos de cor', (selector) => {
    const missing = missingDeclarations(cssBlock(selector), semanticColorTokens.map(token => `--${token}`))

    expect(missing, `token(s) sem valor no bloco ${selector} do main.css: ${missing.join(', ')}`).toEqual([])
  })

  it('@theme inline registra cada token semântico como utility de cor', () => {
    const missing = missingDeclarations(cssBlock('@theme inline'), semanticColorTokens.map(token => `--color-${token}`))

    expect(missing, `token(s) sem utility em @theme inline (bg-*/text-*/border-* não existem sem isso): ${missing.join(', ')}`).toEqual([])
  })

  // Raio é um número só: `--radius` no `:root` e a escala inteira derivando dele.
  it('a escala de raio deriva de um único --radius', () => {
    expect(cssBlock(':root'), '--radius não declarado no :root do main.css').toMatch(/--radius:\s*[\d.]+rem/)

    const theme = cssBlock('@theme inline')
    const detached = radiusSteps.filter(step => !new RegExp(`--radius-${step}:[^;]*var\\(--radius\\)`).test(theme))

    expect(detached, `--radius-* que não deriva de var(--radius): ${detached.join(', ')}`).toEqual([])
  })

  it('tokens aposentados não voltam ao main.css', () => {
    const resurrected = retiredTokens.filter(token => new RegExp(`${token}:`).test(mainCss))

    expect(resurrected, `token aposentado redeclarado no main.css: ${resurrected.join(', ')}`).toEqual([])
  })
})
