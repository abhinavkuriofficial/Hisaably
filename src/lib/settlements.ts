import type { Id, Paise } from "../types/models";
import type { Balances } from "./balances";

export type SuggestedPayment = {
  from: Id; // who should pay
  to: Id; // who should receive
  amount: Paise;
};

/**
 * Suggests who should pay whom so everyone ends at 0.
 * Greedy method: biggest debtor pays biggest receiver, repeat.
 * Never needs more than (members - 1) payments.
 */
export function suggestSettlements(balances: Balances): SuggestedPayment[] {
  const byBiggest = (a: [Id, Paise], b: [Id, Paise]) =>
    b[1] - a[1] || a[0].localeCompare(b[0]); // tie -> sort by id, so results never change

  // people who should receive (positive) and who owe (stored as positive amounts)
  const receivers = Object.entries(balances)
    .filter(([, amount]) => amount > 0)
    .sort(byBiggest);
  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < 0)
    .map(([id, amount]): [Id, Paise] => [id, -amount])
    .sort(byBiggest);

  const payments: SuggestedPayment[] = [];
  let r = 0;
  let d = 0;

  while (r < receivers.length && d < debtors.length) {
    const amount = Math.min(receivers[r][1], debtors[d][1]);
    payments.push({ from: debtors[d][0], to: receivers[r][0], amount });

    receivers[r][1] -= amount;
    debtors[d][1] -= amount;
    if (receivers[r][1] === 0) r++;
    if (debtors[d][1] === 0) d++;
  }

  return payments;
}