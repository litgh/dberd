<template>
  <div
    class="w-full h-12 flex justify-start space-x-4 items-center p-2 border-b shadow-lg"
  >
    <router-link to="/"><Logo /></router-link>
    <div class="flex items-center space-x-1 relative w-52">
      <Tooltip content="Click to edit" position="bottom" class="group">
        <input
          type="text"
          class="rounded-md py-1 px-2 bg-transparent"
          v-model="diagramName"
        />
      </Tooltip>
      <i-lucide-chevrons-up-down class="cursor-pointer" @click="openDiagram" />
      <Modal ref="openDiagramModal">
        <OpenDiagram @close="closeDiagram" />
      </Modal>
    </div>
    <Tooltip content="New Diagram(ctrl+n)" position="bottom" class="group">
      <i-tabler-file-plus class="cursor-pointer" @click="newDiagram" />
    </Tooltip>
    <Tooltip content="Duplicate Diagram" position="bottom" class="group">
      <i-tabler-files class="cursor-pointer" @click="duplicateDiagram" />
    </Tooltip>
    <Tooltip content="Add Table(t)" position="bottom" class="group">
      <i-tabler-table-plus class="cursor-pointer" @click="() => addTable()" />
    </Tooltip>
    <Tooltip content="Duplicate Table(ctrl+d)" position="bottom" class="group">
      <Icon :color="disable(selectedTable.length === 0)">
        <i-tabler-table-alias class="cursor-pointer" @click="duplicateTable" />
      </Icon>
    </Tooltip>
    <Tooltip content="Fullscreen(F11)" position="bottom" class="group">
      <i-tabler-arrows-maximize
        v-if="!fullscreen"
        class="cursor-pointer"
        @click="enterFullscreen"
      />
      <i-tabler-arrows-minimize
        v-else
        class="cursor-pointer"
        @click="exitFullscreen"
      />
    </Tooltip>
    <div class="border-l mx-2 h-full"></div>
    <Tooltip content="Undo(cmd/alt + z)" position="bottom" class="group">
      <Icon :color="disable(undoStack.length === 0)">
        <i-lucide-undo-2 class="cursor-pointer" @click="undo" />
      </Icon>
    </Tooltip>
    <Tooltip
      content="Redo(cmd/alt + shift + z)"
      position="bottom"
      class="group"
    >
      <Icon :color="disable(redoStack.length === 0)">
        <i-lucide-redo-2 class="cursor-pointer" @click="redo" />
      </Icon>
    </Tooltip>
    <div class="border-l mx-2 h-full"></div>
    <Tooltip content="Save(alt/option + s)" position="bottom" class="group">
      <Icon
        :color="
          disable(
            settings.autoSave ||
              state.state === State.SAVED ||
              state.state === State.NONE,
          )
        "
      >
        <i-fluent-mdl2-save
          class="cursor-pointer"
          @click="state.state = State.SAVING"
        />
      </Icon>
    </Tooltip>
    <Tooltip
      :content="'Auto Save' + (settings.autoSave ? '(On)' : '(Off)')"
      position="bottom"
      class="group"
    >
      <Icon :color="!settings.autoSave ? 'rgb(156 163 175)' : ''">
        <i-fluent-document-autosave-24-regular
          class="cursor-pointer"
          @click="settings.autoSave = !settings.autoSave"
        />
      </Icon>
    </Tooltip>
    <Tooltip
      :content="settings.lock ? 'Unlock' : 'Lock'"
      position="bottom"
      class="group"
    >
      <i-lucide-lock-keyhole
        v-if="settings.lock"
        class="cursor-pointer"
        @click="settings.lock = !settings.lock"
      />
      <i-lucide-lock-keyhole-open
        v-else
        class="cursor-pointer"
        @click="settings.lock = !settings.lock"
      />
    </Tooltip>
    <div class="border-l mx-2 h-full"></div>
    <Tooltip content="Export" position="bottom" class="group">
      <i-tabler-download class="cursor-pointer" @click="openExport" />
      <Drawer direction="rtl" ref="exportDrawer">
        <Export title="Export" :formats="ExportFormat" @export="exportFile" />
      </Drawer>
    </Tooltip>
    <Tooltip content="Export Source" position="bottom" class="group">
      <i-tabler-file-type-sql
        class="cursor-pointer"
        @click="openExportSource"
      />
      <Drawer direction="rtl" ref="exportSourceDrawer">
        <Export
          title="Export Source"
          :formats="ExportSourceFormat"
          @export="exportSource"
        />
      </Drawer>
    </Tooltip>
    <div class="border-l mx-2 h-full"></div>
    <Tooltip content="History" position="bottom" class="group">
      <i-lucide-history class="cursor-pointer" @click="openHistory" />
      <Drawer direction="rtl" ref="historyDrawer">
        <History />
      </Drawer>
    </Tooltip>
    <Tooltip content="Help" position="bottom" class="group">
      <i-lucide-circle-help class="cursor-pointer" />
    </Tooltip>
    <div class="p-2 bg-gray-200 rounded-md h-6 text-sm flex items-center">
      Last saved:
      {{
        state.state === State.SAVED || state.state === State.NONE
          ? state.lastSaved.toLocaleString()
          : "*"
      }}
    </div>
  </div>
