<script setup>
import {
  tableWidth,
  tableFieldHeight,
  ObjectType,
  ShowTableStyle,
} from "@/constants/constants";
import { defineAsyncComponent } from "vue";
import useSettings from "@/store/useSettings";
import tableHeight from "@/utils/tableHeight";

const Palette = defineAsyncComponent(
  () => import("@/components/workspace/Palette.vue"),
);
const emit = defineEmits([
  "dragstart",
  "connectstart",
  "fieldenter",
  "fieldleave",
  "dblclick",
  "edit",
]);
defineProps({
  tableStyle: {
    type: String,
  },
});
const table = defineModel();
const { settings } = useSettings();

function onDragStart(event, id) {
  emit("dragstart", event, id, ObjectType.TABLE);
}
</script>

<template>
  <foreignObject
    :key="table.id"
    :x="table.x"
    :y="table.y"
    :width="tableWidth"
    :height="tableHeight(table, tableStyle)"
    :class="['rounded-md', settings.lock ? '' : 'cursor-move']"
    @mousedown="onDragStart($event, table.id)"
    @touchstart="onDragStart($event, table.id)"
    @dblclick="$emit('dblclick', $event, table)"
  >
    <div class="w-full select-none bg-white">
      <div
        class="flex w-full items-center justify-between px-2 text-center"
        :style="{ height: tableFieldHeight + 'px', background: table.color }"
      >
        <span class="text-white">{{ table.name }}</span>
        <div class="flex items-center space-x-2" v-if="!settings.lock">
          <Icon size="18" color="white">
            <i-tabler-edit
              @click="$emit('edit', $event, table)"
              class="hidden cursor-pointer group-hover/table:block"
            />
          </Icon>
          <Palette :table="table" />
        </div>
      </div>
      <template v-for="(field, index) in table.fields" :key="field.id">
        <div
          v-if="
            tableStyle === ShowTableStyle.ALL_FIELDS ||
            tableStyle === ShowTableStyle.COMMENT ||
            (tableStyle === ShowTableStyle.KEYS_ONLY && field.pk)
          "
          class="flex items-center justify-between border-t border-t-zinc-900 bg-gray-100 px-2 hover:bg-gray-200"
          :key="field.id"
          :style="{ height: tableFieldHeight + 'px' }"
          @mouseenter="
            field.name &&
              $emit(
                'fieldenter',
                $event,
                table.id,
                field.id,
                table.x,
                table.y +
                  ((index + 1) * tableFieldHeight + tableFieldHeight / 2),
              )
          "
          @mouseleave="$emit('fieldleave', $event, -1, -1)"
        >
          <div class="flex items-center group">
            <button
              :class="[
                'w-2.5 h-2.5 rounded-full opacity-80 inline-block',
                field.pk
                  ? 'bg-blue-500'
                  : field.notNull
                    ? 'bg-gray-800'
                    : 'bg-gray-400',
              ]"
              @mousedown="
                field.name &&
                  $emit(
                    'connectstart',
                    $event,
                    table.id,
                    field.id,
                    table.x + 14,
                    table.y +
                      ((index + 1) * tableFieldHeight + tableFieldHeight / 2),
                  )
              "
            ></button>
            <Tooltip
              position="top"
              :content="
                tableStyle === ShowTableStyle.COMMENT
                  ? field.comment || field.name
                  : field.name
              "
            >
              <span
                :class="['inline-block ml-1.5 text-ellipsis max-w-[100px]']"
                >{{
                  tableStyle === ShowTableStyle.COMMENT
                    ? field.comment || field.name
                    : field.name
                }}</span
              >
            </Tooltip>
            <i-lucide-key-square
              v-if="field.pk"
              size="15"
              color="#E4A62F"
              class="ml-1 inline-block"
            />
          </div>
          <div class="text-xs font-bold uppercase text-gray-700">
            {{ field.type }}
          </div>
        </div>
      </template>
    </div>
  </foreignObject>
</template>

<style scoped></style>
