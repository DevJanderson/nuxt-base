// Teste-inventário curto: main.css (--font-sans) e nuxt.config.ts (fonts.families)
// declaram a mesma família em dois lugares por causa do bug upstream nuxt/fonts#638
// (ver comentário em nuxt.config.ts) — sem isto, o drift entre os dois é silencioso:
// o build continua passando com um @font-face que não bate com o token do Tailwind.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { appDir, readMainCss } from './_helpers'

const projectRoot = join(appDir, '..')

function readFontSansFamily(): string | undefined {
  return readMainCss().match(/--font-sans:\s*"([^"]+)"/)?.[1]
}

function readFontsModuleFamily(): string | undefined {
  const config = readFileSync(join(projectRoot, 'nuxt.config.ts'), 'utf8')
  return config.match(/families:\s*\[\s*\{\s*name:\s*'([^']+)'/)?.[1]
}

describe('convenção: main.css e nuxt.config.ts declaram a mesma font-sans', () => {
  it('família de --font-sans bate com fonts.families[0].name', () => {
    const cssFamily = readFontSansFamily()
    const configFamily = readFontsModuleFamily()

    expect(cssFamily, '--font-sans não encontrado em app/assets/css/main.css').toBeTruthy()
    expect(configFamily, 'fonts.families[0].name não encontrado em nuxt.config.ts').toBeTruthy()
    expect(configFamily).toBe(cssFamily)
  })
})
