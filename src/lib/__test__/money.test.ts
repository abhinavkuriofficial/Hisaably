import { describe, expect, it } from "vitest";
import { formatINR, paiseToRupeesString, parseRupees } from "../money";

describe("parseRupees: text -> paise", () => {
  it("reads whole rupees", () => {
    expect(parseRupees("900")).toBe(90000);
  });

  it("reads 1 or 2 decimal places", () => {
    expect(parseRupees("900.5")).toBe(90050);
    expect(parseRupees("900.50")).toBe(90050);
    expect(parseRupees("0.01")).toBe(1);
  });

  it("ignores spaces and commas", () => {
    expect(parseRupees("  1,250.75 ")).toBe(125075);
  });

  it("avoids the classic 0.1 + 0.2 problem", () => {
    // in plain JavaScript, 0.1 + 0.2 = 0.30000000000000004
    expect(parseRupees("0.10")! + parseRupees("0.20")!).toBe(parseRupees("0.30"));
  });

  it("rejects invalid text", () => {
    expect(parseRupees("")).toBeNull();
    expect(parseRupees("abc")).toBeNull();
    expect(parseRupees("-5")).toBeNull();
    expect(parseRupees("1.234")).toBeNull();
    expect(parseRupees("12.")).toBeNull();
  });
});

describe("formatINR: paise -> ₹ text", () => {
  it("uses the Indian style (lakh commas)", () => {
    expect(formatINR(125000050)).toBe("₹12,50,000.50");
  });

  it("shows negative amounts", () => {
    expect(formatINR(-30000)).toBe("-₹300.00");
  });
});

describe("paiseToRupeesString", () => {
  it("fills an edit box", () => {
    expect(paiseToRupeesString(25050)).toBe("250.50");
    expect(paiseToRupeesString(7)).toBe("0.07");
  });
});