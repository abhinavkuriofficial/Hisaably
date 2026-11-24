import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your groups, balances and recent activity at a glance."
      />
      <ComingSoon milestone={8} />
    </>
  );
}