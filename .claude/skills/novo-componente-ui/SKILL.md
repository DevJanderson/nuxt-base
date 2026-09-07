---
name: novo-componente-ui
description: Cria um componente novo no kit copy-and-own de app/components/ui/ — comportamento com primitivo Reka UI, visual portado do catálogo Preline traduzido para tokens semânticos, registro na vitrine /components e teste com mountSuspended. Use quando o usuário pedir para criar/adicionar um componente de UI (Tooltip, Tabs, Alert, Checkbox, …), portar algo do Preline ou estender o kit.
argument-hint: "[nome-do-componente]"
---

# Novo componente no kit de UI

Fluxo da casa para criar um componente em `app/components/ui/`, seguindo o copy-and-own
das "Convenções inegociáveis" do CLAUDE.md. Exemplo vivo que cumpre
todo o padrão: `app/components/ui/Select.vue`.

## 1. Verificar se já existe

- Liste `app/components/ui/` e confira a vitrine `app/pages/components.vue` (rota `/components`).
- Se existir componente **igual** ao pedido: **pare aqui**. Não crie um segundo, não
  reescreva o existente (`jscpd` está em threshold 0 — clone novo reprova o CI).
  Responda com a API atual do componente (props, slots, exemplo de uso), diga onde
  ele já está registrado (vitrine, spec, `kit-smoke`) e pergunte se o que o usuário
  quer é uma extensão concreta. Antes de afirmar o que o componente faz, **leia o
  arquivo** — e, se a afirmação for sobre comportamento do primitivo Reka, confirme
  em `node_modules/reka-ui` ou em <https://reka-ui.com/llms.txt>.
- Aproveite a passagem para conferir se o componente existente está registrado nos
  quatro pontos (vitrine, `<nome>.spec.ts`, `kit-smoke.spec.ts`, tabela do README).
  Faltando algum, reporte — foi assim que o `UiTooltip` ficou fora do README.
- Se existir componente **próximo** (pediram "Dropdown" e há `Select`), prefira estender
  o existente com prop/variante em vez de criar outro — confirme com o usuário.

## 2. Decidir: primitivo Reka ou só markup?

- **Tem comportamento** (abrir/fechar, seleção, foco gerenciado, teclado, portal)?
  → use o primitivo Reka UI correspondente (Tooltip, Tabs, Popover, Checkbox, …).
  Consulte a API atual em <https://reka-ui.com/llms.txt> — não confie em memória de
  versões antigas. Reka já é dependência; importe os subcomponentes nomeados de `'reka-ui'`.
- **Só markup** (Alert, Badge, Card, Skeleton, divisor)? → componente Vue puro, sem Reka.

## 3. Buscar referência visual no Preline

