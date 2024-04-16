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
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import useDiagram from "@/store/useDiagram.js";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Plus,
  CircleX,
  KeySquare,
  ArrowUp01,
  Ban,
  Settings,
  Grip,
  PencilLine,
} from "lucide-vue-next";
import { computed, defineComponent, h, ref, watch } from "vue";
import { storeToRefs } from "pinia";

defineEmits(["resizeStart"]);
defineProps({
  width: {
    type: Number,
    required: true,
  },
});

const diagramStore = useDiagram();
const { diagrams, currentDiagram } = storeToRefs(diagramStore);
const { addTable, addField, newDiagram, selectDiagram, deleteDiagram } =
  diagramStore;
const diagramName = ref("");
const editDiagramNameModal = ref(false);

const query = ref("");
const filterTables = computed(() =>
  query.value === ""
    ? currentDiagram.value.tables
    : currentDiagram.value.tables.filter((table) => {
        return table.name.toLowerCase().includes(query.value.toLowerCase());
      }),
);

function closeEditDiagramNameModal() {
  editDiagramNameModal.value = false;
}

function renameDiagramName() {
  currentDiagram.value.name = diagramName.value;
  closeEditDiagramNameModal();
}

function createNewDiagram() {
  newDiagram();
  diagramName.value = currentDiagram.value.name;
  closeEditDiagramNameModal();
}

function delDiagram(id, close) {
  if (confirm("Are you sure you want to delete this diagram?")) {
    deleteDiagram(id);
    diagramName.value = currentDiagram.value.name;
    if (close) {
      closeEditDiagramNameModal();
    }
  }
}

const DisclosureEmitter = defineComponent(
  (props, { emit }) => {
    watch(
      () => props.open,
      (value) => {
        if (value) {
          emit("open");
        }
      },
    );
    return () => {
      return h("div", "");
    };
  },
  {
    props: {
      open: Boolean,
    },
    emits: ["open"],
  },
);
/**
 * @type {import("vue").Ref<HTMLButtonElement[]>}
 */
const disclosureButtons = ref([]);

function closeOthers(id) {
  disclosureButtons.value.forEach((button) => {
    if (button.getAttribute("data-id") !== id.toString()) {
      button.click();
    }
  });
}
</script>

<template>
  <div class="flex h-full">
    <div
      class="h-full flex flex-col relative border-r px-1 pt-1 overflow-y-auto"
      :style="{ width: width + 'px' }"
    >
      <div
        class="flex p-1 cursor-text border-b items-center group"
        @click="
          editDiagramNameModal = true;
          diagramName = currentDiagram.name;
        "
      >
        <Grip size="22" class="mr-1" />
        {{ currentDiagram.name }}
        <PencilLine size="18" class="ml-2 hidden group-hover:block" />
      </div>
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
              v-for="table in filterTables"
              :key="table.id"
              v-slot="{ open, close }"
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
              <transition
                enter-active-class="transition duration-50 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
              >
                <DisclosurePanel class="flex flex-col px-4 py-2">
                  <div class="flex items-center">
                    <span class="text-sm font-semibold">Name:</span>
                    <input
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
                    <div class="flex flex-1">
                      <input
                        type="text"
                        class="input h-8 focus-input w-1/2 flex-shrink-0 px-2"
                        v-model="field.name"
                      />
                      <div
                        class="input h-8 focus-input w-1/2 flex-shrink-0 pl-2 ml-1 relative"
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
                            class="absolute z-10 left-0 mt-2 outline-none w-full max-h-60 overflow-auto bg-white rounded-md border"
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
                    </div>
                    <div class="flex">
                      <!--                      <span-->
                      <!--                        class="rounded-sm bg-gray-100 w-8 h-8 flex items-center justify-center ml-1.5"-->
                      <!--                        :class="field.pk ? 'bg-sky-400' : ''"-->
                      <!--                        title="Primary Key"-->
                      <!--                        @click="field.pk = !field.pk"-->
                      <!--                      >-->
                      <!--                        <KeySquare size="18" class="cursor-pointer" />-->
                      <!--                      </span>-->
                      <!--                      <span-->
                      <!--                        class="rounded-sm bg-gray-100 w-8 h-8 flex items-center justify-center ml-1.5"-->
                      <!--                        :class="field.increment ? 'bg-sky-400' : ''"-->
                      <!--                        title="Auto Increment"-->
                      <!--                        @click="field.increment = !field.increment"-->
                      <!--                      >-->
                      <!--                        <ArrowUp01 size="18" class="cursor-pointer" />-->
                      <!--                      </span>-->
                      <span
                        class="rounded-sm bg-gray-100 w-8 h-8 flex items-center justify-center ml-1.5"
                        :class="field.notNull ? 'bg-sky-400' : ''"
                        title="Not Null"
                        @click="field.notNull = !field.notNull"
                      >
                        <Ban size="18" class="cursor-pointer" />
                      </span>
                      <span
                        class="rounded-sm bg-gray-100 w-8 h-8 flex items-center justify-center ml-1.5"
                      >
                        <Settings size="18" class="cursor-pointer" />
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
              </transition>
              <button
                ref="disclosureButtons"
                :data-id="table.id"
                class="hidden"
                @click="close()"
              />
              <DisclosureEmitter :open="open" @open="closeOthers(table.id)" />
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
  <TransitionRoot appear :show="editDiagramNameModal" as="template">
    <Dialog as="div" @close="closeEditDiagramNameModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 -top-1/3 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Rename diagram
              </DialogTitle>
              <div class="mt-2 flex">
                <input
                  type="text"
                  class="input input-focus flex-1"
                  v-model="diagramName"
                />
              </div>

              <div class="mt-4 flex justify-start space-x-2">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="renameDiagramName"
                >
                  Rename
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="createNewDiagram"
                >
                  New Diagram
                </button>
                <button
                  v-if="diagrams.length > 1"
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="delDiagram(currentDiagram.id, true)"
                >
                  Delete
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="closeEditDiagramNameModal"
                >
                  Cancel
                </button>
              </div>
              <div class="mt-4 flex flex-col max-h-80 overflow-y-auto">
                <div
                  v-for="diagram in diagrams.slice(1)"
                  :key="diagram.id"
                  class="flex hover:bg-gray-100 cursor-pointer p-1 group justify-between h-9"
                  @click="
                    selectDiagram(diagram.id);
                    closeEditDiagramNameModal();
                  "
                >
                  <span>{{ diagram.name }}</span>
                  <button
                    class="ring-2 ring-red-400 rounded-sm p-1 text-sm group-hover:block hidden"
                    @click="delDiagram(diagram.id, false)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
