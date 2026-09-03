// Helper compartilhado pelos testes-inventário de tests/nuxt/conventions/ — evita
// duplicar o walker de arquivos e os dois `it()` padrão (violação nova / allowlist
// apodrecida) entre specs de convenção parecidos (jscpd threshold 0 no repo).
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// cwd do Vitest = raiz do projeto (o import.meta.url não é file: no ambiente nuxt)
export const appDir = join(process.cwd(), 'app')

export interface Violation {
  file: string
  excerpt: string
}

export interface AllowlistEntry extends Violation {
  reason: string
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return entry.name.endsWith('.vue') || entry.name.endsWith('.ts') ? [path] : []
  })
}

export function readMainCss(): string {
  return readFileSync(join(appDir, 'assets/css/main.css'), 'utf8')
}

export function findViolations(patterns: RegExp[]): Violation[] {
  const violations: Violation[] = []
  for (const path of sourceFiles(appDir)) {
    const file = join('app', relative(appDir, path))
    const source = readFileSync(path, 'utf8')
    for (const pattern of patterns) {
      for (const excerpt of source.match(pattern) ?? []) {
        violations.push({ file, excerpt })
      }
    }
  }
  return violations
}

// Registra os dois testes-padrão do inventário: violação nova fora da allowlist
// falha; entrada de allowlist sem correspondência no código também falha
// (a allowlist não pode apodrecer).
export function describeInventory(
  suiteName: string,
  violations: Violation[],
  allowlist: AllowlistEntry[],
  unexpectedMessage: string,
): void {
  describe(suiteName, () => {
    it('nenhuma violação fora da allowlist', () => {
      const unexpected = violations.filter(v =>
        !allowlist.some(a => a.file === v.file && a.excerpt === v.excerpt))

      expect(unexpected, unexpectedMessage).toEqual([])
    })

    it('allowlist sem entradas apodrecidas', () => {
      const rotten = allowlist.filter(a =>
        !violations.some(v => v.file === a.file && v.excerpt === a.excerpt))

      expect(rotten, 'entrada de allowlist sem correspondência no código — remova-a').toEqual([])
    })
  })
}
