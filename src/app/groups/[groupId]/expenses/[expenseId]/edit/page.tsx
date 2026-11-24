import { Suspense } from "react";
import { EditExpenseView } from "@/components/expenses/edit-expense-view";

export default function EditExpensePage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-card" />}>
      <EditExpenseView />
    </Suspense>
  );
}