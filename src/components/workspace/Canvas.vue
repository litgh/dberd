<script setup>
import useTable from "@/store/useTable";
import useTransform from "@/store/useTransform";
import { ObjectType, tableWidth } from "@/constants/constants";
import Table from "@/components/workspace/Table.vue";
import Relationship from "@/components/workspace/Relationship.vue";
import { computed, ref, watch } from "vue";
import { debounce } from "lodash-es";
import hotkeys from "hotkeys-js";
import { ZoomIn, ZoomOut, Maximize } from "lucide-vue-next";

const { tables, addTable, relationships, addRelationship } = useTable();
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

hotkeys("t", (e, h) => {
  addTable();
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
      const table = tables.find((t) => t.id === dragEl.value.id);
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
  for (let t of tables) {
    if (t.id === table.id) {
      continue;
    }

    const ll = Math.abs(table.x - t.x);
    const tt = Math.abs(table.y - t.y);
    const rl = Math.abs(table.x + tableWidth - t.x);
    const bt = Math.abs(table.y + table.height - t.y);
    const lr = Math.abs(table.x - t.x - tableWidth);
    const tb = Math.abs(table.y - t.y - t.height);
    const xc = Math.abs(table.x + tableWidth / 2 - t.x - tableWidth / 2);
    const yc = Math.abs(table.y + table.height / 2 - t.y - t.height / 2);

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
      table.y = t.y - table.height;
    } else if (tb <= guideOffset) {
      g.h = t.y + t.height;
      table.y = t.y + t.height;
    } else if (yc <= guideOffset) {
      g.h = t.y + t.height / 2;
      table.y = g.h - table.height / 2;
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
  const table = tables.find((t) => t.id === id);
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
  const minX = Math.min(...tables.map((t) => t.x)) - 50;
  const minY = Math.min(...tables.map((t) => t.y)) - 50;
  const maxX = Math.max(...tables.map((t) => t.x + tableWidth)) + 50;
  const maxY = Math.max(...tables.map((t) => t.y + t.height)) + 50;
  const width = maxX - minX;
  const height = maxY - minY;
  const zoomX = rectWidth / width;
  const zoomY = rectHeight / height;
  transform.zoom = Math.min(1, Math.min(zoomX, zoomY));
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
          v-for="(r, i) in relationships"
          :key="r.id"
          v-model="relationships[i]"
        />
        <Table
          v-for="(table, index) in tables"
          :key="table.id"
          v-model="tables[index]"
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
      class="flex flex-col justify-between space-y-2 absolute bottom-5 right-5 py-2 px-1 bg-white border rounded-md"
    >
      <ZoomIn
        :size="22"
        @click="zoom(false, 1.1)"
        class="cursor-pointer"
        alt="Zoom In"
      />
      <hr />
      <ZoomOut
        :size="22"
        @click="zoom(true, 1.1)"
        class="cursor-pointer"
        alt="Zoom Out"
      />
      <hr />
      <Maximize
        :size="22"
        @click="zoomToFit"
        class="cursor-pointer"
        alt="Zoom To Fit"
      />
    </div>
  </div>
</template>

<style scoped></style>
