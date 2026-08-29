# Especificação — Base Nuxt 4

> Documento de referência do projeto-base. Fechado em 2026-08-28, antes de qualquer código.

## 1. Objetivo

Repositório-modelo (template) em Nuxt 4 que sirva de ponto de partida para qualquer projeto:
dashboards/painéis atrás de login, sites com SEO, SaaS full-stack e frontends puros
consumindo API externa.

**Estratégia de reuso:** template primeiro — cada projeto nasce de uma cópia. Quando a base
estabilizar, o que for genérico será extraído para uma Nuxt Layer (fase futura, fora deste escopo).

## 2. Princípios

1. **Agnóstica com o terreno preparado** — a base não impõe backend, banco nem auth;
   ela deixa os pontos de encaixe prontos e documentados.
2. **Enxuta** — tudo que entra na base é carregado por todos os projetos futuros.
   Na dúvida, fica de fora com receita documentada.
3. **Copy-and-own na UI** — nenhuma biblioteca de componentes estilizados como dependência.
   O visual é nosso; referências externas são fonte de cópia, não runtime.
4. **100% Vue-nativa** — comportamento de UI vive no Vue (via Reka UI), nunca em
   plugins JS vanilla que manipulam o DOM por fora.

## 3. Fundação

- **Nuxt 4** com estrutura `app/`
- **TypeScript estrito**
- **pnpm** como gerenciador de pacotes
- **SSR ligado por padrão.** O ajuste por tipo de projeto é documentado no README:
  - Dashboard SPA → `ssr: false` global ou `routeRules` por rota
  - Site com SEO → padrão da base, com `routeRules` de prerender onde couber
- **`runtimeConfig` como única fonte de configuração de ambiente**, espelhado num
  `.env.example` sempre atualizado

## 4. UI e Design System

- **Tailwind 4** (config CSS-first): tokens do projeto via `@theme` — cores, tipografia,
  espaçamento, raios. Trocar a identidade visual de um projeto = editar tokens.
- **Kit de componentes próprio** em `app/components/ui/`:
  - **Comportamento:** Reka UI (headless — foco, teclado, ARIA resolvidos)
  - **Visual:** markup portado do Preline UI (core MIT), adaptado aos nossos tokens.
    Variantes próprias do Preline (`hs-*`) são traduzidas para os estados do Reka
    (`data-[state=open]:` etc.)
  - **Preline nunca entra como dependência** — nem o pacote npm, nem o plugin JS.
    É catálogo de referência e fonte de cópia.
- **Kit inicial (mínimo fechado):** Button, Input, Select, Modal, Card, Badge, Table, Toast.
  Table começa simples (markup + slots) e evolui conforme demanda real.
- **Dark mode** funcionando via `@nuxt/color-mode`, integrado aos tokens.
- **Módulos:** `@nuxt/icon`, `@nuxt/fonts`, `@nuxt/image`.

## 5. Dados e API

- **`useApi`** — composable central: wrapper de `$fetch`/`useFetch` com:
  - baseURL vinda do `runtimeConfig` (aponta para o Nitro próprio ou para API externa)
  - injeção de credencial (preparada, sem implementação de auth fixa)
  - tratamento de erro padronizado e tipagem de resposta
- **`server/`** estruturado com exemplo mínimo (rota de healthcheck).
  **Sem ORM e sem banco** — entram por projeto.
- **Pinia** com um store de exemplo definindo o padrão da casa (setup stores).
- **VueUse** disponível.

## 6. Auth — pontos de encaixe, sem implementação

A base **não implementa** autenticação. Ela entrega:

- Middleware de rota `auth` (esqueleto documentado)
- Página `/login` placeholder
- `useApi` já preparado para injetar credencial
- **Duas receitas no README:**
  1. Sessão no servidor (SaaS full-stack) → `nuxt-auth-utils`
  2. Token contra API externa (frontend puro) → armazenamento + injeção no `useApi`

## 7. DX e Qualidade

- **`@nuxt/eslint`** flat config, com formatação inclusa (sem Prettier)
- **Vitest + `@nuxt/test-utils`**: um teste de componente e um de composable como referência
- **`simple-git-hooks` + `lint-staged`**: lint no pre-commit
- **CI (GitHub Actions):** lint + typecheck + test
- **`CLAUDE.md`** com as convenções da base — herdado por todos os projetos

## 8. Estrutura de pastas (proposta)

```
app/
  assets/css/        # main.css com @theme (tokens)
  components/
    ui/              # kit próprio (Button, Input, Modal, ...)
  composables/       # useApi, ...
  layouts/           # default
  middleware/        # auth (esqueleto)
  pages/             # index, login (placeholder)
  stores/            # exemplo Pinia
  error.vue          # erro global + 404
server/
  api/               # healthcheck de exemplo
public/
.env.example
CLAUDE.md
README.md            # convenções + receitas (SSR/SPA, auth, deploy)
SPEC.md              # este documento
```

## 9. Fora do escopo (por decisão, não esquecimento)

i18n, ORM/banco, upload de arquivos, filas, e-mail, billing, PWA, admin.
Entram por projeto; quando um padrão se repetir, vira receita no README — não código na base.

## 10. Critérios de pronto

A base está pronta quando, a partir de um clone limpo:

1. `pnpm install && pnpm dev` sobe sem erro e sem warning
2. Lint, typecheck e testes passam (`pnpm lint`, `pnpm typecheck`, `pnpm test`)
3. Dark mode alterna corretamente em todos os componentes do kit
4. Todos os componentes do kit inicial existem, com uso demonstrado em uma página de exemplo
5. `useApi` funciona contra o healthcheck do próprio Nitro
6. README cobre: trocar tokens de tema, escolher SSR/SPA, as duas receitas de auth
7. Virar um projeto novo = renomear + editar tokens + apagar exemplos
