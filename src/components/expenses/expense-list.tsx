import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Expense, Id, Member } from "@/types/models";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { sortExpensesNewestFirst } from "@/data/actions/expenses";
import { cn } from "@/lib/utils";

type ExpenseListProps = {
  expenses: Expense[];
  members: Member[];
  youMemberId?: Id;
};

export function ExpenseList({ expenses, members, youMemberId }: ExpenseListProps) {
  const nameOf = (id: Id) => members.find((m) => m.id === id)?.name ?? "Someone";

  return (
    <ul className="divide-y divide-border">
      {sortExpensesNewestFirst(expenses).map((e) => {
        // What this expense means for "you"
        const yourShare = e.splits.find((s) => s.memberId === youMemberId)?.amount ?? 0;
        let youText = "";
        let youColor = "text-muted-foreground";
        if (youMemberId) {
          if (e.paidBy === youMemberId) {
            youText = `you lent ${formatINR(e.amount - yourShare)}`;
            youColor = "text-positive";
          } else if (yourShare > 0) {
            youText = `you borrowed ${formatINR(yourShare)}`;
            youColor = "text-negative";
          } else {
            youText = "not involved";
          }
        }

        return (
          <li key={e.id}>
            <Link
              href={`/groups/${e.groupId}/expenses/${e.id}/edit`}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium break-words">{e.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {nameOf(e.paidBy)} paid · {formatDate(e.date)}
                  <span className="hidden sm:inline">
                    {e.splitType === "custom" ? " · custom split" : ` · split ${e.splits.length} ways`}
                  </span>
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold">{formatINR(e.amount)}</p>
                {youText && <p className={cn("mt-0.5 text-xs", youColor)}>{youText}</p>}
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}