"use client";

import Link from "next/link";
import { ChevronRight, Scale } from "lucide-react";
import { useAppData } from "@/providers/app-data-provider";
import { getAllGroupSummaries } from "@/lib/group-summary";
import { calculateContributions } from "@/lib/balances";
import { formatINR } from "@/lib/money";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DemoBadge } from "@/components/shared/demo-badge";
import { BalanceText } from "@/components/shared/balance-text";
import { buttonStyles } from "@/components/shared/button-styles";

export default function BalancesPage() {
  const { data, isLoaded } = useAppData();
  const summaries = getAllGroupSummaries(data);

  // Your money across all groups (only groups where a member is marked "you")
  let youGet = 0;
  let youOwe = 0;
  for (const s of summaries) {
    if (s.yourBalance === null) continue;
    if (s.yourBalance > 0) youGet += s.yourBalance;
    else youOwe += -s.yourBalance;
  }

  return (
    <>
      <PageHeader title="Balances" description="Who owes money and who gets money back." />

      {!isLoaded ? (
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      ) : summaries.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No balances yet"
          description="Create a group and add an expense to see who owes whom."
          action={
            <Link href="/groups/new" className={buttonStyles("primary")}>
              Create a group
            </Link>
          }
        />
      ) : (
        <>
          {/* ---- Your totals ---- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">You get back</p>
              <p className="mt-1 text-2xl font-semibold text-positive">{formatINR(youGet)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">You owe</p>
              <p className="mt-1 text-2xl font-semibold text-negative">{formatINR(youOwe)}</p>
            </div>
          </div>

          {/* ---- One card per group ---- */}
          <div className="mt-8 space-y-6">
            {summaries.map((s) => {
              const contributions = calculateContributions(s.members, s.expenses);
              return (
                <section key={s.group.id} className="rounded-xl border border-border bg-card">
                  <Link
                    href={`/groups/${s.group.id}`}
                    className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{s.group.name}</h2>
                      {s.group.isDemo && <DemoBadge />}
                    </div>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      {formatINR(s.totalSpent)} spent <ChevronRight className="size-4" />
                    </span>
                  </Link>
                  <ul className="divide-y divide-border">
                    {s.members.map((m) => {
                      const c = contributions.find((x) => x.memberId === m.id)!;
                      return (
                        <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3">
                          <div className="min-w-0">
                            <p className="font-medium">
                              {m.name}
                              {s.group.youMemberId === m.id && m.name !== "You" && (
                                <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Paid {formatINR(c.paid)} · Share {formatINR(c.share)}
                            </p>
                          </div>
                          <BalanceText amount={s.balances[m.id] ?? 0} className="shrink-0" />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Balance = what someone paid minus their share, plus or minus payments already made.
            Go to <Link href="/settlements" className="text-brand-bright underline">Settlements</Link> to settle up.
          </p>
        </>
      )}
    </>
  );
}