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

const terms = ref(true)
const newsletter = ref(false)
const disabledCheck = ref(true)

const topics = [
  { label: 'Lançamentos', value: 'releases' },
  { label: 'Segurança', value: 'security' },
  { label: 'Comunidade', value: 'community' },
]

const selectedTopics = reactive<Record<string, boolean | 'indeterminate'>>({
  releases: true,
  security: false,
  community: false,
})

// Marca-tudo: computed com setter, então o v-model do checkbox faz os dois sentidos
const allTopics = computed<boolean | 'indeterminate'>({
  get() {
    const checked = topics.filter(topic => selectedTopics[topic.value])
    if (checked.length === 0) return false
    return checked.length === topics.length ? true : 'indeterminate'
  },
  set(value) {
    for (const topic of topics) {
      selectedTopics[topic.value] = value === true
    }
  },
})

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
        Vitrine do kit próprio: comportamento via Reka UI, visual portado
        do Preline, tudo estilizado só com os tokens semânticos da base.
        As convenções são as de mercado — nomes de variante, escala densa de alturas,
        <code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">cva</code> e
        <code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">data-slot</code> —, a
        aparência continua sendo a nossa.
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
        <UiButton variant="secondary">
          Duplicar
        </UiButton>
        <UiButton variant="ghost">
          Saiba mais
        </UiButton>
        <UiButton variant="destructive">
          Excluir
        </UiButton>
        <UiButton variant="link">
          Ver documentação
        </UiButton>
        <UiButton disabled>
          Desabilitado
        </UiButton>
      </div>
      <p class="text-sm text-muted-foreground">
        A escala de altura é a densa: 24px (<code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">xs</code>),
        28px (<code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">sm</code>),
        32px (<code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">default</code>) e
        36px (<code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">lg</code>).
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <UiButton size="xs">
          Extra pequeno
        </UiButton>
        <UiButton size="sm">
          Pequeno
        </UiButton>
        <UiButton>Padrão</UiButton>
        <UiButton size="lg">
          Grande
        </UiButton>
      </div>
      <p class="text-sm text-muted-foreground">
        Os tamanhos <code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">icon*</code> são
        quadrados, com a mesma altura dos tamanhos de texto — para ação sem rótulo, sempre
        com <code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">aria-label</code>.
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <UiButton
          size="icon-xs"
          variant="outline"
          aria-label="Adicionar"
        >
          <Icon
            name="lucide:plus"
            class="size-3"
            aria-hidden="true"
          />
        </UiButton>
        <UiButton
          size="icon-sm"
          variant="outline"
          aria-label="Editar"
        >
          <Icon
            name="lucide:pencil"
            class="size-3.5"
            aria-hidden="true"
          />
        </UiButton>
        <UiButton
          size="icon"
          aria-label="Salvar"
        >
          <Icon
            name="lucide:check"
            class="size-4"
            aria-hidden="true"
          />
        </UiButton>
        <UiButton
          size="icon-lg"
          variant="destructive"
          aria-label="Excluir"
        >
          <Icon
            name="lucide:trash-2"
            class="size-4"
            aria-hidden="true"
          />
        </UiButton>
      </div>
      <p class="text-sm text-muted-foreground">
        Com a prop <code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">to</code> o
        botão vira <code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">NuxtLink</code>,
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
        Checkbox
      </h2>
      <div class="grid max-w-3xl gap-6 sm:grid-cols-2">
        <UiCheckbox
          v-model="terms"
          label="Aceito os termos de uso"
          hint="Você pode revogar o aceite depois nas configurações."
        />
        <UiCheckbox
          v-model="newsletter"
          label="Quero receber a newsletter"
          error="Confirme o recebimento para continuar."
        />
        <UiCheckbox
          v-model="disabledCheck"
          label="Opção indisponível"
          disabled
        />
        <UiCheckbox
          v-model="allTopics"
          label="Todos os assuntos"
        />
      </div>
      <div class="ms-7 space-y-2">
        <UiCheckbox
          v-for="topic in topics"
          :key="topic.value"
          v-model="selectedTopics[topic.value]"
          :label="topic.label"
        />
      </div>
      <p class="text-sm text-muted-foreground">
        O estado <code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">indeterminate</code>
        é o do marca-tudo parcial: "Todos os assuntos" acima o assume sozinho quando só
        parte dos assuntos está marcada.
      </p>
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
        Informe sempre a <code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">description</code>:
        é ela que o leitor de tela anuncia ao abrir o diálogo. Sem ela o componente cai num
        fallback oculto com o título, que é só rede de segurança para o
        <code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">aria-describedby</code>.
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
        <UiBadge>Padrão</UiBadge>
        <UiBadge variant="secondary">
          Secundário
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
        Alert
      </h2>
      <p class="text-sm text-muted-foreground">
        Mensagem estática da página (aviso de ambiente, erro de formulário já renderizado).
        Para mensagem que aparece em resposta a uma ação, use
        <code class="rounded-md bg-muted px-1.5 py-0.5 text-xs">useToast()</code>,
        que anuncia em live region.
      </p>
      <div class="grid max-w-3xl gap-4">
        <UiAlert>
          Este é um ambiente de demonstração: os dados são reiniciados todo dia.
        </UiAlert>
        <UiAlert title="Publicação agendada">
          A página vai ao ar automaticamente na data escolhida. Dá para cancelar
          enquanto o status for “agendada”.
        </UiAlert>
        <UiAlert variant="destructive">
          Não foi possível carregar a lista de projetos.
        </UiAlert>
        <UiAlert
          variant="destructive"
          title="Erro ao salvar"
        >
          Verifique os campos destacados e envie o formulário novamente.
        </UiAlert>
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
          <UiBadge :variant="value === 'Ativo' ? 'default' : 'secondary'">
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
