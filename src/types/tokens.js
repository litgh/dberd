import { createToken, Lexer } from "chevrotain";
import { Dialects } from "@/constants/constants.js";

export const PK = createToken({
  name: "PK",
  pattern: /pk/i
});

export const Auto = createToken({
  name: "Auto",
  pattern: /auto/i
});

export const Null = createToken({
  name: "Null",
  pattern: /null/i
});

export const Not = createToken({
  name: "Not",
  pattern: /not/i
});

export const Default = createToken({
  name: "Default",
  pattern: /default/i
});

export const Whitespace = createToken({
  name: "Whitespace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

export const DataType = createToken({
  name: "DataType",
  pattern: new RegExp("(" + Array.from(Object.values(Dialects).map(t => t.trim().split(" "))
    .flat().reduce((s, t) => s.add(t), new Set())).join("|") + ")(\\(\\d+(,\\s*\\d+)?\\))?", "i")
})

export const allTokens = [
  PK,
  Auto,
  Null,
  Not,
  Default,
  Whitespace,
  DataType
]