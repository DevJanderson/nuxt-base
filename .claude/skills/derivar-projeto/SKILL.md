---
name: derivar-projeto
description: Transforma o template nuxt-base num projeto novo — clona com histórico (para o derivado receber evoluções da base), renomeia pacote e healthcheck, edita os tokens de tema, define SSR/SPA, trata auth, apaga exemplos e arquivos só-do-template, e valida com os gates do SPEC §11. Use quando o usuário pedir para "usar o template", "começar um projeto novo a partir da base", "derivar" a base ou "renomear a base".
argument-hint: "[nome-do-novo-projeto]"
---

# Derivar um projeto novo da base

Roteiro executável de "Como virar um projeto novo" do README.md (docs/SPEC.md §11): virar
projeto novo = **renomear + editar tokens + apagar exemplos + apagar os arquivos "só do
template"**.

**Atualizar depois:** derivar é uma vez só; trazer evoluções da base é outra receita, no
README.md, seção **"Atualizar a base no derivado"** (`git fetch template --tags && git merge vX.Y.Z`).

Antes de editar, pergunte (ou deduza do pedido): nome do projeto, tipo
(site/SEO, dashboard SPA, SaaS full-stack, frontend puro) e se haverá login.

**Antes de editar qualquer arquivo, confirme que você está no derivado — nunca na base:**

```bash
git remote -v                 # tem de existir `template`; se `origin` for o nuxt-base, você está NA BASE
grep '"name"' package.json    # ainda "nuxt-base"? é a base
ls docs/SPEC.md               # existe? é a base
```

Se for a base, **não edite nada** — nem `nuxt.config.ts`, nem `scripts/smoke.mjs`, nem
README/CLAUDE.md: responda com o passo 0 e peça o clone. A exceção única é corrigir um defeito
**da própria receita** (`.md`), e mesmo essa se anuncia como tal.

## 0. Repositório e vínculo com a base

Caminho recomendado: **clone com histórico** — é o único que deixa o derivado receber as
evoluções da base depois (`git fetch template --tags && git merge vX.Y.Z`). O repositório
novo tem de nascer **vazio**: qualquer commit inicial criado pelo GitHub (README, licença,
`--template`) vira outra raiz de histórico e todo merge futuro morre em
`refusing to merge unrelated histories`.

```bash
gh repo create <nome> --private          # VAZIO: sem --template, sem --add-readme
git clone https://github.com/DevJanderson/nuxt-base.git <nome>   # público: HTTPS vale para qualquer conta
cd <nome>
git remote rename origin template        # a base vira remoto de leitura
git remote add origin git@github.com:<owner>/<nome>.git
git push -u origin main
pnpm install                             # deps + git hooks (lefthook)
```

Se o repositório já veio de **"Use this template"** ou de cópia manual (`rm -rf .git && git init`),
siga o roteiro do mesmo jeito, mas **avise**: sem ancestral comum não existe merge da base —
atualizar vira cópia de arquivo à mão. Em cópia manual, rode também `pnpm exec lefthook install`
(zerar o `.git` apaga os hooks).

## 1. Apagar o que é só do template

A lista canônica, com o porquê de cada item, está no **README.md, seção "Atualizar a base no
derivado"** — leia-a antes de apagar. É a mesma lista que reaparece como conflito
modify/delete em cada merge futuro, sempre resolvida com `git rm -r`.

```bash
git rm -r docs/SPEC.md .github/workflows/renovate.yml .claude/skills/*/evals
```

Depois, tire as **referências penduradas** — **cinco**, e nenhuma some sozinha:

- `README.md`, primeiro parágrafo → o link para `docs/SPEC.md`.
- `README.md`, bloco "Estrutura de pastas" → a linha `docs/SPEC.md`.
- `README.md`, bloco "Estrutura de pastas" → tire `derivar-projeto` da linha `.claude/skills/`.
- `CLAUDE.md`, topo → a linha de citação "Só do template: docs/SPEC.md".
- `CLAUDE.md`, seção "Skills" → o bullet `.claude/skills/derivar-projeto/` (a skill sai no passo 10).

