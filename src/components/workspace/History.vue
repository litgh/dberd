<script setup>
import useUndoRedo from "@/store/useUndoRedo";

const { history } = useUndoRedo();
</script>

<template>
  <div class="flex flex-col text-gray-600 py-4 overflow-auto">
    <div class="flex items-center p-4 mb-2">
      <Icon size="24">
        <i-clarity-timeline-line />
      </Icon>
      <span class="ml-2 text-lg font-bold">History</span>
    </div>
    <div v-for="(h, i) in history" :key="'h_' + i"
         class="flex flex-col hover:bg-gray-200 px-4 py-2 text-wrap max-w-[400px] border-b">
      <div>{{ h.message }}</div>
      <div class="text-xs text-gray-500">{{ h.time.toLocaleString() }}</div>
    </div>
  </div>
</template>

<style scoped></style>
