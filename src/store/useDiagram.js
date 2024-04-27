import { Relationship, Table } from "@/types/types";
import { defineStore } from "pinia";
import { ref, toRaw, watch } from "vue";
import { v4 as uuid } from "uuid";

import db from "@/store/db";
import { Action, ObjectType, ShowTableStyle, State, tableWidth } from "@/constants/constants";
import useTransform from "@/store/useTransform";
import useSetting from "@/store/useSettings";
import useState from "@/store/useState";
import useUndoRedo from "@/store/useUndoRedo";

export default defineStore("diagrams", () => {
  const { transform } = useTransform();
  const { state } = useState();
  const { settings } = useSetting();
  const { addHistory } = useUndoRedo();
  const diagramId = ref();
  const diagramName = ref("Untitled Diagram");
  /**
   * @type {import("vue").Ref<Table[]>}
   */
  const tables = ref([]);
  /**
   * @type {import("vue").Ref<Relationship[]>}
   */
  const relationships = ref([]);

  const diagram = () => {
    return {
      name: diagramName.value,
      lastModified: new Date(),
      tables: toRaw(tables.value),
      relationships: relationships.value.map(r => {
        return {
          id: r.id,
          fromTable: r.fromTable.id,
          fromField: r.fromField,
          toTable: r.toTable.id,
          toField: r.toField
        }
      }),
      zoom: transform.zoom,
      position: toRaw(transform.position),
    };
  };

  const load = (d) => {
    if (d) {
      diagramId.value = d.id;
      diagramName.value = d.name;
      tables.value = d.tables.map((t) => Table.fromJSON(t));
      relationships.value = d.relationships.map((r) => {
        const fromTable = tables.value.find((t) => t.id === r.fromTable);
        const toTable = tables.value.find((t) => t.id === r.toTable);
        return new Relationship(r.id, fromTable, r.fromField, toTable, r.toField);
      });
      transform.zoom = d.zoom;
      transform.position = d.position;
    }
    state.state = State.NONE;
  };

  const save = async () => {
    if (diagramId.value) {
      await db.diagrams
        .update(diagramId.value, diagram())
        .then(() => {
          state.state = State.SAVED;
          state.lastSaved = new Date();
        });
    } else {
      console.log("add new diagram")
      await db.diagrams
        .add({
          ...diagram(),
          createdAt: new Date(),
        })
        .then(() => {
          state.state = State.SAVED;
          state.lastSaved = new Date();
        });
    }
  };

  const loadLatestDiagram = async () => {
    state.state = State.LOADING;
    await db.diagrams
      .orderBy("lastModified")
      .last()
      .then(load)
      .catch((e) => console.error(e));
  };

  const loadDiagram = async (id) => {
    await db.diagrams
      .get(id)
      .then(load)
      .catch((e) => console.error(e));
  };

  const diagrams = async () => db.diagrams.toArray()

  /**
   *
   * @param {string} fromTable tableId
   * @param {string} fromField fieldId
   * @param {string} toTable tableId
   * @param {string} toField fieldId
   * @param {boolean} addUndo
   */
  const addRelationship = (fromTable, fromField, toTable, toField, addUndo = true) => {
    const from = tables.value.find((table) => table.id === fromTable);
    const to = tables.value.find((table) => table.id === toTable);
    const relationship = new Relationship(uuid(), from, fromField, to, toField);

    if (addUndo) {
      addHistory({
        action: Action.ADD,
        element: ObjectType.RELATIONSHIP,
        data: {
          id: relationship.id,
          fromTable: fromTable,
          fromField: fromField,
          toTable: toTable,
          toField: toField,
        },
        message: `Created relationship`,
      });
    }
    relationships.value.push(relationship);
    state.state = State.MODIFIED;
  };

  const removeRelationship = (relationshipId, addUndo = true) => {
    const r = relationships.value.find((relationship) => relationship.id === relationshipId);
    if (r) {
      relationships.value.splice(relationships.value.indexOf(r), 1);
      if (addUndo) {
        addHistory({
          action: Action.DELETE,
          element: ObjectType.RELATIONSHIP,
          data: {
            id: r.id,
            fromTable: r.fromTable.id,
            fromField: r.fromField,
            toTable: r.toTable.id,
            toField: r.toField,
          },
          message: `Deleted relationship`,
        });
      }
      state.state = State.MODIFIED;
    }
  };

  /**
   * @param {Table} table
   * @param {boolean} addUndo
   */
  const addTable = (table, addUndo = true) => {
    if (table) {
      table.id = uuid();
    } else {
      let i = tables.value.length + 1;
      let name = "table_" + i;
      do {
        const t = tables.value.findIndex((t) => t.name === name);
        if (t >= 0) {
          i++;
          name = "table_" + i;
        } else {
          break;
        }
      } while (true);
      table = Table.newTable(uuid(), name);
    }
    let overlap = tables.value.find((t) => {
      return (
        Math.abs(t.x - table.x) <= tableWidth &&
        Math.abs(t.y - table.y) <= t.getHeight(ShowTableStyle.ALL_FIELDS)
      );
    });
    while (overlap) {
      table.x += tableWidth + 20;
      if (table.x + tableWidth >= transform.width) {
        table.y += overlap.getHeight(ShowTableStyle.ALL_FIELDS) + 20;
        table.x = 50;
      }
      overlap = tables.value.find((t) => {
        return (
          Math.abs(t.x - table.x) <= tableWidth &&
          Math.abs(t.y - table.y) <= t.getHeight(ShowTableStyle.ALL_FIELDS)
        );
      });
    }
    tables.value.push(table);

    if (addUndo) {
      addHistory({
        action: Action.ADD,
        element: ObjectType.TABLE,
        data: table.id,
        message: `Created table ${table.name}`,
      });
    }
    state.state = State.MODIFIED;
  };

  /**
   *
   * @param {string[]} tableIds
   */
  const duplicateTable = (tableIds) => {
    if (tableIds.length) {
      tables.value.forEach((t) => {
        if (tableIds.includes(t.id)) {
          const newTable = Table.fromJSON(t);
          newTable.name = `${t.name}_copy`;
          addTable(newTable)
        }
      });
    }
  }

  /**
   * @param {string} tableId
   * @param {boolean} addUndo
   */
  const removeTable = (tableId, addUndo = true) => {
    const index = tables.value.findIndex((table) => table.id === tableId);
    if (index >= 0) {
      const t = tables.value.splice(index, 1)[0];
      const rs = relationships.value.filter((relationship) => {
        return (
          relationship.fromTable.id === tableId ||
          relationship.toTable.id === tableId
        );
      });
      rs.forEach((r) => {
        relationships.value.splice(relationships.value.indexOf(r), 1);
      });
      if (addUndo) {
        addHistory({
          action: Action.DELETE,
          element: ObjectType.TABLE,
          data: {
            table: t,
            relationships: rs,
          },
          message: `Deleted table ${t.name}`,
        })
      }
    }
  };

  // /**
  //  * @param {string} tableId
  //  * @param {boolean} addUndo
  //  */
  // const addField = (tableId, addUndo = true) => {
  //   const table = tables.value.find((table) => table.id === tableId);
  //   if (table) {
  //     table.fields.push(Field.newField(uuid(), "", ""));
  //   }
  // };

  // const removeField = (tableId, fieldId) => {
  //   const table = tables.value.find((table) => table.id === tableId);
  //   if (table) {
  //     const index = table.fields.findIndex((field) => field.id === fieldId);
  //     if (index >= 0) {
  //       table.fields.splice(index, 1);
  //     }
  //   }
  //   const rs = relationships.value.filter((relationship) => {
  //     return (
  //       (relationship.fromTable.id === tableId &&
  //         relationship.fromField === fieldId) ||
  //       (relationship.toTable.id === tableId &&
  //         relationship.toField === fieldId)
  //     );
  //   });
  //   rs.forEach((r) => {
  //     relationships.value.splice(relationships.value.indexOf(r), 1);
  //   });
  // };

  loadLatestDiagram().then();

  watch(
    () => state.state,
    async (v) => {
      if (v === State.MODIFIED && settings.autoSave) {
        await save();
        return;
      } else if (v !== State.SAVING) {
        return;
      }
      await save();
    },
  );

  watch(
    () => [tables.value.length, relationships.value.length, transform.zoom],
    () => {
      if (tables.value.length === 0 && relationships.value.length === 0) {
        return;
      }
      if (settings.autoSave && state.state === State.NONE) {
        state.state = State.SAVING;
      }
    },
  );

  watch(diagramName, () => {
    state.state = State.MODIFIED;
  })


  return {
    diagramId,
    diagramName,
    tables,
    relationships,
    diagrams,
    loadDiagram,
    addTable,
    duplicateTable,
    removeTable,
    addRelationship,
    removeRelationship,
    save,
  };
});
