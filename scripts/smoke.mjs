#!/usr/bin/env node
/**
 * `pnpm smoke` — gate de runtime da base.
 *
 * Os outros gates (lint, typecheck, test, knip, dup) leem o código parado; este sobe o app
 * de verdade, requisita as rotas de referência e **lê o log do servidor**. Existe por um caso
 * real: o catch-all 404 foi commitado com `fatal: true` e cada 404 despejava stack trace
 * `[request error] [fatal]` no log — nenhum gate rodava o app, então ninguém viu.
 *
 * Etapas: build (+ teto de tamanho do `.output/server`) → servidor de produção → `nuxt dev`.
 * Nas duas últimas: mesmas requisições, mesmas asserções e a mesma regra de log limpo
 * (o aviso do h3 só aparece em dev; o stack trace do Nitro, só em produção).
 *
 * Sem dependência nova de propósito: Node puro (child_process, net, fs, fetch global).
 */
import { spawn } from 'node:child_process'
import { readdir, stat } from 'node:fs/promises'
import { createServer } from 'node:net'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const NUXT_BIN = join(ROOT, 'node_modules', '.bin', 'nuxt')

/**
 * Teto do bundle do servidor. Hoje a base fica em ~5 MB; o teto pega regressão de peso
 * (o `@nuxt/image`, com sharp+ipx, sozinho levava o `.output/server` a 26 MB).
 */
const MAX_SERVER_MB = 15

/** Timeout por etapa (build, subida do servidor de produção, prontidão do dev). */
const STEP_TIMEOUT_MS = 120_000

/** Respiro para o servidor terminar de escrever no stdout/stderr antes de a gente ler. */
const FLUSH_MS = 500

/** Espera entre o SIGTERM e o SIGKILL na árvore de processos. */
const KILL_GRACE_MS = 3_000

/**
 * Linha de log que reprova a etapa — casada contra o stdout das duas etapas.
 *
 * Em **produção** vale uma regra a mais: **qualquer** linha não vazia de stderr reprova,
 * casando o regex ou não. O servidor compilado só tem uma saída legítima, o `Listening` em
 * stdout; tudo que ele manda para stderr é problema. Sem isso escapa um caso real, achado
 * pelo QA: o Nitro compilado imprime `console.warn` cru, **sem** o prefixo `WARN ` que a
 * consola põe em dev — `console.warn('x')` num handler de `server/` passava limpo na etapa
 * de produção e só era pego pela etapa dev.
 *
 * Em **dev** a regra estrita não serve: o Vite escreve coisas legítimas em stderr.
 */
const OFFENSIVE_LINE = /WARN|ERROR|request error|\[nuxt\] \[|VUE_ROUTER/

/**
 * Linhas benignas conhecidas, cada uma com o porquê. Nasce vazia e só cresce com ruído
 * comprovado da ferramenta (medido em execuções repetidas) — nunca para calar um aviso do
 * nosso código: aí a correção é no código, não aqui. Afrouxar `OFFENSIVE_LINE` está fora
 * de questão: a allowlist é específica e auditável, o regex frouxo não.
 */
const LOG_ALLOWLIST = [
  // (vazia — a baseline da base não produz linha ofensiva nenhuma)
]

/** Rotas de referência: as três páginas, o healthcheck do Nitro e uma URL inexistente. */
const ROUTES = ['/', '/components', '/login', '/api/health', '/rota-que-nao-existe']

const running = new Set()
const failures = []

// ── relatório ──────────────────────────────────────────────────────────────────────────

function step(title) {
  console.log(`\n▶ ${title}`)
}

function pass(message) {
  console.log(`  ✔ ${message}`)
}

function fail(message) {
  failures.push(message)
  console.log(`  ✘ ${message}`)
}

function tail(output) {
  return output.trim().split('\n').slice(-25).join('\n')
}

// ── processos ──────────────────────────────────────────────────────────────────────────

function killGroup(child, signal) {
  // Sem guard de "pai já saiu": um neto do grupo pode ter sobrevivido ao SIGTERM do pai,
  // e o SIGKILL no grupo é o que o alcança. Grupo inexistente cai no catch (ESRCH).
  try {
    // `detached: true` põe o filho num grupo próprio; o pid negativo atinge a árvore inteira
    // (o `nuxt dev`, por exemplo, roda o servidor num processo neto).
    process.kill(-child.pid, signal)
  }
  catch {
    // Grupo já morreu (ESRCH) — nada a fazer.
  }
}

/** Sobe um processo em grupo próprio, acumulando stdout+stderr num buffer só. */
function launch(command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NUXT_TELEMETRY_DISABLED: '1', ...env },
  })
  running.add(child)

  // `output` mantém os dois fluxos intercalados na ordem em que chegaram (é o que vai para o
  // relatório); `stdout`/`stderr` ficam separados porque a regra de produção depende disso.
  const proc = { child, output: '', stdout: '', stderr: '' }
  const collect = stream => (chunk) => {
    proc[stream] += chunk
    proc.output += chunk
  }
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  child.stdout.on('data', collect('stdout'))
  child.stderr.on('data', collect('stderr'))
  child.on('error', (error) => {
    collect('stderr')(`\n${command}: ${error.message}\n`)
  })
  return proc
}

