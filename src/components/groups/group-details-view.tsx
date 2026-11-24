"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Receipt, Trash2 } from "lucide-react";
import { useAppData } from "@/providers/app-data-provider";
import { calculateBalances, totalSpent } from "@/lib/balances";
import { formatINR } from "@/lib/money";
import { deleteGroup } from "@/data/actions/groups";
import { groupTypeInfo } from "@/components/groups/group-type";
import { DemoBadge } from "@/components/shared/demo-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonStyles } from "@/components/shared/button-styles";
import { cn } from "@/lib/utils";

export function GroupDetailsView() {
  // [groupId] in the folder name -> read it from the URL
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const { data, isLoaded, updateData } = useAppData();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isLoaded) return <div className="h-96 animate-pulse rounded-xl bg-card" />;

  const group = data.groups.find((g) => g.id === groupId);
  if (!group) {
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

  const members = data.members.filter((m) => m.groupId === group.id);
  const expenses = data.expenses.filter((e) => e.groupId === group.id);
  const settlements = data.settlements.filter((s) => s.groupId === group.id);
  const balances = calculateBalances(members, expenses, settlements);
  const { label, icon: Icon } = groupTypeInfo[group.type];

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
              {label} · {members.length} members · {formatINR(totalSpent(expenses))} spent
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/groups/${group.id}/edit`} className={buttonStyles("outline")}>
            <Pencil className="size-4" /> Edit
          </Link>
          <button onClick={() => setConfirmOpen(true)} className={buttonStyles("outline", "text-negative")}>
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      </div>

      {/* ---- Members + balances ---- */}
      <section className="mt-8 rounded-xl border border-border bg-card">
        <h2 className="border-b border-border px-5 py-4 font-semibold">Members</h2>
        <ul className="divide-y divide-border">
          {members.map((m) => {
            const balance = balances[m.id] ?? 0;
            return (
              <li key={m.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium">
                    {m.name}
                    {group.youMemberId === m.id && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    balance > 0 && "text-positive",
                    balance < 0 && "text-negative",
                    balance === 0 && "text-muted-foreground",
                  )}
                >
                  {balance > 0 ? `gets ${formatINR(balance)}` : balance < 0 ? `owes ${formatINR(-balance)}` : "settled"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-6 text-sm text-muted-foreground">
        Adding and viewing expenses comes in Milestone 6.
      </p>

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