/**
 * Store-referência da base: novos stores seguem este formato (setup store, SPEC §5).
 * @public — sem uso por design (o knip ignora); apague ou adapte ao derivar o projeto.
 */
export const useAppStore = defineStore('app', () => {
  const sidebarOpen = ref(false)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  return { sidebarOpen, toggleSidebar }
})
