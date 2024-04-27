<template>
  <div class="flex flex-col text-gray-600">
    <div class="flex items-center p-4 mb-2">
      <Icon size="24">
        <i-tabler-download />
      </Icon>
      <span class="ml-2 text-lg font-bold">{{ title}}</span>
    </div>
    <RadioGroup v-model="format" class="px-4">
      <div class="space-y-2">
        <template v-for="format in formats" :key="format">
          <RadioGroupOption :value="format" v-slot="{ active, checked }">
            <span
              :class="[
                'inline-block w-3 h-3 border border-black rounded-full',
                checked ? 'bg-black' : '',
              ]"
            ></span>
            <span class="ml-2 cursor-pointer">{{ format }}</span>
          </RadioGroupOption>
        </template>
      </div>
    </RadioGroup>
    <div class="px-4 mt-4">
      <button class="btn" @click="$emit('export', format)">OK</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RadioGroup, RadioGroupOption } from "@headlessui/vue";

const props = defineProps({
  formats: {
    type: Array,
  },
  title: {
    type: String,
  }
})
const emit = defineEmits(['export']);
const format = ref(props.formats[0]);
</script>

<style scoped></style>