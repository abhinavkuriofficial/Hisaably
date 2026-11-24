import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Your name, backup and data management." />
      <ComingSoon milestone={9} />
    </>
  );
}