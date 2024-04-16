import { defineStore } from "pinia";
import { ref } from "vue";

export default defineStore('transform', () => {
  const transform = ref({
    zoom: 1,
    width: window.innerWidth - 400,
    height: window.innerHeight,
    position: { x: 0, y: 0 },
  })

  return {
    transform,
  }
})