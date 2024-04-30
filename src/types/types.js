import {
  tableFieldHeight,
  tableWidth,
  colors,
  ShowTableStyle,
} from "@/constants/constants";
import { v4 as uuid } from "uuid";

export class Diagram {
  /**
   * @type {Table[]}
   */
  tables;
  /**
   * @type {Relationship[]}
   */
  relationships;

  /**
   *
   * @param {string} id
   * @param {string} name
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.tables = [];
    this.relationships = [];
  }

  static fromJSON(json) {
    const diagram = new Diagram(json.id, json.name);
    diagram.tables = json.tables.map((table) => Table.fromJSON(table));
    diagram.relationships = json.relationships.map((relationship) => {
      const r = Relationship.fromJSON(relationship);
      r.fromTable = diagram.tables.find((t) => t.id === r.fromTable.id);
      r.toTable = diagram.tables.find((t) => t.id === r.toTable.id);
      return r;
    });
    return diagram;
  }
}

export class Table {
  /**
   *
   * @param {string} id
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {string} comment
   * @param {Field[]} fields
   * @param {Index[]} indices
   * @param {string} color
   */
  constructor(id, name, x, y, comment, fields, indices, color) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.comment = comment;
    this.fields = fields;
    this.indices = indices;
    this.color = color;
  }

  static newTable(id, name) {
    return new Table(
      id,
      name,
      50,
      50,
      "",
      [Field.newPk()],
      [],
      colors[Math.floor(Math.random() * colors.length)],
    );
  }


  static fromJSON(json) {
    return new Table(
      json.id,
      json.name,
      json.x,
      json.y,
      json.comment,
      json.fields.map((field) => Field.fromJSON(field)),
      json.indices.map((index) => Index.fromJSON(index)),
      json.color,
    );
  }

  toYaml() {
    let yaml = "name: " + this.name + "\n";
    yaml += "comment: " + (this.comment || "") + "\n"
    yaml += "fields: \n";
    this.fields.forEach((field) => {
      yaml += "\t" + field.name + ": " + field.type;
      if (field.pk) {
        yaml += " pk";
      }
      if (field.increment) {
        yaml += " auto";
      }
      if (field.notNull) {
        yaml += " not null";
      } else {
        yaml += " null";
      }
      if (field.default) {
        yaml += " default " + field.default;
      }
      if (field.comment) {
        yaml += " #" + field.comment;
      }
      yaml += "\n";
    });
    if (this.indices && this.indices.length > 0) {
      yaml += "index: \n";
      this.indices.forEach((index) => {
        yaml += "\t- name: " + (index.name || "") + "\n";
        yaml += "\t  fields: " + (index.fields instanceof Array? index.fields.join(", ") : index.fields) + "\n"
        yaml += "\t  unique: " + (index.unique ? "true" : "false") + "\n"
        if (index.type) {
          yaml += "\t  type: " + (index.type || "") + "\n"
        }
      });
    }
    return yaml.replaceAll('\t', '  ');
  }
}

export class Field {
  /**
   *
   * @param {string} id
   * @param {string} name
   * @param {string} type
   * @param {string} defaultValue
   * @param {boolean} pk
   * @param {boolean} notNull
   * @param {boolean} increment
   * @param {string} comment
   */
  constructor(id, name, type, defaultValue, pk, notNull, increment, comment) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.default = defaultValue;
    this.pk = pk;
    this.notNull = notNull;
    this.increment = increment;
    this.comment = comment;
    if (!id) {
      this.id = uuid();
    }
  }

  static newPk() {
    return new Field("", "id", "int", "", true, true, true, "");
  }

  /**
   *
   * @param {string} id
   * @param {string} name
   * @param {string} type
   * @returns {Field}
   */
  static newField(id, name, type) {
    return new Field(id, name, type, "", false, false, false, "");
  }

  static fromJSON(json) {
    return new Field(
      json.id,
      json.name,
      json.type,
      json.default,
      json.pk,
      json.notNull,
      json.increment,
      json.comment,
    );
  }
}

export class Index {
  /**
   *
   * @param {string} name
   * @param {string[]} fields
   * @param {boolean} unique
   * @param {string} type
   */
  constructor(name, fields, unique, type) {
    this.name = name;
    this.fields = fields;
    this.unique = unique;
    this.type = type;
  }

  static newIndex(name, fields, unique, type) {
    return new Index(name, fields, unique, type);
  }

  static fromJSON(json) {
    return new Index(json.name, json.fields, json.unique, json.type);
  }
}

export class Relationship {
  /**
   *
   * @constructor
   * @param {string} id
   * @param {Table} fromTable
   * @param {string} fromField
   * @param {Table} toTable
   * @param {string} toField
   */
  constructor(id, fromTable, fromField, toTable, toField) {
    this.id = id;
    this.fromTable = fromTable;
    this.fromField = fromField;
    this.toTable = toTable;
    this.toField = toField;
  }

  static fromJSON(json) {
    return new Relationship(
      json.id,
      Table.fromJSON(json.fromTable),
      json.fromField,
      Table.fromJSON(json.toTable),
      json.toField,
    );
  }

}
