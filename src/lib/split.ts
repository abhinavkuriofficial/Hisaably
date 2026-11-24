import type { ExpenseSplit, Id, Paise } from "../types/models";

/**
 * Splits an amount equally. Leftover paise go one each to the first members,
 * so the shares ALWAYS add up exactly to the amount.
 * Example: 10000 paise among 3 -> 3334, 3333, 3333
 */
export function splitEqually(amount: Paise, memberIds: Id[]): ExpenseSplit[] {
  if (memberIds.length === 0) {
    throw new Error("Pick at least one member to split with.");
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Amount must be a whole number of paise above 0.");
  }

  const count = memberIds.length;
  const base = Math.floor(amount / count);
  const leftover = amount - base * count; // always less than count

  return memberIds.map((memberId, index) => ({
    memberId,
    amount: index < leftover ? base + 1 : base,
  }));
}

export type CustomSplitCheck = {
  isValid: boolean;
  assigned: Paise; // total of all shares typed so far
  remaining: Paise; // amount - assigned (negative = too much assigned)
};

/** Checks that custom shares add up exactly to the bill. */
export function checkCustomSplit(
  amount: Paise,
  splits: ExpenseSplit[],
): CustomSplitCheck {
  const assigned = splits.reduce((sum, s) => sum + s.amount, 0);
  const remaining = amount - assigned;
  const allSharesOk = splits.every(
    (s) => Number.isInteger(s.amount) && s.amount >= 0,
  );
  const someoneShares = splits.some((s) => s.amount > 0);

  return {
    isValid: remaining === 0 && allSharesOk && someoneShares,
    assigned,
    remaining,
  };
}