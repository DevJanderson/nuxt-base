# Especificação — Base Nuxt 4

> Documento de referência do projeto-base. Fechado em 2026-08-28, antes de qualquer código;
> **revisado em 2026-08-29** para refletir a base construída (kit, skills e guardrails) e em
> **2026-09-03** para fixar a estratégia de reuso (clone com histórico) e a lista "só do template".
> Arquivo **só do template**: não viaja para os projetos derivados.

## 1. Objetivo

Repositório-modelo (template) em Nuxt 4 que sirva de ponto de partida para qualquer projeto:
dashboards/painéis atrás de login, sites com SEO, SaaS full-stack e frontends puros
consumindo API externa. Publicado como Template repository em
<https://github.com/DevJanderson/nuxt-base>.

**Estratégia de reuso: clone com histórico.** Cada projeto nasce de um `git clone` da base,
com o remoto renomeado para `template` e um `origin` próprio **criado vazio** (`gh repo create
<nome> --private`, sem `--template` e sem README inicial: commit inicial alheio mata o ancestral
comum). Atualizar o derivado = `git fetch template --tags && git merge vX.Y.Z`; a receita, a
lista "só do template" e a tabela de conflitos vivem no README, seção **"Atualizar a base no
derivado"** — a única seção do README que permanece no derivado. "Use this template" continua
possível e é o começo mais rápido, mas o repo nasce com um único commit, sem ancestral comum:
derivado assim **não recebe evolução por merge**.

**Nuxt Layer adiada:** extrair o genérico para uma Nuxt Layer só quando existirem
**2–3 derivados reais**. Antes disso não há evidência do que de fato é genérico, e a Layer
cobra publicação e versionamento que o merge não cobra.

## 2. Princípios

1. **Agnóstica com o terreno preparado** — a base não impõe backend, banco nem auth;
   ela deixa os pontos de encaixe prontos e documentados.
2. **Enxuta** — tudo que entra na base é carregado por todos os projetos futuros.
   Na dúvida, fica de fora com receita documentada.
3. **Copy-and-own na UI** — nenhuma biblioteca de componentes estilizados como dependência.
   O visual é nosso; referências externas são fonte de cópia, não runtime.
4. **100% Vue-nativa** — comportamento de UI vive no Vue (via Reka UI), nunca em
   plugins JS vanilla que manipulam o DOM por fora.
5. **Convenção que importa vira código executável** — regra crítica ganha teste-inventário,
   regra de lint ou gate de CI; documento sozinho não segura regressão.

## 3. Fundação

- **Nuxt 4** com estrutura `app/`
- **TypeScript estrito** — **pinado em 6.x** (7.x/tsgo quebra `vue-tsc`/`nuxt typecheck`;
  o Renovate bloqueia o major)
- **Node 24+** — mesma versão em todo lugar: `engines.node`, `.node-version` e o runner do CI
- **pnpm 11** (pinado em `packageManager`; build scripts liberados via `allowBuilds`).
  **Toda dependência em versão exata** (sem `^`/`~`): atualizar é decisão do Renovate com CI verde
- **SSR ligado por padrão.** Ajuste por tipo de projeto documentado no README
  (dashboard SPA → `ssr: false` ou `routeRules`)
- **`runtimeConfig` como única fonte de configuração de ambiente**, espelhado num
  `.env.example` sempre atualizado

## 4. UI e Design System

- **Tailwind 4** (CSS-first via `@tailwindcss/vite`): tokens do projeto em
  `app/assets/css/main.css`, em duas camadas — valores por tema (`:root`/`.dark`) e
  registro como utilities (`@theme inline`, obrigatório pela indireção `var()`).
  Trocar a identidade visual de um projeto = editar os blocos de tema.
- **Dark mode** via `@nuxtjs/color-mode` (classe `dark`, `@custom-variant` no CSS).
  **Tema claro é o padrão** (`preference: 'light'`); o toggle do layout persiste a
  escolha do usuário.
- **Kit de componentes próprio** em `app/components/ui/` (auto-import `<UiX>`):
  - **Comportamento:** Reka UI (headless — foco, teclado, ARIA). API de primitivos:
    fonte canônica <https://reka-ui.com/llms.txt>.
  - **Visual:** markup portado do Preline UI, adaptado aos tokens. Variantes `hs-*`
    traduzidas para estados Reka (`data-[state=…]`). **Preline nunca entra como
    dependência** — regras completas em `.claude/skills/preline-mcp/PROJECT-NOTES.md`.
