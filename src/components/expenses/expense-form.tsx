"use client";

import { useEffect, useEffectEvent, useState } from "react";
import type { Id, Member, SplitType } from "@/types/models";
import { expenseFormSchema, type ExpenseFormValues } from "@/lib/expense-validation";
import { toFieldErrors } from "@/lib/validation";
import { formatINR, parseRupees } from "@/lib/money";
import { splitEqually } from "@/lib/split";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/components/shared/button-styles";

// What the form starts with (empty for "add", filled for "edit")
export type ExpenseFormStart = {
  title: string;
  amount: string; // text, e.g. "250.50"
  paidBy: Id;
  date: string; // "2026-11-24"
  description: string;
  splitType: SplitType;
  included: Id[]; // ticked members for equal split
  customAmounts: Record<Id, string>; // typed shares for custom split
};

type ExpenseFormProps = {
  members: Member[];
  start: ExpenseFormStart;
  submitLabel: string;
  onSubmit: (values: ExpenseFormValues) => string | void; // return an error text to show it
  onCancel: () => void;
};

const inputClass =
  "h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-ring";

export function ExpenseForm({ members, start, submitLabel, onSubmit, onCancel }: ExpenseFormProps) {
  const [title, setTitle] = useState(start.title);
  const [amount, setAmount] = useState(start.amount);
  const [paidBy, setPaidBy] = useState(start.paidBy);
  const [date, setDate] = useState(start.date);
  const [description, setDescription] = useState(start.description);
  const [splitType, setSplitType] = useState<SplitType>(start.splitType);
  const [included, setIncluded] = useState<Id[]>(start.included);
  const [customAmounts, setCustomAmounts] = useState(start.customAmounts);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Same as the group form: start fresh next time this page opens
  const resetForm = useEffectEvent(() => {
    setTitle(start.title);
    setAmount(start.amount);
    setPaidBy(start.paidBy);
    setDate(start.date);
    setDescription(start.description);
    setSplitType(start.splitType);
    setIncluded(start.included);
    setCustomAmounts(start.customAmounts);
    setErrors({});
  });
  useEffect(() => () => resetForm(), []);

  // ---- Live preview numbers (only for showing, the real check is Zod) ----
  const amountPaise = parseRupees(amount);
  const validAmount = amountPaise !== null && amountPaise > 0 ? amountPaise : null;

  // Equal: each ticked person's share
  const equalShares = new Map<Id, number>();
  if (validAmount && included.length > 0) {
    const ordered = members.filter((m) => included.includes(m.id)).map((m) => m.id);
    for (const s of splitEqually(validAmount, ordered)) equalShares.set(s.memberId, s.amount);
  }

  // Custom: how much is assigned so far
  const assigned = members.reduce(
    (sum, m) => sum + (parseRupees(customAmounts[m.id] ?? "") ?? 0),
    0,
  );
  const remaining = (validAmount ?? 0) - assigned;

  function toggleIncluded(id: Id) {
    setIncluded((old) => (old.includes(id) ? old.filter((x) => x !== id) : [...old, id]));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const result = expenseFormSchema.safeParse({
      title,
      amount,
      paidBy,
      date,
      description,
      splitType,
      shares: members.map((m) => ({
        memberId: m.id,
        included: included.includes(m.id),
        amount: customAmounts[m.id] ?? "",
      })),
    });

    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
    const problem = onSubmit(result.data);
    if (problem) setErrors({ form: problem });
  }

  return (
    <form
      onSubmit={handleSubmit}
      // Typing anything clears old error messages, so they don't confuse
      onChange={() => {
        if (Object.keys(errors).length > 0) setErrors({});
      }}
      className="space-y-6"
      noValidate
    >
      {/* ---- Title ---- */}
      <div className="space-y-2">
        <label htmlFor="expense-title" className="text-sm font-medium">
          What was it for?
        </label>
        <input
          id="expense-title"
          className={inputClass}
          placeholder="e.g. Dinner at Fisherman's Wharf"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
        />
        {errors.title && <p className="text-sm text-negative">{errors.title}</p>}
      </div>

      {/* ---- Amount + date ---- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="expense-amount" className="text-sm font-medium">
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
              ₹
            </span>
            <input
              id="expense-amount"
              className={cn(inputClass, "pl-7")}
              placeholder="0.00"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {errors.amount && <p className="text-sm text-negative">{errors.amount}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="expense-date" className="text-sm font-medium">
            Date
          </label>
          <input
            id="expense-date"
            type="date"
            className={cn(inputClass, "scheme-dark")}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <p className="text-sm text-negative">{errors.date}</p>}
        </div>
      </div>

      {/* ---- Paid by ---- */}
      <div className="space-y-2">
        <label htmlFor="expense-paid-by" className="text-sm font-medium">
          Paid by
        </label>
        <select
          id="expense-paid-by"
          className={inputClass}
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {errors.paidBy && <p className="text-sm text-negative">{errors.paidBy}</p>}
      </div>

      {/* ---- Split ---- */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Split</p>
          <div className="flex rounded-lg border border-border p-0.5">
            {(["equal", "custom"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSplitType(t)}
                aria-pressed={splitType === t}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  splitType === t ? "bg-primary text-white" : "text-muted-foreground hover:text-white",
                )}
              >
                {t === "equal" ? "Equally" : "Custom amounts"}
              </button>
            ))}
          </div>
        </div>

        <ul className="divide-y divide-border rounded-lg border border-border">
          {members.map((m, index) => (
            <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              {splitType === "equal" ? (
                <>
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-(--primary)"
                      checked={included.includes(m.id)}
                      onChange={() => toggleIncluded(m.id)}
                    />
                    {m.name}
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {equalShares.has(m.id) ? formatINR(equalShares.get(m.id)!) : "—"}
                  </span>
                </>
              ) : (
                <>
                  <label htmlFor={`share-${m.id}`} className="text-sm">
                    {m.name}
                  </label>
                  <div className="w-32 space-y-1">
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>
                      <input
                        id={`share-${m.id}`}
                        className={cn(inputClass, "h-9 pl-7 text-right")}
                        placeholder="0"
                        inputMode="decimal"
                        value={customAmounts[m.id] ?? ""}
                        onChange={(e) =>
                          setCustomAmounts((old) => ({ ...old, [m.id]: e.target.value }))
                        }
                      />
                    </div>
                    {errors[`shares.${index}.amount`] && (
                      <p className="text-right text-xs text-negative">{errors[`shares.${index}.amount`]}</p>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {splitType === "custom" && validAmount && (
          <p className={cn("text-sm", remaining === 0 ? "text-positive" : "text-muted-foreground")}>
            {formatINR(assigned)} of {formatINR(validAmount)} assigned
            {remaining > 0 && ` · ${formatINR(remaining)} left`}
            {remaining < 0 && ` · ${formatINR(-remaining)} too much`}
            {remaining === 0 && " ✓"}
          </p>
        )}
        {errors.shares && <p className="text-sm text-negative">{errors.shares}</p>}
      </div>

      {/* ---- Note ---- */}
      <div className="space-y-2">
        <label htmlFor="expense-note" className="text-sm font-medium">
          Note <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="expense-note"
          className={inputClass}
          placeholder="Anything to remember"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />
      </div>

      {errors.form && (
        <p className="rounded-lg border border-negative/40 bg-negative/10 p-3 text-sm text-negative">
          {errors.form}
        </p>
      )}

      <div className="flex gap-3 border-t border-border pt-6">
        <button type="submit" className={buttonStyles("primary")}>
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={buttonStyles("ghost")}>
          Cancel
        </button>
      </div>
    </form>
  );
}