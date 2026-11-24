import { describe, expect, it } from "vitest";
import { createDemoData } from "../demo-data";
import { createEmptyData } from "../repository";
import {
  createLocalStorageRepository,
  STORAGE_KEY,
} from "../local-storage-repository";
import { calculateBalances } from "../../lib/balances";
import { checkCustomSplit } from "../../lib/split";

// A pretend localStorage that lives in memory (tests have no browser)
function fakeStorage() {
  const items = new Map<string, string>();
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  };
}

describe("demo data", () => {
  const demo = createDemoData();

  it("has 2 groups, both marked as demo", () => {
    expect(demo.groups).toHaveLength(2);
    expect(demo.groups.every((g) => g.isDemo)).toBe(true);
  });

  it("every expense split adds up exactly to its amount", () => {
    for (const e of demo.expenses) {
      expect(checkCustomSplit(e.amount, e.splits).isValid).toBe(true);
    }
  });

  it("every expense and settlement points to members of its own group", () => {
    const groupOf = new Map(demo.members.map((m) => [m.id, m.groupId]));
    for (const e of demo.expenses) {
      expect(groupOf.get(e.paidBy)).toBe(e.groupId);
      for (const s of e.splits) expect(groupOf.get(s.memberId)).toBe(e.groupId);
    }
    for (const s of demo.settlements) {
      expect(groupOf.get(s.fromMemberId)).toBe(s.groupId);
      expect(groupOf.get(s.toMemberId)).toBe(s.groupId);
    }
  });

  it("balances of each demo group add up to 0", () => {
    for (const group of demo.groups) {
      const balances = calculateBalances(
        demo.members.filter((m) => m.groupId === group.id),
        demo.expenses.filter((e) => e.groupId === group.id),
        demo.settlements.filter((s) => s.groupId === group.id),
      );
      const total = Object.values(balances).reduce((a, b) => a + b, 0);
      expect(total).toBe(0);
    }
  });
});

describe("LocalStorage repository", () => {
  it("first visit (nothing saved) starts empty", async () => {
    const repo = createLocalStorageRepository(fakeStorage());
    const data = await repo.load();
    expect(data).toEqual(createEmptyData());
  });

  it("saves and loads the same data back", async () => {
    const storage = fakeStorage();
    const repo = createLocalStorageRepository(storage);
    const data = createEmptyData();
    data.profile.name = "Abhinav";

    await repo.save(data);
    expect(await repo.load()).toEqual(data);
  });

  it("broken saved text: starts empty and keeps a backup", async () => {
    const storage = fakeStorage();
    storage.setItem(STORAGE_KEY, "{ this is not json");
    const repo = createLocalStorageRepository(storage);

    expect(await repo.load()).toEqual(createEmptyData());
    expect(storage.getItem(`${STORAGE_KEY}:broken-backup`)).toBe(
      "{ this is not json",
    );
  });

  it("clear removes saved data (next load starts fresh)", async () => {
    const storage = fakeStorage();
    const repo = createLocalStorageRepository(storage);
    await repo.save(createEmptyData());
    await repo.clear();
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});
