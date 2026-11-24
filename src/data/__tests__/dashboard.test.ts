import { describe, expect, it } from "vitest";
import { createDemoData } from "../demo-data";
import { createEmptyData } from "../repository";
import { getDashboardStats, getRecentActivity } from "../../lib/dashboard";

const NOV_2026 = new Date(2026, 10, 24); // months start at 0, so 10 = November

describe("dashboard stats", () => {
  it("adds up your money across all demo groups", () => {
    const stats = getDashboardStats(createDemoData(), NOV_2026);
    expect(stats.youGet).toBe(0);
    expect(stats.youOwe).toBe(185800); // ₹1,700 (Goa) + ₹158 (Flat)
    expect(stats.net).toBe(-185800);
    expect(stats.groupCount).toBe(2);
    // Goa: 600 + 450 + 2250 + 200 = 3,500 · Flat: 650 + 412.50 + 333 = 1,395.50
    expect(stats.yourShareThisMonth).toBe(350000 + 139550);
  });

  it("only counts this month's expenses in your share", () => {
    const stats = getDashboardStats(createDemoData(), new Date(2026, 11, 1)); // December
    expect(stats.yourShareThisMonth).toBe(0);
  });

  it("is all zero with no data", () => {
    expect(getDashboardStats(createEmptyData(), NOV_2026)).toEqual({
      youGet: 0,
      youOwe: 0,
      net: 0,
      yourShareThisMonth: 0,
      groupCount: 0,
    });
  });
});

describe("recent activity", () => {
  it("mixes expenses and settlements, newest first", () => {
    const items = getRecentActivity(createDemoData(), 20);
    expect(items).toHaveLength(8); // 7 expenses + 1 settlement
    expect(items[0]).toMatchObject({
      kind: "settlement",
      title: "Priya paid Aman",
      date: "2026-11-18",
    });
    expect(items[1]).toMatchObject({ kind: "expense", title: "Petrol", detail: "Priya paid" });
    const dates = items.map((i) => i.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("shows only as many items as asked", () => {
    expect(getRecentActivity(createDemoData(), 3)).toHaveLength(3);
  });
});