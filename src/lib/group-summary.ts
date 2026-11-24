import type { AppData, Expense, Group, Id, Member, Paise, Settlement } from "../types/models";
import { calculateBalances, totalSpent, type Balances } from "./balances";
import { suggestSettlements, type SuggestedPayment } from "./settlements";

// Everything about one group in one place, so every page does not
// have to filter and calculate the same things again.
export type GroupSummary = {
  group: Group;
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
  balances: Balances; // + gets money, - owes money
  suggestions: SuggestedPayment[]; // who should pay whom to settle up
  totalSpent: Paise;
  yourBalance: Paise | null; // null if no member is marked as "you"
  nameOf: (memberId: Id) => string;
};

export function getGroupSummary(data: AppData, groupId: Id): GroupSummary | null {
  const group = data.groups.find((g) => g.id === groupId);
  if (!group) return null;

  const members = data.members.filter((m) => m.groupId === groupId);
  const expenses = data.expenses.filter((e) => e.groupId === groupId);
  const settlements = data.settlements.filter((s) => s.groupId === groupId);
  const balances = calculateBalances(members, expenses, settlements);

  return {
    group,
    members,
    expenses,
    settlements,
    balances,
    suggestions: suggestSettlements(balances),
    totalSpent: totalSpent(expenses),
    yourBalance: group.youMemberId ? (balances[group.youMemberId] ?? 0) : null,
    nameOf: (memberId) => members.find((m) => m.id === memberId)?.name ?? "Someone",
  };
}

/** Summaries of all groups, in the order they were created. */
export function getAllGroupSummaries(data: AppData): GroupSummary[] {
  return data.groups
    .map((g) => getGroupSummary(data, g.id))
    .filter((s): s is GroupSummary => s !== null);
}