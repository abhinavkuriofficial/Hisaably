"use client";

import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { useAppData } from "@/providers/app-data-provider";
import { addDemoData, removeDemoData } from "@/data/backup";
import { createEmptyData } from "@/data/repository";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { buttonStyles } from "@/components/shared/button-styles";
import { SettingsSection } from "./settings-section";

type Pending = "remove-demo" | "clear-all" | null;

export function DataSettings() {
  const { data, updateData } = useAppData();
  const [pending, setPending] = useState<Pending>(null);
  const demoCount = data.groups.filter((g) => g.isDemo).length;

  return (
    <>
      <SettingsSection
        title="Demo data"
        description={
          demoCount > 0
            ? `You have ${demoCount} demo groups (marked DEMO). Remove them when you're ready to use only your own groups.`
            : "Want to see how Hisaably works? Add the sample groups. Your own groups stay as they are."
        }
      >
        {demoCount > 0 ? (
          <button onClick={() => setPending("remove-demo")} className={buttonStyles("outline")}>
            <Trash2 className="size-4" /> Remove demo data
          </button>
        ) : (
          <button onClick={() => updateData(addDemoData)} className={buttonStyles("outline")}>
            <Sparkles className="size-4" /> Add demo data
          </button>
        )}
      </SettingsSection>

      <section className="rounded-xl border border-negative/40 p-5 md:p-6">
        <h2 className="font-semibold text-negative">Delete everything</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Removes all groups, expenses, payments and your name from this browser. Export a backup first if you
          might need it.
        </p>
        <button onClick={() => setPending("clear-all")} className={buttonStyles("danger", "mt-5")}>
          <Trash2 className="size-4" /> Delete all data
        </button>
      </section>

      <ConfirmDialog
        open={pending === "remove-demo"}
        title="Remove demo data?"
        description={`The ${demoCount} demo groups and their expenses will be removed. Your own groups stay.`}
        confirmLabel="Remove demo data"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          updateData(removeDemoData);
          setPending(null);
        }}
      />
      <ConfirmDialog
        open={pending === "clear-all"}
        title="Delete all data?"
        description="Every group, expense and payment in this browser will be deleted. This can't be undone."
        confirmLabel="Delete everything"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          updateData(() => createEmptyData());
          setPending(null);
        }}
      />
    </>
  );
}