async function terminate(proc) {
  killGroup(proc.child, 'SIGTERM')
  const deadline = Date.now() + KILL_GRACE_MS
  while (proc.child.exitCode === null && Date.now() < deadline) await sleep(100)
  killGroup(proc.child, 'SIGKILL')
  running.delete(proc.child)
}

function killEverything() {
  for (const child of running) killGroup(child, 'SIGKILL')
  running.clear()
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    killEverything()
    process.exit(130)
  })
}
// Rede de segurança para saída por exceção não tratada ou `process.exit` de outro caminho.
process.on('exit', killEverything)

/** Roda um comando até o fim. Lança se sair diferente de 0 ou estourar o timeout. */
async function runToEnd(label, command, args) {
  const proc = launch(command, args)
  const exit = await Promise.race([
    new Promise(done => proc.child.on('close', code => done(code ?? 1))),
    sleep(STEP_TIMEOUT_MS).then(() => 'timeout'),
  ])
  await terminate(proc)
  if (exit !== 0) {
    const motivo = exit === 'timeout' ? `estourou ${STEP_TIMEOUT_MS / 1000}s` : `saiu com código ${exit}`
    throw new Error(`${label} ${motivo}:\n${tail(proc.output)}`)
  }
}

/** Espera `check()` virar verdadeiro, abortando se o processo morrer antes ou o tempo acabar. */
async function waitUntil(proc, check, label) {
  const deadline = Date.now() + STEP_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (await check()) return
    if (proc.child.exitCode !== null) throw new Error(`o processo morreu antes de ${label}:\n${tail(proc.output)}`)
    await sleep(200)
  }
  throw new Error(`timeout de ${STEP_TIMEOUT_MS / 1000}s aguardando ${label}:\n${tail(proc.output)}`)
}

// ── utilidades ─────────────────────────────────────────────────────────────────────────

/** Porta livre pelo kernel: escuta em 0, lê a porta sorteada e devolve. */
function freePort() {
  return new Promise((done, reject) => {
    const probe = createServer()
    probe.on('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address()
      probe.close(() => done(port))
    })
  })
}

async function dirSizeBytes(dir) {
  let total = 0
  for (const entry of await readdir(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue
    total += (await stat(join(entry.parentPath, entry.name))).size
  }
  return total
}

// Cores de terminal atrapalham o casamento das linhas; o alvo do escape é o ESC (0x1B),
// montado por código para não deixar caractere de controle solto no fonte.
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-?]*[ -/]*[@-~]`, 'g')

function logLines(output) {
  return output.replace(ANSI, '').split('\n').map(line => line.trimEnd()).filter(line => line.trim() !== '')
}

/**
 * `strictStderr` (só produção): além do regex no stdout, toda linha de stderr reprova.
 * A allowlist continua valendo nos dois casos — é a única válvula de escape.
 */
function offendingLines(proc, strictStderr) {
  const suspects = strictStderr
    ? [...logLines(proc.stdout).filter(line => OFFENSIVE_LINE.test(line)), ...logLines(proc.stderr)]
    : logLines(proc.output).filter(line => OFFENSIVE_LINE.test(line))
  return suspects.filter(line => !LOG_ALLOWLIST.some(({ pattern }) => pattern.test(line)))
}

// ── asserções ──────────────────────────────────────────────────────────────────────────

async function fetchRoutes(base) {
  const responses = {}
  for (const route of ROUTES) {
    // Rota pendurada não pode travar o gate até o limite do runner: 30 s por requisição.
    const response = await fetch(base + route, { redirect: 'manual', signal: AbortSignal.timeout(30_000) })
    responses[route] = { status: response.status, body: await response.text() }
  }
  return responses
}

function assertResponses(mode, responses) {
  for (const route of ['/', '/components', '/login', '/api/health']) {
    const { status } = responses[route]
    if (status === 200) pass(`GET ${route} → 200`)
    else fail(`[${mode}] GET ${route} → ${status}, esperado 200`)
  }

  const home = responses['/'].body
  if (/<html[^>]*\slang="pt-BR"/.test(home)) pass('`/` com <html lang="pt-BR">')
  else fail(`[${mode}] \`/\` não tem \`<html lang="pt-BR">\``)

  const title = home.match(/<title[^>]*>([^<]*)<\/title>/)?.[1]?.trim()
  if (title) pass(`\`/\` com <title> "${title}"`)
  else fail(`[${mode}] \`/\` sem <title> preenchido`)

  let health = null
  try {
    health = JSON.parse(responses['/api/health'].body)
  }
  catch {
    // Resposta não-JSON já reprova abaixo, com o corpo no relatório.
  }
  if (health?.status === 'ok') pass('`/api/health` → JSON status "ok"')
  else fail(`[${mode}] \`/api/health\` sem JSON status "ok": ${responses['/api/health'].body.slice(0, 120)}`)

  const notFound = responses['/rota-que-nao-existe']
  if (notFound.status === 404) pass('GET /rota-que-nao-existe → 404')
  else fail(`[${mode}] GET /rota-que-nao-existe → ${notFound.status}, esperado 404`)
  if (notFound.body.includes('Página não encontrada')) pass('404 renderiza a página de erro em pt-BR')
  else fail(`[${mode}] a resposta 404 não contém "Página não encontrada"`)
}

