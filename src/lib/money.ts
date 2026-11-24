import type { Paise } from "../types/models";

/**
 * Turns what the user typed ("250", "250.5", "1,250.50") into paise (25050).
 * Returns null if the text is not a valid amount.
 * We only cut the text at the dot, so no decimal (floating-point) maths happens.
 */
export function parseRupees(input: string): Paise | null {
  const text = input.trim().replaceAll(",", "");

  // digits, optionally followed by a dot and 1 or 2 digits
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;

  const [rupeesPart, paisePart = ""] = text.split(".");
  const rupees = Number(rupeesPart);
  const paise = Number(paisePart.padEnd(2, "0")); // "5" -> "50"

  const total = rupees * 100 + paise;
  if (!Number.isSafeInteger(total)) return null;
  return total;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 125000050 -> "₹12,50,000.50" (only for showing on screen) */
export function formatINR(paise: Paise): string {
  const sign = paise < 0 ? "-" : "";
  return sign + inrFormatter.format(Math.abs(paise) / 100);
}

/** 25050 -> "250.50" (to fill an input box when editing) */
export function paiseToRupeesString(paise: Paise): string {
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  return `${paise < 0 ? "-" : ""}${rupees}.${rest}`;
}