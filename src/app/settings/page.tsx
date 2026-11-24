"use client";

import { useAppData } from "@/providers/app-data-provider";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { BackupSettings } from "@/components/settings/backup-settings";
import { DataSettings } from "@/components/settings/data-settings";

export default function SettingsPage() {
  const { isLoaded } = useAppData();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Your name, backup and data management." />
      {!isLoaded ? (
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      ) : (
        <div className="space-y-6">
          <ProfileSettings />
          <BackupSettings />
          <DataSettings />
          <p className="text-xs text-muted-foreground">
            Hisaably keeps everything in this browser only. No account, no server, nothing is sent anywhere.
          </p>
        </div>
      )}
    </div>
  );
}