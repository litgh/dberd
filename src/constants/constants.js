export const tableWidth = 230;
export const tableFieldHeight = 32;
export const colors = [
  "#1D69FD",
  "#FFA07A",
  "#126E7A",
  "#DE65C3",
  "#25BAB1",
  "#E4A62F",
  "#6A5ACD",
  "#FFD700",
  "#4B81B0",
  "#6724BB",
];

export const ObjectType = {
  NONE: 0,
  TABLE: 1,
  RELATIONSHIP: 2,
  LINKING: 3,
  DIAGRAM: 4,
};

export const ShowTableStyle = {
  TABLE_NAME: "Table Name",
  KEYS_ONLY: "Keys Only",
  ALL_FIELDS: "All Fields",
  COMMENT: "Comment",
};

export const Action = {
  ADD: 0,
  MOVE: 1,
  DELETE: 2,
  EDIT: 3,
  PAN: 4,
};

export const State = {
  NONE: 0,
  MODIFIED: 1,
  SAVING: 2,
  SAVED: 3,
  LOADING: 4,
  ERROR: 5,
};

export const ExportFormat = ["PNG", "JPEG", "SVG", "PDF", "JSON"]
export const ExportSourceFormat = ["MySQL", "PostgreSQL", "SQLite", "SQLServer"]

export const Keywords = "pk auto not null default "
const SQLTypes =
  "array binary bit boolean char character clob date decimal double float int integer interval large national nchar nclob numeric object precision real smallint time timestamp varchar varying";
export const Dialects = {
  MySQL:
    "bool blob long longblob longtext medium mediumblob mediumint mediumtext tinyblob tinyint tinytext text bigint int1 int2 int3 int4 int8 float4 float8 varbinary varcharacter precision datetime unsigned signed " + SQLTypes,
  SQLServer:
    "bigint smallint smallmoney tinyint money real text nvarchar ntext varbinary image hierarchyid uniqueidentifier sql_variant xml"  + SQLTypes,
  SQLite:
    "bool blob long longblob longtext medium mediumblob mediumint mediumtext tinyblob tinyint tinytext text bigint int2 int8 unsigned signed real" + SQLTypes,
  PostgreSQL:
    "bigint int8 bigserial serial8 varbit bool box bytea cidr circle precision float8 inet int4 json jsonb line lseg macaddr macaddr8 money numeric pg_lsn point polygon float4 int2 smallserial serial2 serial serial4 text timetz timestamptz tsquery tsvector txid_snapshot uuid xml" + SQLTypes,
};