</template>
<script setup>
import Tooltip from "@/components/Tooltip.vue";
import Export from "@/components/workspace/Export.vue";
import History from "@/components/workspace/History.vue";
import Logo from "@/components/Logo.vue";
import useDiagram from "@/store/useDiagram";
import useSetting from "@/store/useSettings";
import useState from "@/store/useState";
import useUndoRedo from "@/store/useUndoRedo";
import { ref } from "vue";
import { State, ExportFormat, ExportSourceFormat } from "@/constants/constants";
import toSql from "@/utils/toSql";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { storeToRefs } from "pinia";
import hotkeys from "hotkeys-js";

const diagramStore = useDiagram();
const { settings } = useSetting();
const { state, selectedTable } = useState();
const { undoStack, undo, redo, redoStack } = useUndoRedo();
const { diagramName, tables, relationships } = storeToRefs(diagramStore);
const { addTable, newDiagram, duplicateDiagram } = diagramStore;
const historyDrawer = ref();
const exportDrawer = ref();
const exportSourceDrawer = ref();
const openDiagramModal = ref();
const fullscreen = ref(false);

function openHistory() {
  historyDrawer.value.open();
}

function openExport() {
  exportDrawer.value.open();
}

function openExportSource() {
  exportSourceDrawer.value.open();
}

function duplicateTable() {
  if (selectedTable.length) {
    const { duplicateTable } = diagramStore;
    duplicateTable(selectedTable);
  }
}

function openDiagram() {
  openDiagramModal.value.open();
}

function closeDiagram() {
  openDiagramModal.value.close();
}

function exportFile(format) {
  const filter = (node) => node.id !== "tool";
  switch (format) {
    case "PNG":
      toPng(document.getElementById("canvas"), { filter }).then((dataUrl) => {
        saveAs(dataUrl, `${diagramName.value}.png`);
      });
      break;
    case "JPEG":
      toJpeg(document.getElementById("canvas"), { filter }).then((dataUrl) => {
        saveAs(dataUrl, `${diagramName.value}.jpeg`);
      });
      break;
    case "SVG":
      toSvg(document.getElementById("canvas"), { filter }).then((dataUrl) => {
        saveAs(dataUrl, `${diagramName.value}.svg`);
      });
      break;
    case "JSON":
      const { tables, relationships } = diagramStore;
      const json = JSON.stringify(
        {
          tables,
          relationships: relationships.map((r) => {
            return {
              ...r,
              fromTable: r.fromTable.id,
              toTable: r.toTable.id,
            };
          }),
        },
        null,
        2,
      );
      const blob = new Blob([json], {
        type: "application/json",
      });
      saveAs(blob, `${diagramName.value}.json`);
      break;
    case "PDF":
      const canvas = document.getElementById("canvas");
      toJpeg(canvas, { filter }).then((dataUrl) => {
        const doc = new jsPDF("l", "px", [
          canvas.offsetWidth,
          canvas.offsetHeight,
        ]);
        doc.addImage(
          dataUrl,
          "jpeg",
          0,
          0,
          canvas.offsetWidth,
          canvas.offsetHeight,
        );
        doc.save(`${diagramName.value}.pdf`);
      });
  }
}

function exportSource(format) {
  const sql = toSql({ tables: tables.value, relationships: relationships.value }, format);
  const blob = new Blob([sql], {
    type: "text/sql",
  });
  saveAs(blob, `${diagramName.value}.sql`);
}

function disable(disable) {
  return disable ? "rgb(156 163 175)" : "";
}

function enterFullscreen() {
  const element = document.documentElement;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
  fullscreen.value = true;
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  fullscreen.value = false;
}

hotkeys("f11", enterFullscreen);
hotkeys("ctrl+n", newDiagram);
</script>

