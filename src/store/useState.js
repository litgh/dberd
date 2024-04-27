import { defineStore } from "pinia";
import { State } from "@/constants/constants.js";
import { ref } from "vue";

export default defineStore('state', () => {
  const state = ref({
    state: State.NONE,
    lastSaved: new Date()
  })
  const selectedTable = ref([])
  return {
    state,
    selectedTable
  }
})