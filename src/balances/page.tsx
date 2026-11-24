import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function BalancesPage() {
  return (
    <>
      <PageHeader title="Balances" description="Who owes money and who gets money back." />
      <ComingSoon milestone={7} />
    </>
  );
}