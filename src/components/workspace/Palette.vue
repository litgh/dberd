<template>
  <Icon size="18" color="white">
    <i-tabler-palette
      class="cursor-pointer hidden group-hover:block"
      @click="toggle"
    />
  </Icon>
  <Teleport to="#canvas">
    <div
      class="absolute w-40 h-56 rounded-lg bg-black py-4 px-2"
      :style="{
        top: `${table.y * transform.zoom + transform.position.y}px`,
        left: `${(table.x + tableWidth + 10) * transform.zoom + transform.position.x}px`,
      }"
      v-if="open"
    >
      <div class="w-2 h-2 rotate-45 absolute top-3 -left-1 bg-black"></div>
      <div>
        <span
          class="w-5 h-5 inline-block rounded-full ml-[7px] mt-2 cursor-pointer hover:border-2 hover:border-white"
          @mouseover="table.color = color"
          @click="changeTableColor(color)"
          v-for="color in colors"
          :style="{ backgroundColor: color }"
        ></span>
      </div>
      <div class="text-white">
        <div class="text-xs font-bold mt-3 mb-2">Currently Color</div>
        <span
          :style="{ backgroundColor: currentColor }"
          class="w-5 h-5 ml-[7px] border-2 border-white inline-block rounded-full cursor-pointer"
        ></span>
      </div>
      <div>
        <div class="text-xs text-white font-bold mt-3 mb-2">Custom</div>
        <div
          class="flex justify-between w-36 h-5 bg-white rounded-md items-center px-2"
        >
          <span class="text-[10px] text-gray-600 mr-4">HEX:</span>
          <span class="flex items-center text-black text-[10px] font-bold"
            ><span :style="{ color: validHex ? 'black' : '#FF0032' }">#</span>
            <input
              type="text"
              spellcheck="false"
              class="w-16 h-4 rounded-md outline-none pl-[1px]"
              :style="{ color: validHex ? 'black' : '#FF0032' }"
              v-model="customColor"
              @input="customColorChange"
            />
          </span>
          <i-lucide-check
            size="14"
            color="#008001"
            v-if="validHex"
            class="cursor-pointer"
            @click="changeTableColor('#' + customColor.trim())"
          />
          <i-lucide-x color="#FF0032" v-if="!validHex" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { colors, tableWidth } from "@/constants/constants";
import { ref, toRaw } from "vue";
import { Table } from "@/types/types";
import useTransform from "@/store/useTransform";

const props = defineProps({
  table: {
    type: Table,
  },
});
const { transform } = useTransform();

const currentColor = ref("");
const open = ref(false);
const customColor = ref("");
const validHex = ref(true);

function toggle() {
  if (open.value) {
    props.table.color = currentColor.value;
  } else {
    currentColor.value = toRaw(props.table.color);
    customColor.value = currentColor.value.substring(1);
  }
  open.value = !open.value;
}

function changeTableColor(color) {
  props.table.color = color;
  open.value = false;
}

function customColorChange() {
  const hex = customColor.value.trim();
  validHex.value = /^[0-9A-F]{3}([0-9A-F]{3})?$/i.test(hex);
  if (validHex.value) {
    props.table.color = "#" + hex;
  }
}
</script>
