import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import { Action, ObjectType, State } from "@/constants/constants";
import useDiagram from "@/store/useDiagram";
import useState from "@/store/useState";
import { Table } from "@/types/types.js";

export default defineStore("undoRedo", () => {
  const diagramStore = useDiagram();
  const { state } = useState();
  const undoStack = ref([]);
  const redoStack = ref([]);
  const history = ref([]);

  const addHistory = (action, addUndo = true) => {
    if (addUndo) {
      undoStack.value.push(action);
    }
    history.value.unshift({ ...action, time: new Date() });
  };

  const undo = () => {
    if (undoStack.value.length === 0) {
      return;
    }
    const {
      tables,
      relationships,
      addTable,
      removeTable,
      addRelationship,
      removeRelationship,
    } = diagramStore;
    const a = undoStack.value.pop();
    let st = State.MODIFIED;
    switch (a.action) {
      case Action.ADD:
        switch (a.element) {
          case ObjectType.TABLE:
            removeTable(a.data, false);
            redoStack.value.push(a);
            break;
          case ObjectType.RELATIONSHIP:
            removeRelationship(a.data.id, false);
            redoStack.value.push(a);
            break;
        }
        break;
      case Action.DELETE:
        switch (a.element) {
          case ObjectType.TABLE:
            addTable(a.data.table, false);
            if (a.data.relationships) {
              relationships.push(...a.data.relationships);
            }
            redoStack.value.push(a);
            break;
          case ObjectType.RELATIONSHIP:
            addRelationship(a.data.fromTable, a.data.fromField, a.data.toTable, a.data.toField);
            break;
        }
        break;
      case Action.MOVE:
        switch (a.element) {
          case ObjectType.TABLE:
            const { id, x, y } = a.data;
            const table = tables.find((t) => t.id === id);
            if (table) {
              redoStack.value.push({
                ...a,
                data: { id, x: table.x, y: table.y },
              });
              table.x = x;
              table.y = y;
            }
        }
        break;
      case Action.EDIT:
        switch (a.element) {
          case ObjectType.TABLE:
            const table = tables.find((t) => t.id === a.data.id);
            if (table) {
              redoStack.value.push({
                ...a,
                data: Table.fromJSON(toRaw(table)),
              });
              Object.assign(table, a.data);
            }
            break;
        }
        break;
      default:
        st = State.NONE;
        break;
    }
    if (st !== State.NONE) {
      state.state = st;
    }
  };

  const redo = () => {
    if (redoStack.value.length === 0) {
      return;
    }
    const { tables, addTable, removeTable, addRelationship } = diagramStore;
    const a = redoStack.value.pop();
    let st = State.MODIFIED;
    switch (a.action) {
      case Action.ADD:
        switch (a.element) {
          case ObjectType.TABLE:
            addTable(a.data, false);
            undoStack.value.push(a);
            break;
          case ObjectType.RELATIONSHIP:
            addRelationship(
              a.data.fromTable,
              a.data.fromField,
              a.data.toTable,
              a.data.toField,
            );
        }
        break;
      case Action.DELETE:
        switch (a.element) {
          case ObjectType.TABLE:
            removeTable(a.data.table.id, false);
            undoStack.value.push(a);
            break;
        }
        break;
      case Action.MOVE:
        switch (a.element) {
          case ObjectType.TABLE:
            const { id, x, y } = a.data;
            const table = tables.find((t) => t.id === id);
            if (table) {
              undoStack.value.push({
                ...a,
                data: { id, x: table.x, y: table.y },
              });
              table.x = x;
              table.y = y;
            }
        }
        break;
      case Action.EDIT:
        switch (a.element) {
          case ObjectType.TABLE:
            const table = tables.find((t) => t.id === a.data.id);
            if (table) {
              undoStack.value.push({
                ...a,
                data: Table.fromJSON(toRaw(table)),
              });
              Object.assign(table, a.data);
            }
            break;
        }
        break;
      default:
        st = State.NONE;
        break;
    }
    if (st !== State.NONE) {
      state.state = st;
    }
  };

  return {
    undoStack,
    redoStack,
    undo,
    redo,
    addHistory,
    history,
  };
});
