import { z } from "zod";

// ===== Form rules (Zod) =====
// Zod checks what the user typed and gives friendly error messages.

export const GROUP_TYPES = ["trip", "roommates", "friends", "other"] as const;

export const groupFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Give your group a name")
      .max(50, "Keep the name under 50 characters"),
    type: z.enum(GROUP_TYPES),
    members: z
      .array(
        z.object({
          id: z.string().optional(), // existing members have an id
          name: z
            .string()
            .trim()
            .min(1, "Enter a name")
            .max(30, "Keep names under 30 characters"),
        }),
      )
      .min(2, "Add at least 2 members"),
    youIndex: z.number().int().nullable(), // which member is "you" (or nobody)
  })
  .superRefine((form, ctx) => {
    // No two members with the same name (Rahul and rahul count as same)
    const seen = new Set<string>();
    form.members.forEach((member, index) => {
      const key = member.name.toLowerCase();
      if (key && seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: "This name is already in the group",
          path: ["members", index, "name"],
        });
      }
      seen.add(key);
    });

    if (form.youIndex !== null && !form.members[form.youIndex]) {
      ctx.addIssue({
        code: "custom",
        message: "Pick which member is you",
        path: ["youIndex"],
      });
    }
  });

export type GroupFormInput = z.input<typeof groupFormSchema>;
export type GroupFormValues = z.output<typeof groupFormSchema>;

/** Turns Zod's error list into { "name": "Give your group a name", "members.1.name": "..." } */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}