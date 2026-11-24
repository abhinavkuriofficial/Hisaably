"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AppData, Group } from "@/types/models";
import { calculateBalances, totalSpent } from "@/lib/balances";
import { formatINR } from "@/lib/money";
import { DemoBadge } from "@/components/shared/demo-badge";
import { groupTypeInfo } from "./group-type";

type GroupCardProps = { group: Group; data: AppData };

export function GroupCard({ group, data }: GroupCardProps) {
  const members = data.members.filter((m) => m.groupId === group.id);
  const expenses = data.expenses.filter((e) => e.groupId === group.id);
  const settlements = data.settlements.filter((s) => s.groupId === group.id);

  // "Your" balance in this group (only if a member is marked as you)
  const balances = calculateBalances(members, expenses, settlements);
  const yours = group.youMemberId ? balances[group.youMemberId] ?? 0 : null;

  const { label, icon: Icon } = groupTypeInfo[group.type];

  return (
    <Link
      href={`/groups/${group.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
            <Icon className="size-5 text-brand-bright" />
          </span>
          <div>
            <p className="font-semibold leading-tight">{group.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {label} · {members.length} members
            </p>
          </div>
        </div>
        {group.isDemo && <DemoBadge />}
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total spent</p>
          <p className="mt-0.5 text-lg font-semibold">
            {formatINR(totalSpent(expenses))}
          </p>
        </div>
        <div className="flex items-center gap-1 text-right">
          {yours === null ? null : yours > 0 ? (
            <p className="text-sm font-medium text-positive">You get {formatINR(yours)}</p>
          ) : yours < 0 ? (
            <p className="text-sm font-medium text-negative">You owe {formatINR(-yours)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Settled up</p>
          )}
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}