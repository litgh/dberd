<template>
  <Teleport to="body">
    <Transition appear name="fade">
      <div v-if="visible" class="overlay flex justify-center items-center" @click="close" ref="overlay">
        <div class="inset-0 top-1/3 left-1/2" @click.stop>
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { ref } from "vue";

const visible = ref(false);
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

</style>