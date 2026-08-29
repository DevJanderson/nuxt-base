// Teste-inventário (padrão adotado do nuxt-kit): trava em código executável a
// convenção nº 1 da base — "apenas tokens semânticos" (CLAUDE.md). Nos dois
// sentidos: violação nova falha o CI; entrada de allowlist que não corresponde
// mais a nada também falha (allowlist não pode apodrecer).
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// cwd do Vitest = raiz do projeto (o import.meta.url não é file: no ambiente nuxt)
const appDir = join(process.cwd(), 'app')

// Exceções conscientes: { file: 'app/...', excerpt: 'trecho exato', reason: 'porquê' }.
// Ao adicionar uma, escreva o porquê — entrada sem correspondência no código falha o teste.
const allowlist: Array<{ file: string, excerpt: string, reason: string }> = []

const rawPaletteClass
  = /\b(?:bg|text|border|ring|outline|fill|stroke|divide|from|via|to|accent|caret|decoration|placeholder)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/g
const arbitraryColorClass = /\b(?:bg|text|border|ring|outline|fill|stroke)-\[#[0-9a-f]{3,8}\]/gi

function vueFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return vueFiles(path)
    return entry.name.endsWith('.vue') ? [path] : []
  })
}

describe('convenção: apenas tokens semânticos em app/**/*.vue', () => {
  const violations: Array<{ file: string, excerpt: string }> = []

  for (const path of vueFiles(appDir)) {
    const file = join('app', relative(appDir, path))
    const source = readFileSync(path, 'utf8')
    for (const excerpt of [
      ...source.match(rawPaletteClass) ?? [],
      ...source.match(arbitraryColorClass) ?? [],
    ]) {
      violations.push({ file, excerpt })
    }
  }

  it('nenhuma cor bruta fora da allowlist', () => {
    const unexpected = violations.filter(v =>
      !allowlist.some(a => a.file === v.file && a.excerpt === v.excerpt))

    expect(unexpected, 'cor bruta encontrada — use um token semântico do main.css '
      + '(ou crie um token novo); em último caso, documente na allowlist deste teste').toEqual([])
  })

  it('allowlist sem entradas apodrecidas', () => {
    const rotten = allowlist.filter(a =>
      !violations.some(v => v.file === a.file && v.excerpt === a.excerpt))

    expect(rotten, 'entrada de allowlist sem correspondência no código — remova-a').toEqual([])
  })
})
