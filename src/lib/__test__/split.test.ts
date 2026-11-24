import { describe, expect, it } from "vitest";
import { checkCustomSplit, splitEqually } from "../split";

const sum = (splits: { amount: number }[]) =>
  splits.reduce((total, s) => total + s.amount, 0);

describe("splitEqually", () => {
  it("₹900 among Rahul, Aman, Abhinav = ₹300 each", () => {
    expect(splitEqually(90000, ["rahul", "aman", "abhinav"])).toEqual([
      { memberId: "rahul", amount: 30000 },
      { memberId: "aman", amount: 30000 },
      { memberId: "abhinav", amount: 30000 },
    ]);
  });

  it("₹100 among 3: leftover paisa goes to the first member", () => {
    const splits = splitEqually(10000, ["a", "b", "c"]);
    expect(splits.map((s) => s.amount)).toEqual([3334, 3333, 3333]);
    expect(sum(splits)).toBe(10000);
  });

  it("₹1 among 3: 34 + 33 + 33 paise", () => {
    expect(splitEqually(100, ["a", "b", "c"]).map((s) => s.amount)).toEqual([
      34, 33, 33,
    ]);
  });

  it("one member pays the whole amount", () => {
    expect(splitEqually(5000, ["a"])).toEqual([{ memberId: "a", amount: 5000 }]);
  });

  it("never loses or adds a paisa (many amounts, many group sizes)", () => {
    for (let people = 1; people <= 9; people++) {
      const ids = Array.from({ length: people }, (_, i) => `m${i}`);
      for (const amount of [1, 7, 99, 100, 101, 12345, 99999]) {
        expect(sum(splitEqually(amount, ids))).toBe(amount);
      }
    }
  });

  it("refuses an empty member list or a bad amount", () => {
    expect(() => splitEqually(1000, [])).toThrow();
    expect(() => splitEqually(0, ["a"])).toThrow();
    expect(() => splitEqually(10.5, ["a"])).toThrow();
  });
});

describe("checkCustomSplit", () => {
  it("accepts shares that add up exactly", () => {
    const result = checkCustomSplit(90000, [
      { memberId: "rahul", amount: 50000 },
      { memberId: "aman", amount: 25000 },
      { memberId: "abhinav", amount: 15000 },
    ]);
    expect(result).toEqual({ isValid: true, assigned: 90000, remaining: 0 });
  });

  it("rejects when 1 paisa is missing", () => {
    const result = checkCustomSplit(90000, [
      { memberId: "rahul", amount: 45000 },
      { memberId: "aman", amount: 44999 },
    ]);
    expect(result.isValid).toBe(false);
    expect(result.remaining).toBe(1);
  });

  it("rejects when too much is assigned", () => {
    const result = checkCustomSplit(10000, [
      { memberId: "a", amount: 6000 },
      { memberId: "b", amount: 5000 },
    ]);
    expect(result.isValid).toBe(false);
    expect(result.remaining).toBe(-1000);
  });

  it("rejects negative shares", () => {
    const result = checkCustomSplit(10000, [
      { memberId: "a", amount: 12000 },
      { memberId: "b", amount: -2000 },
    ]);
    expect(result.isValid).toBe(false);
  });
});