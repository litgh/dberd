import { defineStore } from "pinia";
import { ref } from "vue";
import useTransform from "./useTransform";
import { Field, Relationship, Table } from "@/types/types";

export default defineStore("table", () => {
  /**
   *
   * @type {import("vue").Ref<import("@/types/types").Table[]>}
   */
  const tables = ref([]);
  const tableId = ref(0);
  /**
   * @type {import("vue").Ref<Relationship[]>}
   */
  const relationships = ref([]);
  const relationshipId = ref(0);

  /**
   *
   * @param {number} fromTable
   * @param {number} fromField
   * @param {number} toTable
   * @param {number} toField
   */
  function addRelationship(fromTable, fromField, toTable, toField) {
    const from = tables.value.find((table) => table.id === fromTable);
    const to = tables.value.find((table) => table.id === toTable);
    relationshipId.value++;
    const relationship = new Relationship(
      relationshipId.value,
      from,
      fromField,
      to,
      toField,
    );
    relationships.value.push(relationship);
  }

  /**
   *
   * @param {Table} table
   */
  function addTable(table) {
    tableId.value++;
    if (table) {
      table.id = tableId.value;
      tables.value.push(table);
    } else {
      tables.value.push(Table.newTable(tableId.value));
    }
  }

  /**
   * @param {number} tableId
   */
  function addField(tableId) {
    const table = tables.value.find((table) => table.id === tableId);
    if (table) {
      const maxId = Math.max(...table.fields.map(field => field.id));
      table.fields.push(Field.newField(maxId + 1, '', ''))
    }
  }

  /**
   * @param {number} tableId
   */
  function removeTable(tableId) {
    const index = tables.value.findIndex((table) => table.id === tableId);
    if (index >= 0) {
      tables.value.splice(index, 1);
    }
    const rs = relationships.value.filter(
      (relationship, i) => {
        return relationship.fromTable.id === tableId || relationship.toTable.id === tableId;
      }
    );
    rs.forEach(r => {
      relationships.value.splice(relationships.value.indexOf(r), 1);
    })
  }

  return {
    tables,
    addTable,
    addField,
    removeTable,
    relationships,
    addRelationship,
  };
});