Confira com `grep -rn 'SPEC\|derivar-projeto' README.md CLAUDE.md`: o que **sobra de
propósito** são as menções dentro de "Atualizar a base no derivado" (tabela e comando
`git rm -r --ignore-unmatch`) — elas existem justamente para o merge não trazer esses
arquivos de volta. Qualquer outra ocorrência é referência pendurada.
A seção "Como virar um projeto novo" do README sai no passo 7;
**"Atualizar a base no derivado" fica** — é a receita de update do derivado.

Esta skill (`.claude/skills/derivar-projeto/`) também é só do template, mas só se apaga no
passo 10, para continuar consultável até o fim da derivação.

## 2. Renomear

- `package.json` → campo `"name"` (kebab-case).
- `server/api/health.get.ts` → campo `service` (o healthcheck reporta o nome do serviço).

## 3. Identidade visual

Edite os tokens em `app/assets/css/main.css`, **somente** os blocos `:root` (claro) e
`.dark` (escuro) — e, se quiser, `--font-sans`/`--radius-*` no `@theme inline`.
A tabela com o papel de cada token está no README.md, seção "Tema (identidade visual)".
Nunca espalhe cor pelo código: componentes e páginas usam só tokens semânticos.
Sem identidade visual definida no pedido? Mantenha os tokens padrão e siga adiante —
trocar depois é editar só esses dois blocos.

## 4. Modo de renderização

Decida pelo tipo de projeto (receitas prontas no README.md, seção "SSR ou SPA"):

- **Site/SEO** → mantenha o SSR padrão; acrescente `prerender`/`swr` por rota onde couber.
- **Dashboard 100% atrás de login** → `ssr: false` no `nuxt.config.ts`.
- **Misto** → `routeRules` (ex.: `'/app/**': { ssr: false }`, landing com `prerender`).

**`ssr: false` muda o que o `smoke` vê.** Em SPA global o servidor devolve o app shell com
**200** para URL inexistente, e as duas asserções de 404 do `scripts/smoke.mjs` reprovam
(produção e dev). Não afrouxe o script: o gate tem modo SPA — no derivado que adotar
`ssr: false` global, o script `smoke` do `package.json` passa a ser
`node scripts/smoke.mjs --spa`, que troca **só** a asserção de 404 (app shell em vez de página
de erro). O 404 renderizado continua coberto por `tests/nuxt/components/error-page.spec.ts`.
**A regra de log limpo e o regex não se tocam** (CLAUDE.md: "afrouxar o regex, nunca").
Se o 404 do servidor importar para monitoramento, o caminho é o modo misto com `routeRules` —
e aí o gate segue no modo padrão, sem a flag.

## 5. Auth

A base não implementa auth — escolha no README.md, seção "Auth: duas receitas":

- **Receita 1** — sessão no servidor (SaaS full-stack) com `nuxt-auth-utils`.
- **Receita 2** — token contra API externa (cookie `auth.token`; o `useApi` já injeta o Bearer).
- **Sem login?** Remova os pontos de encaixe: `app/middleware/auth.ts`, `app/pages/login.vue` e
  o redirect de 401 → `/login` em `app/composables/useApi.ts`. A rota deixa de existir, então
  tire `/login` também de `scripts/smoke.mjs` (**duas** ocorrências: a lista `ROUTES` e a
  asserção de 200) e o botão em `app/pages/index.vue` — sem isso o gate de runtime recebe 404
  onde exige 200 e o `pnpm verify` fecha vermelho. `NUXT_SESSION_PASSWORD` sai do
  `.env.example` no passo 7.
- **Login futuro (ainda sem receita escolhida)?** Mantenha os pontos de encaixe como
  estão e não instale nada — eles são inertes até serem usados.

Não instale nada além do que a receita escolhida pedir.

O middleware da base é **nomeado** de propósito (`app/middleware/auth.ts` +
`definePageMeta({ middleware: 'auth' })`). Trocá-lo por `auth.global.ts` é decisão de projeto,
não parte da receita: **proponha**, não aplique sozinho — e, se o time aceitar, o README **da
base** não se reescreve por causa disso (é o derivado que muda).

## 6. Limpar exemplos

- `app/pages/components.vue` (vitrine `/components`): pergunte se o time quer mantê-la
  como styleguide interno (sem resposta, **mantenha** — remover depois é barato); se
  remover, remova também o link "Componentes" no header de `app/layouts/default.vue`.
