<script setup lang="ts">
// Catch-all: sem esta rota o vue-router loga o warning VUE_ROUTER_R0004 em produção
// para qualquer URL inexistente. Lançar o erro no setup entrega o 404 ao app/error.vue.
throw createError({
  statusCode: 404,
  statusMessage: 'Página não encontrada',
  fatal: true,
})
</script>

<template>
  <div />
</template>
