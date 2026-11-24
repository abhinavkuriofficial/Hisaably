"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useAppData } from "@/providers/app-data-provider";
import { PageHeader } from "@/components/layout/page-header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { buttonStyles } from "@/components/shared/button-styles";
import { deleteExpense, updateExpense } from "@/data/actions/expenses";
import { formatINR, paiseToRupeesString } from "@/lib/money";

export function EditExpenseView() {
  // This page's folder path has both [groupId] and [expenseId]
  const { groupId, expenseId } = useParams<{ groupId: string; expenseId: string }>();
  const router = useRouter();
  const { data, isLoaded, updateData } = useAppData();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isLoaded) return <div className="h-96 animate-pulse rounded-xl bg-card" />;

  const expense = data.expenses.find((e) => e.id === expenseId && e.groupId === groupId);
  if (!expense) return <p className="text-muted-foreground">Expense not found.</p>;

  const group = data.groups.find((g) => g.id === expense.groupId);
  const members = data.members.filter((m) => m.groupId === expense.groupId);
  const backToGroup = () => router.push(`/groups/${expense.groupId}`);

  // Fill the custom boxes with the saved shares, e.g. { "m_1": "250.00" }
  const customAmounts: Record<string, string> = {};
  for (const s of expense.splits) customAmounts[s.memberId] = paiseToRupeesString(s.amount);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit expense" description={group?.name} />
      <div className="rounded-xl border border-border bg-card p-5 md:p-8">
        <ExpenseForm
          key={expense.updatedAt} // after a save, start again from the saved values
          members={members}
          start={{
            title: expense.title,
            amount: paiseToRupeesString(expense.amount),
            paidBy: expense.paidBy,
            date: expense.date,
            description: expense.description ?? "",
            splitType: expense.splitType,
            included: expense.splits.map((s) => s.memberId),
            customAmounts,
          }}
          submitLabel="Save changes"
          onCancel={backToGroup}
          onSubmit={(values) => {
            try {
              const next = updateExpense(data, expense.id, values);
              updateData(() => next);
              backToGroup();
            } catch (error) {
              return error instanceof Error ? error.message : "Something went wrong";
            }
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className={buttonStyles("ghost", "mt-4 text-negative")}
      >
        <Trash2 className="size-4" /> Delete this expense
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete "${expense.title}"?`}
        description={`This removes the ${formatINR(expense.amount)} expense and updates everyone's balance. This can't be undone.`}
        confirmLabel="Delete expense"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          updateData((old) => deleteExpense(old, expense.id));
          backToGroup();
        }}
      />
    </div>
  );
}