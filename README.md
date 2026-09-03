# Nuxt Base

Template Nuxt 4 que serve de ponto de partida para qualquer projeto: dashboard atrás de login, site com SEO, SaaS full-stack ou frontend puro contra API externa. A base é **agnóstica** (não impõe backend, banco nem auth — deixa os pontos de encaixe prontos), **enxuta** (na dúvida, fica de fora com receita documentada) e **copy-and-own na UI** (o visual é nosso; bibliotecas estilizadas não entram como dependência). A especificação do template está em [docs/SPEC.md](./docs/SPEC.md) — arquivo **só do template**, que não viaja para os projetos derivados.

## Requisitos

- **Node 24+** — é o que o CI usa, o que `engines.node` exige e o que o `.node-version` seleciona (`fnm use`, `nvm use`, `asdf`)
- **pnpm 11** — a versão exata está pinada em `packageManager` no `package.json`

## Comandos

```bash
pnpm install        # instala dependências e roda nuxt prepare
pnpm dev            # servidor de desenvolvimento em http://localhost:3000
pnpm build          # build de produção (.output/)
pnpm preview        # serve o build localmente
pnpm lint           # ESLint, inclusive formatação (regras @stylistic do @nuxt/eslint) — não há Prettier
pnpm lint:fix       # ESLint com autofix
pnpm typecheck      # vue-tsc via nuxt typecheck
pnpm test           # Vitest (uma execução)
pnpm test:watch     # Vitest em modo watch
pnpm smoke          # gate de runtime: builda, sobe produção e dev, requisita as rotas, lê o log
pnpm verify         # lint + typecheck + test + knip + dup + smoke (o espelho do CI)
```

## Estrutura de pastas

```
app/                      # código da aplicação (srcDir do Nuxt 4)
  assets/css/main.css     # design tokens (Tailwind 4 CSS-first) — identidade visual vive aqui
  components/ui/          # kit próprio: Button, Input, Select, Modal, Card, Badge, Table, Toaster, Tooltip
  composables/            # useApi/useApiData (porta única para a API), useToast
  layouts/default.vue     # header + nav + toggle de tema + <UiToaster />
  middleware/auth.ts      # esqueleto do middleware de rota (auth é ponto de encaixe)
  pages/                  # index, login (placeholder), components (vitrine do kit)
  stores/app.ts           # store-referência Pinia (setup store)
  error.vue               # página de erro global + 404
server/
  api/health.get.ts       # rota-referência do Nitro (GET /api/health)
tests/nuxt/               # specs aqui entram no nuxt typecheck
  components/             # referência (mountSuspended) + smoke de regressão do kit
  composables/            # teste-referência de composable (registerEndpoint)
  conventions/            # teste-inventário: só tokens semânticos
.claude/skills/           # skills de IA (preline-mcp, novo-componente-ui, derivar-projeto, ci-verde)
.env.example              # espelho documentado do runtimeConfig
nuxt.config.ts            # módulos, css, runtimeConfig
vitest.config.ts          # ambiente nuxt global + happy-dom
CLAUDE.md                 # convenções para sessões de IA
docs/SPEC.md              # especificação do template (não viaja para o derivado)
```

## Como virar um projeto novo

**TL;DR** — do zero ao codando, sem perder o vínculo com a base:

```bash
gh repo create meu-projeto --private     # repositório VAZIO: sem --template, sem --add-readme
git clone git@github.com:DevJanderson/nuxt-base.git meu-projeto
cd meu-projeto
git remote rename origin template        # a base vira remoto de leitura
git remote add origin git@github.com:<owner>/meu-projeto.git
git push -u origin main
pnpm install    # deps + git hooks (lefthook) sozinho
claude          # e dentro da sessão: /derivar-projeto meu-projeto
```

Virar um projeto novo = renomear + editar tokens + limpar exemplos + apagar os arquivos "só do template". Dois caminhos:

