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
)
