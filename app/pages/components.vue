<script setup lang="ts">
useSeoMeta({
  title: 'Componentes — Nuxt Base',
  description: 'Vitrine do kit de componentes próprio: comportamento Reka UI, visual portado do Preline, tokens da base.',
})

const toast = useToast()

const name = ref('')
const email = ref('email-invalido')
const framework = ref<string>()
const modalOpen = ref(false)
const modalFramework = ref<string>()

const frameworks = [
  { label: 'Nuxt', value: 'nuxt' },
  { label: 'Vue', value: 'vue' },
  { label: 'Astro', value: 'astro' },
  { label: 'Svelte (indisponível)', value: 'svelte', disabled: true },
]

const tableColumns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'role', label: 'Papel' },
  { key: 'status', label: 'Status' },
]

const tableRows = [
  { name: 'Ana Souza', email: 'ana@exemplo.com', role: 'Admin', status: 'Ativo' },
  { name: 'Bruno Lima', email: 'bruno@exemplo.com', role: 'Editor', status: 'Ativo' },
  { name: 'Carla Nunes', email: 'carla@exemplo.com', role: 'Leitora', status: 'Inativo' },
  { name: 'Diego Alves', email: 'diego@exemplo.com', role: 'Editor', status: 'Ativo' },
]
</script>

<template>
  <div class="space-y-12">
    <header>
      <h1 class="text-2xl font-bold tracking-tight">
        Componentes
      </h1>
      <p class="mt-2 text-muted-foreground">
        Vitrine do kit próprio (SPEC §4): comportamento via Reka UI, visual portado
        do Preline, tudo estilizado só com os tokens semânticos da base.
      </p>
    </header>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">
        Button
      </h2>
      <div class="flex flex-wrap items-center gap-3">
        <UiButton>Salvar</UiButton>
        <UiButton variant="outline">
          Cancelar
        </UiButton>
        <UiButton variant="ghost">
          Saiba mais
        </UiButton>
        <UiButton variant="destructive">
          Excluir
        </UiButton>
        <UiButton disabled>
          Desabilitado
        </UiButton>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <UiButton size="sm">
          Pequeno
        </UiButton>
        <UiButton size="md">
          Médio
        </UiButton>
        <UiButton size="lg">
          Grande
        </UiButton>
      </div>
      <p class="text-sm text-muted-foreground">
        Com a prop <code class="rounded-field bg-muted px-1.5 py-0.5 text-xs">to</code> o
        botão vira <code class="rounded-field bg-muted px-1.5 py-0.5 text-xs">NuxtLink</code>,
        mantendo variantes e tamanhos.
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <UiButton to="/">
          Ir para a home
        </UiButton>
        <UiButton
          to="/login"
          variant="outline"
        >
          Link outline
        </UiButton>
        <UiButton
          to="/login"
          disabled
        >
          Link desabilitado
        </UiButton>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">
        Input
      </h2>
      <div class="grid max-w-3xl gap-6 sm:grid-cols-2">
        <UiInput
          v-model="name"
          label="Nome"
          placeholder="Maria da Silva"
          hint="Como aparece no seu documento."
        />
        <UiInput
          v-model="email"
          type="email"
          label="E-mail"
          placeholder="voce@exemplo.com"
          error="Informe um endereço de e-mail válido."
        />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">
        Select
      </h2>
      <div class="max-w-xs">
        <UiSelect
          v-model="framework"
          :items="frameworks"
          label="Framework"
          placeholder="Escolha um framework…"
        />
      </div>
      <p class="text-sm text-muted-foreground">
        Selecionado: {{ framework ?? 'nenhum' }}
      </p>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">
        Modal
      </h2>
      <p class="text-sm text-muted-foreground">
        Informe sempre a <code class="rounded-field bg-muted px-1.5 py-0.5 text-xs">description</code>:
        é ela que o leitor de tela anuncia ao abrir o diálogo. Sem ela o componente cai num
        fallback oculto com o título, que é só rede de segurança para o
        <code class="rounded-field bg-muted px-1.5 py-0.5 text-xs">aria-describedby</code>.
      </p>
      <UiModal
        v-model:open="modalOpen"
        title="Confirmar publicação"
        description="Esta ação publica a página imediatamente para todos os visitantes."
      >
        <template #trigger>
          <UiButton>Abrir modal</UiButton>
        </template>

        <!-- Select portalizado dentro do modal: confere a escala de z-index a olho nu -->
        <div class="mb-4 max-w-xs">
          <UiSelect
            v-model="modalFramework"
            :items="frameworks"
            label="Framework"
            placeholder="Escolha um framework…"
          />
        </div>

        <p class="text-sm">
          Revise as informações antes de confirmar. Dá para fechar com Esc, clicando
          fora ou no botão de fechar — o foco fica preso no diálogo enquanto aberto.
        </p>

        <template #footer>
          <UiButton
            variant="outline"
            @click="modalOpen = false"
          >
            Cancelar
          </UiButton>
          <UiButton @click="modalOpen = false">
            Confirmar
          </UiButton>
        </template>
      </UiModal>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">
        Card
      </h2>
      <UiCard class="max-w-md">
        <template #header>
          <h3 class="text-sm font-semibold">
            Resumo do projeto
          </h3>
        </template>

        <p class="text-sm text-muted-foreground">
          Cards agrupam conteúdo relacionado. Header e footer são slots opcionais;
          o corpo é o slot default.
        </p>

        <template #footer>
          <div class="flex justify-end gap-x-2">
            <UiButton
              size="sm"
              variant="outline"
            >
              Detalhes
            </UiButton>
            <UiButton size="sm">
              Continuar
            </UiButton>
          </div>
        </template>
      </UiCard>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">
        Badge
      </h2>
      <div class="flex flex-wrap items-center gap-3">
        <UiBadge>Neutro</UiBadge>
        <UiBadge variant="primary">
          Primário
        </UiBadge>
        <UiBadge variant="destructive">
          Destrutivo
        </UiBadge>
        <UiBadge variant="outline">
          Outline
        </UiBadge>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">
        Table
      </h2>
      <UiTable
        :columns="tableColumns"
        :rows="tableRows"
      >
        <template #cell-status="{ value }">
          <UiBadge :variant="value === 'Ativo' ? 'primary' : 'neutral'">
            {{ value }}
          </UiBadge>
        </template>
      </UiTable>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">
        Toast
      </h2>
      <div class="flex flex-wrap items-center gap-3">
        <UiButton @click="toast.success('Alterações salvas com sucesso.')">
          Toast de sucesso
        </UiButton>
        <UiButton
          variant="destructive"
          @click="toast.error('Não foi possível salvar. Tente novamente.', { title: 'Erro ao salvar' })"
        >
          Toast de erro
        </UiButton>
        <UiButton
          variant="outline"
          @click="toast.info('Uma nova versão da base está disponível.')"
        >
          Toast de informação
        </UiButton>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">
        Tooltip
      </h2>
      <div class="flex flex-wrap items-center gap-3">
        <UiTooltip text="Dica exibida acima (padrão)">
          <UiButton variant="outline">
            Passe o mouse
          </UiButton>
        </UiTooltip>
        <UiTooltip
          text="Dica exibida abaixo"
          side="bottom"
        >
          <UiButton variant="outline">
            Tooltip embaixo
          </UiButton>
        </UiTooltip>
        <UiTooltip
          text="Sem atraso na exibição"
          :delay-duration="0"
        >
          <UiButton variant="ghost">
            Sem delay
          </UiButton>
        </UiTooltip>
      </div>
    </section>
  </div>
</template>
