# Nuxt Base

Template Nuxt 4 que serve de ponto de partida para qualquer projeto: dashboard atrás de login, site com SEO, SaaS full-stack ou frontend puro contra API externa. A base é **agnóstica** (não impõe backend, banco nem auth — deixa os pontos de encaixe prontos), **enxuta** (na dúvida, fica de fora com receita documentada) e **copy-and-own na UI** (o visual é nosso; bibliotecas estilizadas não entram como dependência). A especificação completa está em [SPEC.md](./SPEC.md).

## Requisitos

- **Node 22.19+** (ou 24.11+ — o CI usa Node 24)
- **pnpm 11** — a versão exata está pinada em `packageManager` no `package.json`

## Comandos

```bash
pnpm install        # instala dependências e roda nuxt prepare
pnpm dev            # servidor de desenvolvimento em http://localhost:3000
pnpm build          # build de produção (.output/)
pnpm preview        # serve o build localmente
pnpm lint           # ESLint (inclui formatação — não há Prettier)
pnpm lint:fix       # ESLint com autofix
pnpm typecheck      # vue-tsc via nuxt typecheck
pnpm test           # Vitest (uma execução)
pnpm test:watch     # Vitest em modo watch
```

## Estrutura de pastas

```
app/                      # código da aplicação (srcDir do Nuxt 4)
  assets/css/main.css     # design tokens (Tailwind 4 CSS-first) — identidade visual vive aqui
  components/ui/          # kit próprio: Button, Input, Select, Modal, Card, Badge, Table, Toaster
  composables/            # useApi/useApiData (porta única para a API), useToast
  layouts/default.vue     # header + nav + toggle de tema + <UiToaster />
  middleware/auth.ts      # esqueleto do middleware de rota (auth é ponto de encaixe)
  pages/                  # index, login (placeholder), components (vitrine do kit)
  stores/app.ts           # store-referência Pinia (setup store)
  error.vue               # página de erro global + 404
server/
  api/health.get.ts       # rota-referência do Nitro (GET /api/health)
tests/
  components/             # teste-referência de componente (mountSuspended)
  composables/            # teste-referência de composable (registerEndpoint)
.env.example              # espelho documentado do runtimeConfig
nuxt.config.ts            # módulos, css, runtimeConfig
vitest.config.ts          # ambiente nuxt global + happy-dom
CLAUDE.md                 # convenções para sessões de IA
SPEC.md                   # especificação da base
```

## Como virar um projeto novo

Virar um projeto novo = renomear + editar tokens + apagar exemplos (SPEC §10.7):

1. **Copie a base e zere o histórico**: `rm -rf .git && git init`.
2. **Renomeie** em dois lugares:
   - `package.json` → campo `"name"`;
   - `server/api/health.get.ts` → `service: 'nuxt-base'` (o healthcheck reporta o nome do serviço).
