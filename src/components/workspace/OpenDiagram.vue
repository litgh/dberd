<template>
  <div class="flex flex-col justify-between rounded-md bg-white p-4 w-[600px] min-h-[200px]">
    <div>
      <div class="text-lg font-bold mb-4">Open Diagram</div>
      <div>
        <table class="w-full border-separate border-spacing-x-0 text-left">
          <thead>
          <tr>
            <th>Name</th>
            <th>Created At</th>
            <th>Size</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="diagram in allDiagrams" :key="diagram.id"
              @click="selectedDiagram = diagram.id"
              :class="['hover:bg-gray-100 cursor-pointer text-gray-600', selectedDiagram === diagram.id ? 'bg-gray-100' : '']">
            <td>{{ diagram.name }}</td>
            <td>{{ diagram.createdAt.toLocaleString() }}</td>
            <td>{{ getDiagramSize(diagram) }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="flex justify-end">
      <button class="btn" @click="load">Open</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import useDiagram from "@/store/useDiagram.js";

const emit = defineEmits(['close'])
const { diagrams, loadDiagram } = useDiagram();
const allDiagrams = ref([]);
const selectedDiagram = ref();
diagrams().then(l => allDiagrams.value = l)

const getDiagramSize = (d) => {
  const size = JSON.stringify(d).length;
  let sizeStr;
  if (size >= 1024 && size < 1024 * 1024)
    sizeStr = (size / 1024).toFixed(1) + "KB";
  else if (size >= 1024 * 1024)
    sizeStr = (size / (1024 * 1024)).toFixed(1) + "MB";
  else sizeStr = size + "B";

  return sizeStr;
};

const load = () => {
  if (selectedDiagram.value) {
    loadDiagram(selectedDiagram.value);
  }
  emit('close')
}
</script>
<style scoped>
</style>