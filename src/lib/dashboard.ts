import type { AppData, Group, ISODate, Paise } from "../types/models";
import { getAllGroupSummaries } from "./group-summary";
import { todayISODate } from "./dates";

// ===== Dashboard numbers =====
// Only counts groups where a member is marked as "you".

export type DashboardStats = {
  youGet: Paise; // total others owe you, across groups
  youOwe: Paise; // total you owe others
  net: Paise; // youGet - youOwe (+ = you are ahead)
  yourShareThisMonth: Paise; // your part of this month's expenses
  groupCount: number;
};

export function getDashboardStats(data: AppData, now: Date = new Date()): DashboardStats {
  const thisMonth = todayISODate(now).slice(0, 7); // "2026-11"
  let youGet = 0;
  let youOwe = 0;
  let yourShareThisMonth = 0;

  for (const s of getAllGroupSummaries(data)) {
    const you = s.group.youMemberId;
    if (!you || s.yourBalance === null) continue;

    if (s.yourBalance > 0) youGet += s.yourBalance;
    else youOwe += -s.yourBalance;

    for (const e of s.expenses) {
      if (!e.date.startsWith(thisMonth)) continue;
      yourShareThisMonth += e.splits.find((x) => x.memberId === you)?.amount ?? 0;
    }
  }

  return {
    youGet,
    youOwe,
    net: youGet - youOwe,
    yourShareThisMonth,
    groupCount: data.groups.length,
  };
}

// ===== Recent activity =====
// Expenses and settlements from all groups, mixed together, newest first.

export type ActivityItem = {
  kind: "expense" | "settlement";
  id: string;
  group: Group;
  title: string; // "Hotel (2 nights)" or "Priya paid Aman"
  detail: string; // "Aman paid" or "Settlement"
  amount: Paise;
  date: ISODate;
  createdAt: string;
  href: string; // where clicking it goes
};

export function getRecentActivity(data: AppData, limit = 8): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const s of getAllGroupSummaries(data)) {
    for (const e of s.expenses) {
      items.push({
        kind: "expense",
        id: e.id,
        group: s.group,
        title: e.title,
        detail: `${s.nameOf(e.paidBy)} paid`,
        amount: e.amount,
        date: e.date,
        createdAt: e.createdAt,
        href: `/groups/${s.group.id}/expenses/${e.id}/edit`,
      });
    }
    for (const p of s.settlements) {
      items.push({
        kind: "settlement",
        id: p.id,
        group: s.group,
        title: `${s.nameOf(p.fromMemberId)} paid ${s.nameOf(p.toMemberId)}`,
        detail: "Settlement",
        amount: p.amount,
        date: p.date,
        createdAt: p.createdAt,
        href: `/groups/${s.group.id}`,
      });
    }
  }

  return items
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}