1. **Clone com histórico (recomendado)** — o do TL;DR. O derivado nasce com o histórico da base e com o remoto `template` apontando para ela, então **continua recebendo as evoluções**: `git fetch template --tags && git merge vX.Y.Z` (ver [Atualizar a base no derivado](#atualizar-a-base-no-derivado)). Por isso o repositório novo é criado **vazio**: qualquer commit inicial gerado pelo GitHub (README, licença, `--template`) vira uma raiz de histórico diferente da base, e todo merge futuro morre em `refusing to merge unrelated histories`.
2. **"Use this template" (sem atualizações futuras)** — `gh repo create <nome> --template DevJanderson/nuxt-base --private --clone`, ou o botão do GitHub. Continua funcionando e é o começo mais rápido, mas o GitHub monta o repo com **um único commit inicial**, sem ancestral comum com a base: não há `git merge` possível, e trazer uma correção da base vira cópia de arquivo à mão. Escolha só se o projeto não pretende acompanhar a base. Cópia manual (`rm -rf .git && git init`) é o mesmo caso, com um passo extra: zerar o `.git` apaga os git hooks, então rode `pnpm exec lefthook install`.

Em qualquer caminho, a skill `/derivar-projeto <nome>` executa o roteiro completo e valida os gates — a fonte canônica dos passos, sempre atualizada, é `.claude/skills/derivar-projeto/`:

1. **Apague os arquivos "só do template"** — a lista, com o porquê de cada item, está logo abaixo em [Atualizar a base no derivado](#atualizar-a-base-no-derivado). É a mesma lista que reaparece como conflito em cada merge futuro.
2. **Renomeie** em dois lugares: `package.json` → campo `"name"`; `server/api/health.get.ts` → campo `service` (o healthcheck reporta o nome do serviço).
3. **Tokens** em `app/assets/css/main.css`, apenas os blocos `:root` e `.dark` (e, se quiser, `--font-sans`/`--radius-*`) — ver [Tema](#tema-identidade-visual). Sem identidade definida ainda? Mantenha o padrão e siga: trocar depois é editar só esses dois blocos.
4. **Renderização**: site/SEO mantém o SSR padrão; dashboard atrás de login → `ssr: false`; misto → `routeRules` — ver [SSR ou SPA](#ssr-ou-spa).
5. **Auth**, quatro ramos: [receita 1 ou 2](#auth-duas-receitas); **sem login** → remova `app/middleware/auth.ts`, `app/pages/login.vue` e o redirect de 401 no `useApi`; **login futuro** → mantenha os pontos de encaixe como estão e não instale nada.
6. **Limpe os exemplos**: vitrine `/components` (mantê-la como styleguide interno é válido; se remover, tire o link do header), `app/pages/index.vue`, marca no `app/layouts/default.vue`, `app/stores/app.ts`. Ao final, caça-marca: `grep -ri "nuxt base" app/ server/` — a marca vive também em `error.vue` e nos `useSeoMeta`; zere o resultado.
7. **Docs e ambiente**: título/descrição de README e CLAUDE.md (as convenções continuam valendo), remova **esta** seção (já cumprida) e mantenha a próxima, `.env.example` só com as variáveis reais do projeto (fora as das receitas não adotadas) e copie para `.env`.
8. **CI do derivado**: `renovate.yml` já saiu no passo 1; peça ao dono da base para incluir o repositório novo em `RENOVATE_REPOSITORIES`, no workflow do template. O `renovate.json` fica, e `ci.yml`/`security.yml` seguem valendo como estão.
9. **Valide**: `pnpm install && pnpm dev` sem erro e sem warning — se a porta 3000 estiver ocupada o Nuxt escolhe outra, confira no log — e `/api/health` reportando o nome novo; `pnpm verify` inteiro verde. Feche com o commit inicial.

A suíte herdada continua valendo no projeto novo: os testes de referência (componente e composable), o smoke de regressão do kit e o teste-inventário de tokens.

## Atualizar a base no derivado

**Esta seção permanece no projeto derivado** — é a receita de trazer as evoluções da base, e a tabela "só do template" abaixo é a fonte canônica da lista. Só funciona no caminho 1 (clone com histórico), que é o que dá ancestral comum; confira com `git remote -v` e, se faltar o remoto, `git remote add template git@github.com:DevJanderson/nuxt-base.git`.

```bash
git switch -c chore/atualizar-base   # nunca direto na main: o merge pode dar trabalho
git fetch template --tags            # --tags é essencial: é por tag que se escolhe a versão
git merge v1.2.0                     # a tag desejada da base (ou template/main, para o topo)
# … resolver os conflitos (tabelas abaixo) …
pnpm install                         # o lockfile veio junto; dependência nova não se instala sozinha
pnpm verify                          # lint + typecheck + test + knip + dup, o gate do CI
git rm -r --ignore-unmatch docs/SPEC.md .github/workflows/renovate.yml \
          .claude/skills/derivar-projeto .claude/skills/*/evals
git commit                           # fecha o merge só com os gates verdes
```

O `git rm -r` antes do commit não é redundância: arquivo **novo** que a base criou dentro de um
caminho só-do-template (um eval a mais, um `references/` novo na skill de derivação) não gera
conflito nenhum — entra calado no merge. O `--ignore-unmatch` deixa o comando passar quando não
há o que remover.

**Arquivos "só do template"** — apagados na derivação e, a cada merge, chegando como conflito **modify/delete** (`deleted by us`). A resolução é sempre `git rm -r <caminho>` (o `-r` porque duas linhas da tabela são diretórios):

| Arquivo | Por que não viaja |
|---|---|
| `docs/SPEC.md` | especificação **do template**; as convenções que valem no derivado moram no `CLAUDE.md`, que é autossuficiente |
| `.github/workflows/renovate.yml` | lista de repositórios fixa + secret `RENOVATE_TOKEN` que só existe na base — copiado, é run vermelho toda segunda |
| `.claude/skills/derivar-projeto/` | usada uma vez, na derivação |
| `.claude/skills/*/evals/` | avaliam as skills durante o desenvolvimento do template |
| seção "Como virar um projeto novo" (README) | já cumprida |

A última linha é a exceção da tabela: como o `README.md` continua existindo dos dois lados, ela chega como **conflito de texto normal** dentro do arquivo, não como modify/delete — resolve-se apagando o bloco da seção, não com `git rm`.

`app/pages/components.vue` (vitrine) **não** entra na lista: mantê-la como styleguide interno é escolha do projeto.

**Conflitos esperados** e a regra de resolução:

| Onde | Regra |
|---|---|
| `app/assets/css/main.css` | seus valores em `:root`/`.dark`; da base o `@theme inline` (token novo é evolução da base) |
| `app/layouts/default.vue`, `app/pages/index.vue` | sua marca e seu conteúdo vencem; traga só a estrutura nova (item de nav, slot) |
| `README.md`, `CLAUDE.md` | seu título e sua descrição vencem; **traga as convenções e receitas novas** da base |
| `package.json` | seu `name`; da base as dependências e os scripts |
| `app/components/ui/**`, `app/composables/**` | da base, salvo customização deliberada sua — nesse caso reaplique-a por cima |
| arquivos "só do template" | `git rm` (tabela acima) |

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
| `--font-sans` | tipografia base (trocar aqui **e** em `fonts.families` — ver abaixo) |
| `--z-overlay` / `--z-modal` / `--z-dropdown` / `--z-toast` / `--z-tooltip` → `z-(--z-modal)` | escala de empilhamento (40/50/60/70/80) — dropdown acima do modal porque o Reka portaliza o `SelectContent` para o `body`; camada nova entra na escala, nunca `z-[n]` solto |

Regra da casa: **componentes e páginas usam apenas tokens semânticos** — nunca cor bruta (`bg-blue-600`, hex). Se precisar de uma cor nova, crie um token.

**Trocar a fonte são dois lugares**, não um: o token `--font-sans` no `main.css` **e** a família em `fonts.families`, no `nuxt.config.ts`. O `@nuxt/fonts` não detecta sozinho a fonte declarada dentro de `@theme inline` — o Tailwind 4 a compila para `--default-font-family` atrás de um `var()`, que o scanner não segue (bug upstream [nuxt/fonts#638](https://github.com/nuxt/fonts/issues/638)). Sem a declaração explícita, nenhum `@font-face` é gerado e o browser cai na fonte de sistema, em silêncio.

**Idioma e título do documento** vivem no `app.head` do `nuxt.config.ts`: `htmlAttrs: { lang: 'pt-BR' }` (sem isso o `<html>` sai sem `lang` — a11y e SEO), `title: 'Nuxt Base'` como fallback de página sem `useSeoMeta({ title })` e `titleTemplate: '%s'` moldando o título das que têm. Projeto derivado troca o idioma nessa linha e ganha sufixo de marca com `titleTemplate: '%s · Meu Projeto'`.

O dark mode é do `@nuxtjs/color-mode` (classe `dark` no `<html>`, preferência persistida). **O tema claro é o padrão da plataforma** (`preference: 'light'` no `nuxt.config.ts` — primeira visita abre clara independentemente do SO); o toggle está no layout default e a escolha do usuário persiste: `colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'`. Em SSR, renderize ícones dependentes do tema dentro de `<ClientOnly>` (o valor efetivo só é conhecido no client).

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
const token = useCookie('auth.token', {
  maxAge: 60 * 60 * 24 * 7,
  sameSite: 'lax',
  secure: !import.meta.dev, // só trafega em https fora do dev
})

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

**Trade-off desta receita:** o cookie é gravado pelo client, então **não pode ser `httpOnly`** — é legível por qualquer JavaScript da página, e um XSS leva o token junto. É o preço de guardar credencial num frontend puro; mitigue com `secure: true` em produção (acima, via `!import.meta.dev`), `sameSite: 'lax'`, expiração curta com refresh, e nunca injetando HTML de terceiros sem sanitizar. Se o projeto tem servidor próprio, a **receita 1** evita o problema: a sessão fica num cookie selado `httpOnly`, invisível para o JS.

Em `app/middleware/auth.ts`, descomente o bloco da receita 2:

```ts
const token = useCookie('auth.token')
if (!token.value) {
  return navigateTo('/login')
}
```

A partir daí toda chamada do `useApi` sai autenticada; um 401 da API derruba o usuário de volta para `/login` (comportamento já embutido). Logout = `useCookie('auth.token').value = null`.

## Imagens otimizadas (receita)

A base **não** traz `@nuxt/image`: o provider padrão (IPX) carrega o `sharp`, que sozinho responde por ~19 MB do build de servidor — peso que todo projeto pagaria para um recurso que nem todo projeto usa. Precisou de `<NuxtImg>`/`<NuxtPicture>`, redimensionamento ou conversão para WebP/AVIF:

```bash
npx nuxt module add image   # instala e registra em `modules` sozinho
```

Nota de deploy: o `sharp` é binário nativo, então **build e runtime precisam da mesma plataforma**. Se você builda em macOS/ARM e sobe para um container Linux x64, configure o gerenciador de pacotes para trazer os binários das duas plataformas (troubleshooting da [doc oficial](https://image.nuxt.com/get-started/installation)) — ou builde dentro da própria imagem. Sem `@nuxt/image`, `<img>` comum continua funcionando normalmente.

## Headers de segurança

A base **não** envia cabeçalhos de segurança — é receita, não default (proxy/CDN na frente do app costuma já cuidar disso, e duplicar atrapalha). Para o app cuidar deles, `routeRules` no `nuxt.config.ts` resolve o básico sem dependência nenhuma:

```ts
export default defineNuxtConfig({
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        // Só faz sentido servindo em https — em http o browser ignora
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
    },
  },
})
```

CSP séria (nonce por requisição, `frame-ancestors`, relatórios) é mais do que `routeRules` entrega bem: aí vale o módulo [`nuxt-security`](https://nuxt-security.vercel.app) (`npx nuxi module add security`), que traz headers, CSP com nonce e rate limiting — **instalação é decisão do projeto derivado**, a base não o inclui.

## Componentes de UI

O kit vive em `app/components/ui/` e é auto-importado com prefixo `Ui` (`<UiButton>`, `<UiModal>`, …). A vitrine com todos os componentes em uso está em `/components`.

| Componente | Props essenciais | Slots |
|---|---|---|
| `UiButton` | `variant` (`solid` \| `outline` \| `ghost` \| `destructive`), `size` (`sm` \| `md` \| `lg`), `disabled`, `type`, `to` (com `to` renderiza `NuxtLink` no lugar de `<button>`) | default |
| `UiInput` | `v-model`, `label`, `hint`, `error`, `type`, `placeholder`, `disabled` | — |
| `UiSelect` | `v-model`, `items: { label, value, disabled? }[]`, `label`, `placeholder`, `error`, `disabled` | — |
| `UiModal` | `v-model:open`, `title` (obrigatória), `description` (informe sempre — sem ela o componente cai num fallback oculto com o título, rede de segurança só para o `aria-describedby`) | `trigger`, default, `footer` |
| `UiCard` | — | `header`, default, `footer` |
| `UiBadge` | `variant` (`neutral` \| `primary` \| `destructive` \| `outline`) | default |
| `UiTable` | `columns: { key, label }[]`, `rows` | `#cell-[key]` recebe `{ row, value }` |
| `UiToaster` | montado uma única vez no layout default | — |

Toasts são imperativos, via composable: `useToast()` retorna `{ toasts, dismiss, success, error, info }` — ex.: `toast.success('Salvo.', { title: 'Pronto', duration: 8000 })`.

**Regra do copy-and-own** (CLAUDE.md, "Convenções inegociáveis"): o **comportamento** vem do Reka UI (headless — foco, teclado e ARIA resolvidos; esse sim é dependência) e o **visual** é markup portado do Preline UI, adaptado aos nossos tokens. **Preline nunca entra como dependência** — nem o pacote npm, nem o plugin JS; é catálogo de referência e fonte de cópia. Componente novo segue o mesmo caminho: escolher o primitivo Reka, portar o markup do Preline, traduzir variantes `hs-*` para os estados `data-[state=…]` do Reka e usar apenas tokens semânticos. Visual inspirado no [Preline UI](https://preline.co) (MIT).

## Testes

Stack: **Vitest 4 + `@nuxt/test-utils` + happy-dom**, com ambiente `nuxt` global (`vitest.config.ts`) — todo teste roda com o runtime do Nuxt (auto-imports, plugins, `#components`, `#imports`).

Dois testes de referência definem o padrão da casa — copie a estrutura deles:

- **Componente** → `tests/nuxt/components/button.spec.ts`: `mountSuspended` de `@nuxt/test-utils/runtime` + import do componente via `#components`. Cobre render de slot, classes por variante e estado disabled.
- **Composable/API** → `tests/nuxt/composables/use-api.spec.ts`: `registerEndpoint` de `@nuxt/test-utils/runtime` mocka rotas no Nitro de teste — sem rede real. Atenção: registre o caminho **completo**, incluindo o prefixo da baseURL (`/api/ping`, não `/ping`). Cobre resposta feliz tipada, erro padronizado e a injeção condicional do header `Authorization`.

Há ainda um **teste-inventário** (`tests/nuxt/conventions/semantic-tokens.spec.ts`) que trava a convenção "apenas tokens semânticos" em código: cor bruta nova em `app/**/*.vue` falha o CI, e entrada de allowlist que apodreceu também.

```bash
pnpm test          # uma execução (é o que o CI roda)
pnpm test:watch    # watch mode durante o desenvolvimento
```

## Versionamento e branches

- **`main` única** — o template não usa `develop`: é a branch que o derivado clona e de onde sai todo merge de atualização, e é ela que os gates mantêm sempre estável. Mudança arriscada = branch de feature ad hoc + PR (CI verde antes do merge), sem branch permanente.
- **Tags de versão** (`v1.0.0`, …) marcam estados estáveis da base: o derivado sabe de qual versão nasceu e escolhe por tag até onde atualizar (`git merge v1.2.0`) em vez de engolir o topo da `main`.
- **Projetos derivados decidem o próprio fluxo** conforme a realidade de deploy (trunk-based, `develop → main`, preview environments) — a base não impõe.

## CI, hooks e saúde do código

- **Hooks de git** (local, via `lefthook.yml`): **pre-commit** aplica `eslint --fix` nos arquivos staged; **pre-push** roda `pnpm verify` — o espelho exato do CI (com o `smoke`, o push demora uns 15 s a mais; é o preço de nunca mais subir um 404 logando stack trace — não pule com `--no-verify`). Instalados automaticamente no `pnpm install` (postinstall do lefthook); após zerar o `.git`, rode `pnpm exec lefthook install`.
- **`pnpm verify`**: `lint && typecheck && test && knip && dup && smoke` num comando. Regra da casa: *"deveria funcionar" não é terminado* — rode antes de considerar qualquer tarefa pronta.
- **CI** (`.github/workflows/ci.yml`): a cada push na `main` e em todo PR — `pnpm install --frozen-lockfile`, `lint`, `typecheck`, `knip`, `dup`, `test` e `smoke` (que já builda), em Node 24 com `TZ: UTC` (teste sensível a data falha igual aqui e em produção).
- **Auditoria semanal** (`.github/workflows/security.yml`): `pnpm audit --prod` como gate toda segunda; auditoria completa informativa.
- **Política de pin: versão exata em toda dependência** (sem `^`/`~`) — quem decide a atualização é o Renovate, num PR com o CI verde, e não um `pnpm install` num dia qualquer; o lockfile governa o resto.
- **Renovate** (`renovate.json` + `.github/workflows/renovate.yml`): updates não-major agrupados às segundas; majors exigem aprovação no Dependency Dashboard; **major do TypeScript bloqueado** (pino em 6.x). Roda **self-hosted via Actions** (segunda 06:00 e manual via workflow_dispatch), com o secret `RENOVATE_TOKEN` (token do dono — PRs disparam o CI normalmente; sem app externo). O workflow do template também cobre os derivados listados em `RENOVATE_REPOSITORIES` — por isso **`renovate.yml` é o único arquivo de CI que o projeto derivado apaga** — está na lista "só do template", porque lá o secret não existe e a lista de repos não é dele: sobraria só um run vermelho por semana. O `renovate.json` continua em cada repositório, e cada derivado novo entra na lista `RENOVATE_REPOSITORIES` aqui na base.
- **Gate de runtime** (`pnpm smoke`, `scripts/smoke.mjs`): os outros gates leem o código parado; este **roda o app**. Faz `nuxt build`, confere o teto de peso do `.output/server` (**15 MB**; a base fica em ~5 MB — o teto pega regressão como o `@nuxt/image`, que sozinho levava a 26 MB), sobe o servidor de produção **e** o `nuxt dev` em portas sorteadas pelo kernel e requisita `/`, `/components`, `/login`, `/api/health` e uma URL inexistente. Reprova por asserção (200 nas páginas, `<html lang="pt-BR">`, `<title>` preenchido, `status: "ok"` no health, 404 com a página de erro em pt-BR) **e por log sujo**: qualquer linha de stdout/stderr do servidor casando `/WARN|ERROR|request error|\[nuxt\] \[|VUE_ROUTER/` derruba o gate, e **em produção qualquer linha em stderr reprova, casando ou não** (o servidor compilado só tem o `Listening` como saída legítima; um `console.warn` cru sai sem o prefixo `WARN`). Existe por um caso real — o catch-all 404 foi commitado com `fatal: true` e cuspia stack trace `[request error] [fatal]` a cada 404, invisível para lint, typecheck, testes, knip e jscpd. Linha benigna de ferramenta entra na allowlist do topo do script, uma a uma e com o porquê; **afrouxar o regex, nunca**. Script em Node puro (sem dependência nova): porta livre via `net`, timeout de 120 s por etapa e kill da árvore de processos mesmo em erro, timeout ou Ctrl+C. Não confundir com o *smoke de regressão do kit* (`tests/nuxt/components/kit-smoke.spec.ts`), que monta os componentes no Vitest.
- **Anti-duplicação e código morto**: regras `sonarjs` no ESLint (funções/branches idênticos), **knip** (exports, arquivos e dependências sem uso — config em `knip.jsonc`) e **jscpd** (`pnpm dup` — detector de copy-paste em `app/`, `server/` e `tests/`, config em `.jscpd.json`). O threshold é **0**: a base parte de 0,00% de duplicação e qualquer clone novo falha o CI — subir o threshold num projeto derivado é decisão consciente, documentada no `.jscpd.json`.
- **Anti-vazamento de logs**: `no-console` no ESLint — **erro** em `server/**` (log de servidor estruturado é decisão do derivado; receita: [pino](https://github.com/pinojs/pino)) e aviso em `app/` (só `console.warn`/`console.error` liberados). No build de produção do client, `console.log/info/debug/trace` são **removidos do bundle** (terser `pure_funcs`, só em `$production` no `nuxt.config.ts`); `warn`/`error` sobrevivem de propósito.
- **Varredura de segredos**: job `gitleaks` no CI varre o histórico inteiro a cada push/PR (chaves, tokens, senhas commitados por acidente). Segredo detectado = CI vermelho → remova, **rotacione a credencial** (ela já vazou no histórico) e reescreva o histórico se o repo for público. `.env`/`.env.*` são gitignorados; só `.env.example` (com placeholders) é versionado.
