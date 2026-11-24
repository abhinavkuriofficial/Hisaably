import Link from "next/link";
import { HandCoins, Receipt } from "lucide-react";
import type { ActivityItem } from "@/lib/dashboard";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/dates";

type RecentActivityProps = { items: ActivityItem[] };

/** The latest expenses and payments from all groups. */
export function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const Icon = item.kind === "expense" ? Receipt : HandCoins;
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Icon className="size-4 text-brand-bright" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.group.name} · {item.detail} · {formatDate(item.date)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold">{formatINR(item.amount)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}