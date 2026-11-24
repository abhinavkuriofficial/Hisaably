import { z } from "zod";
import type { AppData } from "../types/models";
import { createDemoData } from "./demo-data";

// ===== Backup (export / import) and demo data helpers =====

// What a valid Hisaably backup must look like. Zod checks every field,
// so a wrong or broken file can never mess up the app.
const id = z.string().min(1);
const paise = z.number().int().nonnegative();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const appDataSchema = z.object({
  schemaVersion: z.literal(1),
  profile: z.object({ name: z.string().max(30) }),
  groups: z.array(
    z.object({
      id,
      name: z.string().min(1),
      type: z.enum(["trip", "roommates", "friends", "other"]),
      youMemberId: id.optional(),
      isDemo: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
  members: z.array(z.object({ id, groupId: id, name: z.string().min(1), createdAt: z.string() })),
  expenses: z.array(
    z.object({
      id,
      groupId: id,
      title: z.string().min(1),
      description: z.string().optional(),
      amount: paise,
      paidBy: id,
      date: isoDate,
      splitType: z.enum(["equal", "custom"]),
      splits: z.array(z.object({ memberId: id, amount: paise })).min(1),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
  settlements: z.array(
    z.object({
      id,
      groupId: id,
      fromMemberId: id,
      toMemberId: id,
      amount: paise,
      date: isoDate,
      note: z.string().optional(),
      createdAt: z.string(),
    }),
  ),
});

/** The file we download: a small label + the data. */
export function exportBackup(data: AppData, now: Date = new Date()): string {
  const file = { app: "hisaably", exportedAt: now.toISOString(), data };
  return JSON.stringify(file, null, 2); // null, 2 = nicely spaced, easy to read
}

export function backupFileName(now: Date = new Date()): string {
  return `hisaably-backup-${now.toISOString().slice(0, 10)}.json`;
}

export type ImportResult = { ok: true; data: AppData } | { ok: false; error: string };

/** Reads a backup file's text. Never throws: returns ok or an error message. */
export function importBackup(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file is not a Hisaably backup (it is not valid JSON)." };
  }

  const file = parsed as { app?: unknown; data?: unknown };
  if (typeof parsed !== "object" || parsed === null || file.app !== "hisaably") {
    return { ok: false, error: "This file is not a Hisaably backup." };
  }

  const result = appDataSchema.safeParse(file.data);
  if (!result.success) {
    return { ok: false, error: "This backup is damaged or from a different version, so it can't be loaded." };
  }

  // Extra money check: every expense's shares must add up to its amount
  const data = result.data as AppData;
  for (const e of data.expenses) {
    const total = e.splits.reduce((sum, s) => sum + s.amount, 0);
    if (total !== e.amount) {
      return { ok: false, error: `The expense "${e.title}" in this backup doesn't add up, so it can't be loaded.` };
    }
  }
  return { ok: true, data };
}

/** Removes every demo group with its members, expenses and settlements. */
export function removeDemoData(data: AppData): AppData {
  const demoIds = new Set(data.groups.filter((g) => g.isDemo).map((g) => g.id));
  return {
    ...data,
    groups: data.groups.filter((g) => !demoIds.has(g.id)),
    members: data.members.filter((m) => !demoIds.has(m.groupId)),
    expenses: data.expenses.filter((e) => !demoIds.has(e.groupId)),
    settlements: data.settlements.filter((s) => !demoIds.has(s.groupId)),
  };
}

/** Adds the demo groups next to your own groups (your data stays). */
export function addDemoData(data: AppData): AppData {
  const demo = createDemoData();
  const clean = removeDemoData(data); // never add them twice
  return {
    ...clean,
    groups: [...clean.groups, ...demo.groups],
    members: [...clean.members, ...demo.members],
    expenses: [...clean.expenses, ...demo.expenses],
    settlements: [...clean.settlements, ...demo.settlements],
  };
}

/** Saves your name (trimmed, at most 30 characters). */
export function setProfileName(data: AppData, name: string): AppData {
  return { ...data, profile: { ...data.profile, name: name.trim().slice(0, 30) } };
}