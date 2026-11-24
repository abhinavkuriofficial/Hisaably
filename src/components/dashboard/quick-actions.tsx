"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HandCoins, Plus, Receipt } from "lucide-react";
import type { Group } from "@/types/models";
import { buttonStyles } from "@/components/shared/button-styles";

type QuickActionsProps = { groups: Group[] };

/** Shortcut buttons. "Add expense" first asks which group. */
export function QuickActions({ groups }: QuickActionsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPickerOpen((open) => !open)}
          disabled={groups.length === 0}
          aria-expanded={pickerOpen}
          className={buttonStyles("primary")}
        >
          <Receipt className="size-4" /> Add expense
          <ChevronDown className={`size-4 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
        </button>
        <Link href="/groups/new" className={buttonStyles("outline")}>
          <Plus className="size-4" /> New group
        </Link>
        <Link href="/settlements" className={buttonStyles("outline")}>
          <HandCoins className="size-4" /> Settle up
        </Link>
      </div>

      {/* Which group is the expense for? */}
      {pickerOpen && (
        <div className="mt-3 max-w-sm rounded-xl border border-border bg-card p-2">
          <p className="px-3 pt-1 pb-2 text-xs text-muted-foreground">Add an expense to…</p>
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}/expenses/new`}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-accent"
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}