import { defineVitestConfig } from '@nuxt/test-utils/config'
import { configDefaults } from 'vitest/config'

export default defineVitestConfig({
  test: {
    // Worktrees do Claude Code dentro do repo carregam cópias de tests/ (caso real, 2026-09-07)
    exclude: [...configDefaults.exclude, '**/.claude/worktrees/**'],
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
  },
})
