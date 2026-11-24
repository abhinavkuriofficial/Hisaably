import type { Paise } from "@/types/models";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

type BalanceTextProps = { amount: Paise; className?: string };

/** "gets ₹500.00" in green, "owes ₹200.00" in red, or "settled" in grey. */
export function BalanceText({ amount, className }: BalanceTextProps) {
  return (
    <span
      className={cn(
        "text-sm font-medium",
        amount > 0 && "text-positive",
        amount < 0 && "text-negative",
        amount === 0 && "text-muted-foreground",
        className,
      )}
    >
      {amount > 0 ? `gets ${formatINR(amount)}` : amount < 0 ? `owes ${formatINR(-amount)}` : "settled"}
    </span>
  );
}