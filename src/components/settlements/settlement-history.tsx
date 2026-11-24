"use client";

import { useState } from "react";
import { Undo2 } from "lucide-react";
import type { Settlement } from "@/types/models";
import type { GroupSummary } from "@/lib/group-summary";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { deleteSettlement, sortSettlementsNewestFirst } from "@/data/actions/settlements";
import { useAppData } from "@/providers/app-data-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { buttonStyles } from "@/components/shared/button-styles";

type SettlementHistoryProps = {
  summaries: GroupSummary[]; // one group (group page) or many (Settlements page)
  showGroupName?: boolean;
};

/** List of payments that were marked as paid, with an "Undo" button. */
export function SettlementHistory({ summaries, showGroupName = false }: SettlementHistoryProps) {
  const { updateData } = useAppData();
  const [picked, setPicked] = useState<Settlement | null>(null);

  // Find the right group for a settlement, to get names
  const summaryOf = (s: Settlement) => summaries.find((g) => g.group.id === s.groupId)!;
  const all = sortSettlementsNewestFirst(summaries.flatMap((g) => g.settlements));

  if (all.length === 0) {
    return <p className="px-5 py-6 text-sm text-muted-foreground">No payments recorded yet.</p>;
  }

  const pickedNames = picked
    ? `${summaryOf(picked).nameOf(picked.fromMemberId)} paid ${summaryOf(picked).nameOf(picked.toMemberId)}`
    : "";

  return (
    <>
      <ul className="divide-y divide-border">
        {all.map((s) => {
          const { nameOf, group } = summaryOf(s);
          return (
            <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{nameOf(s.fromMemberId)}</span> paid{" "}
                  <span className="font-medium">{nameOf(s.toMemberId)}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(s.date)}
                  {showGroupName && ` · ${group.name}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-semibold">{formatINR(s.amount)}</span>
                <button
                  onClick={() => setPicked(s)}
                  className={buttonStyles("ghost", "size-9 px-0")}
                  title="Undo this payment"
                  aria-label="Undo this payment"
                >
                  <Undo2 className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={picked !== null}
        title="Undo this payment?"
        description={
          picked
            ? `"${pickedNames} ${formatINR(picked.amount)}" will be removed, and the money will show as owed again.`
            : ""
        }
        confirmLabel="Undo payment"
        onCancel={() => setPicked(null)}
        onConfirm={() => {
          if (picked) updateData((old) => deleteSettlement(old, picked.id));
          setPicked(null);
        }}
      />
    </>
  );
}