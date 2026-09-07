---
name: ci-verde
description: Mantém o CI do GitHub Actions verde — diagnostica a falha do run (gh run view --log-failed), reproduz localmente, corrige e previne o drift local-vs-CI com pnpm verify. Use quando o CI falhar ou aparecer X vermelho/erro do GitHub, quando algo passa na máquina local mas quebra no CI, ou antes de um push importante.
argument-hint: "[run-id]"
---

# CI verde

O CI (`.github/workflows/ci.yml`) roda: `pnpm install --frozen-lockfile` → `lint` →
`typecheck` → `knip` → `dup` → `test` → `smoke`, em Node 24 com `TZ: UTC` (+ job
`gitleaks` varrendo segredos no histórico). O `smoke` substitui o antigo `build`: ele
já builda e ainda sobe o app (produção e `nuxt dev`), requisita as rotas de referência
e reprova log com WARN/ERROR. A regra da casa:
**"deveria funcionar" não é terminado** — terminado é `pnpm verify` verde.
Para o que roda em runtime há uma regra a mais: **afirmação de validação só vale com o
log colado** — cole a saída do `pnpm smoke`, não o resumo dela. E cole a saída **relida da
fonte** (arquivo de log ou terminal): resumo de comando longo/em background já veio errado
(caso real: "2 arquivos / 9 testes" num relatório, quando a suíte tinha 12 arquivos e 49 testes) — número inventado em
relatório de validação é falha grave, não detalhe.

## Prevenir (antes do push)

1. `pnpm verify` — o espelho local do CI (lint + typecheck + test + knip + dup + smoke).
   O hook pre-push do lefthook já roda isso; **nunca** contorne com `--no-verify`
   sem motivo documentado.
2. Mexeu em dependências? Confira `git status pnpm-lock.yaml` — lockfile fora de
   sincronia derruba o `--frozen-lockfile` do CI.
3. Pacote novo usado diretamente no código/scripts → **declarado** no `package.json`.
   Peer auto-instalado funciona local e some no CI (caso real: `eslint`).
4. Apareceu `Ignored build scripts` no install? Libere o pacote em `allowBuilds`
   no `pnpm-workspace.yaml` — senão o binário falta no CI.
5. Teste que envolve data/hora: rode `TZ=UTC pnpm test` localmente — o CI é UTC,
   sua máquina provavelmente não.

## Diagnosticar (quando o CI falhou)

**Passo zero: confirme que existe falha.** O usuário costuma confundir workflow (`renovate`,
`security`) com o `ci`, olhar um run antigo ou estar falando de outro repo/branch. Se o run do
commit atual está verde, diga isso **com o log colado** (`gh run view <id>` com os steps),
aponte qual workflow ficou vermelho e peça o run-id — não saia procurando o que consertar.
Corrigir código que está passando é pior do que não fazer nada.

```bash
gh run list --limit 5                # qual run falhou
gh run view <run-id>                 # qual step ficou vermelho
gh run view <run-id> --log-failed    # o log só do que falhou
```

Reproduza localmente com o comando do step (`pnpm lint`, `pnpm typecheck`,
`pnpm knip`, `pnpm test`, `pnpm smoke`; para install: `pnpm install --frozen-lockfile`).
Falha no `smoke` vem com a etapa (build / produção / dev), a asserção quebrada ou as
linhas de log ofensivas — leia essas linhas antes de mexer em qualquer coisa.

Exceção: `<binário>: not found` não se reproduz com o `node_modules` que você já tem — o
binário pode ser sobra de install antigo. Reproduza a condição do CI:
`rm -rf node_modules && pnpm install --frozen-lockfile`.

Não reproduziu local? É diferença de ambiente — consulte
`references/falhas-conhecidas.md` (catálogo com os casos já vividos e a correção).

## Corrigir e confirmar

1. Corrija a causa (nunca desabilite o step para "passar").
2. `pnpm verify` verde → commit → push.
3. Acompanhe: `gh run watch <run-id> --exit-status` — **sem pipe** para `tail`/`head`
   (o pipe engole o exit code e você lê sucesso onde houve falha; caso real).
4. Confirme com `gh run view <run-id>` (conclusão ✓).

## Regras

- **Nunca re-rode o CI sem mudança** esperando cura: falha determinística não
  se resolve sozinha; se for intermitente, o problema é flakiness — investigue
  (rede real em teste é proibida: use `registerEndpoint`). Isso vale também para
  "se você insistir, o comando é…": não entregue o `gh run rerun` como saída. Peça o
  run-id e leia o log — se a falha for intermitente, o alvo é a flakiness, não o botão.
- Falha nova de ambiente diagnosticada → **registre** em
  `references/falhas-conhecidas.md` no mesmo commit da correção; o catálogo
  é memória do projeto e cresce com ele.
