"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppData } from "@/providers/app-data-provider";
import { PageHeader } from "@/components/layout/page-header";
import { GroupForm } from "@/components/groups/group-form";
import { membersWithHistory, updateGroup } from "@/data/actions/groups";

export function GroupEditView() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const { data, isLoaded, updateData } = useAppData();

  if (!isLoaded) return <div className="h-96 animate-pulse rounded-xl bg-card" />;

  const group = data.groups.find((g) => g.id === groupId);
  if (!group) {
    return <p className="text-muted-foreground">Group not found.</p>;
  }

  const members = data.members.filter((m) => m.groupId === group.id);
  const youIndex = members.findIndex((m) => m.id === group.youMemberId);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit group" description={group.name} />
      <div className="rounded-xl border border-border bg-card p-5 md:p-8">
        <GroupForm
          start={{
            name: group.name,
            type: group.type,
            members: members.map((m) => ({ id: m.id, name: m.name })),
            youIndex: youIndex === -1 ? null : youIndex,
          }}
          lockedMemberIds={membersWithHistory(data, group.id)}
          submitLabel="Save changes"
          onCancel={() => router.push(`/groups/${group.id}`)}
          onSubmit={(values) => {
            try {
              const next = updateGroup(data, group.id, values);
              updateData(() => next);
              router.push(`/groups/${group.id}`);
            } catch (error) {
              return error instanceof Error ? error.message : "Something went wrong";
            }
          }}
        />
      </div>
    </div>
  );
}