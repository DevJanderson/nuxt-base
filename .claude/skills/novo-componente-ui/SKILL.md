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
- Se existir componente igual ou próximo (ex.: pediram "Dropdown" e há `Select`),
  prefira estender o existente com prop/variante em vez de criar outro — confirme com o usuário.

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

## 4. Traduzir o markup copiado

Aplicando o mapeamento completo de `.claude/skills/preline-mcp/PROJECT-NOTES.md`:

- Cores/temas do Preline → **somente tokens semânticos** de `app/assets/css/main.css`
  (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, …).
  Nunca cor bruta (`bg-blue-600`, hex). Precisa de cor nova? Crie um token
  (`:root`/`.dark` + `@theme inline`) e use o token.
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
- Foco visível com o token `ring` (`focus-visible:ring-ring` / `focus:ring-ring`).
- Raios: `rounded-field` (controles) e `rounded-box` (containers).
- Checklist objetivo de acessibilidade: `references/checklist-a11y.md` (desta skill).

## 6. Registrar na vitrine

Adicione uma seção em `app/pages/components.vue` demonstrando as variantes e estados
(siga o formato das seções existentes). O componente é auto-importado como `<UiNome>`.

## 7. Teste

Crie `tests/nuxt/components/<nome>.spec.ts` no padrão de
`tests/nuxt/components/button.spec.ts`: `mountSuspended` de `@nuxt/test-utils/runtime`
+ import via `#components`. Cubra ao menos: conteúdo/slot, classes por variante e
estado disabled (quando existirem).

## 8. Gate final

```bash
pnpm lint && pnpm typecheck && pnpm test
```

Só considere o componente pronto com os três verdes.
