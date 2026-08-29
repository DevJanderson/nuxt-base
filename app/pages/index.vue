<script setup lang="ts">
useSeoMeta({
  title: 'Nuxt Base — ponto de partida para qualquer projeto',
  description:
    'Template Nuxt 4 com SSR por padrão, design tokens em Tailwind 4 e pontos de encaixe prontos para backend e auth.',
})

const highlights = [
  {
    icon: 'lucide:server',
    title: 'SSR por padrão',
    description:
      'Renderização no servidor ligada desde o início, com receita documentada para virar SPA quando o projeto pedir.',
  },
  {
    icon: 'lucide:palette',
    title: 'Design tokens',
    description:
      'Cores, tipografia e raios definidos em um único CSS. Trocar a identidade visual é editar tokens, não caçar classes.',
  },
  {
    icon: 'lucide:rocket',
    title: 'Pronto para qualquer projeto',
    description:
      'Dashboard, SaaS ou site com SEO: a base não impõe backend nem auth — deixa os pontos de encaixe preparados.',
  },
]
</script>

<template>
  <section>
    <div class="max-w-2xl">
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        Uma base Nuxt 4 pronta para virar o seu próximo projeto
      </h1>
      <p class="mt-4 text-base text-muted-foreground">
        Template enxuto com Tailwind 4, Reka UI, Pinia e dark mode integrado aos tokens.
        Copie, renomeie, edite os tokens e comece a construir.
      </p>
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-x-2 rounded-field bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Ver placeholder de login
        </NuxtLink>
        <span class="inline-flex items-center gap-x-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Icon
            name="lucide:sparkles"
            class="size-3.5"
          />
          Copy-and-own na UI
        </span>
      </div>
    </div>

    <div class="mt-12 grid gap-4 sm:grid-cols-3">
      <div
        v-for="item in highlights"
        :key="item.title"
        class="flex flex-col rounded-box border border-border bg-card p-6 shadow-2xs"
      >
        <span class="inline-flex size-10 items-center justify-center rounded-field bg-muted text-primary">
          <Icon
            :name="item.icon"
            class="size-5"
          />
        </span>
        <h2 class="mt-4 text-sm font-semibold text-card-foreground">
          {{ item.title }}
        </h2>
        <p class="mt-2 text-sm text-muted-foreground">
          {{ item.description }}
        </p>
      </div>
    </div>
  </section>
</template>
