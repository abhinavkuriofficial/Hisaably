"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppData } from "@/providers/app-data-provider";
import { PageHeader } from "@/components/layout/page-header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { addExpense } from "@/data/actions/expenses";
import { todayISODate } from "@/lib/dates";

export function AddExpenseView() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const { data, isLoaded, updateData } = useAppData();

  if (!isLoaded) return <div className="h-96 animate-pulse rounded-xl bg-card" />;

  const group = data.groups.find((g) => g.id === groupId);
  if (!group) return <p className="text-muted-foreground">Group not found.</p>;

  const members = data.members.filter((m) => m.groupId === group.id);
  const backToGroup = () => router.push(`/groups/${group.id}`);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Add expense" description={group.name} />
      <div className="rounded-xl border border-border bg-card p-5 md:p-8">
        <ExpenseForm
          members={members}
          start={{
            title: "",
            amount: "",
            paidBy: group.youMemberId ?? members[0]?.id ?? "", // "you" paid, by default
            date: todayISODate(),
            description: "",
            splitType: "equal",
            included: members.map((m) => m.id), // everyone, by default
            customAmounts: {},
          }}
          submitLabel="Add expense"
          onCancel={backToGroup}
          onSubmit={(values) => {
            try {
              const result = addExpense(data, group.id, values);
              updateData(() => result.data);
              backToGroup();
            } catch (error) {
              return error instanceof Error ? error.message : "Something went wrong";
            }
          }}
        />
      </div>
    </div>
  );
}