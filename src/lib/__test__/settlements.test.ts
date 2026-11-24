import { describe, expect, it } from "vitest";
import type { Balances } from "../balances";
import { suggestSettlements, type SuggestedPayment } from "../settlements";

// Apply suggested payments and return the new balances
function applyPayments(balances: Balances, payments: SuggestedPayment[]) {
  const result = { ...balances };
  for (const p of payments) {
    result[p.from] += p.amount;
    result[p.to] -= p.amount;
  }
  return result;
}

describe("suggestSettlements", () => {
  it("the worked example: Abhinav pays Rahul ₹400 and Aman ₹100", () => {
    expect(
      suggestSettlements({ rahul: 40000, aman: 10000, abhinav: -50000 }),
    ).toEqual([
      { from: "abhinav", to: "rahul", amount: 40000 },
      { from: "abhinav", to: "aman", amount: 10000 },
    ]);
  });

  it("everyone already settled: no payments", () => {
    expect(suggestSettlements({ a: 0, b: 0, c: 0 })).toEqual([]);
  });

  it("two people: one simple payment", () => {
    expect(suggestSettlements({ a: -2500, b: 2500 })).toEqual([
      { from: "a", to: "b", amount: 2500 },
    ]);
  });

  it("5 people: everyone ends at exactly 0, with at most 4 payments", () => {
    const balances = { a: 70000, b: -20000, c: -35000, d: 10000, e: -25000 };
    const payments = suggestSettlements(balances);

    expect(payments.length).toBeLessThanOrEqual(4);
    expect(Object.values(applyPayments(balances, payments))).toEqual([
      0, 0, 0, 0, 0,
    ]);
    for (const p of payments) expect(p.amount).toBeGreaterThan(0);
  });

  it("works for 100 random groups", () => {
    let seed = 42; // fixed seed: same "random" numbers every run
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    for (let round = 0; round < 100; round++) {
      const people = 2 + Math.floor(random() * 8);
      const balances: Balances = {};
      let runningTotal = 0;
      for (let i = 0; i < people - 1; i++) {
        const amount = Math.floor(random() * 200001) - 100000;
        balances[`m${i}`] = amount;
        runningTotal += amount;
      }
      balances[`m${people - 1}`] = -runningTotal; // makes the total 0

      const payments = suggestSettlements(balances);
      const after = applyPayments(balances, payments);

      expect(Object.values(after).every((v) => v === 0)).toBe(true);
      expect(payments.length).toBeLessThanOrEqual(people - 1);
    }
  });
});