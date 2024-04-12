<script setup>
import {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import useTable from "@/store/useTable";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Plus,
  CircleX,
  X,
  KeySquare,
  ArrowUp01,
  Ban,
  Settings,
} from "lucide-vue-next";
import { computed, ref } from "vue";

defineEmits(["resizeStart"]);
defineProps({
  width: {
    type: Number,
    required: true,
  },
});

const { tables, addTable, removeTable, addField } = useTable();
const query = ref("");
const filterTables = computed(() =>
  query.value === ""
    ? tables
    : tables.filter((table) => {
        return table.name.toLowerCase().includes(query.value.toLowerCase());
      }),
);
</script>

<template>
  <div class="flex h-full">
    <div
      class="h-full flex flex-col relative border-r px-1 pt-1 overflow-y-auto"
      :style="{ width: width + 'px' }"
    >
      <TabGroup>
        <TabList class="flex space-x-1 rounded p-1 border-b">
          <Tab as="template" v-slot="{ selected }">
            <div
              :class="[
                'border-l border-t border-r px-4 py-1 rounded-t-md -mb-1 cursor-pointer',
              ]"
            >
              Table
            </div>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div class="flex justify-between group py-1">
              <div
                class="flex items-center flex-1 bg-gray-100 py-1 h-8 relative"
              >
                <Search size="16" class="absolute left-2" />
                <Combobox v-model="query">
                  <ComboboxInput
                    class="flex w-full input focus-input pl-8"
                    @input="query = $event.target.value"
                  />
                  <CircleX
                    size="22"
                    v-if="query !== ''"
                    @click="query = ''"
                    class="hover:scale-110 absolute inset-y-0 top-1.5 right-0 pr-2"
                  />
                  <ComboboxOptions
                    class="absolute mt-1 -ml-2 border bg-white top-8 min-h-20 max-h-60 w-full overflow-auto rounded-md py-1"
                  >
                    <ComboboxOption
                      v-for="table in filterTables"
                      :key="table.id"
                      :value="table.name"
                      class="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {{ table.name }}
                    </ComboboxOption>
                  </ComboboxOptions>
                </Combobox>
              </div>
              <div
                class="flex justify-items-center cursor-pointer space-x-1 items-center w-[130px] ml-2 px-2 border rounded-sm bg-gray-200"
                @click="addTable(null)"
              >
                <Plus />
                <span class="select-none">Add Table</span>
              </div>
            </div>
            <Disclosure
              v-for="table in tables"
              :key="table.id"
              v-slot="{ open }"
            >
              <div class="p-1 border-t">
                <DisclosureButton
                  class="flex w-full justify-between items-center py-1 px-4 hover:bg-gray-100 rounded-sm"
                >
                  <span
                    class="text-ellipsis whitespace-nowrap overflow-hidden font-semibold"
                    >{{ table.name }}</span
                  >
                  <ChevronUp v-if="open" />
                  <ChevronDown v-if="!open" />
                </DisclosureButton>
              </div>
              <DisclosurePanel class="flex flex-col px-4 py-2">
                <div class="flex items-center">
                  <span class="text-sm font-semibold">Name: </span
                  ><input
                    type="text"
                    class="input focus-input flex-1 ml-2 px-2"
                    v-model="table.name"
                  />
                </div>
                <div class="flex mt-2">
                  <textarea
                    class="input focus-input flex-1 p-1"
                    placeholder="Table comment..."
                    rows="2"
                  ></textarea>
                </div>
                <div
                  class="mt-2 flex justify-between"
                  v-for="field in table.fields"
                >
                  <input
                    type="text"
                    class="input h-8 focus-input w-1/3 flex-shrink-0 px-2"
                    v-model="field.name"
                  />
                  <div
                    class="input h-8 focus-input w-1/3 flex-shrink-0 pl-2 ml-1 relative"
                  >
                    <Listbox v-model="field.type">
                      <ListboxButton class="relative w-full text-left">
                        <span class="inline-block">{{ field.type }}</span>
                        <span
                          class="absolute inset-y-0 right-0 flex items-center h-6"
                        >
                          <ChevronDown aria-hidden="true" size="16" />
                        </span>
                      </ListboxButton>
                      <ListboxOptions
                        class="absolute z-10 left-0 mt-2 focus:outline-none w-full max-h-60 overflow-auto bg-white rounded-md border"
                      >
                        <ListboxOption
                          v-for="type in [
                            'int',
                            'varchar',
                            'bigint',
                            'date',
                            'datetime',
                          ]"
                          :key="type"
                          :value="type"
                          class="py-1 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                          {{ type }}
                        </ListboxOption>
                      </ListboxOptions>
                    </Listbox>
                  </div>
                  <div class="flex">
                    <span
                      class="rounded-sm bg-gray-100 w-8 h-8 flex items-center justify-center ml-1.5"
                      :class="field.pk ? 'bg-sky-400' : ''"
                      title="Primary Key"
                      @click="field.pk = !field.pk"
                    >
                      <KeySquare size="18" class="cursor-pointer" />
                    </span>
                    <span
                      class="rounded-sm bg-gray-100 w-8 h-8 flex items-center justify-center ml-1.5"
                      :class="field.increment ? 'bg-sky-400' : ''"
                      title="Auto Increment"
                      @click="field.increment = !field.increment"
                    >
                      <ArrowUp01 size="18" class="cursor-pointer" />
                    </span>
                    <span
                      class="rounded-sm bg-gray-100 w-8 h-8 flex items-center justify-center ml-1.5"
                      :class="field.notNull ? 'bg-sky-400' : ''"
                      title="Not Null"
                      @click="field.notNull = !field.notNull"
                    >
                      <Ban size="18" class="cursor-pointer" />
                    </span>
                  </div>
                </div>
                <div
                  class="h-8 w-[120px] mt-1 flex justify-items-center cursor-pointer space-x-1 items-center px-2 border rounded-sm bg-gray-200"
                  @click="addField(table.id)"
                >
                  <Plus />
                  <span class="select-none">Add Field</span>
                </div>
              </DisclosurePanel>
            </Disclosure>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
    <div
      class="flex justify-center items-center h-auto cursor-col-resize hover:bg-gray-200 select-none pl-1"
      @mousedown="$emit('resizeStart', $event)"
    >
      <div class="h-[80px] w-1.5 border bg-gray-300 rounded"></div>
    </div>
  </div>
</template>

<style scoped></style>
