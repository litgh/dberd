import { ShowTableStyle, tableFieldHeight } from "@/constants/constants.js";

export default function tableHeight(table, style) {
  if (style === ShowTableStyle.ALL_FIELDS || style === ShowTableStyle.COMMENT) {
    return (table.fields ? table.fields.length + 1 : 1) * tableFieldHeight;
  } else if (style === ShowTableStyle.TABLE_NAME) {
    return tableFieldHeight;
  } else if (style === ShowTableStyle.KEYS_ONLY) {
    const keys = table.fields.filter((f) => f.pk);
    return (keys ? keys.length + 1 : 1) * tableFieldHeight;
  }
}
