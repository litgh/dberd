<template>
  <div
    class="flex flex-col justify-between rounded-md bg-white p-4 w-[600px] min-h-[200px]"
  >
    <div>
      <div class="text-lg font-bold mb-4">Open Diagram</div>
      <div>
        <table class="w-full border-separate border-spacing-x-0 text-left">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Created At</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="diagram in allDiagrams"
              :key="diagram.id"
              @click="select(diagram.id)"
              :class="[
                'hover:bg-gray-100 cursor-pointer text-gray-600',
                selectedDiagram.includes(diagram.id) ? 'bg-gray-100' : '',
              ]"
            >
              <td>
                <input
                  type="checkbox"
                  :value="diagram.id"
                  v-model="selectedDiagram"
                  :checked="selectedDiagram.includes(diagram.id)"
                />
              </td>
              <td>{{ diagram.name }}</td>
              <td>{{ diagram.createdAt.toLocaleString() }}</td>
              <td>{{ getDiagramSize(diagram) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-show="allDiagrams.length > 0" class="flex justify-end mt-2">
      <button class="btn btn-primary" @click="load" :disabled="selectedDiagram.length === 0 || selectedDiagram.length > 1">Open</button>
      <button class="btn ml-2 bg-[#F56C6C] text-white" @click="del" :disabled="selectedDiagram.length === 0">Delete</button>
    </div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import hotkeys from "hotkeys-js";
import useDiagram from "@/store/useDiagram.js";

const emit = defineEmits(["close"]);
const { diagrams, loadDiagram, deleteDiagram } = useDiagram();
const allDiagrams = ref([]);
const selectedDiagram = ref([]);
diagrams().then((l) => (allDiagrams.value = l));

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
  if (selectedDiagram.value.length === 1) {
    loadDiagram(selectedDiagram.value[0]);
  }
  emit("close");
};
const del = async () => {
  if (selectedDiagram.value.length > 0) {
    if (confirm("Are you sure to delete the selected diagrams?")) {
      for (let id of selectedDiagram.value) {
        await deleteDiagram(id)
      }
    }
  }
  emit("close");
};
const select = (id) => {
  const i = selectedDiagram.value.indexOf(id);
  if (i >= 0) {
    selectedDiagram.value.splice(i, 1);
  } else {
    selectedDiagram.value.push(id);
  }
};

onMounted(() => {
  hotkeys("esc", () => emit("close"))
});
onUnmounted(() => {
  hotkeys.unbind("esc");
});
</script>
<style scoped></style>