- **Kit atual:** Button, Input, Select, Modal, Card, Badge, Table, Toast (Toaster +
  `useToast`), Tooltip. Vitrine em `/components`. Componente novo segue a skill
  `novo-componente-ui` e entra no smoke de regressão no mesmo commit.
- **Documento:** `app.head` no `nuxt.config.ts` fixa `htmlAttrs.lang` (a11y e SEO — sem isso o
  `<html>` sai sem idioma), `title` de fallback e `titleTemplate`.
- **Módulos:** `@nuxt/icon` (+ `@iconify-json/lucide` local) e `@nuxt/fonts`.
  `@nuxt/image` saiu da base e virou receita no README (o `sharp` do IPX custava ~19 MB
  de build de servidor para um recurso que nem todo projeto usa).
  A família de fonte é **declarada em `fonts.families`**: o scanner do `@nuxt/fonts` não
  enxerga o token dentro de `@theme inline` (bug upstream nuxt/fonts#638).

## 5. Dados e API

- **`useApi`** — wrapper tipado de `$fetch` (baseURL do `runtimeConfig.public.apiBase`,
  injeção condicional de Bearer via cookie `auth.token`, erro padronizado
  `ApiError { statusCode, statusMessage, data }`, redirect 401 → `/login` no client) +
  **`useApiData`** sobre `useFetch`. Toda chamada HTTP passa por aqui.
- **`server/`** com exemplo mínimo (`server/api/health.get.ts`). **Sem ORM e sem banco.**
- **Pinia** (setup stores; modelo em `app/stores/app.ts`) e **VueUse**.

## 6. Auth — pontos de encaixe, sem implementação

- Middleware nomeado `auth` (esqueleto), página `/login` placeholder, `useApi`
  preparado para credencial.
- **Duas receitas no README:** sessão no servidor (`nuxt-auth-utils`) e token contra
  API externa. Terceiro caso documentado na skill `derivar-projeto`: login futuro →
  manter encaixes, não instalar nada.

## 7. Qualidade e guardrails (anti-regressão)

Três camadas, todas espelhando o mesmo padrão:

- **Local, na mão:** `pnpm verify` = `lint && typecheck && test && knip && dup && smoke`.
  Regra da casa: *"deveria funcionar" não é terminado.*
- **Local, automático (lefthook):** pre-commit roda `eslint --fix` nos staged;
  pre-push roda `pnpm verify` inteiro.
- **CI (GitHub Actions):** push/PR → `install --frozen-lockfile`, `lint`, `typecheck`,
  `knip`, `dup`, `test`, `smoke` (que já builda) em Node 24 com `TZ: UTC` + job **gitleaks** (segredos,
  histórico completo). Semanal: `security.yml` (`pnpm audit --prod` como gate).
  **Renovate** configurado (não-majors agrupados; majors com aprovação; TS major bloqueado):
  `renovate.yml` é workflow **só do template** (lista fixa de repos + secret do dono) e o
  projeto derivado o apaga — o `renovate.json`, esse sim, fica em cada repositório.

Ferramentas e regras:

- **ESLint** (`@nuxt/eslint`, flat, `stylistic: true` — formatação é do lint, sem Prettier) + **sonarjs** (duplicação estrutural,
  complexidade) + **`no-console`** (erro em `server/` — receita pino no README; aviso no
  `app/` com `warn`/`error` liberados).
- **Editor alinhado por padrão:** `.editorconfig` e `.vscode/` versionados (extensões
  recomendadas + autofix do ESLint ao salvar, sem formatador concorrente).
- **knip** (código morto/deps sem uso, `knip.jsonc`) e **jscpd** (copy-paste,
  `.jscpd.json`, **threshold 0** — baseline da base é 0,00%).
- **`pnpm smoke`** (`scripts/smoke.mjs`, Node puro, sem dependência) — **gate de runtime**,
  a quarta ferramenta ao lado de ESLint, knip e jscpd, e a única que roda o app: builda,
  confere o teto de peso do `.output/server` (15 MB; hoje ~5 MB), sobe o servidor de
  produção **e** o `nuxt dev` em portas livres e requisita `/`, `/components`, `/login`,
  `/api/health` e uma URL inexistente. Reprova por asserção (status, `<html lang>`,
  `<title>`, JSON do health, 404 com a página de erro) **e por log sujo**: qualquer linha
  de stdout/stderr do servidor casando `/WARN|ERROR|request error|\[nuxt\] \[|VUE_ROUTER/`, e em produção stderr não vazio reprova por si só,
  derruba o gate (allowlist explícita no topo do script, hoje vazia). Nasceu de um caso
  real — 404 commitado com `fatal: true` logando stack trace a cada requisição, invisível
  para todos os outros gates.
- **Strip de console em produção** (client): `console.log/info/debug/trace` removidos do
  bundle via terser `pure_funcs` em `$production` (Vite 8/oxc ignora `vite.esbuild.*`;
  validado por inspeção de bundle).
- **Testes (Vitest + `@nuxt/test-utils`, ambiente `nuxt`, happy-dom):** referência de
  componente (`button.spec.ts`), de composable (`use-api.spec.ts` com `registerEndpoint`),
  **smoke de regressão do kit inteiro** (`kit-smoke.spec.ts`) e **teste-inventário**
  de tokens semânticos (`semantic-tokens.spec.ts` — cor bruta falha; allowlist podre falha).
  Specs vivem em `tests/nuxt/` (cobertos pelo `nuxt typecheck`).

## 8. Skills (automação de fluxo com IA)

Em `.claude/skills/`, viajam com o template para os derivados — exceto `derivar-projeto`
(usada uma vez, na derivação) e os `evals/` de todas elas, que são **só do template** (§9):

- **`preline-mcp`** — skill oficial do Preline (cópia fiel) + `PROJECT-NOTES.md` com as
  regras da casa, que sempre prevalecem.
- **`novo-componente-ui`** — fluxo de estender o kit (+ checklist de a11y + 4 evals).
- **`derivar-projeto`** — roteiro de virar projeto novo (+ 3 evals; corrigida após teste
  real em clone).
- **`ci-verde`** — prevenção e diagnóstico de CI (+ catálogo de falhas conhecidas
  vivido em produção + 4 evals).

Evals no formato skill-creator (`evals/evals.json`), executáveis via plugin oficial.

## 9. Estrutura

```
app/
  assets/css/main.css   # tokens (identidade visual = editar :root/.dark)
  components/ui/        # kit próprio (9 componentes); vitrine em /components
  composables/          # useApi/useApiData, useToast
  layouts/ pages/ stores/ middleware/ error.vue
server/api/health.get.ts
tests/nuxt/             # referência + smoke + inventário (cobertos pelo typecheck)
.claude/skills/         # as 4 skills
.github/workflows/      # ci.yml, security.yml
lefthook.yml  knip.jsonc  .jscpd.json  renovate.json
docs/SPEC.md  .env.example  CLAUDE.md  README.md
```

**Só do template** — apagados na derivação e apagados de novo (`git rm`) nos conflitos
modify/delete de cada merge: `docs/SPEC.md`, `.github/workflows/renovate.yml`,
`.claude/skills/derivar-projeto/`, `.claude/skills/*/evals/` e a seção "Como virar um projeto
novo" do README. A lista **canônica**, com o porquê de cada item e a regra de resolução, mora
no README ("Atualizar a base no derivado"), que é justamente o que fica no derivado — daí o
`CLAUDE.md` ser autossuficiente e não depender de "ver SPEC §N". `app/pages/components.vue`
(vitrine) é opcional, não "só do template".

## 10. Fora do escopo (por decisão, não esquecimento)

i18n, ORM/banco, upload de arquivos, filas, e-mail, billing, PWA, admin, e2e Playwright,
logger estruturado (pino — receita no README), otimização de imagens (`@nuxt/image` —
receita no README; o `sharp` do IPX pesa ~19 MB no build de servidor). Entram por
projeto; padrão que se repetir vira receita no README — não código na base.

## 11. Critérios de pronto

A partir de um clone limpo:

1. `pnpm smoke` verde: build, servidor de produção e `nuxt dev` sobem, as rotas de
   referência respondem e **nenhum** dos dois logs tem WARN/ERROR (o antigo "`pnpm dev`
   sem erro e sem warning", que era conferência manual, virou gate executável)
2. `pnpm verify` verde (lint, typecheck, testes, knip, jscpd, smoke)
3. Bundle de produção sem `console.log` (verificável por marcador)
4. Tema claro por padrão; dark mode alterna corretamente em todos os componentes do kit
5. Kit completo com uso demonstrado em `/components`; todo componente no smoke de regressão
6. `useApi` funciona contra o healthcheck do próprio Nitro
7. README cobre: tema, SSR/SPA, as duas receitas de auth, guardrails
8. Virar um projeto novo = skill `derivar-projeto` (clone com histórico + renomear + tokens +
   limpar exemplos + apagar os "só do template")
9. **Derivado consegue fazer merge de uma tag nova da base:** `git fetch template --tags &&
   git merge vX.Y.Z` produz só os conflitos previstos no README, e `pnpm install && pnpm verify`
   fecham verdes antes do commit de merge