- Use a skill `preline-mcp` para descobrir e copiar o markup do catálogo
  (sem o MCP configurado, as docs públicas <https://preline.co/docs/> servem de catálogo).
- **Antes**, leia `.claude/skills/preline-mcp/PROJECT-NOTES.md`: aqui o Preline é só
  catálogo de cópia. **Nunca instalar** o pacote `preline`, plugin JS, `data-hs-*`,
  `autoInit` ou `HSStaticMethods`.
- Reaproveitar um padrão que o kit já tem (o par ícone/cor do `Toaster.vue`, por exemplo)
  é **preferível** a buscar no catálogo, quando existe: mantém o vocabulário visual coeso.
- **Evidência obrigatória**: cite a URL do catálogo que você abriu, ou diga explicitamente
  que a fonte foi um componente já existente do kit — e qual. "Copiei do Preline" sem URL
  não é evidência.

## 4. Traduzir o markup copiado

Aplicando o mapeamento completo de `.claude/skills/preline-mcp/PROJECT-NOTES.md`:

- Cores/temas do Preline → **somente tokens semânticos** de `app/assets/css/main.css`
  (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, …).
  Nunca cor bruta (`bg-blue-600`, hex).

  **Precisa de token novo (cor, raio, camada)?** `app/assets/css/main.css` é o arquivo
  de identidade que todo projeto derivado herda — token novo não é detalhe de
  componente. Antes de editar:
  1. Confirme que não dá para resolver com token existente ou com modificador de
     opacidade sobre um deles (`bg-destructive/10`, padrão que o `Button` já usa).
  2. **Proponha ao usuário e espere o aval** — diga o nome, os valores claro/escuro e
     o porquê. Token de cor entra sempre em par (`x` / `x-foreground`).
  3. Valide o contraste do par nos dois temas (mínimo 4,5:1 para texto normal;
     3:1 só vale para texto grande). Cite os números na resposta.
  4. Escreva nas três camadas: `:root`, `.dark` e `@theme inline`.
  5. **Documente na tabela de tokens do README** ("Tema") — token sem doc é pior que
     token nenhum.
  6. Confirme no CSS do build que a utility saiu
     (`pnpm build && grep -o '\.bg-seu-token{[^}]*}' .output/public/_nuxt/*.css`).
- Variantes `hs-*` (`hs-dropdown-open:*`, `hs-overlay-open:*`, …) → estados do Reka:
  `data-[state=open]:*`, `data-[state=checked]:*`, `data-[disabled]:*`, `data-[highlighted]:*`.
- Remova atributos `data-hs-*` e variantes `dark:*` (dark mode já sai dos tokens).

## 5. Convenções do componente

Modelo: `app/components/ui/Select.vue`. Em resumo:

- `<script setup lang="ts">`, ordem script → template; identificadores em inglês,
  textos de UI em pt-BR.
- Props tipadas com `withDefaults(defineProps<{ … }>(), { … })`.
- `defineModel` quando o componente tiver valor (`v-model`).
- `useId()` para associar `label`/controle; com `error`: `aria-invalid` +
  mensagem ligada por `aria-describedby`.
- Foco visível sempre com o token `ring`, no idioma do vizinho mais próximo do kit:
  controles de formulário (`Input`, `Select`, …) usam
  `focus:ring-1 focus:outline-hidden` + `focus:border-ring focus:ring-ring`;
  elementos acionáveis (`Button`, botão de fechar do `Modal`/`Toaster`) usam
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`.
  Não invente um terceiro.
- Raios: `rounded-field` (controles) e `rounded-box` (containers).
- Checklist objetivo de acessibilidade: `references/checklist-a11y.md` (desta skill).

## 6. Registrar nos quatro pontos

Componente novo só existe de verdade quando está nos quatro. Todos no mesmo commit:

1. **Vitrine** — seção em `app/pages/components.vue` demonstrando variantes e estados
   (siga o formato das seções existentes). O componente é auto-importado como `<UiNome>`.
   Prefira demo que exercite o componente de verdade (um marca-tudo que muda de estado
   vale mais que quatro caixas paradas).
2. **Guardrail do kit** — uma entrada em `cases` no `tests/nuxt/components/kit-smoke.spec.ts`,
   com as props mínimas. É o teste que pega prop obrigatória nova, rename e erro de setup.
3. **README** — linha na tabela "Componentes de UI" (props essenciais + slots) e, se o
   kit ganhou peça nova, a lista de componentes na árvore de estrutura. Token novo entra
   também na tabela de tokens da seção "Tema".
4. **Teste próprio** — passo 7.

Registrou só na vitrine? O componente vira invisível na doc — foi exatamente assim que
o `UiTooltip` ficou fora da tabela do README.

## 7. Teste

Crie `tests/nuxt/components/<nome>.spec.ts` no padrão de
`tests/nuxt/components/button.spec.ts`: `mountSuspended` de `@nuxt/test-utils/runtime`
+ import via `#components`. Cubra ao menos: conteúdo/slot, classes por variante e
estado disabled (quando existirem).

## 8. Gate final

```bash
pnpm verify
```

Não é `lint && typecheck && test`: o passo 6 mexe em `app/pages/components.vue`, que é
**uma página** — e o CLAUDE.md exige `pnpm smoke` (com o log colado na resposta) para
qualquer mudança em rota, página, `nuxt.config.ts` ou `server/`. O `verify` roda os seis
gates do CI (lint + typecheck + test + knip + dup + smoke) de uma vez.

**"Deveria funcionar" não é terminado.** Só considere o componente pronto com o `verify`
verde e a saída anexada à resposta — incluindo a contagem de testes.
