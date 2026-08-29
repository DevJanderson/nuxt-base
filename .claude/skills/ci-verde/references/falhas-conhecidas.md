# Falhas conhecidas de CI — catálogo do projeto

Casos reais primeiro (com o commit da correção quando houver), classes conhecidas depois.
Ao resolver uma falha de ambiente nova, adicione a linha aqui **no mesmo commit**.

| Sintoma | Causa | Correção |
|---|---|---|
| `<binário>: not found` só no CI (`eslint: not found`) — **caso real, commit c898dd6** | Dependência implícita: peer auto-instalado pelo pnpm local, sem entrada própria no `package.json`; o CI não expõe o binário | Declarar o pacote explicitamente em `devDependencies` |
| `ERR_PNPM_OUTDATED_LOCKFILE` no install do CI | `pnpm-lock.yaml` fora de sincronia com o `package.json` (edição manual de deps sem rodar install) | `pnpm install` local e commitar o lockfile junto |
| `Ignored build scripts: <pacote>` e depois binário/hook faltando — **casos reais: esbuild, unrs-resolver, vue-demi, lefthook** | pnpm 11 bloqueia postinstall por padrão | Adicionar o pacote em `allowBuilds` no `pnpm-workspace.yaml` |
| `typecheck` falha no CI e não local (ou vice-versa) | Spec fora de `tests/nuxt/` (fora do include do tsconfig) ou `.nuxt/` desatualizado | Specs sempre em `tests/nuxt/`; rodar `pnpm exec nuxt prepare` |
| Teste com data/hora passa local e falha no CI | Fuso: o CI roda `TZ: UTC`; máquina local provavelmente UTC-3 | Reproduzir com `TZ=UTC pnpm test`; corrigir o teste/código (datas em ISO/UTC), não o fuso do CI |
| `knip` acusa dependência "não usada" que o app usa | Auto-descoberta do Nuxt (coleções `@iconify-json/*`, environments de teste, binários internos) — knip não vê import | `ignoreDependencies` no `knip.jsonc`, com comentário do porquê |
| Você leu "sucesso" mas o run falhou | `gh run watch \| tail` — o pipe substitui o exit code do gh pelo do tail — **caso real** | `gh run watch <id> --exit-status` sem pipe; confirmar com `gh run view` |
| Teste intermitente só no CI | Flakiness: rede real, timers reais, ordem de teste | `registerEndpoint` para HTTP (nunca rede real), fake timers, teste isolado |
| Dev server "validado" era outro processo | Porta 3000 ocupada por instância órfã; Nuxt sobe em outra porta — **caso real na sessão de bootstrap** | Conferir a porta no log do `pnpm dev`; matar pelo PID de quem escuta a porta (`ss -tlnpH`) |
