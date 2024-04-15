import { Diagram, Field, Relationship, Table } from "@/types/types";
import { defineStore } from "pinia";
import { computed, ref, toRaw, toRefs, watch } from "vue";

export default defineStore("diagram", () => {
  const tableId = ref(0);
  const relationshipId = ref(0);
  /**
   * @type {import("vue").Ref<Diagram[]>}
   */
  const diagrams = ref([])
  const diagramsId = ref(0);
  const diagramsKey = "dberd::diagrams";

  watch(() => diagrams, (newVal) => {
    const v = toRaw(newVal.value)
    localStorage.setItem(diagramsKey, JSON.stringify(v));
  }, {
    deep: true,
  })


  function setDiagramsId(diagrams) {
    diagramsId.value = Math.max(...diagrams.map((d) => d.id));
  }

  function newDiagram() {
    diagramsId.value++;
    let name = 'Untitled Diagram';
    let i = 1;
    while(true) {
      const d = diagrams.value.find(d => d.name === name)
      if (d) {
        name = `Untitled Diagram(${i})`;
        i++;
      } else {
        diagrams.value.unshift(new Diagram(diagramsId.value, name));
        break;
      }
    }
    tableId.value = 0;
  }

  function deleteDiagram(id) {
    const index = diagrams.value.findIndex((d) => d.id === id);
    if (index >= 0) {
      diagrams.value.splice(index, 1);
      if (diagrams.value.length > 0) {
        setTableId(diagrams.value[0].tables)
      }
    }

  }

  const localDiagrams = localStorage.getItem(diagramsKey);
  if (localDiagrams) {
    const diagramsArray = JSON.parse(localDiagrams);
    if (diagramsArray.length) {
      setDiagramsId(diagramsArray);
      setTableId(diagramsArray[0].tables);
      setRelationshipId(diagramsArray[0].relationships);
      diagrams.value = diagramsArray.map(d => Diagram.fromJSON(d));
    }
  }

  if (diagrams.value.length === 0) {
    newDiagram();
  }

  const currentDiagram = computed(() => diagrams.value[0])
  /**
   * @param {Table[]} tables
   */
  function setTableId(tables) {
    if (!tables || tables.length === 0) {
      tableId.value = 0;
    }
    tableId.value = Math.max(...tables.map((t) => t.id));
  }

  /**
   * @param {Relationship[]} relationships
   */
  function setRelationshipId(relationships) {
    if (!relationships || relationships.length === 0) {
      relationshipId.value = 0;
    }
    relationshipId.value = Math.max(...relationships.map((r) => r.id));
  }

  function selectDiagram(id) {
    const index = diagrams.value.findIndex((d) => d.id === id);
    if (index >= 0) {
      let element = diagrams.value.splice(index, 1)[0];
      setTableId(element.tables)
      diagrams.value.unshift(element);
    }

  }


  /**
   *
   * @param {number} fromTable
   * @param {number} fromField
   * @param {number} toTable
   * @param {number} toField
   */
  function addRelationship(fromTable, fromField, toTable, toField) {
    const from = diagrams.value[0].tables.find((table) => table.id === fromTable);
    const to = diagrams.value[0].tables.find((table) => table.id === toTable);
    relationshipId.value++;
    const relationship = new Relationship(
      relationshipId.value,
      from,
      fromField,
      to,
      toField,
    );
    diagrams.value[0].relationships.push(relationship);
  }

  /**
   *
   * @param {Table} table
   */
  function addTable(table) {
    tableId.value++;
    if (table) {
      table.id = tableId.value;
      diagrams.value[0].tables.push(table);
    } else {
      diagrams.value[0].tables.push(Table.newTable(tableId.value));
    }
  }

  /**
   * @param {number} tableId
   */
  function addField(tableId) {
    const table = diagrams.value[0].tables.find((table) => table.id === tableId);
    if (table) {
      const maxId = Math.max(...table.fields.map((field) => field.id));
      table.fields.push(Field.newField(maxId + 1, "", ""));
    }
  }

  /**
   * @param {number} tableId
   */
  function removeTable(tableId) {
    const index = diagrams.value[0].tables.findIndex((table) => table.id === tableId);
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
      diagrams.value[0].relationships.splice(diagrams.value[0].relationships.indexOf(r), 1);
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
    removeTable,
    addRelationship,
  };
});
