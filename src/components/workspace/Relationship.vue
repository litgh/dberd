<script setup>
defineProps({
  tableStyle: {
    type: String
  }
})
defineEmits(['click'])
/**
 * @type {ModelRef<import("@/types/types").Relationship | undefined, string>}
 */
const model = defineModel();
</script>

<template>
    <path
      :d="model.calPath(1, tableStyle)"
      stroke="gray"
      fill="none"
      class="hover:stroke-sky-700"
      stroke-width="2"
      cursor="pointer"
      @click="$emit('click', $event, model.id)"
     />
</template>

<style scoped></style>
