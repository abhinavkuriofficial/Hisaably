import { describe, expect, it } from "vitest";
import { createDemoData } from "../demo-data";
import { createEmptyData } from "../repository";
import { createGroup } from "../actions/groups";
import {
  addDemoData,
  backupFileName,
  exportBackup,
  importBackup,
  removeDemoData,
  setProfileName,
} from "../backup";

describe("demo data", () => {
  it("does not use anyone's real name", () => {
    const demo = createDemoData();
    expect(demo.profile.name).toBe("");
    const you = demo.members.filter((m) => demo.groups.some((g) => g.youMemberId === m.id));
    expect(you.map((m) => m.name)).toEqual(["You", "You"]);
  });

  it("can be removed and added back without touching your own groups", () => {
    const { data: withMine } = createGroup(createDemoData(), {
      name: "Room 209",
      type: "roommates",
      members: [{ name: "Abhinav" }, { name: "Vedant" }],
      youIndex: 0,
    });

    const noDemo = removeDemoData(withMine);
    expect(noDemo.groups.map((g) => g.name)).toEqual(["Room 209"]);
    expect(noDemo.members).toHaveLength(2);
    expect(noDemo.expenses).toHaveLength(0);
    expect(noDemo.settlements).toHaveLength(0);

    const again = addDemoData(addDemoData(noDemo)); // twice, still only one copy
    expect(again.groups.map((g) => g.name)).toEqual(["Room 209", "Goa Trip", "Flat 201"]);
  });
});

describe("backup", () => {
  it("export then import gives back exactly the same data", () => {
    const data = setProfileName(createDemoData(), "Abhinav");
    const result = importBackup(exportBackup(data));
    expect(result).toEqual({ ok: true, data });
  });

  it("names the file with the date", () => {
    expect(backupFileName(new Date("2026-11-24T10:00:00Z"))).toBe("hisaably-backup-2026-11-24.json");
  });

  it("refuses files that are not Hisaably backups", () => {
    expect(importBackup("hello")).toMatchObject({ ok: false });
    expect(importBackup(JSON.stringify({ some: "thing" }))).toEqual({
      ok: false,
      error: "This file is not a Hisaably backup.",
    });
    const broken = JSON.stringify({ app: "hisaably", data: { schemaVersion: 1 } });
    expect(importBackup(broken)).toMatchObject({ ok: false });
  });

  it("refuses an expense whose shares don't add up", () => {
    const data = createDemoData();
    data.expenses[0].amount += 1; // one paisa off
    const result = importBackup(exportBackup(data));
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.error).toContain("Beach shack dinner");
  });

  it("imports an empty app too", () => {
    expect(importBackup(exportBackup(createEmptyData()))).toMatchObject({ ok: true });
  });
});

describe("your name", () => {
  it("trims spaces and keeps it short", () => {
    expect(setProfileName(createEmptyData(), "  Abhinav  ").profile.name).toBe("Abhinav");
    expect(setProfileName(createEmptyData(), "x".repeat(50)).profile.name).toHaveLength(30);
  });
});