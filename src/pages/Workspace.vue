<script setup>
import Canvas from "@/components/workspace/Canvas.vue";
import SidePanel from "@/components/workspace/SidePanel.vue";
import { ref } from "vue";

const resizing = ref(false);
const width = ref(400);

function handleResize(event) {
  if (!resizing.value) {
    return;
  }
  const w = event.clientX;
  if (w >= 400) {
    width.value = w;
  }
}
</script>

<template>
  <div
    class="flex h-full overflow-y-auto"
    @mouseup="resizing = false"
    @mouseleave="resizing = false"
    @mousemove="handleResize"
    @keyup=""
  >
    <SidePanel :width="width" @resizeStart="resizing = true" />
    <Canvas />
  </div>
</template>

<style scoped></style>
