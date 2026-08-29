// Store-referência da base: novos stores seguem este formato (setup store, SPEC §5).
export const useAppStore = defineStore('app', () => {
  const sidebarOpen = ref(false)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  return { sidebarOpen, toggleSidebar }
})
