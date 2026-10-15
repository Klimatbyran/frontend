/**
 * Utility functions for searching
 */

import { SupportedLanguage } from "@/lib/languageDetection";

const ENGLISH_CHAR_MAP: Record<string, string> = {
  a: "àáâãäåæāăą",
  c: "çćĉċč",
  d: "đď",
  e: "èéêëēĕėęě",
  g: "ĝğġģ",
  h: "ĥħ",
  i: "ìíîïĩīĭįı",
  j: "ĵ",
  k: "ķĸ",
  l: "ĺļľŀł",
  n: "ñńņňŉŋ",
  o: "òóôõöøōŏőœ",
  r: "ŕŗř",
  s: "śŝşšșß",
  t: "ţťŧț",
  u: "ùúûüũūŭůűų",
  w: "ŵ",
  y: "ýÿŷ",
  z: "źżž",
};

const SWEDISH_CHAR_MAP: Record<string, string> = {
  ...ENGLISH_CHAR_MAP,
  a: ENGLISH_CHAR_MAP["a"].replace("å", "").replace("ä", ""),
  o: ENGLISH_CHAR_MAP["o"].replace("ö", ""),
  ä: "æ",
  ö: "ø",
};

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, (match) => `\\${match}`);
}

/** Literal match at the start of a word. The term is never treated as regex. */
export function buildWordStartSearchRegex(term: string): RegExp {
  return new RegExp(`(?<!\\p{L})${escapeRegExp(term)}`, "iu");
}

export function buildSearchRegex(
  term: string,
  currentLanguage: SupportedLanguage,
  allowInbetweenSymbols: boolean,
): RegExp {
  const charMap =
    currentLanguage === "sv" ? SWEDISH_CHAR_MAP : ENGLISH_CHAR_MAP;

  const pattern = term
    .toLowerCase()
    .split("")
    .map((char) =>
      charMap[char] ? `[${char}${charMap[char]}]` : escapeRegExp(char),
    )
    .join(allowInbetweenSymbols ? "[^\\p{L}\\p{N}\\s]*" : "");

  return new RegExp(`(?:^|\\s)${pattern}`, "iu");
}
