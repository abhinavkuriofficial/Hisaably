import { Home, Plane, Users, Shapes, type LucideIcon } from "lucide-react";
import type { GroupType } from "@/types/models";

export const groupTypeInfo: Record<GroupType, { label: string; icon: LucideIcon }> = {
  trip: { label: "Trip", icon: Plane },
  roommates: { label: "Roommates", icon: Home },
  friends: { label: "Friends", icon: Users },
  other: { label: "Other", icon: Shapes },
};