- `app/pages/index.vue` → substituir o conteúdo de demonstração pelo do projeto.
- `app/layouts/default.vue` → trocar a marca "Nuxt Base" no header/footer.
- `app/stores/app.ts` → adaptar ou apagar (novos stores seguem o mesmo formato setup store).
- Ao final, caça-marca: `grep -ri "nuxt base" app/ server/` — a marca também vive em
  `app/error.vue` e nos `useSeoMeta` de `components.vue`/`login.vue`; zere o resultado.

## 7. Documentação e ambiente

- README.md e CLAUDE.md do projeto derivado: título e descrição do projeto novo
  (as convenções da base continuam valendo — não as apague). Remova a seção
  "Como virar um projeto novo" (já cumprida) e **mantenha "Atualizar a base no derivado"**,
  que é a receita de merge do derivado. Atualize exemplos que citem `nuxt-base`.
- `.env.example` → só as variáveis reais do projeto: remova as variáveis das receitas
  **não** adotadas (ex.: `NUXT_SESSION_PASSWORD` se não usar a receita 1); copie para
  `.env` e ajuste os valores locais.

## 8. CI do projeto derivado

- `.github/workflows/renovate.yml` já saiu no passo 1 (workflow do template: lista de
  repositórios fixa + secret `RENOVATE_TOKEN` que só existe lá — copiado, seria run vermelho
  toda segunda). O `renovate.json` **fica**: é ele que define as regras de update do repositório.
- Pergunte (ou deduza pelo `owner` do remoto `origin`) de quem é o repositório novo:
  - **Do dono da base (DevJanderson)**: avise-o para acrescentar o repositório em **dois**
    lugares: `RENOVATE_REPOSITORIES` no `.github/workflows/renovate.yml` **do template**
    (uma execução só cuida da base e de todos os derivados listados) e o *Repository access*
    do token fine-grained que alimenta o secret `RENOVATE_TOKEN` — sem o segundo, o push do
    Renovate no derivado volta `Permission denied`.
  - **De outra conta**: o hub do template não alcança esse repo. Oriente a montar o próprio
    Renovate: instalar o app do Renovate (Mend) só nesse repositório (o `renovate.json`
    herdado já configura tudo) **ou** copiar o `renovate.yml` da base com `RENOVATE_REPOSITORIES`
    apontando para o repo novo e um secret `RENOVATE_TOKEN` próprio (token fine-grained com
    Contents, Issues, Pull requests, Workflows e Commit statuses em read-write). Nunca os dois
    juntos: dois Renovates no mesmo repo duplicam dashboard e bloqueiam os PRs um do outro.
- `ci.yml` e `security.yml` continuam como estão: valem para qualquer projeto e não usam secret
  **em conta pessoal**. Repositório dentro de **organização** precisa do secret
  `GITLEAKS_LICENSE` para o job `gitleaks` — sem ele, esse job falha no primeiro push.

## 9. Gate final (critérios do SPEC §11)

```bash
pnpm verify   # lint + typecheck + test + knip + dup + smoke
```

O `smoke` é o gate de runtime: sobe o build **e** o `nuxt dev` em portas livres, requisita
as rotas e reprova log com WARN/ERROR — ele substitui a antiga conferência manual de
"`pnpm dev` sem erro e sem warning". **Cole a saída dele**: validação de runtime sem log
colado não conta.

Depois do rename, confira à mão só o que o smoke não sabe: `pnpm dev` e
`http://localhost:<porta>/api/health` devem reportar o **nome novo** do serviço (o smoke
checa `status: "ok"`, não o nome). Se a 3000 estiver ocupada o Nuxt escolhe outra porta —
confira a porta real no log.

## 10. Commit inicial

Apague por último esta skill e feche a derivação com os gates verdes:

```bash
git rm -r .claude/skills/derivar-projeto
git add -A && git commit -m "chore: bootstrap <nome> a partir do nuxt-base"
git push
```

No clone com histórico o commit entra **em cima do histórico da base** — é isso que mantém o
ancestral comum vivo para o primeiro `git merge` de atualização.
