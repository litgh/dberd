<script setup>
import useDiagram from "@/store/useDiagram";
import useTransform from "@/store/useTransform";
import useSettings from "@/store/useSettings";
import useState from "@/store/useState";
import useUndoRedo from "@/store/useUndoRedo";
import {
  Action,
  ObjectType,
  ShowTableStyle,
  State,
  tableWidth,
} from "@/constants/constants";

import { computed, onMounted, onUnmounted, ref, toRaw, watch } from "vue";
import { debounce } from "lodash-es";
import { storeToRefs } from "pinia";
import hotkeys from "hotkeys-js";

import Tooltip from "@/components/Tooltip.vue";
import EditTable from "@/components/workspace/EditTable.vue";
import Table from "@/components/workspace/Table.vue";
import Relationship from "@/components/workspace/Relationship.vue";

const diagramStore = useDiagram();
const { tables, relationships } = storeToRefs(diagramStore);
const { addRelationship, addTable, removeTable, duplicateTable, removeRelationship } = diagramStore;
const { transform } = useTransform();
const { settings } = useSettings();
const { state, selectedTable } = useState();
const selectedRelationship = ref([]);
const { addHistory, undo, redo } = useUndoRedo();
const cursor = ref("default");
const stageRef = ref();
const canvasRef = ref();
const editTableRef = ref();
const { innerWidth, innerHeight } = window;
const stagePosition = ref({
  isPanning: false,
  hasMoved: false,
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
  fromTable: null,
  fromField: null,
  startX: 0,
  startY: 0,
  toTable: null,
  toField: null,
  endX: 0,
  endY: 0,
});
const guideLines = ref({ v: -1, h: -1 });

const linkPath = computed(() => {
  return `M ${linking.value.startX} ${linking.value.startY} L ${linking.value.endX} ${linking.value.endY}`;
});

watch(cursor, (newVal) => {
  stageRef.value.style.cursor = newVal;
});
const sizeObserver = new ResizeObserver((entries) => {
  const { width, height } = entries[0].contentRect;
  transform.width = width;
  transform.height = height;
});
onMounted(() => {
  sizeObserver.observe(canvasRef.value);
  hotkeys("del, backspace", () => {
    if (selectedRelationship.value.length && !settings.lock) {
      selectedRelationship.value.forEach((id) => removeRelationship(id));
    }
    if (selectedTable.length === 0 || settings.lock) {
      return;
    }
    if (selectedTable.length === 1) {
      const t = tables.value.find((t) => t.id === selectedTable[0]);
      if (t && t.fields.length === 1) {
        selectedTable.length = 0;
        removeTable(t.id);
        state.state = State.MODIFIED;
        return;
      }
    }

    if (confirm("Are you sure to delete this table?")) {
      selectedTable.forEach((id) => removeTable(id));
      selectedTable.length = 0;
      state.state = State.MODIFIED;
    }
  });
  hotkeys("ctrl+a", () => {
    selectedTable.length = 0;
    selectedTable.push(...tables.value.map((t) => t.id));
  });
  hotkeys("t", () => addTable());
  hotkeys("ctrl+d", () => duplicateTable(selectedTable));
  hotkeys("cmd+z, alt+z", undo);
  hotkeys("cmd+shift+z, alt+shift+z", redo);
  hotkeys("alt+s, option+s", () => {
    if (settings.autoSave) {
      return;
    }
    state.state = State.SAVING;
  });
});
onUnmounted(() => {
  sizeObserver.disconnect();
});

function onStageMousedown(event) {
  stagePosition.value = {
    isPanning: true,
    x: transform.position.x,
    y: transform.position.y,
    dx: event.clientX,
    dy: event.clientY,
  };
  cursor.value = "grabbing";
}

