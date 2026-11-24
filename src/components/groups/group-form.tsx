"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import type { GroupType, Id } from "@/types/models";
import {
  GROUP_TYPES,
  groupFormSchema,
  toFieldErrors,
  type GroupFormValues,
} from "@/lib/validation";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/components/shared/button-styles";
import { groupTypeInfo } from "./group-type";

// One row in the members list. "key" is only for React's list, not saved.
type MemberRow = { key: string; id?: Id; name: string };

export type GroupFormStart = {
  name: string;
  type: GroupType;
  members: { id?: Id; name: string }[];
  youIndex: number | null;
};

type GroupFormProps = {
  start: GroupFormStart;
  lockedMemberIds?: Set<Id>; // members with history: can rename, can't remove
  submitLabel: string;
  onSubmit: (values: GroupFormValues) => string | void; // return an error text to show it
  onCancel: () => void;
};

let rowCounter = 0;
const newKey = () => `row-${++rowCounter}`;
const toRows = (start: GroupFormStart): MemberRow[] =>
  start.members.map((m) => ({ ...m, key: newKey() }));

const inputClass =
  "h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-ring";

export function GroupForm({
  start,
  lockedMemberIds = new Set(),
  submitLabel,
  onSubmit,
  onCancel,
}: GroupFormProps) {
  const [name, setName] = useState(start.name);
  const [type, setType] = useState<GroupType>(start.type);
  const [rows, setRows] = useState<MemberRow[]>(() => toRows(start));
  const [youKey, setYouKey] = useState<string | null>(() =>
    start.youIndex === null ? null : rows[start.youIndex]?.key ?? null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Next.js keeps recently visited pages alive in the background, so typed
  // text would still be there next time. When the user leaves this page,
  // we reset the form so it always opens fresh.
  const resetForm = useEffectEvent(() => {
    const freshRows = toRows(start);
    setName(start.name);
    setType(start.type);
    setRows(freshRows);
    setYouKey(start.youIndex === null ? null : freshRows[start.youIndex]?.key ?? null);
    setErrors({});
  });
  useEffect(() => () => resetForm(), []);

  function updateRow(key: string, newName: string) {
    setRows((old) => old.map((r) => (r.key === key ? { ...r, name: newName } : r)));
  }

  function removeRow(key: string) {
    setRows((old) => old.filter((r) => r.key !== key));
    if (youKey === key) setYouKey(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // stop the browser from reloading the page

    const youIndex = youKey ? rows.findIndex((r) => r.key === youKey) : -1;
    const result = groupFormSchema.safeParse({
      name,
      type,
      members: rows.map((r) => ({ id: r.id, name: r.name })),
      youIndex: youIndex === -1 ? null : youIndex,
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
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* ---- Group name ---- */}
      <div className="space-y-2">
        <label htmlFor="group-name" className="text-sm font-medium">
          Group name
        </label>
        <input
          id="group-name"
          className={inputClass}
          placeholder="e.g. Goa Trip"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
        {errors.name && <p className="text-sm text-negative">{errors.name}</p>}
      </div>

      {/* ---- Group type ---- */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Type</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GROUP_TYPES.map((t) => {
            const { label, icon: Icon } = groupTypeInfo[t];
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={active}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-white"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className={cn("size-4", active && "text-brand-bright")} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Members ---- */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">Members</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tick &quot;Me&quot; next to your own name, so the dashboard can show what you owe.
          </p>
        </div>

        {rows.map((row, index) => {
          const locked = row.id ? lockedMemberIds.has(row.id) : false;
          const error = errors[`members.${index}.name`];
          return (
            <div key={row.key} className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  aria-label={`Member ${index + 1} name`}
                  className={inputClass}
                  placeholder={`Member ${index + 1}`}
                  value={row.name}
                  onChange={(e) => updateRow(row.key, e.target.value)}
                  maxLength={30}
                />
                <label className="flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-muted-foreground has-checked:border-primary has-checked:text-white">
                  <input
                    type="radio"
                    name="you"
                    className="accent-(--primary)"
                    checked={youKey === row.key}
                    onChange={() => setYouKey(row.key)}
                  />
                  Me
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  disabled={locked}
                  title={locked ? "Has expenses, can't be removed" : "Remove member"}
                  aria-label="Remove member"
                  className={buttonStyles("ghost", "size-10 shrink-0 px-0")}
                >
                  <X className="size-4" />
                </button>
              </div>
              {error && <p className="text-sm text-negative">{error}</p>}
            </div>
          );
        })}

        {errors.members && <p className="text-sm text-negative">{errors.members}</p>}

        <button
          type="button"
          onClick={() => setRows((old) => [...old, { key: newKey(), name: "" }])}
          className={buttonStyles("outline")}
        >
          <Plus className="size-4" /> Add member
        </button>
      </div>

      {errors.form && (
        <p className="rounded-lg border border-negative/40 bg-negative/10 p-3 text-sm text-negative">
          {errors.form}
        </p>
      )}

      {/* ---- Buttons ---- */}
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