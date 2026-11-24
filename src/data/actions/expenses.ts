import type { AppData, Expense, Id } from "../../types/models";
import type { ExpenseFormValues } from "../../lib/expense-validation";
import { createId } from "../../lib/ids";

// ===== Expense actions =====
// Same idea as group actions: old data in, new data out.

/** Safety check: the payer and everyone in the split must belong to this group. */
function checkMembers(data: AppData, groupId: Id, values: ExpenseFormValues) {
  const memberIds = new Set(
    data.members.filter((m) => m.groupId === groupId).map((m) => m.id),
  );
  const people = [values.paidBy, ...values.splits.map((s) => s.memberId)];
  if (!people.every((id) => memberIds.has(id))) {
    throw new Error("Someone in this expense is not a member of the group.");
  }
}

export function addExpense(
  data: AppData,
  groupId: Id,
  values: ExpenseFormValues,
  now: Date = new Date(),
): { data: AppData; expenseId: Id } {
  if (!data.groups.some((g) => g.id === groupId)) throw new Error("Group not found");
  checkMembers(data, groupId, values);

  const at = now.toISOString();
  const expense: Expense = {
    id: createId("e"),
    groupId,
    ...values,
    createdAt: at,
    updatedAt: at,
  };
  return {
    expenseId: expense.id,
    data: { ...data, expenses: [...data.expenses, expense] },
  };
}

export function updateExpense(
  data: AppData,
  expenseId: Id,
  values: ExpenseFormValues,
  now: Date = new Date(),
): AppData {
  const old = data.expenses.find((e) => e.id === expenseId);
  if (!old) throw new Error("Expense not found");
  checkMembers(data, old.groupId, values);

  const updated: Expense = {
    id: old.id,
    groupId: old.groupId,
    createdAt: old.createdAt,
    ...values,
    updatedAt: now.toISOString(),
  };
  return {
    ...data,
    expenses: data.expenses.map((e) => (e.id === expenseId ? updated : e)),
  };
}

export function deleteExpense(data: AppData, expenseId: Id): AppData {
  return { ...data, expenses: data.expenses.filter((e) => e.id !== expenseId) };
}

/** Newest first: by date, then by when it was added. */
export function sortExpensesNewestFirst(expenses: Expense[]): Expense[] {
  return [...expenses].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}