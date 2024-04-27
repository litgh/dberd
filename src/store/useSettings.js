import { defineStore } from "pinia";
import { ref, watch } from "vue";

export default defineStore('settings', () => {
  const settings = ref({
    mode: 'light',
    autoSave: true,
    panning: true,
    lock: false,
  })

  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings)
  }

  watch(settings, (v) => {
    localStorage.setItem('settings', JSON.stringify(v))
  }, {
    deep: true
  })

  return {
    settings
  }
})