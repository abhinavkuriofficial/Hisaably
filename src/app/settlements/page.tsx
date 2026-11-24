"use client";

import { useState } from "react";
import Link from "next/link";
import { HandCoins } from "lucide-react";
import type { Id } from "@/types/models";
import { useAppData } from "@/providers/app-data-provider";
import { getAllGroupSummaries } from "@/lib/group-summary";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SuggestionList } from "@/components/settlements/suggestion-list";
import { SettlementHistory } from "@/components/settlements/settlement-history";
import { buttonStyles } from "@/components/shared/button-styles";
import { cn } from "@/lib/utils";

export default function SettlementsPage() {
  const { data, isLoaded } = useAppData();
  const [filter, setFilter] = useState<Id | "all">("all"); // which group to show

  const all = getAllGroupSummaries(data);
  const shown = filter === "all" ? all : all.filter((s) => s.group.id === filter);

  return (
    <>
      <PageHeader title="Settlements" description="Suggested payments and settlement history." />

      {!isLoaded ? (
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      ) : all.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="Nothing to settle"
          description="Create a group and add expenses first."
          action={
            <Link href="/groups/new" className={buttonStyles("primary")}>
              Create a group
            </Link>
          }
        />
      ) : (
        <>
          {/* ---- Group filter ---- */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {[{ id: "all", name: "All groups" }, ...all.map((s) => s.group)].map((g) => (
              <button
                key={g.id}
                onClick={() => setFilter(g.id)}
                aria-pressed={filter === g.id}
                className={cn(
                  "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                  filter === g.id
                    ? "border-primary bg-primary/15 text-white"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* ---- Suggested payments ---- */}
          <h2 className="mt-8 mb-1 text-lg font-semibold">Suggested payments</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            The fewest payments that settle everyone. Pay by UPI or cash, then tap &quot;Mark as paid&quot;.
          </p>
          <div className="space-y-4">
            {shown.map((s) => (
              <section key={s.group.id} className="rounded-xl border border-border bg-card">
                <h3 className="border-b border-border px-5 py-3 text-sm font-semibold">{s.group.name}</h3>
                <SuggestionList summary={s} />
              </section>
            ))}
          </div>

          {/* ---- History ---- */}
          <h2 className="mt-10 mb-4 text-lg font-semibold">History</h2>
          <section className="rounded-xl border border-border bg-card">
            <SettlementHistory summaries={shown} showGroupName={filter === "all"} />
          </section>
        </>
      )}
    </>
  );
}