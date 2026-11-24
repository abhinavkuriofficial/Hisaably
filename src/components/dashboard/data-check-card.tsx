"use client";

import { useAppData } from "@/providers/app-data-provider";
import { totalSpent } from "@/lib/balances";
import { formatINR } from "@/lib/money";
import { createId } from "@/lib/ids";
import { splitEqually } from "@/lib/split";

/**
 * TEMPORARY card (Milestone 4) to check that saving works.
 * The real dashboard replaces it in Milestone 8.
 */
export function DataCheckCard() {
  const { data, isLoaded, updateData, resetToDemo, clearAll } = useAppData();

  if (!isLoaded) {
    return <div className="h-48 animate-pulse rounded-xl bg-card" />;
  }

  function addTestExpense() {
    updateData((old) => {
      const group = old.groups[0];
      if (!group) return old;
      const memberIds = old.members
        .filter((m) => m.groupId === group.id)
        .map((m) => m.id);
      if (memberIds.length === 0) return old;

      const now = new Date().toISOString();
      return {
        ...old,
        expenses: [
          ...old.expenses,
          {
            id: createId("e"),
            groupId: group.id,
            title: "Test chai",
            amount: 10000, // ₹100
            paidBy: memberIds[0],
            date: now.slice(0, 10),
            splitType: "equal",
            splits: splitEqually(10000, memberIds),
            createdAt: now,
            updatedAt: now,
          },
        ],
      };
    });
  }

  const stats = [
    { label: "Groups", value: String(data.groups.length) },
    { label: "Members", value: String(data.members.length) },
    { label: "Expenses", value: String(data.expenses.length) },
    { label: "Total spent", value: formatINR(totalSpent(data.expenses)) },
  ];

  const buttonClass =
    "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors";

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-sm font-medium text-brand-bright">
        Milestone 4 · Data check
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a test expense, then refresh the page. The numbers should stay.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-secondary p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={addTestExpense}
          className={`${buttonClass} bg-primary text-primary-foreground hover:bg-primary/90`}
        >
          Add ₹100 test expense
        </button>
        <button
          onClick={resetToDemo}
          className={`${buttonClass} border border-border hover:bg-accent`}
        >
          Reset to demo data
        </button>
        <button
          onClick={clearAll}
          className={`${buttonClass} border border-border text-negative hover:bg-accent`}
        >
          Clear everything
        </button>
      </div>
    </div>
  );
}