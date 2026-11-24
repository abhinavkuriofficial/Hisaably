import type {
  AppData,
  Expense,
  ExpenseSplit,
  Member,
  Settlement,
} from "../types/models";
import { splitEqually } from "../lib/split";

/**
 * Sample data shown on first visit, so the app is not empty.
 * Every demo group has isDemo: true, so the app can show a "Demo" badge
 * and the user can remove all of it with one click (Milestone 9).
 */
export function createDemoData(now: Date = new Date()): AppData {
  const at = now.toISOString();

  const member = (id: string, groupId: string, name: string): Member => ({
    id,
    groupId,
    name,
    createdAt: at,
  });

  const expense = (
    id: string,
    groupId: string,
    title: string,
    amount: number,
    paidBy: string,
    date: string,
    splits: ExpenseSplit[],
    splitType: "equal" | "custom" = "equal",
  ): Expense => ({
    id,
    groupId,
    title,
    amount,
    paidBy,
    date,
    splitType,
    splits,
    createdAt: at,
    updatedAt: at,
  });

  const settlement = (
    id: string,
    groupId: string,
    from: string,
    to: string,
    amount: number,
    date: string,
  ): Settlement => ({
    id,
    groupId,
    fromMemberId: from,
    toMemberId: to,
    amount,
    date,
    createdAt: at,
  });

  // ---------- Group 1: Goa Trip ----------
  const goa = "demo-g-goa";
  const goaPeople = ["demo-m-abhinav", "demo-m-rahul", "demo-m-aman", "demo-m-priya"];

  // ---------- Group 2: Flat 201 ----------
  const flat = "demo-g-flat";
  const flatPeople = ["demo-m-abhinav-flat", "demo-m-karan", "demo-m-sneha"];

  return {
    schemaVersion: 1,
    profile: { name: "" }, // empty: each visitor sets their own name in Settings
    groups: [
      {
        id: goa,
        name: "Goa Trip",
        type: "trip",
        youMemberId: "demo-m-abhinav",
        isDemo: true,
        createdAt: at,
        updatedAt: at,
      },
      {
        id: flat,
        name: "Flat 201",
        type: "roommates",
        youMemberId: "demo-m-abhinav-flat",
        isDemo: true,
        createdAt: at,
        updatedAt: at,
      },
    ],
    members: [
      member("demo-m-abhinav", goa, "You"), // "You" so every visitor sees themselves
      member("demo-m-rahul", goa, "Rahul"),
      member("demo-m-aman", goa, "Aman"),
      member("demo-m-priya", goa, "Priya"),
      member("demo-m-abhinav-flat", flat, "You"),
      member("demo-m-karan", flat, "Karan"),
      member("demo-m-sneha", flat, "Sneha"),
    ],
    expenses: [
      // amounts are in paise: 240000 = ₹2,400
      expense("demo-e-dinner", goa, "Beach shack dinner", 240000, "demo-m-rahul", "2026-11-14", splitEqually(240000, goaPeople)),
      expense("demo-e-scooty", goa, "Scooter rental", 180000, "demo-m-abhinav", "2026-11-15", splitEqually(180000, goaPeople)),
      expense("demo-e-hotel", goa, "Hotel (2 nights)", 900000, "demo-m-aman", "2026-11-15", splitEqually(900000, goaPeople)),
      expense(
        "demo-e-petrol",
        goa,
        "Petrol",
        65000,
        "demo-m-priya",
        "2026-11-16",
        [
          { memberId: "demo-m-abhinav", amount: 20000 },
          { memberId: "demo-m-rahul", amount: 15000 },
          { memberId: "demo-m-aman", amount: 15000 },
          { memberId: "demo-m-priya", amount: 15000 },
        ],
        "custom",
      ),
      expense("demo-e-electricity", flat, "Electricity bill", 195000, "demo-m-karan", "2026-11-05", splitEqually(195000, flatPeople)),
      expense("demo-e-groceries", flat, "Groceries", 123750, "demo-m-abhinav-flat", "2026-11-10", splitEqually(123750, flatPeople)),
      expense("demo-e-wifi", flat, "Wi-Fi recharge", 99900, "demo-m-sneha", "2026-11-12", splitEqually(99900, flatPeople)),
    ],
    settlements: [
      settlement("demo-s-priya-aman", goa, "demo-m-priya", "demo-m-aman", 100000, "2026-11-18"),
    ],
  };
}