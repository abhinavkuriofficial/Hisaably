"use client";

import { useRouter } from "next/navigation";
import { useAppData } from "@/providers/app-data-provider";
import { PageHeader } from "@/components/layout/page-header";
import { GroupForm } from "@/components/groups/group-form";
import { createGroup } from "@/data/actions/groups";

export default function NewGroupPage() {
  const router = useRouter();
  const { data, isLoaded, updateData } = useAppData();

  if (!isLoaded) return <div className="h-96 animate-pulse rounded-xl bg-card" />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Create group" description="Name it, pick a type and add the people." />
      <div className="rounded-xl border border-border bg-card p-5 md:p-8">
        <GroupForm
          start={{
            name: "",
            type: "trip",
            // Your name from Settings goes first (Milestone 9 adds the setting)
            members: [{ name: data.profile.name }, { name: "" }],
            youIndex: 0,
          }}
          submitLabel="Create group"
          onCancel={() => router.push("/groups")}
          onSubmit={(values) => {
            const result = createGroup(data, values);
            updateData(() => result.data);
            router.push(`/groups/${result.groupId}`);
          }}
        />
      </div>
    </div>
  );
}