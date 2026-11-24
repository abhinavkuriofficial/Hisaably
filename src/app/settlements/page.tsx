import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function SettlementsPage() {
  return (
    <>
      <PageHeader title="Settlements" description="Suggested payments and settlement history." />
      <ComingSoon milestone={7} />
    </>
  );
}