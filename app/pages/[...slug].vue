<script setup lang="ts">
// Catch-all: sem esta rota o vue-router loga o warning VUE_ROUTER_R0004 em produção
// para qualquer URL inexistente. Lançar o erro no setup entrega o 404 ao app/error.vue.
// `fatal` só no client: é o que faz a navegação interna abrir a página de erro. No SSR o
// erro já rende a página de erro sem `fatal`, e sem `fatal` o Nitro não loga stack trace
// de 404 como "[request error] [fatal]". `statusMessage` curto e ASCII (o h3 sanitiza
// textos longos); o texto em pt-BR vai em `message`.
throw createError({
  statusCode: 404,
  statusMessage: 'Not Found',
  message: 'Página não encontrada',
  fatal: import.meta.client,
})
</script>

<template>
  <div />
</template>
