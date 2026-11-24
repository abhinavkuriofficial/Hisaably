import { z } from "zod";
import type { ExpenseSplit } from "../types/models";
import { formatINR, parseRupees } from "./money";
import { checkCustomSplit, splitEqually } from "./split";

// ===== Expense form rules (Zod) =====
// The form sends TEXT (what the user typed). Zod checks it and turns it into
// clean values: amounts in paise and exact shares that add up to the bill.

const MAX_AMOUNT = 1_00_00_000_00; // ₹1 crore in paise

export const expenseFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "What was this expense for?")
      .max(60, "Keep the title under 60 characters"),
    amount: z.string().trim().min(1, "Enter the amount"),
    paidBy: z.string().min(1, "Choose who paid"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    description: z.string().trim().max(200, "Keep the note under 200 characters"),
    splitType: z.enum(["equal", "custom"]),
    // One row per group member
    shares: z.array(
      z.object({
        memberId: z.string(),
        included: z.boolean(), // used by equal split
        amount: z.string(), // used by custom split, e.g. "250.50"
      }),
    ),
  })
  .transform((form, ctx) => {
    // ---- 1. Amount text -> paise ----
    const amount = parseRupees(form.amount);
    if (amount === null) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Enter a valid amount, like 250 or 250.50" });
      return z.NEVER;
    }
    if (amount <= 0) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Amount must be more than ₹0" });
      return z.NEVER;
    }
    if (amount > MAX_AMOUNT) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Amount must be under ₹1 crore" });
      return z.NEVER;
    }

    // ---- 2. Work out each person's share ----
    let splits: ExpenseSplit[];

    if (form.splitType === "equal") {
      const ids = form.shares.filter((s) => s.included).map((s) => s.memberId);
      if (ids.length === 0) {
        ctx.addIssue({ code: "custom", path: ["shares"], message: "Pick at least one person to split with" });
        return z.NEVER;
      }
      splits = splitEqually(amount, ids);
    } else {
      splits = [];
      let badShare = false;
      form.shares.forEach((s, index) => {
        const text = s.amount.trim();
        const share = text === "" ? 0 : parseRupees(text); // empty box = ₹0
        if (share === null) {
          ctx.addIssue({ code: "custom", path: ["shares", index, "amount"], message: "Not a valid amount" });
          badShare = true;
        } else if (share > 0) {
          splits.push({ memberId: s.memberId, amount: share });
        }
      });
      if (badShare) return z.NEVER;

      const check = checkCustomSplit(amount, splits);
      if (!check.isValid) {
        const message =
          check.assigned === 0
            ? "Enter at least one person's share"
            : check.remaining > 0
              ? `Shares add up to ${formatINR(check.assigned)}. ${formatINR(check.remaining)} is still left to assign.`
              : `Shares add up to ${formatINR(check.assigned)}. That is ${formatINR(-check.remaining)} more than the bill.`;
        ctx.addIssue({ code: "custom", path: ["shares"], message });
        return z.NEVER;
      }
    }

    return {
      title: form.title,
      amount,
      paidBy: form.paidBy,
      date: form.date,
      description: form.description || undefined,
      splitType: form.splitType,
      splits,
    };
  });

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;
export type ExpenseFormValues = z.output<typeof expenseFormSchema>;