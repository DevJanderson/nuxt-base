# Checklist de acessibilidade — kit `app/components/ui/`

Checklist objetivo para todo componente novo do kit. Exemplo que cumpre todos os itens:
`app/components/ui/Select.vue`.

## Label e associação

- [ ] Controle com rótulo visível tem `<label :for="id">` apontando para o elemento
      rotulável (id gerado com `useId()` — nunca id fixo, que colide em SSR/listas).
- [ ] Sem rótulo visível? `aria-label` no controle.
- [ ] Ícones decorativos com `aria-hidden="true"`.

## Navegação por teclado

- [ ] Tudo alcançável por Tab — elementos nativos ou primitivo Reka; sem `tabindex` positivo.
- [ ] Componente com comportamento (abrir/fechar, seleção, navegação em lista):
      setas/Enter/Esc funcionam. Isso vem de graça do primitivo Reka certo —
      se não veio, o primitivo escolhido está errado.
- [ ] `disabled` de verdade: atributo nativo `disabled` ou `data-[disabled]` +
      `pointer-events-none` + `opacity-50`.

## Estado de erro

- [ ] `aria-invalid="true"` no controle quando a prop `error` estiver presente.
- [ ] Mensagem de erro em elemento com `id` próprio, referenciado por `aria-describedby`.
- [ ] Erro nunca comunicado só por cor: há texto visível.

## Foco visível

- [ ] Anel de foco com o token `ring` (`focus-visible:ring-ring` / `focus:ring-ring`).
- [ ] Nunca remover o outline sem substituto visível (`outline-hidden` só acompanhado de ring).

## Contraste

- [ ] Somente tokens semânticos de `app/assets/css/main.css` — os pares
      foreground/background (`bg-card` + `text-card-foreground`, etc.) são validados
      no token, não no componente. Sem cor bruta, o contraste (claro e escuro) é
      responsabilidade do `main.css`.
