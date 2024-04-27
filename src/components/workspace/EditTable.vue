<template>
  <Teleport to="body">
    <Transition name="fade" @after-enter="onLoad">
      <div
        v-if="visible"
        @click="close"
        class="fixed w-full h-full top-0 left-0 inset-0 bg-black/50 z-50 flex justify-center items-center"
      >
        <div
          @click.stop
          class="w-1/2 h-1/2 bg-white rounded-md shrink-0 min-w-[900px] relative flex"
        >
          <div class="border-r h-full flex flex-1 p-4 justify-between flex-col">
            <div class="flex flex-1">
              <div ref="editorContainer" class="flex flex-1"></div>
            </div>
            <div class="flex justify-center space-x-2 mt-2">
              <button class="rounded-sm bg-blue-200 px-2 py-1" @click="save">
                Save
              </button>
              <button class="rounded-sm bg-gray-100 px-2 py-1" @click="close">
                Cancel
              </button>
            </div>
          </div>
          <div
            class="flex justify-center items-start py-10 h-full px-10 overflow-y-auto min-w-[270px]"
          >
            <div
              class="flex flex-col rounded-md overflow-hidden ring-1 ring-neutral-800"
              :style="{ width: tableWidth + 'px' }"
            >
              <div
                class="group w-full flex justify-between items-center text-center px-2"
                :style="{
                  height: tableFieldHeight + 'px',
                  background: table.color,
                }"
              >
                <span class="text-white">{{ table.name }}</span>
              </div>
              <template v-for="field in table.fields" :key="field.id">
                <div
                  class="hover:bg-gray-200 bg-gray-100 flex items-center px-2 justify-between border-t border-t-zinc-900"
                  :style="{ height: tableFieldHeight + 'px' }"
                >
                  <div class="flex items-center">
                    <span
                      :class="[
                        'w-2.5 h-2.5 rounded-full opacity-80 inline-block',
                        field.pk
                          ? 'bg-blue-500'
                          : field.notNull
                            ? 'bg-gray-800'
                            : 'bg-gray-400',
                      ]"
                    ></span>
                    <span class="inline-block ml-1.5">{{ field.name }}</span>
                    <Icon size="13" color="#E4A62F">
                      <i-lucide-key-square
                        v-if="field.pk"
                        class="ml-1 inline-block"
                      />
                    </Icon>
                  </div>
                  <div class="uppercase text-xs font-bold">
                    {{ field.type }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import useUndoRedo from "@/store/useUndoRedo";
import useState from "@/store/useState";
import { onMounted, ref, toRaw } from "vue";
import {
  Action,
  Dialects,
  Keywords, ObjectType, State,
  tableFieldHeight,
  tableWidth,
} from "@/constants/constants";
import loader from "@monaco-editor/loader";
import YAML from "yaml";
import { Lexer } from "chevrotain";
import { Field, Index, Table } from "@/types/types";
import * as tokens from "@/types/tokens";

const { addHistory } = useUndoRedo();
const { state } = useState();
/**
 * @type {import("vue").Ref<import("@/types/types").Table>}
 */
const table = ref(null);
const visible = ref(false);
const editorContainer = ref();
const lexer = new Lexer(tokens.allTokens);
let source;

loader.config({
  paths: {
    vs: "https://unpkg.com/monaco-editor@0.45.0/min/vs",
  },
});

let monaco;
let schemaSuggestion;
let indexSuggestion;
onMounted(async () => {
  monaco = await loader.init();
  indexSuggestion = [
    {
      label: "name",
      insertText: "name: ${1}",
      detail: "Index name",
      kind: monaco.languages.CompletionItemKind.Property,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
    {
      label: "fields",
      insertText: "fields: ${1}",
      detail: "Index fields, separated by comma or json array",
      kind: monaco.languages.CompletionItemKind.Property,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
    {
      label: "unique",
      insertText: "unique: ${1:false}",
      detail: "true/false, Whether the index is unique",
      kind: monaco.languages.CompletionItemKind.Property,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
    {
      label: "type",
      insertText: "type: ${1:btree}",
      detail: "Index type",
      kind: monaco.languages.CompletionItemKind.Property,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
  ];

  schemaSuggestion = schemaSuggestion = [
    {
      label: "name",
      insertText: "name: ${1}",
      detail: "Table name",
      kind: monaco.languages.CompletionItemKind.Property,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
    {
      label: "comment",
      insertText: 'comment: "${1}"',
      detail: "Table comment",
      kind: monaco.languages.CompletionItemKind.Property,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
    {
      label: "fields",
      insertText: "fields:\n  ${1:id}: ${2:int} ${3:pk} ${4}",
      detail: "Table fields",
      kind: monaco.languages.CompletionItemKind.Property,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
    {
      label: "index",
      insertText:
        "index:\n  - name: ${1}\n    fields: ${2}\n    unique: ${3:false}\n    type: ${4:btree}\n  ${5}",
      detail: "Table index",
      kind: monaco.languages.CompletionItemKind.Property,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
  ];
});

function suggestItem(s) {
  return {
    label: s.label,
    insertText: s.insertText,
    detail: s.detail,
    kind: s.kind,
    insertTextRules: s.insertTextRules,
  };
}

async function onLoad() {
  monaco.languages.registerCompletionItemProvider("yaml", {
    provideCompletionItems(model, position, context, token) {
      try {
        const ast = YAML.parseDocument(model.getValue());
        if (!ast.contents.items) {
          return {
            suggestions: schemaSuggestion.map(suggestItem),
          };
        } else {
          const keys = ast.contents.items
            .filter((item) => item.value)
            .map((item) => item.key.value);
          const pos = model.getValueLengthInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });
          for (let item of ast.contents.items) {
            if (!item.value) {
              return {
                suggestions: schemaSuggestion
                  .filter((item) => !keys.includes(item.label))
                  .map(suggestItem),
              };
            } else if (item.key.value === "index") {
              for (let idx of item.value.items) {
                if (idx.items) {
                  for (let idxItem of idx.items) {
                    if (idxItem.value == null) {
                      return {
                        suggestions: indexSuggestion.map(suggestItem),
                      };
                    }
                    if (
                      idxItem.key.value === "name" &&
                      idxItem.value.range[1] === pos
                    ) {
                      return {
                        suggestions: [],
                      };
                    }
                    if (
                      idxItem.key.value === "fields" &&
                      idxItem.value.range[1] === pos
                    ) {
                      return {
                        suggestions: table.value.fields.map((f) => {
                          return {
                            label: f.name,
                            kind: monaco.languages.CompletionItemKind.Variable,
                            insertText: f.name,
                          };
                        }),
                      };
                    }
                  }
                } else {
                  return {
                    suggestions: indexSuggestion.map(suggestItem),
                  };
                }
              }
            }
          }
        }
      } catch (error) {
        return {
          suggestions: [],
        };
      }

      const line = model.getLineContent(position.lineNumber);
      if (line.includes(":")) {
        return {
          suggestions: Keywords.trim()
            .split(" ")
            .map((word) => {
              return {
                label: word,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: word,
                detail: "Keyword",
              };
            })
            .concat(
              Array.from(
                Object.keys(Dialects)
                  .map((dialect) => {
                    return Dialects[dialect].split(" ").map((word) => {
                      return {
                        label: word,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: word,
                        detail: dialect,
                      };
                    });
                  })
                  .flat()
                  .reduce((v, i) => {
                    if (v.has(i.label)) {
                      if (!v.get(i.label).detail.includes(i.detail)) {
                        v.get(i.label).detail += "/" + i.detail;
                      }
                      return v;
                    } else {
                      return v.set(i.label, i);
                    }
                  }, new Map())
                  .values(),
              ),
            ),
        };
      }
      return {
        suggestions: [],
      };
    },
  });

  const editor = monaco.editor.create(editorContainer.value, {
    value: table.value.toYaml(),
    language: "yaml",
    automaticLayout: false,
    minimap: {
      enabled: false,
    },
    lineNumbers: "on",
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 1,
    glyphMargin: false,
    tabSize: 2,
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 6,
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
    padding: {
      top: 4,
    },
  });
  editor.onDidChangeModelContent((e) => {
    const change = e.changes[0];
    if (change.text.trim() === "" && change.rangeLength === 0) {
      return;
    }
    const value = editor.getValue();
    if (value.trim() === "") {
      return;
    }
    try {
      const data = YAML.parseDocument(value);
      if (data.errors.length > 0) {
        return;
      }
      const t = { fields: [], indices: [] };
      /**
       * @type {Map}
       */
      const j = data.toJS({ mapAsMap: true });
      j.forEach((v, k) => {
        switch (k) {
          case "name":
            t.name = v;
            break;
          case "comment":
            t.comment = v;
            break;
          case "fields":
            v &&
              v.forEach((exp, f) => {
                const field = Field.newField("", "", "");
                field.name = f;
                if (exp) {
                  const raw = data.contents
                    .get("fields", true)
                    .items.find((i) => i.key.value === f);
                  if (raw && raw.value.comment) {
                    field.comment = raw.value.comment;
                  }
                  parseField(field, exp);
                  t.fields.push(field);
                }
              });
            break;
          case "index":
            if (v) {
              v.forEach((idx) => {
                if (idx instanceof Map) {
                  const index = Index.newIndex(
                    idx.get("name"),
                    idx.get("fields"),
                    idx.get("unique"),
                    idx.get("type"),
                  );
                  if (index.fields && index.fields instanceof String) {
                    index.fields = index.fields
                      .split(",")
                      .map((f) => f.trim())
                      .filter((f) => f !== "");
                  }
                  t.indices.push(index);
                }
              });
            } else {
              t.indices = [];
            }
        }
      });
      Object.assign(table.value, t);
    } catch (error) {}
  });
}

function parseField(field, value) {
  const lexingResult = lexer.tokenize(value);
  lexingResult.tokens.forEach((t, i) => {
    switch (t.tokenType) {
      case tokens.PK:
        field.pk = true;
        break;
      case tokens.Auto:
        field.increment = true;
        break;
      case tokens.Not:
        field.notNull = true;
        break;
      case tokens.Default:
        if (i + 1 < lexingResult.tokens.length) {
          const nextToken = lexingResult.tokens[i + 1];
          field.default = value
            .slice(t.endOffset + 1, nextToken.startOffset)
            .trim();
        } else if (t.endOffset + 1 < value.length) {
          field.default = value.slice(t.endOffset + 1).trim();
        }
        break;
      case tokens.DataType:
        field.type = t.image;
        break;
    }
  });
}

function edit(t) {
  source = t;
  table.value = Table.fromJSON(toRaw(t));
  visible.value = true;
}

function close() {
  visible.value = false;
}

function save() {
  addHistory({
    action: Action.EDIT,
    element: ObjectType.TABLE,
    data: Table.fromJSON(toRaw(source)),
    message: `Edit table ${source.name}`
  })
  Object.assign(source, table.value);
  state.state = State.MODIFIED;
  close();
}

defineExpose({
  edit,
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