3. **Edite os tokens** em `app/assets/css/main.css`, apenas os blocos `:root` e `.dark` (cores) e, se quiser, `--font-sans` e `--radius-*` no `@theme inline`. Nada mais precisa mudar para trocar a identidade visual — ver [Tema](#tema-identidade-visual).
4. **Apague/substitua os exemplos**:
   - `app/pages/components.vue` — vitrine do kit; apague junto com o link "Componentes" no header de `app/layouts/default.vue`;
   - `app/pages/index.vue` — conteúdo de demonstração; substitua pelo do projeto;
   - `app/pages/login.vue` — placeholder; substitua ao implementar uma das [receitas de auth](#auth-duas-receitas);
   - `app/layouts/default.vue` — troque a marca "Nuxt Base" no header/footer;
   - `app/stores/app.ts` — store-referência; adapte ou apague (novos stores seguem o mesmo formato).
5. **Configure o ambiente**: copie `.env.example` para `.env` e ajuste (ex.: `NUXT_PUBLIC_API_BASE` se for consumir API externa).
6. **Valide**: `pnpm install && pnpm dev` deve subir sem erro; confira `http://localhost:3000` e `http://localhost:3000/api/health`. `pnpm lint && pnpm typecheck && pnpm test` devem passar.

Os testes de referência em `tests/` cobrem `UiButton` e `useApi` — continuam válidos no projeto novo enquanto esses arquivos existirem.

## Tema (identidade visual)

Os tokens vivem em `app/assets/css/main.css`, em duas camadas:

- **Camada 1** — `:root` (tema claro) e `.dark` (tema escuro) definem os **valores** de cada token semântico. **Trocar a identidade visual do projeto = editar só esses dois blocos.**
- **Camada 2** — `@theme inline` registra os tokens como utilities do Tailwind (`bg-primary`, `text-foreground`, `rounded-box`, …). Só é editada para criar token novo.

| Token | Papel |
|---|---|
| `background` / `foreground` | fundo e texto da página |
| `card` / `card-foreground` | superfícies elevadas (cards, modais) |
| `muted` / `muted-foreground` | fundos discretos e texto secundário |
| `border` | bordas e divisores |
| `primary` / `primary-hover` / `primary-foreground` | ação principal |
| `destructive` / `destructive-foreground` | ações destrutivas e erros |
| `ring` | anel de foco |
| `--radius-box` → `rounded-box` | raio de containers (cards, modais) |
| `--radius-field` → `rounded-field` | raio de controles (botões, inputs) |
| `--font-sans` | tipografia base |

Regra da casa: **componentes e páginas usam apenas tokens semânticos** — nunca cor bruta (`bg-blue-600`, hex). Se precisar de uma cor nova, crie um token.

O dark mode é do `@nuxtjs/color-mode` (classe `dark` no `<html>`, preferência persistida). O toggle está no layout default: `colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'`. Em SSR, renderize ícones dependentes do tema dentro de `<ClientOnly>` (o valor efetivo só é conhecido no client).

## SSR ou SPA

A base vem com **SSR ligado** (bom para SEO e primeira pintura). Ajuste por tipo de projeto no `nuxt.config.ts`:

```ts
// Dashboard/painel 100% atrás de login → SPA global
export default defineNuxtConfig({
  ssr: false,
})
```

```ts
// Misto: só a área logada vira SPA; o resto continua SSR
export default defineNuxtConfig({
  routeRules: {
    '/app/**': { ssr: false }, // área logada renderiza só no client
    '/': { prerender: true }, // landing gerada no build
  },
})
```

Site com SEO: mantenha o padrão da base e acrescente `prerender`/`swr` nas rotas que couber.

## API e dados

Toda chamada HTTP sai por `app/composables/useApi.ts`:

- **`useApi()`** → instância configurada de `$fetch` para chamadas imperativas (handlers de evento, stores, middleware):

  ```ts
  const api = useApi()
  const user = await api<User>('/users/42')
  await api('/users/42', { method: 'PATCH', body: { name: 'Ana' } })
  ```

- **`useApiData<T>(url, options?)`** → wrapper de `useFetch` com a mesma instância, para data fetching SSR-friendly no setup de componentes:

  ```ts
  const { data: users, status, error } = await useApiData<User[]>('/users')
  ```

Comportamento embutido:

- **baseURL** vem de `runtimeConfig.public.apiBase` (default `/api`, o Nitro do próprio app). Para consumir API externa, defina `NUXT_PUBLIC_API_BASE=https://api.exemplo.com` no `.env`.
- **Credencial**: se o cookie `auth.token` tiver valor, toda chamada sai com `Authorization: Bearer <token>` (ver receita 2 de auth). Sem cookie, nenhum header é enviado.
- **Erros padronizados**: respostas de erro rejeitam com `createError` no formato `ApiError` — `{ statusCode, statusMessage, data }`.
- **401 no client** redireciona para `/login` (remova ou ajuste no `useApi` se o projeto não usar esse fluxo).

Healthcheck de referência: `GET /api/health` → `{ status: 'ok', service: 'nuxt-base', timestamp }`. Novos endpoints Nitro seguem o formato de `server/api/health.get.ts` (arquivo `<nome>.<método>.ts` + retorno tipado).

## Auth: duas receitas

A base **não implementa** autenticação — entrega o middleware `auth` (esqueleto em `app/middleware/auth.ts`), a página `/login` placeholder e o `useApi` preparado para injetar credencial. Proteja páginas com `definePageMeta({ middleware: 'auth' })` e escolha uma receita:

### Receita 1 — sessão no servidor (SaaS full-stack) com `nuxt-auth-utils`

Sessão em cookie selado/criptografado, gerenciada pelo próprio Nitro. Recomendação oficial do time Nuxt.

```bash
npx nuxi module add auth-utils
```

Defina `NUXT_SESSION_PASSWORD` no `.env` (mínimo 32 caracteres; em dev é gerada automaticamente no primeiro `nuxt dev`, em produção é obrigatória — já documentada no `.env.example`).

```ts
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const user = await verifyCredentials(email, password) // sua validação (banco, serviço, …)
  await setUserSession(event, { user: { email: user.email } })
  return { ok: true }
})
```

No client, `useUserSession()` expõe `{ loggedIn, user, session, clear }`. Em `app/middleware/auth.ts`, descomente o bloco da receita 1:

```ts
const { loggedIn } = useUserSession()
if (!loggedIn.value) {
  return navigateTo('/login')
}
```

Em rotas de API protegidas, use `await requireUserSession(event)` no início do handler.

### Receita 2 — token contra API externa (frontend puro)

O login troca credenciais por um token na API externa e o grava no cookie `auth.token` — o mesmo que o `useApi` já lê para injetar o `Bearer`.

Aponte a base para a API externa no `.env`: `NUXT_PUBLIC_API_BASE=https://api.exemplo.com`.

```ts
// essência da página de login
const email = ref('')
const password = ref('')
const token = useCookie('auth.token', { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })

async function submit() {
  const api = useApi()
  const response = await api<{ token: string }>('/auth/login', {
    method: 'POST',
    body: { email: email.value, password: password.value },
  })
  token.value = response.token
  await navigateTo('/')
}
```

Em `app/middleware/auth.ts`, descomente o bloco da receita 2:

```ts
const token = useCookie('auth.token')
if (!token.value) {
  return navigateTo('/login')
}
```

A partir daí toda chamada do `useApi` sai autenticada; um 401 da API derruba o usuário de volta para `/login` (comportamento já embutido). Logout = `useCookie('auth.token').value = null`.

## Componentes de UI

O kit vive em `app/components/ui/` e é auto-importado com prefixo `Ui` (`<UiButton>`, `<UiModal>`, …). A vitrine com todos os componentes em uso está em `/components`.

| Componente | Props essenciais | Slots |
|---|---|---|
| `UiButton` | `variant` (`solid` \| `outline` \| `ghost` \| `destructive`), `size` (`sm` \| `md` \| `lg`), `disabled`, `type` | default |
| `UiInput` | `v-model`, `label`, `hint`, `error`, `type`, `placeholder`, `disabled` | — |
| `UiSelect` | `v-model`, `items: { label, value, disabled? }[]`, `label`, `placeholder`, `error`, `disabled` | — |
| `UiModal` | `v-model:open`, `title` (obrigatória), `description` | `trigger`, default, `footer` |
| `UiCard` | — | `header`, default, `footer` |
| `UiBadge` | `variant` (`neutral` \| `primary` \| `destructive` \| `outline`) | default |
| `UiTable` | `columns: { key, label }[]`, `rows` | `#cell-[key]` recebe `{ row, value }` |
| `UiToaster` | montado uma única vez no layout default | — |

Toasts são imperativos, via composable: `useToast()` retorna `{ toasts, dismiss, success, error, info }` — ex.: `toast.success('Salvo.', { title: 'Pronto', duration: 8000 })`.

**Regra do copy-and-own** (SPEC §2 e §4): o **comportamento** vem do Reka UI (headless — foco, teclado e ARIA resolvidos; esse sim é dependência) e o **visual** é markup portado do Preline UI, adaptado aos nossos tokens. **Preline nunca entra como dependência** — nem o pacote npm, nem o plugin JS; é catálogo de referência e fonte de cópia. Componente novo segue o mesmo caminho: escolher o primitivo Reka, portar o markup do Preline, traduzir variantes `hs-*` para os estados `data-[state=…]` do Reka e usar apenas tokens semânticos. Visual inspirado no [Preline UI](https://preline.co) (MIT).

## Testes

Stack: **Vitest 4 + `@nuxt/test-utils` + happy-dom**, com ambiente `nuxt` global (`vitest.config.ts`) — todo teste roda com o runtime do Nuxt (auto-imports, plugins, `#components`, `#imports`).

Dois testes de referência definem o padrão da casa — copie a estrutura deles:

- **Componente** → `tests/components/button.spec.ts`: `mountSuspended` de `@nuxt/test-utils/runtime` + import do componente via `#components`. Cobre render de slot, classes por variante e estado disabled.
- **Composable/API** → `tests/composables/use-api.spec.ts`: `registerEndpoint` de `@nuxt/test-utils/runtime` mocka rotas no Nitro de teste — sem rede real. Atenção: registre o caminho **completo**, incluindo o prefixo da baseURL (`/api/ping`, não `/ping`). Cobre resposta feliz tipada, erro padronizado e a injeção condicional do header `Authorization`.

```bash
pnpm test          # uma execução (é o que o CI roda)
pnpm test:watch    # watch mode durante o desenvolvimento
```

## CI e hooks de git

- **Pre-commit** (local): `simple-git-hooks` roda `lint-staged`, que aplica `eslint --fix` nos arquivos staged (`.js`, `.mjs`, `.ts`, `.vue`). Os hooks são instalados no `pnpm install`; se alterar a config `simple-git-hooks` do `package.json`, rode `pnpm exec simple-git-hooks` para reinstalar.
- **CI** (GitHub Actions, `.github/workflows/ci.yml`): a cada push na `main` e em todo pull request roda `pnpm install`, `pnpm lint`, `pnpm typecheck` e `pnpm test`, em Node 24, com a versão do pnpm lida do campo `packageManager`.
