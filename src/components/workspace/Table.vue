<script setup>
import {
  tableWidth,
  tableFieldHeight,
  ObjectType,
  ShowTableStyle,
} from "@/constants/constants";
import { defineAsyncComponent } from "vue";
import useSettings from "@/store/useSettings";

const Palette = defineAsyncComponent(
  () => import("@/components/workspace/Palette.vue"),
);
defineEmits([
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
</script>

<template>
  <foreignObject
    :key="table.id"
    :x="table.x"
    :y="table.y"
    :width="tableWidth"
    :height="table.getHeight(tableStyle)"
    :class="['rounded-md', settings.lock ? '' : 'cursor-move']"
    @mousedown="$emit('dragstart', $event, table.id, ObjectType.TABLE)"
    @dblclick="$emit('dblclick', $event, table)"
  >
    <div class="w-full select-none bg-white">
      <div
        class="group w-full flex justify-between items-center text-center px-2"
        :style="{ height: tableFieldHeight + 'px', background: table.color }"
      >
        <span class="text-white">{{ table.name }}</span>
        <div class="flex items-center space-x-2" v-if="!settings.lock">
          <Icon size="18" color="white">
            <i-tabler-edit
              @click="$emit('edit', $event, table)"
              class="cursor-pointer hidden group-hover:block"
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
          class="hover:bg-gray-200 bg-gray-100 flex items-center px-2 justify-between border-t border-t-zinc-900"
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
                :class="[
                  'inline-block ml-1.5 text-ellipsis max-w-[100px]',
                ]"
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
          <div class="uppercase text-xs font-bold text-gray-700">{{ field.type }}</div>
        </div>
      </template>
    </div>
  </foreignObject>
</template>

<style scoped></style>