function assertCleanLog(mode, proc, strictStderr) {
  const offenders = offendingLines(proc, strictStderr)
  const total = logLines(proc.output).length
  const regra = strictStderr
    ? `${OFFENSIVE_LINE} no stdout, stderr vazio`
    : `${OFFENSIVE_LINE}`
  if (offenders.length === 0) {
    pass(`log limpo (${total} linha${total === 1 ? '' : 's'}; regra: ${regra})`)
    return
  }
  fail(`[${mode}] ${offenders.length} linha(s) de log ofensivas (regra: ${regra}):\n${offenders.map(line => `      │ ${line}`).join('\n')}`)
}

/** Espera o servidor ficar pronto, requisita, lê o log depois disso e derruba a árvore. */
async function exerciseServer(mode, proc, port, ready, strictStderr = false) {
  try {
    await waitUntil(proc, ready, `${mode} ficar pronto na porta ${port}`)
    pass(`servidor pronto na porta ${port}`)
    assertResponses(mode, await fetchRoutes(`http://127.0.0.1:${port}`))
    // O log só é julgado DEPOIS das requisições: o stack trace do 404 e o WARN do h3
    // aparecem em resposta a elas, não na subida.
    await sleep(FLUSH_MS)
    assertCleanLog(mode, proc, strictStderr)
  }
  finally {
    await terminate(proc)
  }
}

// ── etapas ─────────────────────────────────────────────────────────────────────────────

async function stepBuild() {
  step('build de produção')
  const started = Date.now()
  await runToEnd('nuxt build', NUXT_BIN, ['build'])
  pass(`nuxt build concluído em ${((Date.now() - started) / 1000).toFixed(1)}s`)

  const megabytes = (await dirSizeBytes(join(ROOT, '.output', 'server'))) / 1024 / 1024
  if (megabytes <= MAX_SERVER_MB) pass(`.output/server ${megabytes.toFixed(1)} MB (teto ${MAX_SERVER_MB} MB)`)
  else fail(`.output/server ${megabytes.toFixed(1)} MB estourou o teto de ${MAX_SERVER_MB} MB`)
}

async function stepProduction() {
  step('servidor de produção (.output/server/index.mjs)')
  const port = await freePort()
  const proc = launch(process.execPath, [join(ROOT, '.output', 'server', 'index.mjs')], {
    HOST: '127.0.0.1',
    PORT: String(port),
    NITRO_PORT: String(port),
  })
  // `strictStderr`: no servidor compilado, stderr com qualquer coisa já é regressão.
  await exerciseServer('produção', proc, port, () => /Listening/i.test(proc.output), true)
}

async function stepDev() {
  step('servidor de desenvolvimento (nuxt dev)')
  const port = await freePort()
  // NUXT_IGNORE_LOCK: o lock do `nuxt dev` existe para impedir duas instâncias disputando a
  // porta 3000 do mesmo diretório; aqui a porta é sorteada, e sem isso o gate (e o pre-push,
  // que roda `pnpm verify`) falharia sempre que o dev estivesse com o `pnpm dev` aberto.
  const proc = launch(NUXT_BIN, ['dev', '--port', String(port), '--host', '127.0.0.1'], {
    NUXT_IGNORE_LOCK: '1',
  })
  // O `Local:` sai antes de o Vite compilar a primeira página; só o 200 em `/` prova pronto.
  const ready = async () => {
    if (!/Local:\s+http/.test(proc.output)) return false
    try {
      return (await fetch(`http://127.0.0.1:${port}/`, { redirect: 'manual' })).status === 200
    }
    catch {
      return false
    }
  }
  await exerciseServer('dev', proc, port, ready)
}

// ── entrada ────────────────────────────────────────────────────────────────────────────

async function main() {
  const started = Date.now()
  try {
    await stepBuild()
    await stepProduction()
    await stepDev()
  }
  catch (error) {
    // Etapa que nem chegou a rodar (build quebrado, servidor que não subiu, timeout):
    // vira falha do relatório, não stack trace do Node em cima do log do servidor.
    fail(error.message)
  }
  finally {
    killEverything()
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1)
  if (failures.length > 0) {
    console.log(`\n✘ smoke reprovado em ${elapsed}s — ${failures.length} problema(s):`)
    for (const failure of failures) console.log(`  · ${failure}`)
    process.exitCode = 1
    return
  }
  console.log(`\n✔ smoke verde em ${elapsed}s (${ROUTES.length} rotas × produção e dev)`)
}

await main()
