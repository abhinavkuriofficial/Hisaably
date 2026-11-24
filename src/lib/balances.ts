import type { Expense, Id, Member, Paise, Settlement } from "../types/models";

export type Balances = Record<Id, Paise>;

/**
 * Net balance of every member.
 *   positive = should RECEIVE money
 *   negative = OWES money
 * Rules:
 *   expense:    payer +amount, each person in the split -their share
 *   settlement: payer (from) +amount, receiver (to) -amount
 * The total of all balances is always 0.
 */
export function calculateBalances(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[],
): Balances {
  const balances: Balances = {};
  for (const member of members) balances[member.id] = 0;

  const add = (memberId: Id, amount: Paise) => {
    balances[memberId] = (balances[memberId] ?? 0) + amount;
  };

  for (const expense of expenses) {
    add(expense.paidBy, expense.amount);
    for (const split of expense.splits) add(split.memberId, -split.amount);
  }

  for (const s of settlements) {
    add(s.fromMemberId, s.amount);
    add(s.toMemberId, -s.amount);
  }

  return balances;
}

/** Total money spent in the group (settlements are not spending). */
export function totalSpent(expenses: Expense[]): Paise {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export type Contribution = {
  memberId: Id;
  paid: Paise; // how much this person paid for bills
  share: Paise; // how much of the bills was their part
};

/** How much each member paid vs. how much was their share. */
export function calculateContributions(
  members: Member[],
  expenses: Expense[],
): Contribution[] {
  return members.map((member) => {
    let paid = 0;
    let share = 0;
    for (const e of expenses) {
      if (e.paidBy === member.id) paid += e.amount;
      for (const s of e.splits) if (s.memberId === member.id) share += s.amount;
    }
    return { memberId: member.id, paid, share };
  });
}