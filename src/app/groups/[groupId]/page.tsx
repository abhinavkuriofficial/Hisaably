import { Suspense } from "react";
import { GroupDetailsView } from "@/components/groups/group-details-view";

// The group id comes from the URL, which Next.js only knows when someone
// opens the page. <Suspense> shows a placeholder until then.
export default function GroupDetailsPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-card" />}>
      <GroupDetailsView />
    </Suspense>
  );
}