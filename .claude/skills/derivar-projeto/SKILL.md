---
name: derivar-projeto
description: Transforma o template nuxt-base num projeto novo — renomeia pacote e healthcheck, edita os tokens de tema, define SSR/SPA, trata auth, limpa os exemplos e valida com os gates do SPEC §10. Use quando o usuário pedir para "usar o template", "começar um projeto novo a partir da base", "derivar" a base ou "renomear a base".
argument-hint: "[nome-do-novo-projeto]"
---

# Derivar um projeto novo da base

Roteiro executável de "Como virar um projeto novo" do README.md (SPEC.md §10.7):
virar projeto novo = **renomear + editar tokens + apagar exemplos**. Roda no repositório
já copiado do template; se o histórico ainda não foi zerado, comece com
`rm -rf .git && git init`.

Antes de editar, pergunte (ou deduza do pedido): nome do projeto, tipo
(site/SEO, dashboard SPA, SaaS full-stack, frontend puro) e se haverá login.

## 1. Renomear

- `package.json` → campo `"name"` (kebab-case).
- `server/api/health.get.ts` → campo `service` (o healthcheck reporta o nome do serviço).

## 2. Identidade visual

Edite os tokens em `app/assets/css/main.css`, **somente** os blocos `:root` (claro) e
`.dark` (escuro) — e, se quiser, `--font-sans`/`--radius-*` no `@theme inline`.
A tabela com o papel de cada token está no README.md, seção "Tema (identidade visual)".
Nunca espalhe cor pelo código: componentes e páginas usam só tokens semânticos.

## 3. Modo de renderização

Decida pelo tipo de projeto (receitas prontas no README.md, seção "SSR ou SPA"):

- **Site/SEO** → mantenha o SSR padrão; acrescente `prerender`/`swr` por rota onde couber.
- **Dashboard 100% atrás de login** → `ssr: false` no `nuxt.config.ts`.
- **Misto** → `routeRules` (ex.: `'/app/**': { ssr: false }`, landing com `prerender`).

## 4. Auth

A base não implementa auth — escolha no README.md, seção "Auth: duas receitas":

- **Receita 1** — sessão no servidor (SaaS full-stack) com `nuxt-auth-utils`.
- **Receita 2** — token contra API externa (cookie `auth.token`; o `useApi` já injeta o Bearer).
- **Sem login?** Remova os pontos de encaixe: `app/middleware/auth.ts`,
  `app/pages/login.vue` e o redirect de 401 → `/login` em `app/composables/useApi.ts`.

Não instale nada além do que a receita escolhida pedir.

## 5. Limpar exemplos

- `app/pages/components.vue` (vitrine `/components`): pergunte se o time quer mantê-la
  como styleguide interno; se remover, remova também o link "Componentes" no header de
  `app/layouts/default.vue`.
- `app/pages/index.vue` → substituir o conteúdo de demonstração pelo do projeto.
- `app/layouts/default.vue` → trocar a marca "Nuxt Base" no header/footer.
- `app/stores/app.ts` → adaptar ou apagar (novos stores seguem o mesmo formato setup store).

## 6. Documentação e ambiente

- README.md e CLAUDE.md do projeto derivado: título e descrição do projeto novo
  (as convenções da base continuam valendo — não as apague).
- `.env.example` → só as variáveis reais do projeto (ex.: `NUXT_PUBLIC_API_BASE` para
  API externa); copie para `.env` e ajuste os valores locais.

## 7. Gate final (critérios do SPEC §10)

```bash
pnpm lint && pnpm typecheck && pnpm test
```

E `pnpm dev` subindo sem erro e sem warning: confira `http://localhost:3000` e
`http://localhost:3000/api/health` (deve reportar o nome novo do serviço).

## 8. Commit inicial

Com os gates verdes, faça o commit inicial do projeto derivado, por exemplo:
`git add -A && git commit -m "chore: bootstrap <nome> a partir do nuxt-base"`.
