"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useAppData } from "@/providers/app-data-provider";
import { setProfileName } from "@/data/backup";
import { buttonStyles } from "@/components/shared/button-styles";
import { SettingsSection } from "./settings-section";

export function ProfileSettings() {
  const { data, updateData } = useAppData();
  const [name, setName] = useState(data.profile.name);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateData((old) => setProfileName(old, name));
    setName(name.trim());
    setSaved(true);
  }

  return (
    <SettingsSection
      title="Your name"
      description="Shown on the dashboard, and filled in for you when you create a new group."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Your name"
          className="h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-ring sm:max-w-xs"
          placeholder="e.g. Abhinav"
          value={name}
          maxLength={30}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
        />
        <button type="submit" className={buttonStyles("primary")}>
          Save name
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-positive">
            <Check className="size-4" /> Saved
          </span>
        )}
      </form>
    </SettingsSection>
  );
}