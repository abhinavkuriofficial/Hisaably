import { PageHeader } from "@/components/layout/page-header";
import { DataCheckCard } from "@/components/dashboard/data-check-card";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your groups, balances and recent activity at a glance."
      />
      <DataCheckCard />
    </>
  );
}