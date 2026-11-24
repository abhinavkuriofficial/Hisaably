"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { useAppData } from "@/providers/app-data-provider";
import { getGroupSummary } from "@/lib/group-summary";
import { formatINR } from "@/lib/money";
import { deleteGroup } from "@/data/actions/groups";
import { groupTypeInfo } from "@/components/groups/group-type";
import { DemoBadge } from "@/components/shared/demo-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { BalanceText } from "@/components/shared/balance-text";
import { buttonStyles } from "@/components/shared/button-styles";
import { ExpenseList } from "@/components/expenses/expense-list";
import { SuggestionList } from "@/components/settlements/suggestion-list";
import { SettlementHistory } from "@/components/settlements/settlement-history";

export function GroupDetailsView() {
  // [groupId] in the folder name -> read it from the URL
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const { data, isLoaded, updateData } = useAppData();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isLoaded) return <div className="h-96 animate-pulse rounded-xl bg-card" />;

  // Everything about this group, calculated in one place (lib/group-summary.ts)
  const summary = getGroupSummary(data, groupId);
  if (!summary) {
    return (
      <EmptyState
        icon={Receipt}
        title="Group not found"
        description="It may have been deleted."
        action={
          <Link href="/groups" className={buttonStyles("outline")}>
            Back to groups
          </Link>
        }
      />
    );
  }

  const { group, members, expenses, settlements, balances } = summary;
  const { label, icon: Icon } = groupTypeInfo[group.type];
  const addExpenseLink = `/groups/${group.id}/expenses/new`;

  return (
    <>
      <Link href="/groups" className={buttonStyles("ghost", "-ml-3 mb-4")}>
        <ArrowLeft className="size-4" /> Groups
      </Link>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-card">
            <Icon className="size-6 text-brand-bright" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{group.name}</h1>
              {group.isDemo && <DemoBadge />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {label} · {members.length} members · {formatINR(summary.totalSpent)} spent
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={addExpenseLink} className={buttonStyles("primary")}>
            <Plus className="size-4" /> Add expense
          </Link>
          <Link href={`/groups/${group.id}/edit`} className={buttonStyles("outline")}>
            <Pencil className="size-4" /> Edit
          </Link>
          <button onClick={() => setConfirmOpen(true)} className={buttonStyles("outline", "text-negative")}>
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* ---- Members + balances ---- */}
        <section className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-5 py-4 font-semibold">Members</h2>
          <ul className="divide-y divide-border">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium">
                    {m.name}
                    {group.youMemberId === m.id && m.name !== "You" && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </span>
                </div>
                <BalanceText amount={balances[m.id] ?? 0} />
              </li>
            ))}
          </ul>
        </section>

        {/* ---- Settle up ---- */}
        <section className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-5 py-4 font-semibold">Settle up</h2>
          <SuggestionList summary={summary} />
        </section>
      </div>

      {/* ---- Expenses ---- */}
      <section className="mt-6 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Expenses</h2>
          <span className="text-sm text-muted-foreground">{expenses.length} total</span>
        </div>
        {expenses.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-medium">No expenses yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the first bill and Hisaably will work out who owes whom.
            </p>
            <Link href={addExpenseLink} className={buttonStyles("primary", "mt-5")}>
              <Plus className="size-4" /> Add expense
            </Link>
          </div>
        ) : (
          <ExpenseList expenses={expenses} members={members} youMemberId={group.youMemberId} />
        )}
      </section>

      {/* ---- Payments already made ---- */}
      {settlements.length > 0 && (
        <section className="mt-6 rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-5 py-4 font-semibold">Payments</h2>
          <SettlementHistory summaries={[summary]} />
        </section>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete "${group.name}"?`}
        description={`This removes the group with its ${members.length} members, ${expenses.length} expenses and ${settlements.length} settlements. This can't be undone.`}
        confirmLabel="Delete group"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          updateData((old) => deleteGroup(old, group.id));
          router.push("/groups");
        }}
      />
    </>
  );
}