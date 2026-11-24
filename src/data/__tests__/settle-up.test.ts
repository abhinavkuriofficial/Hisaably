import { describe, expect, it } from "vitest";
import { createDemoData } from "../demo-data";
import { deleteSettlement, recordSettlement, sortSettlementsNewestFirst } from "../actions/settlements";
import { getAllGroupSummaries, getGroupSummary } from "../../lib/group-summary";

const GOA = "demo-g-goa";

describe("group summary", () => {
  it("collects everything about the Goa Trip", () => {
    const goa = getGroupSummary(createDemoData(), GOA)!;
    expect(goa.members).toHaveLength(4);
    expect(goa.expenses).toHaveLength(4);
    expect(goa.totalSpent).toBe(1385000); // ₹13,850
    expect(goa.yourBalance).toBe(-170000); // Abhinav owes ₹1,700
    expect(goa.nameOf("demo-m-aman")).toBe("Aman");
    // all balances together are always 0
    expect(Object.values(goa.balances).reduce((a, b) => a + b, 0)).toBe(0);
  });

  it("suggests payments that everyone can follow", () => {
    const goa = getGroupSummary(createDemoData(), GOA)!;
    expect(goa.suggestions.length).toBeLessThanOrEqual(3); // at most members - 1
    expect(goa.suggestions.every((p) => p.to === "demo-m-aman")).toBe(true); // Aman is owed
  });

  it("returns null for a group that does not exist, and lists all groups", () => {
    const data = createDemoData();
    expect(getGroupSummary(data, "nope")).toBeNull();
    expect(getAllGroupSummaries(data).map((s) => s.group.name)).toEqual(["Goa Trip", "Flat 201"]);
  });
});

describe("settlements", () => {
  it("marking every suggestion as paid settles the whole group", () => {
    let data = createDemoData();
    for (const p of getGroupSummary(data, GOA)!.suggestions) {
      data = recordSettlement(data, GOA, {
        fromMemberId: p.from,
        toMemberId: p.to,
        amount: p.amount,
        date: "2026-11-24",
      }).data;
    }
    const after = getGroupSummary(data, GOA)!;
    expect(Object.values(after.balances).every((b) => b === 0)).toBe(true);
    expect(after.suggestions).toEqual([]);
  });

  it("refuses wrong payments", () => {
    const data = createDemoData();
    const base = { amount: 1000, date: "2026-11-24" };
    expect(() =>
      recordSettlement(data, GOA, { ...base, fromMemberId: "demo-m-rahul", toMemberId: "demo-m-rahul" }),
    ).toThrow("Someone can't pay themselves.");
    expect(() =>
      recordSettlement(data, GOA, { ...base, fromMemberId: "demo-m-rahul", toMemberId: "demo-m-karan" }),
    ).toThrow("Both people must be members of this group.");
    expect(() =>
      recordSettlement(data, GOA, { ...base, amount: 0, fromMemberId: "demo-m-rahul", toMemberId: "demo-m-aman" }),
    ).toThrow("Amount must be more than ₹0.");
  });

  it("deleting a settlement brings the old balance back", () => {
    const data = createDemoData();
    const before = getGroupSummary(data, GOA)!.balances["demo-m-rahul"];
    const { data: paid, settlementId } = recordSettlement(data, GOA, {
      fromMemberId: "demo-m-rahul",
      toMemberId: "demo-m-aman",
      amount: 50000,
      date: "2026-11-24",
    });
    expect(getGroupSummary(paid, GOA)!.balances["demo-m-rahul"]).toBe(before + 50000);
    const undone = deleteSettlement(paid, settlementId);
    expect(getGroupSummary(undone, GOA)!.balances["demo-m-rahul"]).toBe(before);
  });

  it("sorts newest first", () => {
    const data = recordSettlement(createDemoData(), GOA, {
      fromMemberId: "demo-m-rahul",
      toMemberId: "demo-m-aman",
      amount: 100,
      date: "2026-11-25",
    }).data;
    expect(sortSettlementsNewestFirst(data.settlements)[0].date).toBe("2026-11-25");
  });
});