<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => (isNotFound.value ? 'Página não encontrada — Nuxt Base' : 'Erro — Nuxt Base'),
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-foreground">
    <p class="text-sm font-semibold text-primary">
      {{ error.statusCode }}
    </p>
    <h1 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
      {{ isNotFound ? 'Página não encontrada' : 'Algo deu errado' }}
    </h1>
    <p class="mt-3 max-w-md text-center text-sm text-muted-foreground">
      {{
        isNotFound
          ? 'O endereço acessado não existe ou foi movido. Confira a URL ou volte para a página inicial.'
          : (error.statusMessage || 'Ocorreu um erro inesperado. Tente novamente em instantes.')
      }}
    </p>
    <button
      type="button"
      class="mt-8 inline-flex items-center gap-x-2 rounded-field bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      @click="goHome"
    >
      Voltar ao início
    </button>
  </div>
</template>
