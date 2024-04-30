<template>
  <div
    ref="canvasRef"
    class="w-full h-full relative flex-grow bg-dots"
    id="canvas"
  >
    <svg
      ref="stageRef"
      class="w-full h-full"
      @touchstart="onStageMousedown"
      @touchend="onStageMouseUp"
      @touchmove="onStageMouseMove"
      @mousedown="onStageMousedown"
      @mouseup="onStageMouseUp"
      @mousemove="onStageMouseMove"
    >
      <g
        id="diagram"
        ref="diagramRef"
        :class="['origin-top-left', svgClass]"
      >
        <g class="select-none">
          <Relationship
            v-for="(r, i) in relationships"
            :key="r.id"
            :tableStyle="tableStyle"
            v-model="relationships[i]"
          />
        </g>
        <Table
          v-for="(table, index) in tables"
          :key="table.id"
          v-model="tables[index]"
          :tableStyle="tableStyle"
          class="ring-1 ring-neutral-800 hover:ring-2 hover:ring-offset-2 hover:ring-blue-500"
          @dragstart="onTableDragStart"
        />
      </g>
    </svg>
  </div>
</template>
<script setup>
import Table from "@/components/workspace/Table.vue";
import Relationship from "@/components/workspace/Relationship.vue";
import { template1 } from "@/templates/template1.js";
import { ref } from "vue";
import {
  ObjectType,
  ShowTableStyle,
  tableWidth,
} from "@/constants/constants.js";
import tableHeight from "@/utils/tableHeight.js";

defineProps({
  svgClass: {
    type: String,
  },
});

const [tables, relationships] = [
  ref(template1.tables),
  ref(template1.relationships),
];
relationships.value.forEach((r) => {
  if (typeof r.fromTable === "string") {
    r.fromTable = tables.value.find((t) => t.id === r.fromTable);
  }
  if (typeof r.toTable === "string") {
    r.toTable = tables.value.find((t) => t.id === r.toTable);
  }
});
const tableStyle = ref(ShowTableStyle.ALL_FIELDS);
const canvasRef = ref();
const diagramRef = ref();
const cursor = ref("grabbing");
const { innerWidth, innerHeight } = window;
const stagePosition = ref({
  isPanning: false,
});
const dragElDefault = () => {
  return {
    el: ObjectType.NONE,
    id: -1,
    prevX: 0,
    prevY: 0,
    offsetX: 0,
    offsetY: 0,
  };
};
const dragEl = ref(dragElDefault());

function onStageMousedown(event) {
  stagePosition.value = {
    isPanning: true,
  };
}

function onStageMouseMove(e) {
  if (!stagePosition.value.isPanning || !dragEl.value.el) {
    return;
  }
  let { clientX, clientY } = e;
  if (e instanceof TouchEvent) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }
  let dx = 0;
  let dy = 0;
  switch (dragEl.value.el) {
    case ObjectType.TABLE:
      dx = clientX - dragEl.value.offsetX;
      dy = clientY - dragEl.value.offsetY;
      const table = tables.value.find((t) => t.id === dragEl.value.id);
      table.x = dx;
      table.y = dy;
      break;
    default:
      break;
  }
}

function onStageMouseUp() {
  stagePosition.value.isPanning = false;
  dragEl.value = dragElDefault();
}

function onTableDragStart(e, id, type) {
  let { clientX, clientY } = e;
  if (e instanceof TouchEvent) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }
  const table = tables.value.find((t) => t.id === id);
  dragEl.value = {
    el: type,
    id: id,
    offsetX: clientX - table.x,
    offsetY: clientY - table.y,
    prevX: table.x,
    prevY: table.y,
  };
}

const minX = Math.min(...tables.value.map((t) => t.x));
const minY = Math.min(...tables.value.map((t) => t.y));
const maxX = Math.max(...tables.value.map((t) => t.x + tableWidth));
const maxY = Math.max(
  ...tables.value.map((t) => t.y + tableHeight(t, tableStyle.value)),
);

const diagramWidth = maxX - minX;
const diagramHeight = maxY - minY;
function translate(scale) {
  diagramRef.value.style.transform = `scale(${scale})`;
}
defineExpose({
  diagramWidth,
  diagramHeight,
  translate
});
</script>

<style scoped></style>
