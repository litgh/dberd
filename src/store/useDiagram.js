import { Diagram, Field, Relationship, Table } from "@/types/types";
import { defineStore } from "pinia";
import { computed, ref, toRaw, watch } from "vue";
import { v4 as uuid } from "uuid";
import { ShowTableStyle, tableWidth } from "@/constants/constants";
import useTransform from "@/store/useTransform";

export default defineStore("diagram", () => {
  const { transform } = useTransform();
  /**
   * @type {import("vue").Ref<Diagram[]>}
   */
  const diagrams = ref([]);
  const diagramsKey = "dberd::diagrams";

  watch(
    () => diagrams,
    (newVal) => {
      const v = toRaw(newVal.value);
      localStorage.setItem(diagramsKey, JSON.stringify(v));
    },
    {
      deep: true,
    },
  );

  function newDiagram() {
    let name = "Untitled Diagram";
    let i = 1;
    while (true) {
      const d = diagrams.value.find((d) => d.name === name);
      if (d) {
        name = `Untitled Diagram(${i})`;
        i++;
      } else {
        diagrams.value.unshift(new Diagram(uuid(), name));
        break;
      }
    }
  }

  function deleteDiagram(id) {
    const index = diagrams.value.findIndex((d) => d.id === id);
    if (index >= 0) {
      diagrams.value.splice(index, 1);
    }
  }

  const localDiagrams = localStorage.getItem(diagramsKey);
  if (localDiagrams) {
    const diagramsArray = JSON.parse(localDiagrams);
    if (diagramsArray.length) {
      diagrams.value = diagramsArray.map((d) => Diagram.fromJSON(d));
    }
  }

  if (diagrams.value.length === 0) {
    newDiagram();
  }

  const currentDiagram = computed(() => diagrams.value[0]);

  function selectDiagram(id) {
    const index = diagrams.value.findIndex((d) => d.id === id);
    if (index >= 0) {
      let element = diagrams.value.splice(index, 1)[0];
      diagrams.value.unshift(element);
    }
  }

  /**
   *
   * @param {string} fromTable
   * @param {string} fromField
   * @param {string} toTable
   * @param {string} toField
   */
  function addRelationship(fromTable, fromField, toTable, toField) {
    const from = diagrams.value[0].tables.find(
      (table) => table.id === fromTable,
    );
    const to = diagrams.value[0].tables.find((table) => table.id === toTable);
    const relationship = new Relationship(uuid(), from, fromField, to, toField);
    diagrams.value[0].relationships.push(relationship);
  }

  /**
   *
   * @param {Table} table
   */
  function addTable(table) {
    if (table) {
      table.id = uuid();
      diagrams.value[0].tables.push(table);
    } else {
      let i = diagrams.value[0].tables.length + 1;
      let name = "table_" + i;
      do {
        const t = diagrams.value[0].tables.findIndex((t) => t.name === name);
        if (t >= 0) {
          i++;
          name = "table_" + i;
        } else {
          break;
        }
      } while (true);
      const table = Table.newTable(uuid(), name);
      let overlap = diagrams.value[0].tables.find((t) => {
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
        overlap = diagrams.value[0].tables.find((t) => {
          return (
            Math.abs(t.x - table.x) <= tableWidth &&
            Math.abs(t.y - table.y) <= t.getHeight(ShowTableStyle.ALL_FIELDS)
          );
        });
      }
      diagrams.value[0].tables.push(table);
    }
  }

  /**
   * @param {string} tableId
   */
  function addField(tableId) {
    const table = diagrams.value[0].tables.find(
      (table) => table.id === tableId,
    );
    if (table) {
      table.fields.push(Field.newField(uuid(), "", ""));
    }
  }

  /**
   * @param {string} tableId
   */
  function removeTable(tableId) {
    const index = diagrams.value[0].tables.findIndex(
      (table) => table.id === tableId,
    );
    if (index >= 0) {
      diagrams.value[0].tables.splice(index, 1);
    }
    const rs = diagrams.value[0].relationships.filter((relationship) => {
      return (
        relationship.fromTable.id === tableId ||
        relationship.toTable.id === tableId
      );
    });
    rs.forEach((r) => {
      diagrams.value[0].relationships.splice(
        diagrams.value[0].relationships.indexOf(r),
        1,
      );
    });
  }

  function removeField(tableId, fieldId) {
    const table = diagrams.value[0].tables.find(
      (table) => table.id === tableId,
    );
    if (table) {
      const index = table.fields.findIndex((field) => field.id === fieldId);
      if (index >= 0) {
        table.fields.splice(index, 1);
      }
    }
    const rs = diagrams.value[0].relationships.filter((relationship) => {
      return (
        (relationship.fromTable.id === tableId && relationship.fromField === fieldId) ||
        (relationship.toTable.id === tableId && relationship.toField === fieldId)
      );
    });
    rs.forEach((r) => {
      diagrams.value[0].relationships.splice(
        diagrams.value[0].relationships.indexOf(r),
        1,
      );
    });
  }

  return {
    diagrams,
    newDiagram,
    selectDiagram,
    deleteDiagram,
    currentDiagram,
    addTable,
    addField,
    removeField,
    removeTable,
    addRelationship,
  };
});
