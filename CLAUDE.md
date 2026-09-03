# CLAUDE.md — Nuxt Base

Template Nuxt 4 agnóstico (sem backend/banco/auth impostos), enxuto, copy-and-own na UI.
As convenções abaixo são **autossuficientes**: valem sem consultar nenhum outro documento.
Receitas (tema, SSR/SPA, API, auth, headers, atualizar a base) ficam no [README.md](./README.md).
Projeto derivado atualiza-se por merge do remoto `template` — README, "Atualizar a base no derivado".

> Só do template: [docs/SPEC.md](./docs/SPEC.md), a especificação fechada. Ao derivar, esta linha sai junto com o arquivo.

## Stack

- Nuxt 4.5 (estrutura `app/`, SSR ligado) + Vue 3.5 + TypeScript estrito
- Tailwind 4 CSS-first via `@tailwindcss/vite` (tokens em `app/assets/css/main.css`)
- Reka UI 2 (headless, dependência) + visual portado do Preline (nunca dependência)
- Pinia 4, VueUse 14, `@nuxtjs/color-mode` (classe `dark` no `<html>`)
- Vitest 4 + `@nuxt/test-utils` + happy-dom (ambiente `nuxt` global)
- pnpm 11 (pinado em `packageManager`), ESLint via `@nuxt/eslint` com `stylistic: true` (formatação pelo ESLint, sem Prettier)
  + regras anti-duplicação do `sonarjs`; `knip` para código morto (`knip.jsonc`);
  `jscpd` para copy-paste (`.jscpd.json`, threshold 0 — clone novo falha o CI)
- Hooks via `lefthook.yml`: pre-commit lint dos staged; pre-push `pnpm verify`

## Comandos

- `pnpm dev` / `pnpm build`
- `pnpm lint` / `pnpm lint:fix` / `pnpm typecheck` / `pnpm test` / `pnpm test:watch` / `pnpm knip` / `pnpm dup`
- `pnpm smoke` — gate de runtime (`scripts/smoke.mjs`): builda, sobe produção **e** `nuxt dev`,
  requisita as rotas de referência e reprova se alguma asserção quebrar **ou** se o log do
  servidor tiver WARN/ERROR. É o único gate que roda o app.
- `pnpm verify` — lint + typecheck + test + knip + dup + smoke, o espelho do CI.
  **Rode antes de dizer que terminou: "deveria funcionar" não é terminado.**

## Convenções inegociáveis

- SFCs: `<script setup lang="ts">` sempre, ordem script → template.
- **Reuso antes de criar**: confira `app/components/ui/` (e a vitrine `/components`) e
  `app/composables/` antes de criar componente ou composable — estender vence duplicar.
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
  Modelos em `tests/nuxt/components/button.spec.ts` e `tests/nuxt/composables/use-api.spec.ts`
  (specs ficam em `tests/nuxt/` para serem cobertos pelo `nuxt typecheck`).
- **TypeScript pinado em 6.x — NÃO atualizar para 7.x** (tsgo quebra o vue-tsc/`nuxt typecheck`).
- `runtimeConfig` é a única fonte de config de ambiente; toda variável nova entra documentada
  no `.env.example`. Segredo nunca em código nem em `public.*` (gitleaks varre no CI).
- `console.*` em `server/` é erro de lint (derivado que precisar de log adota pino — README);
  no `app/` só `console.warn`/`error` passam, e produção remove log/info/debug do bundle.
- **Validação em runtime só vale com o log colado.** Mudou rota, `error.vue`, `nuxt.config.ts`,
  módulo ou qualquer coisa de `server/`? Terminado = `pnpm smoke` verde **com a saída anexada**
  na resposta. "Subi e testei" sem log não é evidência: foi assim que um 404 com `fatal: true`
  passou logando stack trace a cada requisição.
- Auth é ponto de encaixe: não implementar na base; seguir uma das duas receitas do README.

## Skills

- `.claude/skills/preline-mcp/` — skill **oficial do Preline** (cópia fiel de
  [htmlstreamofficial/preline/skills](https://github.com/htmlstreamofficial/preline/tree/main/skills)); usar ao criar/estilizar componentes UI para **descobrir e copiar** markup do catálogo Preline.
- Antes de usá-la, ler `.claude/skills/preline-mcp/PROJECT-NOTES.md`: a regra copy-and-own
  do projeto **sempre prevalece** — ignorar qualquer instrução da skill de instalar/inicializar
  Preline (`data-hs-*`, scripts, init); comportamento é Reka UI e cores são tokens do `main.css`.
- `.claude/skills/novo-componente-ui/` — fluxo da casa para criar componente novo no kit
  `app/components/ui/` (Reka + Preline traduzido + vitrine + teste); usar ao estender o kit.
- `.claude/skills/derivar-projeto/` — roteiro para transformar o template num projeto novo
  (clone com histórico, renomear, tokens, SSR/SPA, auth, limpar exemplos); usar ao derivar a base.
  É **só do template**: o derivado a apaga depois de usar, junto com os `evals/` das outras skills.
- `.claude/skills/ci-verde/` — prevenção e diagnóstico de CI (`pnpm verify`, `gh run`,
  catálogo de falhas conhecidas); usar quando o CI falhar ou antes de push importante.
- API de primitivos do Reka UI: a fonte canônica é a doc oficial indexada em
  <https://reka-ui.com/llms.txt> — consultar ao usar um primitivo ainda ausente do kit
  (Tooltip, Combobox, DatePicker, …) em vez de confiar em memória de versões antigas.
- Recurso/API do Nuxt que gere dúvida de versão: consultar <https://nuxt.com/llms.txt>
  (docs completas da v4 indexadas para LLMs; versão integral em `llms-full.txt`).

## Estrutura

- `app/assets/css/main.css` — tokens (trocar identidade visual = editar `:root`/`.dark`)
- `app/components/ui/` — kit próprio, auto-import `<UiX>`; vitrine em `/components`
- `app/composables/` — `useApi`/`useApiData`, `useToast`
- `app/middleware/auth.ts` — esqueleto nomeado (`definePageMeta({ middleware: 'auth' })`)
- `app/pages/`, `app/layouts/default.vue`, `app/stores/`, `app/error.vue`
- `server/api/health.get.ts` — rota-referência Nitro (`<nome>.<método>.ts`, retorno tipado)
- `scripts/smoke.mjs` — gate de runtime (`pnpm smoke`), Node puro, sem dependência
- `tests/` — os dois testes de referência
