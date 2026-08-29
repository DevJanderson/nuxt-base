# PROJECT-NOTES — adaptação da skill `preline-mcp` a este projeto

> Arquivo **do projeto** (não faz parte da skill oficial). O `SKILL.md` e `references/`
> são cópia fiel de <https://github.com/htmlstreamofficial/preline/tree/main/skills/preline-mcp>
> e não devem ser editados. **Em qualquer conflito entre o SKILL.md e estas notas,
> estas notas (e o CLAUDE.md/SPEC §4) prevalecem.**

## O que muda aqui

Neste projeto o Preline é **apenas catálogo de referência visual** (copy-and-own).
A skill oficial assume Preline instalado como dependência com plugin JS — esse modelo
**não se aplica** aqui:

- **Nunca instalar `preline`** — nem o pacote npm, nem `@preline/*`, nem o script
  `preline/dist/index.js`, nem helpers `hs-*-helpers.js`.
- **Nunca usar `data-hs-*`, `autoInit`, `HSStaticMethods` ou blocos `<!-- Init -->`.**
  As "Integration Rules" do SKILL.md sobre inserir `<script src>`, CSS no `<head>` e
  init antes de `</body>` valem para páginas HTML puras — aqui são **ignoradas por completo**.
- **Comportamento é do Reka UI** (headless, já dependência): foco, teclado, ARIA,
  abrir/fechar. Nenhum JS do Preline é portado, só markup/classes.
- **Traduzir variantes `hs-*`** do markup copiado para os estados do Reka:
  `hs-dropdown-open:*` / `hs-overlay-open:*` / etc. → `data-[state=open]:*`,
  `data-[state=checked]:*`, `data-[disabled]:*`, `data-[highlighted]:*` conforme o primitivo.
  Atributos `data-hs-*` são removidos, não copiados.
- **Somente tokens semânticos do `app/assets/css/main.css`** — nunca cor bruta
  (`bg-blue-600`, `text-gray-500`, hex) nem os temas/tokens do Preline
  (`default`, `harvest`, `bg-layer`, `bg-navbar`, …). Mapeamento da casa (README, "Tema"):
  - fundos/texto da página → `bg-background` / `text-foreground`
  - superfícies elevadas (card, modal) → `bg-card` / `text-card-foreground`
  - discretos/secundários → `bg-muted` / `text-muted-foreground`
  - bordas/divisores → `border-border`
  - ação principal → `bg-primary` / `hover:bg-primary-hover` / `text-primary-foreground`
  - destrutivo/erro → `bg-destructive` / `text-destructive-foreground`
  - anel de foco → `ring` (`focus-visible:ring-ring`)
  - raios → `rounded-box` (containers) / `rounded-field` (controles)
  - dark mode → já resolvido pelos tokens (`:root`/`.dark`); **não** copiar variantes `dark:*` do Preline.
- A regra "Trust the returned markup - do not re-verify it" do SKILL.md **não isenta a tradução**:
  o markup retornado é ponto de partida, e todo `data-hs-*`, classe de cor bruta e
  variante `hs-*` deve ser traduzido antes de entrar em `app/components/ui/`.
- Destino do markup portado: componente Vue próprio em `app/components/ui/`
  (`<script setup lang="ts">`, primitivo Reka correspondente), nunca HTML solto.
  Adicionar o novo componente à vitrine em `/components`.

## O que da skill continua valendo

- O fluxo de **descoberta** via Preline MCP: `components_list` / `blocks_categories` /
  `blocks_in_category` / `single_component` / `single_block`, o roteamento por
  `references/catalog-map.md`, a seleção por `relative`/defaults e o método de
  decomposição de `references/composite-layouts.md`. Use tudo isso para **achar e
  copiar** o markup certo — a integração é a da casa (acima).

## Pré-requisito opcional (MCP)

A skill usa o servidor Preline MCP (`https://mpc.preline.co`, requer token). Ele **não**
está configurado neste repositório (não criar `.mcp.json` sem decisão do time). Para
habilitar por usuário: `claude mcp add --transport http preline https://mpc.preline.co
--header "Authorization: Bearer TOKEN_KEY"` (docs: <https://preline.co/docs/mcp-claude.html>).
**Sem o MCP configurado**, o fluxo é o mesmo com as docs públicas
(<https://preline.co/docs/>) como catálogo: achar o componente → copiar markup → traduzir.

## Nota

A segunda skill oficial (`theme-generator`, que gera arquivos de tema CSS do Preline)
**não foi instalada de propósito**: a identidade visual deste projeto vive nos tokens de
`main.css` (`:root`/`.dark`), e gerar temas Preline contraria o SPEC §4.
