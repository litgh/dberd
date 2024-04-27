<template>
  <i :style="{'font-size': size + 'px', 'color': color}">
    <slot/>
  </i>
</template>
<script setup>
defineProps({
  size: {
    type: String,
  },
  color: {
    type: String,
  },
});
</script>
