"use client";

import { useState } from "react";
import { ArrowRight, PartyPopper } from "lucide-react";
import type { GroupSummary } from "@/lib/group-summary";
import type { SuggestedPayment } from "@/lib/settlements";
import { formatINR } from "@/lib/money";
import { todayISODate } from "@/lib/dates";
import { recordSettlement } from "@/data/actions/settlements";
import { useAppData } from "@/providers/app-data-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { buttonStyles } from "@/components/shared/button-styles";

type SuggestionListProps = { summary: GroupSummary };

/** "Rahul pays Aman ₹1,050" rows, each with a "Mark as paid" button. */
export function SuggestionList({ summary }: SuggestionListProps) {
  const { updateData } = useAppData();
  const [picked, setPicked] = useState<SuggestedPayment | null>(null); // the one being confirmed
  const { group, suggestions, nameOf } = summary;
  // Show "You" instead of your own name, so your payments stand out
  const who = (id: string) => (id === group.youMemberId ? "You" : nameOf(id));

  if (suggestions.length === 0) {
    return (
      <div className="flex items-center gap-3 px-5 py-6 text-sm text-muted-foreground">
        <PartyPopper className="size-5 text-brand-bright" />
        {summary.expenses.length === 0
          ? "No expenses yet, so nobody owes anything."
          : "Everyone is settled up. Nobody owes anything."}
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {suggestions.map((p) => (
          <li
            key={`${p.from}-${p.to}`}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{who(p.from)}</span>
              <ArrowRight className="size-4 text-muted-foreground" />
              <span className="font-medium">{who(p.to)}</span>
              <span className="font-semibold text-brand-bright">{formatINR(p.amount)}</span>
            </div>
            <button onClick={() => setPicked(p)} className={buttonStyles("outline", "h-9")}>
              Mark as paid
            </button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={picked !== null}
        title="Mark as paid?"
        description={
          picked
            ? `This records that ${nameOf(picked.from)} paid ${nameOf(picked.to)} ${formatINR(picked.amount)}. Hisaably only keeps track, no real money is sent.`
            : ""
        }
        confirmLabel="Mark as paid"
        confirmVariant="primary"
        onCancel={() => setPicked(null)}
        onConfirm={() => {
          if (!picked) return;
          updateData(
            (old) =>
              recordSettlement(old, group.id, {
                fromMemberId: picked.from,
                toMemberId: picked.to,
                amount: picked.amount,
                date: todayISODate(),
              }).data,
          );
          setPicked(null);
        }}
      />
    </>
  );
}