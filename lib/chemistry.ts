"use client";
// ─── Atomic number → element symbol mapping ─────────────────────────────────
const ELEMENT_SYMBOLS: Record<number, string> = {
  1: "H",
  2: "He",
  3: "Li",
  4: "Be",
  5: "B",
  6: "C",
  7: "N",
  8: "O",
  9: "F",
  10: "Ne",
  11: "Na",
  12: "Mg",
  13: "Al",
  14: "Si",
  15: "P",
  16: "S",
  17: "Cl",
  18: "Ar",
  35: "Br",
  53: "I",
};
export function getElementSymbol(atomicNumber: number): string {
  return ELEMENT_SYMBOLS[atomicNumber] ?? `El${atomicNumber}`;
}
// ─── CPK colour map (standard chemistry convention) ───────────────────────────
export const CPK: Record<string, { bg: string; text: string }> = {
  H: {
    bg: "bg-gray-100   dark:bg-gray-700",
    text: "text-gray-800 dark:text-gray-100",
  },
  C: { bg: "bg-gray-800   dark:bg-gray-900", text: "text-white" },
  N: { bg: "bg-blue-600", text: "text-white" },
  O: { bg: "bg-red-500", text: "text-white" },
  F: { bg: "bg-green-400", text: "text-white" },
  Cl: { bg: "bg-green-600", text: "text-white" },
  Br: { bg: "bg-amber-700", text: "text-white" },
  I: { bg: "bg-purple-700", text: "text-white" },
  S: { bg: "bg-yellow-400", text: "text-gray-900" },
  P: { bg: "bg-orange-500", text: "text-white" },
  Si: { bg: "bg-amber-300", text: "text-gray-900" },
};
