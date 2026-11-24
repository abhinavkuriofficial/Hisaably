import type { AppData } from "../types/models";

/**
 * The "contract" for saving and loading Hisaably data.
 * Today LocalStorage follows it. Later a Supabase version can follow
 * the same contract, and the rest of the app will not need to change.
 * (Promise = the answer may come later, like from the internet.)
 */
export interface HisaablyRepository {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
  clear(): Promise<void>;
}

/** A completely empty app (no groups, no expenses). */
export function createEmptyData(): AppData {
  return {
    schemaVersion: 1,
    profile: { name: "" },
    groups: [],
    members: [],
    expenses: [],
    settlements: [],
  };
}