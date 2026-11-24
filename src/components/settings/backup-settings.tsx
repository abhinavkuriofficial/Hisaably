"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import type { AppData } from "@/types/models";
import { useAppData } from "@/providers/app-data-provider";
import { backupFileName, exportBackup, importBackup } from "@/data/backup";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { buttonStyles } from "@/components/shared/button-styles";
import { SettingsSection } from "./settings-section";

export function BackupSettings() {
  const { data, updateData } = useAppData();
  const fileInput = useRef<HTMLInputElement>(null); // the hidden file picker
  const [pending, setPending] = useState<AppData | null>(null); // backup waiting for "yes"
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Download: put the text in a "Blob" (a file in memory) and click a hidden link
  function handleExport() {
    const blob = new Blob([exportBackup(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = backupFileName();
    link.click();
    URL.revokeObjectURL(url);
    setMessage({ ok: true, text: "Backup downloaded. Keep the file somewhere safe." });
  }

  // Upload: read the chosen file's text, check it, then ask before replacing
  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // so the same file can be picked again later
    if (!file) return;

    const result = importBackup(await file.text());
    if (!result.ok) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    setMessage(null);
    setPending(result.data);
  }

  return (
    <SettingsSection
      title="Backup"
      description="Your data lives only in this browser. Download a backup file to keep it safe, or to move it to another phone or laptop."
    >
      <div className="flex flex-wrap gap-2">
        <button onClick={handleExport} className={buttonStyles("primary")}>
          <Download className="size-4" /> Export backup
        </button>
        <button onClick={() => fileInput.current?.click()} className={buttonStyles("outline")}>
          <Upload className="size-4" /> Import backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {message && (
        <p className={`mt-3 text-sm ${message.ok ? "text-positive" : "text-negative"}`}>{message.text}</p>
      )}

      <ConfirmDialog
        open={pending !== null}
        title="Replace your data with this backup?"
        description={
          pending
            ? `The backup has ${pending.groups.length} groups and ${pending.expenses.length} expenses. Everything currently in this browser will be replaced.`
            : ""
        }
        confirmLabel="Replace my data"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) updateData(() => pending);
          setPending(null);
          setMessage({ ok: true, text: "Backup loaded." });
        }}
      />
    </SettingsSection>
  );
}