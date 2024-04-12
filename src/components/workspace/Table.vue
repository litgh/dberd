<script setup>
import {
  tableWidth,
  tableFieldHeight,
  ObjectType,
} from "@/constants/constants";
import { KeySquare } from "lucide-vue-next";
import { defineAsyncComponent } from "vue";

const Palette = defineAsyncComponent(() => import("@/components/workspace/Palette.vue"))
defineEmits([
  "dragstart",
  "connectstart",
  "fieldenter",
  "fieldleave",
  "dblclick",
]);

const table = defineModel();
</script>

<template>
  <foreignObject
    :key="table.id"
    :x="table.x"
    :y="table.y"
    :width="tableWidth"
    :height="(table.height + 12)"
    class="group cursor-move"
    @mousedown="$emit('dragstart', $event, table.id, ObjectType.TABLE)"
    @dblclick="$emit('dblclick', $event, table)"
  >
    <div class="w-full select-none bg-white">
      <div
        class="group w-full flex justify-between items-center text-center px-2 border-1"
        :style="{ height: tableFieldHeight + 'px', background: table.color }"
      >
        <span class="text-white">{{ table.name }}</span>
        <Palette :table="table"/>
      </div>
      <div
        v-for="(field, index) in table.fields"
        class="hover:bg-gray-200 bg-gray-100 flex items-center px-2 justify-between"
        :key="field.id"
        :style="{ height: tableFieldHeight + 'px' }"
        @mouseenter="
          $emit(
            'fieldenter',
            $event,
            table.id,
            field.id,
            table.x,
            table.y + ((index + 1) * tableFieldHeight + tableFieldHeight / 2),
          )
        "
        @mouseleave="$emit('fieldleave', $event, -1, -1)"
      >
        <div class="flex items-center">
          <button
            class="w-3 h-3 rounded-full bg-blue-500 opacity-80 inline-block"
            @mousedown="
            $emit(
              'connectstart',
              $event,
              table.id,
              field.id,
              table.x + 14,
              table.y + ((index + 1) * tableFieldHeight + tableFieldHeight / 2),
            )
          "
          ></button>
          <span class="inline-block ml-1">{{ field.name }}</span>
          <KeySquare v-if="field.pk" size="15" color="#FFD700" class="ml-1 inline-block"/>
        </div>
        <div class="uppercase">{{ field.type }}</div>
      </div>
    </div>
  </foreignObject>
</template>

<style scoped></style>
