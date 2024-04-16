import {
  tableFieldHeight,
  tableWidth,
  colors,
  ShowTableStyle,
} from "@/constants/constants";

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

  getHeight(style) {
    if (style === ShowTableStyle.ALL_FIELDS || style === ShowTableStyle.COMMENT) {
      return (this.fields ? this.fields.length + 1 : 1) * tableFieldHeight;
    } else if (style === ShowTableStyle.TABLE_NAME) {
      return tableFieldHeight;
    } else if (style === ShowTableStyle.KEYS_ONLY) {
      const keys = this.fields.filter((f) => f.pk);
      return (keys ? keys.length + 1 : 1) * tableFieldHeight;
    }
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
  }

  static newPk() {
    return new Field(0, "id", "int", "", true, true, true, "");
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
  static fromJSON(json) {
    return new Index();
  }
}

export class Relationship {
  /**
   *
   * @constructor
   * @param {string} id
   * @param {Table} fromTable
   * @param {string} fromField
   * @param {Table}toTable
   * @param {string} toField
   */
  constructor(id, fromTable, fromField, toTable, toField) {
    this.id = id;
    this.fromTable = fromTable;
    this.fromField = fromField;
    this.toTable = toTable;
    this.toField = toField;
    this.name = fromTable.name + "_" + fromTable.fields[fromField].name + "_fk";
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

  calY(table, fieldId, tableStyle) {
    switch (tableStyle) {
      case ShowTableStyle.KEYS_ONLY:
        const fi = table.fields.findIndex(f => f.pk && f.id === fieldId)
        if (fi >= 0) {
          return table.y + (fi + 1) * tableFieldHeight + tableFieldHeight / 2;
        }
      case ShowTableStyle.TABLE_NAME:
        return table.y + tableFieldHeight / 2;
      case ShowTableStyle.ALL_FIELDS:
        return table.y +
          (table.fields.findIndex(f => f.id === fieldId) + 1) * tableFieldHeight +
          tableFieldHeight / 2;
    }
    return table.y;
  }

  calPath(zoom = 1, tableStyle) {
    const width = tableWidth * zoom;
    let x1 = this.fromTable.x;
    let y1 = this.calY(this.fromTable, this.fromField, tableStyle)

    let x2 = this.toTable.x;
    let y2 = this.calY(this.toTable, this.toField, tableStyle)

    let radius = 10 * zoom;
    const midX = (x2 + x1 + width) / 2;
    const endX = x2 + width < x1 ? x2 + width : x2;

    if (Math.abs(y1 - y2) <= 36 * zoom) {
      radius = Math.abs(y2 - y1) / 3;
      if (radius <= 2) {
        if (x1 + width <= x2)
          return `M ${x1 + width} ${y1} L ${x2} ${y2 + 0.1}`;
        else if (x2 + width < x1)
          return `M ${x1} ${y1} L ${x2 + width} ${y2 + 0.1}`;
      }
    }

    if (y1 <= y2) {
      if (x1 + width <= x2) {
        return `M ${x1 + width} ${y1} L ${
          midX - radius
        } ${y1} A ${radius} ${radius} 0 0 1 ${midX} ${y1 + radius} L ${midX} ${
          y2 - radius
        } A ${radius} ${radius} 0 0 0 ${midX + radius} ${y2} L ${endX} ${y2}`;
      } else if (x2 <= x1 + width && x1 <= x2) {
        return `M ${x1 + width} ${y1} L ${
          x2 + width
        } ${y1} A ${radius} ${radius} 0 0 1 ${x2 + width + radius} ${
          y1 + radius
        } L ${x2 + width + radius} ${y2 - radius} A ${radius} ${radius} 0 0 1 ${
          x2 + width
        } ${y2} L ${x2 + width} ${y2}`;
      } else if (x2 + width >= x1 && x2 + width <= x1 + width) {
        return `M ${x1} ${y1} L ${
          x2 - radius
        } ${y1} A ${radius} ${radius} 0 0 0 ${x2 - radius - radius} ${
          y1 + radius
        } L ${x2 - radius - radius} ${y2 - radius} A ${radius} ${radius} 0 0 0 ${
          x2 - radius
        } ${y2} L ${x2} ${y2}`;
      } else {
        return `M ${x1} ${y1} L ${
          midX + radius
        } ${y1} A ${radius} ${radius} 0 0 0 ${midX} ${y1 + radius} L ${midX} ${
          y2 - radius
        } A ${radius} ${radius} 0 0 1 ${midX - radius} ${y2} L ${endX} ${y2}`;
      }
    } else {
      if (x1 + width <= x2) {
        return `M ${x1 + width} ${y1} L ${
          midX - radius
        } ${y1} A ${radius} ${radius} 0 0 0 ${midX} ${y1 - radius} L ${midX} ${
          y2 + radius
        } A ${radius} ${radius} 0 0 1 ${midX + radius} ${y2} L ${endX} ${y2}`;
      } else if (x1 + width >= x2 && x1 + width <= x2 + width) {
        return `M ${x1} ${y1} L ${
          x1 - radius - radius
        } ${y1} A ${radius} ${radius} 0 0 1 ${x1 - radius - radius - radius} ${
          y1 - radius
        } L ${x1 - radius - radius - radius} ${
          y2 + radius
        } A ${radius} ${radius} 0 0 1 ${
          x1 - radius - radius
        } ${y2} L ${endX} ${y2}`;
      } else if (x1 >= x2 && x1 <= x2 + width) {
        return `M ${x1 + width} ${y1} L ${
          x1 + width + radius
        } ${y1} A ${radius} ${radius} 0 0 0 ${x1 + width + radius + radius} ${
          y1 - radius
        } L ${x1 + width + radius + radius} ${
          y2 + radius
        } A ${radius} ${radius} 0 0 0 ${x1 + width + radius} ${y2} L ${
          x2 + width
        } ${y2}`;
      } else {
        return `M ${x1} ${y1} L ${
          midX + radius
        } ${y1} A ${radius} ${radius} 0 0 1 ${midX} ${y1 - radius} L ${midX} ${
          y2 + radius
        } A ${radius} ${radius} 0 0 0 ${midX - radius} ${y2} L ${endX} ${y2}`;
      }
    }
  }
}
