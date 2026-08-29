<script setup lang="ts">
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background text-foreground">
    <header class="border-b border-border">
      <div class="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <NuxtLink
          to="/"
          class="text-sm font-semibold tracking-tight"
        >
          Nuxt Base
        </NuxtLink>

        <nav
          class="flex items-center gap-1"
          aria-label="Navegação principal"
        >
          <NuxtLink
            to="/"
            class="rounded-field px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Início
          </NuxtLink>

          <NuxtLink
            to="/components"
            class="rounded-field px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Componentes
          </NuxtLink>

          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-field text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Alternar tema claro/escuro"
            @click="toggleColorMode"
          >
            <!-- O tema efetivo só é conhecido no client; renderizar o ícone no SSR causaria hydration mismatch -->
            <ClientOnly>
              <Icon
                :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'"
                class="size-4"
              />
              <template #fallback>
                <span
                  class="size-4"
                  aria-hidden="true"
                />
              </template>
            </ClientOnly>
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <slot />
    </main>

    <footer class="border-t border-border">
      <div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <p class="text-xs text-muted-foreground">
          Nuxt Base — template para começar projetos Nuxt 4.
        </p>
      </div>
    </footer>

    <UiToaster />
  </div>
</template>
