export default function toSql(obj, dbms = "MySQL") {
  switch (dbms) {
    case "MySQL":
      return jsonToMysql(obj);
    case "PostgreSQL":
      return jsonToPostgres(obj);
    case "SQLite":
      return jsonToSqlite(obj);
    case "SQLServer":
      return jsonToSqlserver(obj);
    default:
      return "";
  }
}

function jsonToMysql(obj) {
  let sql = "";
  obj.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;
    table.fields.forEach((field, i) => {
      if (i > 0) {
        sql += ",\n";
      }
      sql += `  ${field.name} ${field.type} `;
      sql += `${field.notNull ? "NOT NULL" : "NULL"} `;
      sql += `${field.default ? "DEFAULT " + field.default : ""}`;
      sql += `${field.increment ? "AUTO_INCREMENT" : ""} `;
      sql += `${field.comment ? "COMMENT '" + field.comment.trim() + "'" : ""}`;
    });
    const pks = table.fields
      .filter((field) => field.pk)
      .map((field) => field.name);
    if (pks.length > 0) {
      sql += `,\n  CONSTRAINT ${table.name}_pk PRIMARY KEY (${pks.join(", ")})\n`;
    }
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ${table.comment ? `COMMENT = '${table.comment.trim()}'` : ""};\n`;

    table.indices.forEach((index) => {
      sql += `CREATE ${index.unique ? "UNIQUE" : ""} INDEX ${index.name} ON ${table.name} (${index.fields.join(", ")});\n`;
    });
  });
  return sql;
}

function jsonToPostgres(obj) {
  let sql = "";
  obj.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;
    table.fields.forEach((field, i) => {
      if (i > 0) {
        sql += ",\n";
      }
      sql += `  ${field.name} ${field.type} `;
      sql += `${field.notNull ? "NOT NULL" : "NULL"} `;
      sql += `${field.default ? "DEFAULT " + field.default : ""}`;
    });
    const pks = table.fields
      .filter((field) => field.pk)
      .map((field) => field.name);
    if (pks.length > 0) {
      sql += `,\n  CONSTRAINT ${table.name}_pk PRIMARY KEY (${pks.join(", ")})\n`;
    }
    sql += `\n);\n`;
    if (table.comment) {
      sql += `COMMENT ON TABLE ${table.name} IS '${table.comment.trim()}';\n`;
    }
    table.fields
      .filter((field) => field.comment)
      .forEach((field) => {
        sql += `COMMENT ON COLUMN ${table.name}.${field.name} IS '${field.comment.trim()}';\n`;
      });

    table.indices.forEach((index) => {
      sql += `CREATE ${index.unique ? "UNIQUE" : ""} INDEX ${index.name} ON ${table.name} (${index.fields.join(", ")});\n`;
    });
  });
}

function jsonToSqlite(obj) {
  let sql = "";
  obj.tables.forEach((table) => {
    if (table.comment) {
      sql += `/* ${table.comment} */\n`;
    }
    sql += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;
    table.fields.forEach((field, i) => {
      if (i > 0) {
        sql += ",\n";
      }
      sql += `  ${field.name} ${field.type}`;
      sql += `${field.default ? " DEFAULT " + field.default : ""}`;
      sql += `${field.notNull ? " NOT NULL" : " NULL"} `;
      sql += `${field.increment ? " AUTOINCREMENT" : ""} `;
      sql += `${field.comment ? ` --'${field.comment}'` : ""}`;
    });
    const pks = table.fields
      .filter((field) => field.pk)
      .map((field) => field.name);
    if (pks.length > 0) {
      sql += `,\n  constraint ${table.name}_pk primary key `;
      sql += `(${pks.join(", ")})`;
    }
    sql += `\n);\n`;

    table.indices.forEach((index) => {
      sql += `CREATE ${index.unique ? "UNIQUE" : ""} INDEX ${index.name} ON ${table.name} (${index.fields.join(", ")});\n`;
    });
  });

  return sql;
}

function jsonToSqlserver(obj) {
  let sql = "";
  obj.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;
    table.fields.forEach((field, i) => {
      if (i > 0) {
        sql += ",\n";
      }
      sql += `  ${field.name} ${field.type}`;
      sql += `${field.increment ? " IDENTITY(1,1)" : ""} `;
      sql += `${field.pk ? " PRIMARY KEY" : ""}`
      sql += `${field.notNull ? " NOT NULL" : " NULL"} `;
      sql += `${field.default ? " DEFAULT " + field.default : ""}`;
    });
    sql += `\n);\n`;
    table.indices.forEach((index) => {
      sql += `CREATE ${index.unique ? "UNIQUE" : ""} INDEX ${index.name} ON ${table.name} (${index.fields.join(", ")});\n`;
    });
  })
}
