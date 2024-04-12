<script setup>
import { ref } from "vue";
import useTransform from "@/store/useTransform.js";

/**
 * @type {ModelRef<import("@/types/types").Relationship | undefined, string>}
 */
const model = defineModel();
const pathRef = ref();
</script>

<template>
  <g class="select-none group">
    <path
      ref="pathRef"
      :d="model.calPath(1)"
      stroke="gray"
      fill="none"
      class="group-hover:stroke-sky-700"
      stroke-width="2"
      cursor="pointer"
    ></path>
  </g>
</template>

<style scoped></style>
