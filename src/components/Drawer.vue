<template>
  <Teleport to="body">
    <Transition appear name="fade">
      <div v-if="visible" class="overlay" @click="close" ref="overlay">
        <div class="drawer" :class="direction" @click.stop>
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(false);

defineProps({
  direction: {
    type: String,
    default: "ltr",
  }
})

function open() {
  visible.value = true;
}

function close() {
  visible.value = false;
}

defineExpose({
  open,
  close,
});
</script>

<style scoped>
.drawer {
  position: absolute;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s;
}
</style>
