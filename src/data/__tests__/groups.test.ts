import { describe, expect, it } from "vitest";
import { createDemoData } from "../demo-data";
import { createEmptyData } from "../repository";
import {
  createGroup,
  deleteGroup,
  membersWithHistory,
  updateGroup,
} from "../actions/groups";
import { groupFormSchema } from "../../lib/validation";

describe("group form rules (Zod)", () => {
  const valid = {
    name: "  Manali Trip ",
    type: "trip",
    members: [{ name: "Abhinav" }, { name: "Rahul" }],
    youIndex: 0,
  };

  it("accepts a valid form and trims spaces", () => {
    const result = groupFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Manali Trip");
  });

  it("needs a group name", () => {
    expect(groupFormSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
  });

  it("needs at least 2 members", () => {
    const result = groupFormSchema.safeParse({ ...valid, members: [{ name: "Abhinav" }] });
    expect(result.success).toBe(false);
  });

  it("rejects the same name twice (any capital letters)", () => {
    const result = groupFormSchema.safeParse({
      ...valid,
      members: [{ name: "Rahul" }, { name: "rahul" }],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["members", 1, "name"]);
  });
});

describe("createGroup", () => {
  it("adds the group and its members, and remembers who is you", () => {
    const form = groupFormSchema.parse({
      name: "Manali Trip",
      type: "trip",
      members: [{ name: "Abhinav" }, { name: "Rahul" }, { name: "Aman" }],
      youIndex: 0,
    });
    const { data, groupId } = createGroup(createEmptyData(), form);

    expect(data.groups).toHaveLength(1);
    expect(data.groups[0].isDemo).toBe(false);
    const members = data.members.filter((m) => m.groupId === groupId);
    expect(members.map((m) => m.name)).toEqual(["Abhinav", "Rahul", "Aman"]);
    expect(data.groups[0].youMemberId).toBe(members[0].id);
  });
});

describe("updateGroup", () => {
  const demo = createDemoData();
  const flat = "demo-g-flat";
  const flatMembers = demo.members.filter((m) => m.groupId === flat);

  it("renames the group and a member, and adds a new member", () => {
    const form = groupFormSchema.parse({
      name: "Flat 202",
      type: "roommates",
      members: [
        ...flatMembers.map((m) => ({
          id: m.id,
          name: m.name === "Karan" ? "Karan S" : m.name,
        })),
        { name: "Neha" },
      ],
      youIndex: 0,
    });
    const data = updateGroup(demo, flat, form);

    expect(data.groups.find((g) => g.id === flat)?.name).toBe("Flat 202");
    const names = data.members.filter((m) => m.groupId === flat).map((m) => m.name);
    expect(names).toEqual(["Abhinav", "Karan S", "Sneha", "Neha"]);
    // ids of existing members stay the same, so old expenses still work
    expect(data.members.find((m) => m.name === "Karan S")?.id).toBe("demo-m-karan");
  });

  it("refuses to remove a member who has expenses", () => {
    const form = groupFormSchema.parse({
      name: "Flat 201",
      type: "roommates",
      members: flatMembers
        .filter((m) => m.name !== "Karan")
        .map((m) => ({ id: m.id, name: m.name })),
      youIndex: 0,
    });
    expect(() => updateGroup(demo, flat, form)).toThrow(/Karan/);
  });

  it("allows removing a member with no history", () => {
    const withNeha = updateGroup(
      demo,
      flat,
      groupFormSchema.parse({
        name: "Flat 201",
        type: "roommates",
        members: [...flatMembers.map((m) => ({ id: m.id, name: m.name })), { name: "Neha" }],
        youIndex: 0,
      }),
    );
    const neha = withNeha.members.find((m) => m.name === "Neha")!;
    expect(membersWithHistory(withNeha, flat).has(neha.id)).toBe(false);

    const without = updateGroup(
      withNeha,
      flat,
      groupFormSchema.parse({
        name: "Flat 201",
        type: "roommates",
        members: flatMembers.map((m) => ({ id: m.id, name: m.name })),
        youIndex: 0,
      }),
    );
    expect(without.members.some((m) => m.name === "Neha")).toBe(false);
  });
});

describe("deleteGroup", () => {
  it("removes the group with its members, expenses and settlements", () => {
    const data = deleteGroup(createDemoData(), "demo-g-goa");
    expect(data.groups.map((g) => g.name)).toEqual(["Flat 201"]);
    expect(data.members.every((m) => m.groupId === "demo-g-flat")).toBe(true);
    expect(data.expenses.every((e) => e.groupId === "demo-g-flat")).toBe(true);
    expect(data.settlements).toHaveLength(0);
  });
});