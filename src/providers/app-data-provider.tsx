"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AppData } from "@/types/models";
import { createDemoData } from "@/data/demo-data";
import { createEmptyData, type HisaablyRepository } from "@/data/repository";
import { createLocalStorageRepository } from "@/data/local-storage-repository";

type AppDataContextValue = {
  data: AppData;
  isLoaded: boolean; // false until LocalStorage has been read
  /** Change the data. Pass a function that gets the old data and returns new data. */
  updateData: (change: (old: AppData) => AppData) => void;
  resetToDemo: () => void;
  clearAll: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [repository, setRepository] = useState<HisaablyRepository | null>(null);
  const [data, setData] = useState<AppData>(createEmptyData);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. On first open in the browser: read saved data
  useEffect(() => {
    const repo = createLocalStorageRepository(window.localStorage);
    repo.load().then((saved) => {
      setRepository(repo);
      setData(saved);
      setIsLoaded(true);
    });
  }, []);

  // 2. Every time data changes (after loading): save it
  useEffect(() => {
    if (repository && isLoaded) {
      repository.save(data);
    }
  }, [repository, isLoaded, data]);

  const updateData = useCallback(
    (change: (old: AppData) => AppData) => setData((old) => change(old)),
    [],
  );
  const resetToDemo = useCallback(() => setData(createDemoData()), []);
  const clearAll = useCallback(() => setData(createEmptyData()), []);

  const value = useMemo(
    () => ({ data, isLoaded, updateData, resetToDemo, clearAll }),
    [data, isLoaded, updateData, resetToDemo, clearAll],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

/** Use this in any component to read or change Hisaably data. */
export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }
  return context;
}