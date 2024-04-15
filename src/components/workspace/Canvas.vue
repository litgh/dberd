<script setup>
import useDiagram from "@/store/useDiagram.js";
import useTransform from "@/store/useTransform";
import { ObjectType, ShowTableStyle, tableWidth } from "@/constants/constants";
import Table from "@/components/workspace/Table.vue";
import Relationship from "@/components/workspace/Relationship.vue";
import { computed, ref, watch } from "vue";
import { debounce } from "lodash-es";
import { ZoomIn, ZoomOut, Maximize, Table2 } from "lucide-vue-next";
import { storeToRefs } from "pinia";

const diagramStore = useDiagram();
const { currentDiagram } = storeToRefs(diagramStore);
const { addRelationship } = useDiagram();
const { transform } = useTransform();
const cursor = ref("default");
const stage = ref();
const canvas = ref();
const { innerWidth, innerHeight } = window;
const stagePosition = ref({
  isMoving: false,
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
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
/**
 *
 * @type {Ref<UnwrapRef<{
 *   fromTable: number,
 *   fromField: number,
 *   startX: number,
 *   startY: number,
 *   toTable: number,
 *   toField: number,
 *   endX: number,
 *   endY: number,
 * }>>}
 */
const linking = ref({
  fromTable: -1,
  fromField: -1,
  startX: 0,
  startY: 0,
  toTable: -1,
  toField: -1,
  endX: 0,
  endY: 0,
});
const guideLines = ref({ v: -1, h: -1 });

const linkPath = computed(() => {
  return `M ${linking.value.startX} ${linking.value.startY} L ${linking.value.endX} ${linking.value.endY}`;
});

watch(cursor, (newVal) => {
  stage.value.style.cursor = newVal;
});

function onStageMousedown(event) {
  stagePosition.value = {
    isMoving: true,
    x: transform.position.x,
    y: transform.position.y,
    dx: event.clientX,
    dy: event.clientY,
  };
  cursor.value = "grabbing";
}

function onStageMouseMove(e) {
  if (!stagePosition.value.isMoving) {
    return;
  }

  let dx = 0;
  let dy = 0;
  switch (dragEl.value.el) {
    case ObjectType.NONE:
      dx = e.clientX - stagePosition.value.dx;
      dy = e.clientY - stagePosition.value.dy;
      transform.position.x += dx;
      transform.position.y += dy;
      stagePosition.value.dx = e.clientX;
      stagePosition.value.dy = e.clientY;
      break;
    case ObjectType.TABLE:
      dx = e.clientX / transform.zoom - dragEl.value.offsetX;
      dy = e.clientY / transform.zoom - dragEl.value.offsetY;
      const table = currentDiagram.value.tables.find((t) => t.id === dragEl.value.id);
      table.x = dx;
      table.y = dy;
      drawGuideLines(table);
      break;
    case ObjectType.LINKING:
      const rect = canvas.value.getBoundingClientRect();
      linking.value.endX =
        (e.clientX - rect.left - transform.position.x) / transform.zoom;
      linking.value.endY =
        (e.clientY - rect.top - transform.position.y) / transform.zoom;
      // console.log("link: ", link.value.startX, link.value.startY, link.value.endX, link.value.endY);
      break;
  }
}

/**
 *
 * @param {import("@/types/types").Table} table
 */
function drawGuideLines(table) {
  guideLines.value.v = -1;
  guideLines.value.h = -1;
  const guideOffset = 5;
  const g = { v: -1, h: -1 };
  for (let t of currentDiagram.value.tables) {
    if (t.id === table.id) {
      continue;
    }

    const ll = Math.abs(table.x - t.x);
    const tt = Math.abs(table.y - t.y);
    const rl = Math.abs(table.x + tableWidth - t.x);
    const bt = Math.abs(table.y + table.getHeight(tableStyle.value) - t.y);
    const bb = Math.abs(table.y + table.getHeight(tableStyle.value) - t.y - t.getHeight(tableStyle.value))
    const lr = Math.abs(table.x - t.x - tableWidth);
    const tb = Math.abs(table.y - t.y - t.getHeight(tableStyle.value));
    const xc = Math.abs(table.x + tableWidth / 2 - t.x - tableWidth / 2);
    const yc = Math.abs(table.y + table.getHeight(tableStyle.value) / 2 - t.y - t.getHeight(tableStyle.value) / 2);

    if (ll <= guideOffset) {
      g.v = t.x;
      table.x = t.x;
    } else if (rl <= guideOffset) {
      g.v = t.x;
      table.x = t.x - tableWidth;
    } else if (lr <= guideOffset) {
      g.v = t.x + tableWidth;
      table.x = t.x + tableWidth;
    } else if (xc <= guideOffset) {
      g.v = t.x + tableWidth / 2;
      table.x = g.v - tableWidth / 2;
    }
    if (tt <= guideOffset) {
      g.h = t.y;
      table.y = t.y;
    } else if (bt <= guideOffset) {
      g.h = t.y;
      table.y = t.y - table.getHeight(tableStyle.value);
    } else if (bb <= guideOffset) {
      g.h = t.y + t.getHeight(tableStyle.value);
      table.y = g.h - table.getHeight(tableStyle.value);
    } else if (tb <= guideOffset) {
      g.h = t.y + t.getHeight(tableStyle.value);
      table.y = g.h
    } else if (yc <= guideOffset) {
      g.h = t.y + t.getHeight(tableStyle.value) / 2;
      table.y = g.h - table.getHeight(tableStyle.value) / 2;
    }
  }

  g.v = g.v * transform.zoom + (g.v !== -1 ? transform.position.x : 0);
  g.h =g.h * transform.zoom + (g.h !== -1 ? transform.position.y : 0);

  guideLines.value = {v: Math.floor(g.v * 100) / 100, h: Math.floor(g.h * 100) / 100};
}

function onStageMouseUp() {
  stagePosition.value.isMoving = false;
  cursor.value = "default";
  dragEl.value = dragElDefault();
  if (linking.value.fromTable !== -1 && linking.value.toTable !== -1) {
    console.log(
      "link: ",
      linking.value.fromTable,
      linking.value.fromField,
      linking.value.toTable,
      linking.value.toField,
    );
    addRelationship(
      linking.value.fromTable,
      linking.value.fromField,
      linking.value.toTable,
      linking.value.toField,
    );
  }
  guideLines.value.v = -1;
  guideLines.value.h = -1;
  linking.value.fromTable = -1;
  linking.value.fromField = -1;
  linking.value.toTable = -1;
  linking.value.toField = -1;
  linking.value.startX = 0;
  linking.value.startY = 0;
  linking.value.endX = 0;
  linking.value.endY = 0;
}

function onTableSelect(e, id, type) {
  if (linking.value.fromTable !== -1) {
    return;
  }
  const { clientX, clientY } = e;
  const table = currentDiagram.value.tables.find(t => t.id === id)
  dragEl.value = {
    el: type,
    id: id,
    offsetX: clientX / transform.zoom - table.x,
    offsetY: clientY / transform.zoom - table.y,
    prevX: table.x,
    prevY: table.y,
  };
}

function onLinkingStart(e, tableId, fieldId, x, y) {
  console.log("linking start", tableId, fieldId);
  if (dragEl.value.el !== ObjectType.NONE) {
    return;
  }
  linking.value.fromTable = tableId;
  linking.value.fromField = fieldId;
  linking.value.startX = x;
  linking.value.startY = y;
  linking.value.endX = x;
  linking.value.endY = y;
  dragEl.value.el = ObjectType.LINKING;
}

function onLinkingEnd(e, tableId, fieldId, x, y) {
  if (linking.value.fromTable === -1) {
    return;
  }
  if (
    linking.value.fromTable === tableId &&
    linking.value.fromField === fieldId
  ) {
    return;
  }
  linking.value.toTable = tableId;
  linking.value.toField = fieldId;
  linking.value.endX = x;
  linking.value.endY = y;
}

function zoom(zoomOut, scale) {
  if (zoomOut) {
    if (transform.zoom <= 0.5) {
      return;
    }
    transform.zoom = Math.floor((transform.zoom * 100) / scale) / 100;
  } else {
    if (transform.zoom >= 5) {
      return;
    }
    transform.zoom = Math.floor(transform.zoom * 100 * scale) / 100;
  }
}

function zoomToFit() {
  const rect = canvas.value.getBoundingClientRect();
  const rectWidth = rect.width;
  const rectHeight = rect.height;
  const minX = Math.min(...currentDiagram.value.tables.map((t) => t.x)) - 50;
  const minY = Math.min(...currentDiagram.value.tables.map((t) => t.y)) - 50;
  const maxX = Math.max(...currentDiagram.value.tables.map((t) => t.x + tableWidth)) + 50;
  const maxY = Math.max(...currentDiagram.value.tables.map((t) => t.y + t.getHeight(tableStyle.value))) + 50;
  const width = maxX - minX;
  const height = maxY - minY;
  const zoomX = rectWidth / width;
  const zoomY = rectHeight / height;
  transform.zoom = Math.min(1, Math.min(zoomX, zoomY));
}

const tableStyle = ref(ShowTableStyle.ALL_FIELDS)
const showTableStyle = ref(false);
function selectTableStyle(style) {
  tableStyle.value = style;
}

const debouncedCursor = debounce(() => {
  cursor.value = "default";
}, 50);

function wheel(e) {
  e.preventDefault();
  cursor.value = e.deltaY < 0 ? "zoom-out" : "zoom-in";
  zoom(e.deltaY < 0, 1.03);
  debouncedCursor();
}
</script>

<template>
  <div
    class="w-full h-full relative flex-grow bg-dots"
    ref="canvas"
    id="canvas"
    @wheel="wheel"
  >
    <svg
      ref="stage"
      class="w-full h-full"
      @mousedown="onStageMousedown"
      @mouseup="onStageMouseUp"
      @mousemove="onStageMouseMove"
    >
      <!--      <defs>-->
      <!--        <pattern-->
      <!--          id="pattern-circles"-->
      <!--          x="0"-->
      <!--          y="0"-->
      <!--          width="24"-->
      <!--          height="24"-->
      <!--          patternUnits="userSpaceOnUse"-->
      <!--          patternContentUnits="userSpaceOnUse"-->
      <!--        >-->
      <!--          <circle-->
      <!--            id="pattern-circle"-->
      <!--            cx="4"-->
      <!--            cy="4"-->
      <!--            r="0.85"-->
      <!--            fill="rgb(99, 152,191)"-->
      <!--          ></circle>-->
      <!--        </pattern>-->
      <!--      </defs>-->
      <!--      <rect-->
      <!--        x="0"-->
      <!--        y="0"-->
      <!--        width="100%"-->
      <!--        height="100%"-->
      <!--        fill="url(#pattern-circles)"-->
      <!--      ></rect>-->
      <g
        id="diagram"
        :style="{
          transform: `translate(${transform.position.x}px, ${transform.position.y}px) scale(${transform.zoom})`,
          transformOrigin: 'top left',
        }"
      >
        <Relationship
          v-for="(r, i) in currentDiagram.relationships"
          :key="r.id"
          :tableStyle="tableStyle"
          v-model="currentDiagram.relationships[i]"
        />
        <Table
          v-for="(table, index) in currentDiagram.tables"
          :key="table.id"
          v-model="currentDiagram.tables[index]"
          :tableStyle="tableStyle"
          @dragstart="onTableSelect"
          @fieldenter="onLinkingEnd"
          @connectstart="onLinkingStart"
        />
        <path
          v-if="linking.fromTable !== -1"
          :d="linkPath"
          stroke="red"
          stroke-dasharray="8,8"
        />
      </g>
      <g>
        <path
          v-if="guideLines.h !== -1"
          :d="`M0 ${guideLines.h} H ${innerWidth}`"
          stroke="red"
          stroke-dasharray="8,8"
        ></path>
        <path
          v-if="guideLines.v !== -1"
          :d="`M${guideLines.v} 0 V ${innerHeight}`"
          stroke="red"
          stroke-dasharray="8,8"
        ></path>
      </g>
    </svg>
    <div
      class="grid grid-cols-1 absolute bottom-5 right-5 px-1 py-1 bg-white border divide-y rounded-md"
    >
      <div title="Zoom In" class="py-1">
        <ZoomIn
          :size="24"
          @click="zoom(false, 1.1)"
          class="cursor-pointer"
        />
      </div>
      <div title="Zoom Out" class="py-1">
        <ZoomOut
          :size="24"
          @click="zoom(true, 1.1)"
          class="cursor-pointer"
        />
      </div>
      <div title="Zoom To Fit" class="py-1">
        <Maximize
          :size="24"
          @click="zoomToFit"
          class="cursor-pointer"
        />
      </div>
      <div title="Show" class="py-1">
        <Table2
          :size="24"
          @click="showTableStyle = !showTableStyle"
          class="cursor-pointer"
        />
      </div>
    </div>
    <div v-if="showTableStyle" class="absolute bottom-5 right-14 flex flex-col bg-white border rounded-md divide-y">
      <div v-for="s in Object.values(ShowTableStyle)" :key="s" @click="selectTableStyle(s)"
        :class="['flex items-center hover:bg-gray-100 py-1.5 px-4 cursor-pointer',
        tableStyle === s ? 'bg-gray-100' : '']">{{ s }}</div>
    </div>
  </div>
</template>
