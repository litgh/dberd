import { defineStore } from "pinia";
import { ref } from "vue";

export default defineStore('transform', () => {
  const transform = ref({
    zoom: 1,
    position: { x: 0, y: 0 },
  })

  return {
    transform,
  }
})