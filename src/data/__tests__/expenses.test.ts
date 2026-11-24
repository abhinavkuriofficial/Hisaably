import { describe, expect, it } from "vitest";
import { createDemoData } from "../demo-data";
import { addExpense, deleteExpense, sortExpensesNewestFirst, updateExpense } from "../actions/expenses";
import { expenseFormSchema, type ExpenseFormInput } from "../../lib/expense-validation";
import { formatDate, todayISODate } from "../../lib/dates";
import { calculateBalances } from "../../lib/balances";

// Goa Trip demo members
const A = "demo-m-abhinav";
const R = "demo-m-rahul";
const AM = "demo-m-aman";
const P = "demo-m-priya";

/** A filled form, like the user typed it. Change only what a test needs. */
function form(changes: Partial<ExpenseFormInput> = {}): ExpenseFormInput {
  return {
    title: "Dinner",
    amount: "100",
    paidBy: A,
    date: "2026-11-24",
    description: "",
    splitType: "equal",
    shares: [A, R, AM].map((memberId) => ({ memberId, included: true, amount: "" })),
    ...changes,
  };
}

/** The first error message for a field, or undefined if it passed. */
function errorFor(input: ExpenseFormInput, field: string) {
  const result = expenseFormSchema.safeParse(input);
  if (result.success) return undefined;
  return result.error.issues.find((i) => i.path.join(".") === field)?.message;
}

describe("expense form rules", () => {
  it("equal split: ₹100 among 3 becomes 33.34 + 33.33 + 33.33", () => {
    const result = expenseFormSchema.parse(form());
    expect(result.amount).toBe(10000);
    expect(result.splits.map((s) => s.amount)).toEqual([3334, 3333, 3333]);
    expect(result.description).toBeUndefined();
  });

  it("equal split only uses ticked members", () => {
    const shares = [
      { memberId: A, included: true, amount: "" },
      { memberId: R, included: false, amount: "" },
      { memberId: AM, included: true, amount: "" },
    ];
    const result = expenseFormSchema.parse(form({ shares }));
    expect(result.splits).toEqual([
      { memberId: A, amount: 5000 },
      { memberId: AM, amount: 5000 },
    ]);
  });

  it("needs a title and a valid amount", () => {
    expect(errorFor(form({ title: "  " }), "title")).toBe("What was this expense for?");
    expect(errorFor(form({ amount: "" }), "amount")).toBe("Enter the amount");
    expect(errorFor(form({ amount: "abc" }), "amount")).toBe("Enter a valid amount, like 250 or 250.50");
    expect(errorFor(form({ amount: "0" }), "amount")).toBe("Amount must be more than ₹0");
  });

  it("equal split needs at least one person", () => {
    const shares = [A, R].map((memberId) => ({ memberId, included: false, amount: "" }));
    expect(errorFor(form({ shares }), "shares")).toBe("Pick at least one person to split with");
  });

  it("custom split must add up exactly to the bill", () => {
    const shares = [
      { memberId: A, included: true, amount: "60" },
      { memberId: R, included: true, amount: "30" },
      { memberId: AM, included: true, amount: "" }, // empty = ₹0
    ];
    expect(errorFor(form({ splitType: "custom", shares }), "shares")).toBe(
      "Shares add up to ₹90.00. ₹10.00 is still left to assign.",
    );

    shares[2].amount = "10";
    const result = expenseFormSchema.parse(form({ splitType: "custom", shares }));
    expect(result.splits).toEqual([
      { memberId: A, amount: 6000 },
      { memberId: R, amount: 3000 },
      { memberId: AM, amount: 1000 },
    ]);
  });

  it("custom split catches a share that is not a number", () => {
    const shares = [
      { memberId: A, included: true, amount: "50" },
      { memberId: R, included: true, amount: "fifty" },
    ];
    expect(errorFor(form({ splitType: "custom", shares }), "shares.1.amount")).toBe("Not a valid amount");
  });
});

describe("expense actions", () => {
  const values = expenseFormSchema.parse(form());

  it("adds an expense and balances change", () => {
    const before = createDemoData();
    const { data, expenseId } = addExpense(before, "demo-g-goa", values);
    expect(data.expenses).toHaveLength(before.expenses.length + 1);
    const added = data.expenses.find((e) => e.id === expenseId)!;
    expect(added).toMatchObject({ groupId: "demo-g-goa", title: "Dinner", amount: 10000 });

    // Abhinav paid ₹100 and his own share is ₹33.34, so he gets ₹66.66 more
    const members = data.members.filter((m) => m.groupId === "demo-g-goa");
    const goa = (d: typeof data) => d.expenses.filter((e) => e.groupId === "demo-g-goa");
    const settled = data.settlements.filter((s) => s.groupId === "demo-g-goa");
    const oldBalance = calculateBalances(members, goa(before), settled)[A];
    const newBalance = calculateBalances(members, goa(data), settled)[A];
    expect(newBalance - oldBalance).toBe(6666);
  });

  it("refuses people who are not in the group", () => {
    const outsider = { ...values, paidBy: "demo-m-karan" }; // Karan is in Flat 201
    expect(() => addExpense(createDemoData(), "demo-g-goa", outsider)).toThrow(
      "Someone in this expense is not a member of the group.",
    );
  });

  it("updates an expense but keeps its id and created time", () => {
    const { data, expenseId } = addExpense(createDemoData(), "demo-g-goa", values);
    const changed = expenseFormSchema.parse(form({ title: "Lunch", amount: "250.50", paidBy: P }));
    const after = updateExpense(data, expenseId, changed);
    const old = data.expenses.find((e) => e.id === expenseId)!;
    const updated = after.expenses.find((e) => e.id === expenseId)!;
    expect(updated).toMatchObject({ id: expenseId, title: "Lunch", amount: 25050, paidBy: P });
    expect(updated.createdAt).toBe(old.createdAt);
    expect(updated.splits.reduce((sum, s) => sum + s.amount, 0)).toBe(25050);
  });

  it("deletes an expense", () => {
    const { data, expenseId } = addExpense(createDemoData(), "demo-g-goa", values);
    const after = deleteExpense(data, expenseId);
    expect(after.expenses.some((e) => e.id === expenseId)).toBe(false);
  });

  it("sorts newest date first", () => {
    const sorted = sortExpensesNewestFirst(createDemoData().expenses);
    const dates = sorted.map((e) => e.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe("dates", () => {
  it("formats dates for the screen", () => {
    expect(formatDate("2026-11-24")).toBe("24 Nov 2026");
    expect(todayISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});