# CLAUDE.md — Nuxt Base

Template Nuxt 4 agnóstico (sem backend/banco/auth impostos), enxuto, copy-and-own na UI.
Referências: [SPEC.md](./SPEC.md) (especificação fechada) e [README.md](./README.md) (receitas: tema, SSR/SPA, API, auth).

## Stack

- Nuxt 4.5 (estrutura `app/`, SSR ligado) + Vue 3.5 + TypeScript estrito
- Tailwind 4 CSS-first via `@tailwindcss/vite` (tokens em `app/assets/css/main.css`)
- Reka UI 2 (headless, dependência) + visual portado do Preline (nunca dependência)
- Pinia 4, VueUse 14, `@nuxtjs/color-mode` (classe `dark` no `<html>`)
- Vitest 4 + `@nuxt/test-utils` + happy-dom (ambiente `nuxt` global)
- pnpm 11 (pinado em `packageManager`), ESLint via `@nuxt/eslint` (sem Prettier)

## Comandos

- `pnpm dev` / `pnpm build`
- `pnpm lint` / `pnpm lint:fix` / `pnpm typecheck` / `pnpm test` / `pnpm test:watch`

## Convenções inegociáveis

- SFCs: `<script setup lang="ts">` sempre, ordem script → template.
- Identificadores (variáveis, funções, tipos, rotas de API) em inglês; textos de UI em pt-BR.
- **Apenas tokens semânticos** (`bg-primary`, `text-muted-foreground`, `rounded-field`, …).
  Nunca cor bruta (`bg-blue-600`, hex). Cor nova = token novo em `main.css` (`:root`/`.dark` + `@theme inline`).
- Componentes novos de UI seguem o padrão do kit: comportamento de primitivo Reka UI,
  markup portado do Preline traduzindo `hs-*` para `data-[state=…]`. **Preline jamais vira
  dependência** (nem pacote npm, nem plugin JS) — é só catálogo de cópia.
- Pinia: setup stores (modelo em `app/stores/app.ts`).
- Toda chamada HTTP sai por `useApi`/`useApiData` (`app/composables/useApi.ts`);
  erros no formato `ApiError { statusCode, statusMessage, data }`.
- Testes: componentes com `mountSuspended` + `#components`; composables/API com
  `registerEndpoint` (registrar o caminho completo, com prefixo `/api`).
  Modelos em `tests/components/button.spec.ts` e `tests/composables/use-api.spec.ts`.
- **TypeScript pinado em 6.x — NÃO atualizar para 7.x** (tsgo quebra o vue-tsc/`nuxt typecheck`).
- `runtimeConfig` é a única fonte de config de ambiente; toda variável nova entra documentada
  no `.env.example`.
- Auth é ponto de encaixe: não implementar na base; seguir uma das duas receitas do README.

## Skills

- `.claude/skills/preline-mcp/` — skill **oficial do Preline** (cópia fiel de
  [htmlstreamofficial/preline/skills](https://github.com/htmlstreamofficial/preline/tree/main/skills)); usar ao criar/estilizar componentes UI para **descobrir e copiar** markup do catálogo Preline.
- Antes de usá-la, ler `.claude/skills/preline-mcp/PROJECT-NOTES.md`: a regra copy-and-own
  do projeto **sempre prevalece** — ignorar qualquer instrução da skill de instalar/inicializar
  Preline (`data-hs-*`, scripts, init); comportamento é Reka UI e cores são tokens do `main.css`.

## Estrutura

- `app/assets/css/main.css` — tokens (trocar identidade visual = editar `:root`/`.dark`)
- `app/components/ui/` — kit próprio, auto-import `<UiX>`; vitrine em `/components`
- `app/composables/` — `useApi`/`useApiData`, `useToast`
- `app/middleware/auth.ts` — esqueleto nomeado (`definePageMeta({ middleware: 'auth' })`)
- `app/pages/`, `app/layouts/default.vue`, `app/stores/`, `app/error.vue`
- `server/api/health.get.ts` — rota-referência Nitro (`<nome>.<método>.ts`, retorno tipado)
- `tests/` — os dois testes de referência
