import { Suspense } from "react";
import { GroupEditView } from "@/components/groups/group-edit-view";

export default function EditGroupPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-card" />}>
      <GroupEditView />
    </Suspense>
  );
}