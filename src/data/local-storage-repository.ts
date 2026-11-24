import type { AppData } from "../types/models";
import { createDemoData } from "./demo-data";
import { createEmptyData, type HisaablyRepository } from "./repository";

export const STORAGE_KEY = "hisaably:data";

// The small part of the browser's localStorage that we use.
// (Tests pass a fake one, so they can run without a browser.)
type SimpleStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Quick check that saved data has the shape we expect. */
function looksLikeAppData(value: unknown): value is AppData {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return (
    data.schemaVersion === 1 &&
    Array.isArray(data.groups) &&
    Array.isArray(data.members) &&
    Array.isArray(data.expenses) &&
    Array.isArray(data.settlements)
  );
}

export function createLocalStorageRepository(
  storage: SimpleStorage,
): HisaablyRepository {
  return {
    async load() {
      const text = storage.getItem(STORAGE_KEY);

      // First visit: nothing saved yet, so start with demo data
      if (text === null) return createDemoData();

      try {
        const parsed: unknown = JSON.parse(text);
        if (looksLikeAppData(parsed)) return parsed;
      } catch {
        // broken text, handled below
      }

      // Saved data is broken: keep a copy so nothing is lost, start empty
      storage.setItem(`${STORAGE_KEY}:broken-backup`, text);
      return createEmptyData();
    },

    async save(data) {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    async clear() {
      storage.removeItem(STORAGE_KEY);
    },
  };
}