function onStageMouseMove(e) {
  if (!stagePosition.value.isPanning) {
    return;
  }
  stagePosition.value.hasMoved = true;
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
      const table = tables.value.find((t) => t.id === dragEl.value.id);
      table.x = dx;
      table.y = dy;
      drawGuideLines(table);
      break;
    case ObjectType.LINKING:
      const rect = canvasRef.value.getBoundingClientRect();
      linking.value.endX =
        (e.clientX - rect.left - transform.position.x) / transform.zoom;
      linking.value.endY =
        (e.clientY - rect.top - transform.position.y) / transform.zoom;
      // console.log("link: ", link.value.startX, link.value.startY, link.value.endX, link.value.endY);
      break;
    default:
      stagePosition.value.hasMoved = false;
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
  for (let t of tables.value) {
    if (t.id === table.id) {
      continue;
    }

    const ll = Math.abs(table.x - t.x);
    const tt = Math.abs(table.y - t.y);
    const rl = Math.abs(table.x + tableWidth - t.x);
    const bt = Math.abs(table.y + table.getHeight(tableStyle.value) - t.y);
    const bb = Math.abs(
      table.y +
        table.getHeight(tableStyle.value) -
        t.y -
        t.getHeight(tableStyle.value),
    );
    const lr = Math.abs(table.x - t.x - tableWidth);
    const tb = Math.abs(table.y - t.y - t.getHeight(tableStyle.value));
    const xc = Math.abs(table.x + tableWidth / 2 - t.x - tableWidth / 2);
    const yc = Math.abs(
      table.y +
        table.getHeight(tableStyle.value) / 2 -
        t.y -
        t.getHeight(tableStyle.value) / 2,
    );

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
      table.y = g.h;
    } else if (yc <= guideOffset) {
      g.h = t.y + t.getHeight(tableStyle.value) / 2;
      table.y = g.h - table.getHeight(tableStyle.value) / 2;
    }
  }

  g.v = g.v * transform.zoom + (g.v !== -1 ? transform.position.x : 0);
  g.h = g.h * transform.zoom + (g.h !== -1 ? transform.position.y : 0);

  guideLines.value = {
    v: Math.floor(g.v * 100) / 100,
    h: Math.floor(g.h * 100) / 100,
  };
}

function onStageMouseUp() {
  if (linking.value.fromTable && linking.value.toTable) {
    addRelationship(
      linking.value.fromTable,
      linking.value.fromField,
      linking.value.toTable,
      linking.value.toField,
    );
  }
  if (stagePosition.value.hasMoved) {
    state.state = State.MODIFIED;
    if (dragEl.value.el === ObjectType.TABLE) {
      const table = tables.value.find((t) => t.id === dragEl.value.id);
      addHistory({
        action: Action.MOVE,
        element: dragEl.value.el,
        data: {
          id: dragEl.value.id,
          x: dragEl.value.prevX,
          y: dragEl.value.prevY,
        },
        message: `Move ${table.name} to (${table.x}, ${table.y})`,
      });
    }
  }

  stagePosition.value.isPanning = false;
  stagePosition.value.hasMoved = false;
  cursor.value = "default";
  dragEl.value = dragElDefault();
  guideLines.value.v = -1;
  guideLines.value.h = -1;
  linking.value.fromTable = null;
  linking.value.fromField = null;
  linking.value.toTable = null;
  linking.value.toField = null;
  linking.value.startX = 0;
  linking.value.startY = 0;
  linking.value.endX = 0;
  linking.value.endY = 0;
}

/**
 *
 * @param {MouseEvent} e
 * @param {string} id
 */
function onTableSelect(e, id) {
  // e.preventDefault();
  // e.stopPropagation();
  selectedRelationship.value.length = 0;
  if (e.altKey || e.metaKey) {
    selectedTable.push(id);
  } else {
    selectedTable.length = 0;
    selectedTable.push(id);
  }
}

function onRelationshipSelect(e, id) {
  selectedTable.length = 0;
  if (e.altKey || e.metaKey) {
    selectedRelationship.value.push(id)
  } else {
    selectedRelationship.value.length = 0;
    selectedRelationship.value.push(id)
  }
}

