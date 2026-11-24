import type { AppData, Group, Id, Member } from "../../types/models";
import type { GroupFormValues } from "../../lib/validation";
import { createId } from "../../lib/ids";

// ===== Group actions =====
// Each function takes the OLD data and returns NEW data. It never changes
// the old data directly. That makes them easy to test and safe to use.

/** Members who appear in any expense or settlement (they cannot be removed). */
export function membersWithHistory(data: AppData, groupId: Id): Set<Id> {
  const ids = new Set<Id>();
  for (const e of data.expenses) {
    if (e.groupId !== groupId) continue;
    ids.add(e.paidBy);
    for (const s of e.splits) ids.add(s.memberId);
  }
  for (const s of data.settlements) {
    if (s.groupId !== groupId) continue;
    ids.add(s.fromMemberId);
    ids.add(s.toMemberId);
  }
  return ids;
}

export function createGroup(
  data: AppData,
  form: GroupFormValues,
  now: Date = new Date(),
): { data: AppData; groupId: Id } {
  const at = now.toISOString();
  const groupId = createId("g");

  const newMembers: Member[] = form.members.map((m) => ({
    id: createId("m"),
    groupId,
    name: m.name,
    createdAt: at,
  }));

  const group: Group = {
    id: groupId,
    name: form.name,
    type: form.type,
    youMemberId:
      form.youIndex === null ? undefined : newMembers[form.youIndex]?.id,
    isDemo: false,
    createdAt: at,
    updatedAt: at,
  };

  return {
    groupId,
    data: {
      ...data,
      groups: [...data.groups, group],
      members: [...data.members, ...newMembers],
    },
  };
}

export function updateGroup(
  data: AppData,
  groupId: Id,
  form: GroupFormValues,
  now: Date = new Date(),
): AppData {
  const at = now.toISOString();
  const group = data.groups.find((g) => g.id === groupId);
  if (!group) throw new Error("Group not found");

  const oldMembers = data.members.filter((m) => m.groupId === groupId);
  const keptIds = new Set(form.members.map((m) => m.id).filter(Boolean));

  // Members that were removed in the form must have no history
  const locked = membersWithHistory(data, groupId);
  for (const m of oldMembers) {
    if (!keptIds.has(m.id) && locked.has(m.id)) {
      throw new Error(
        `${m.name} has expenses or settlements in this group, so they can't be removed.`,
      );
    }
  }

  // Build the new member list: rename existing ones, create new ones
  const updatedMembers: Member[] = form.members.map((m) => {
    const existing = m.id ? oldMembers.find((o) => o.id === m.id) : undefined;
    if (existing) return { ...existing, name: m.name };
    return { id: createId("m"), groupId, name: m.name, createdAt: at };
  });

  const updatedGroup: Group = {
    ...group,
    name: form.name,
    type: form.type,
    youMemberId:
      form.youIndex === null ? undefined : updatedMembers[form.youIndex]?.id,
    updatedAt: at,
  };

  return {
    ...data,
    groups: data.groups.map((g) => (g.id === groupId ? updatedGroup : g)),
    members: [
      ...data.members.filter((m) => m.groupId !== groupId),
      ...updatedMembers,
    ],
  };
}

/** Deletes a group together with its members, expenses and settlements. */
export function deleteGroup(data: AppData, groupId: Id): AppData {
  return {
    ...data,
    groups: data.groups.filter((g) => g.id !== groupId),
    members: data.members.filter((m) => m.groupId !== groupId),
    expenses: data.expenses.filter((e) => e.groupId !== groupId),
    settlements: data.settlements.filter((s) => s.groupId !== groupId),
  };
}