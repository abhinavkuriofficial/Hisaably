import type { AppData, Id, ISODate, Paise, Settlement } from "../../types/models";
import { createId } from "../../lib/ids";

// ===== Settlement actions =====
// A settlement is only a RECORD that someone paid someone back.
// Hisaably never moves real money.

export type PaymentInput = {
  fromMemberId: Id; // who paid back
  toMemberId: Id; // who received
  amount: Paise;
  date: ISODate;
  note?: string;
};

export function recordSettlement(
  data: AppData,
  groupId: Id,
  payment: PaymentInput,
  now: Date = new Date(),
): { data: AppData; settlementId: Id } {
  if (!data.groups.some((g) => g.id === groupId)) throw new Error("Group not found");

  const inGroup = (id: Id) => data.members.some((m) => m.id === id && m.groupId === groupId);
  if (!inGroup(payment.fromMemberId) || !inGroup(payment.toMemberId)) {
    throw new Error("Both people must be members of this group.");
  }
  if (payment.fromMemberId === payment.toMemberId) {
    throw new Error("Someone can't pay themselves.");
  }
  if (!Number.isInteger(payment.amount) || payment.amount <= 0) {
    throw new Error("Amount must be more than ₹0.");
  }

  const settlement: Settlement = {
    id: createId("s"),
    groupId,
    ...payment,
    createdAt: now.toISOString(),
  };
  return {
    settlementId: settlement.id,
    data: { ...data, settlements: [...data.settlements, settlement] },
  };
}

export function deleteSettlement(data: AppData, settlementId: Id): AppData {
  return { ...data, settlements: data.settlements.filter((s) => s.id !== settlementId) };
}

/** Newest first: by date, then by when it was recorded. */
export function sortSettlementsNewestFirst(settlements: Settlement[]): Settlement[] {
  return [...settlements].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}