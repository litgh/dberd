<script setup>
import Canvas from "@/components/workspace/Canvas.vue";
import Toolbar from "@/components/workspace/Toolbar.vue";
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
  <Toolbar />
  <div
    id="workspace"
    class="flex h-full overflow-y-auto relative"
    @mouseup="resizing = false"
    @mouseleave="resizing = false"
    @mousemove="handleResize"
  >
<!--    <SidePanel :width="width" @resizeStart="resizing = true" />-->
    <Canvas />
  </div>
</template>

