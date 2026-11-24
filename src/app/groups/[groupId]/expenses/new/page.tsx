import { Suspense } from "react";
import { AddExpenseView } from "@/components/expenses/add-expense-view";

export default function AddExpensePage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-card" />}>
      <AddExpenseView />
    </Suspense>
  );
}