import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function GroupsPage() {
  return (
    <>
      <PageHeader title="Groups" description="All your trips, flats and friend groups." />
      <ComingSoon milestone={5} />
    </>
  );
}