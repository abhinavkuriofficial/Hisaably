import { describe, expect, it } from "vitest";
import type { Expense, Member, Settlement } from "../../types/models";
import {
  calculateBalances,
  calculateContributions,
  totalSpent,
} from "../balances";
import { splitEqually } from "../split";

// ---- small helpers to create test data quickly ----
const NOW = "2026-11-24T00:00:00.000Z";

function member(id: string): Member {
  return { id, groupId: "g1", name: id, createdAt: NOW };
}

function expense(
  id: string,
  paidBy: string,
  amount: number,
  splitWith: string[],
): Expense {
  return {
    id,
    groupId: "g1",
    title: id,
    amount,
    paidBy,
    date: "2026-11-24",
    splitType: "equal",
    splits: splitEqually(amount, splitWith),
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function settlement(from: string, to: string, amount: number): Settlement {
  return {
    id: `s-${from}-${to}`,
    groupId: "g1",
    fromMemberId: from,
    toMemberId: to,
    amount,
    date: "2026-11-24",
    createdAt: NOW,
  };
}

const total = (balances: Record<string, number>) =>
  Object.values(balances).reduce((a, b) => a + b, 0);

const members = ["rahul", "aman", "abhinav"].map(member);
const all = ["rahul", "aman", "abhinav"];

describe("calculateBalances", () => {
  it("no expenses: everyone is at 0", () => {
    expect(calculateBalances(members, [], [])).toEqual({
      rahul: 0,
      aman: 0,
      abhinav: 0,
    });
  });

  it("Rahul pays ₹900 dinner, split equally", () => {
    const balances = calculateBalances(
      members,
      [expense("dinner", "rahul", 90000, all)],
      [],
    );
    expect(balances).toEqual({ rahul: 60000, aman: -30000, abhinav: -30000 });
  });

  it("the worked example from the plan: dinner + cab", () => {
    const balances = calculateBalances(
      members,
      [
        expense("dinner", "rahul", 90000, all),
        expense("cab", "aman", 60000, all),
      ],
      [],
    );
    // Rahul +400, Aman +100, Abhinav -500 (in rupees)
    expect(balances).toEqual({ rahul: 40000, aman: 10000, abhinav: -50000 });
    expect(total(balances)).toBe(0);
  });

  it("payer is not part of the split (paid for others only)", () => {
    const balances = calculateBalances(
      members,
      [expense("gift", "abhinav", 20000, ["rahul", "aman"])],
      [],
    );
    expect(balances).toEqual({ rahul: -10000, aman: -10000, abhinav: 20000 });
  });

  it("a settlement reduces the debt", () => {
    const balances = calculateBalances(
      members,
      [
        expense("dinner", "rahul", 90000, all),
        expense("cab", "aman", 60000, all),
      ],
      [settlement("abhinav", "rahul", 40000)],
    );
    expect(balances).toEqual({ rahul: 0, aman: 10000, abhinav: -10000 });
  });

  it("total of all balances is always 0, even with odd amounts", () => {
    const balances = calculateBalances(
      members,
      [
        expense("a", "rahul", 10000, all), // ₹100 / 3
        expense("b", "aman", 3337, all),
        expense("c", "abhinav", 1, ["rahul"]),
      ],
      [settlement("aman", "rahul", 1234)],
    );
    expect(total(balances)).toBe(0);
  });
});

describe("totalSpent and contributions", () => {
  const expenses = [
    expense("dinner", "rahul", 90000, all),
    expense("cab", "aman", 60000, all),
  ];

  it("adds up all expenses", () => {
    expect(totalSpent(expenses)).toBe(150000);
  });

  it("shows paid vs share per member", () => {
    expect(calculateContributions(members, expenses)).toEqual([
      { memberId: "rahul", paid: 90000, share: 50000 },
      { memberId: "aman", paid: 60000, share: 50000 },
      { memberId: "abhinav", paid: 0, share: 50000 },
    ]);
  });
});