function onTableDragStart(e, id, type) {
  if (linking.value.fromTable || settings.lock) {
    return;
  }
  const { clientX, clientY } = e;
  const table = tables.value.find((t) => t.id === id);
  dragEl.value = {
    el: type,
    id: id,
    offsetX: clientX / transform.zoom - table.x,
    offsetY: clientY / transform.zoom - table.y,
    prevX: table.x,
    prevY: table.y,
  };
}

function onTableEdit(e, table) {
  editTableRef.value.edit(table);
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
  state.state = State.MODIFIED;
}

function zoomToFit() {
  const rect = canvasRef.value.getBoundingClientRect();
  const rectWidth = rect.width;
  const rectHeight = rect.height;
  const minX = Math.min(...tables.value.map((t) => t.x)) - 50;
  const minY = Math.min(...tables.value.map((t) => t.y)) - 50;
  const maxX = Math.max(...tables.value.map((t) => t.x + tableWidth)) + 50;
  const maxY =
    Math.max(...tables.value.map((t) => t.y + t.getHeight(tableStyle.value))) +
    50;
  const width = maxX - minX;
  const height = maxY - minY;
  const zoomX = rectWidth / width;
  const zoomY = rectHeight / height;
  transform.zoom = Math.min(1, Math.min(zoomX, zoomY));
  state.state = State.MODIFIED;
}

const tableStyle = ref(ShowTableStyle.ALL_FIELDS);
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
    ref="canvasRef"
    id="canvas"
    @wheel="wheel"
  >
    <svg
      ref="stageRef"
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
        <g class="select-none">
          <Relationship
            v-for="(r, i) in relationships"
            :key="r.id"
            :tableStyle="tableStyle"
            v-model="relationships[i]"
            @click="onRelationshipSelect"
            :class="selectedRelationship.includes(r.id) ? 'stroke-sky-700 stroke-[3px]' : ''"
          />
        </g>
        <Table
          v-for="(table, index) in tables"
          :key="table.id"
          v-model="tables[index]"
          :tableStyle="tableStyle"
          @dragstart="onTableDragStart"
          @fieldenter="onLinkingEnd"
          @connectstart="onLinkingStart"
          @click.stop="onTableSelect($event, table.id)"
          @edit="onTableEdit"
          :class="[
            selectedTable.includes(table.id)
              ? 'ring-2 ring-offset-2 ring-blue-500'
              : 'ring-1 ring-neutral-800',
          ]"
        />
        <path
          v-if="linking.fromTable"
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
      id="tool"
      class="grid grid-cols-1 absolute bottom-5 right-5 px-1 py-1 bg-white border divide-y rounded-md"
    >
      <Tooltip content="Zoom In" position="left" class="group py-1">
        <Icon size="20">
          <i-lucide-zoom-in @click="zoom(false, 1.1)" class="cursor-pointer" />
        </Icon>
      </Tooltip>
      <Tooltip content="Zoom Out" position="left" class="group py-1">
        <Icon size="20">
          <i-lucide-zoom-out @click="zoom(true, 1.1)" class="cursor-pointer" />
        </Icon>
      </Tooltip>
      <Tooltip content="Zoom To Fit" position="left" class="group py-1">
        <Icon size="20">
          <i-material-symbols-fit-screen-outline
            @click="zoomToFit"
            class="cursor-pointer"
          />
        </Icon>
      </Tooltip>
      <Tooltip content="Show" position="left" class="group py-1">
        <Icon size="20">
          <i-tabler-scan-eye
            @click="showTableStyle = !showTableStyle"
            class="cursor-pointer"
          />
        </Icon>
      </Tooltip>
    </div>
    <div
      v-if="showTableStyle"
      class="absolute bottom-5 right-14 flex flex-col bg-white border rounded-md divide-y"
    >
      <div
        v-for="s in Object.values(ShowTableStyle)"
        :key="s"
        @click="selectTableStyle(s)"
        :class="[
          'flex items-center hover:bg-gray-100 py-1.5 px-4 cursor-pointer',
          tableStyle === s ? 'bg-gray-100' : '',
        ]"
      >
        {{ s }}
      </div>
    </div>
  </div>
  <EditTable ref="editTableRef" />
</template>
