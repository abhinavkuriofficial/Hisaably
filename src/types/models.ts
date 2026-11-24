// ===== Hisaably data types =====
// These describe the "shape" of our data. TypeScript uses them to catch mistakes.

export type Id = string; // e.g. "g_k3f9x2"
export type Paise = number; // ALWAYS a whole number. ₹900 = 90000
export type ISODate = string; // "2026-11-24" (a day, no time)
export type ISODateTime = string; // "2026-11-24T08:30:00.000Z"

export type GroupType = "trip" | "roommates" | "friends" | "other";

export interface Group {
  id: Id;
  name: string; // "Goa Trip"
  type: GroupType;
  youMemberId?: Id; // which member is "you" (for dashboard totals)
  isDemo: boolean; // true = sample data
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Member {
  id: Id;
  groupId: Id;
  name: string; // "Rahul"
  createdAt: ISODateTime;
}

export type SplitType = "equal" | "custom";

export interface ExpenseSplit {
  memberId: Id; // who shares this expense
  amount: Paise; // their share
}

export interface Expense {
  id: Id;
  groupId: Id;
  title: string; // "Dinner"
  description?: string;
  amount: Paise; // total bill
  paidBy: Id; // member who paid
  date: ISODate;
  splitType: SplitType;
  splits: ExpenseSplit[]; // RULE: shares always add up to amount
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Settlement {
  id: Id;
  groupId: Id;
  fromMemberId: Id; // who paid back
  toMemberId: Id; // who received
  amount: Paise;
  date: ISODate;
  note?: string;
  createdAt: ISODateTime;
}

// Everything we save in LocalStorage (Milestone 4)
export interface AppData {
  schemaVersion: 1;
  profile: { name: string };
  groups: Group[];
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
}