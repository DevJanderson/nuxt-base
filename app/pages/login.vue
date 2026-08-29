<script setup lang="ts">
// Auth é ponto de encaixe (SPEC §6): a base não implementa autenticação.
// Ao adotar uma das receitas do README — sessão no servidor com nuxt-auth-utils
// ou token contra API externa injetado no useApi — substitua esta página.
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Entrar — Nuxt Base',
  description: 'Placeholder de autenticação da base Nuxt 4.',
})
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="w-full max-w-md rounded-box border border-border bg-card p-8 text-center shadow-2xs">
      <span class="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-muted text-primary">
        <Icon
          name="lucide:lock"
          class="size-5"
        />
      </span>
      <h1 class="mt-4 text-lg font-semibold text-card-foreground">
        Autenticação é um ponto de encaixe
      </h1>
      <p class="mt-2 text-sm text-muted-foreground">
        A base não implementa auth. Escolha uma das receitas do README — sessão no
        servidor (nuxt-auth-utils) ou token contra API externa — e substitua esta
        página pelo fluxo real do seu projeto.
      </p>
      <NuxtLink
        to="/"
        class="mt-6 inline-flex items-center gap-x-2 rounded-field bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Voltar ao início
      </NuxtLink>
    </div>
  </div>
</template>
