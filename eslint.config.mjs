// @ts-check
import sonarjs from 'eslint-plugin-sonarjs'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Anti-duplicação e complexidade (subconjunto do sonarjs — o recommended
  // inteiro é ruidoso demais para o dia a dia com Vue/Nuxt)
  {
    plugins: { sonarjs },
    rules: {
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/cognitive-complexity': ['warn', 15],
    },
  },
  // Anti-vazamento: log de servidor estruturado é decisão do projeto derivado
  // (receita pino no README) — console.* solto em server/ é erro.
  {
    files: ['server/**/*.ts'],
    rules: { 'no-console': 'error' },
  },
  // Scripts de automação da base (gate `pnpm smoke`) falam pelo stdout: o relatório
  // é a saída deles. `no-console` aqui só serviria para virar ruído silenciado à mão.
  {
    files: ['scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
  // No client, console.log é aviso (o strip de produção no nuxt.config remove
  // log/info/debug/trace do bundle final; warn/error sobrevivem de propósito).
  {
    files: ['app/**/*.{ts,vue}'],
    rules: { 'no-console': ['warn', { allow: ['warn', 'error'] }] },
  },
)
