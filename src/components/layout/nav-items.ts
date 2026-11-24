import {
  HandCoins,
  LayoutDashboard,
  Scale,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// One list, used by both the desktop sidebar and the mobile bottom bar
export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/balances", label: "Balances", icon: Scale },
  { href: "/settlements", label: "Settlements", icon: HandCoins },
  { href: "/settings", label: "Settings", icon: Settings },
];

// "/" is active only on the dashboard itself; other items also match their sub-pages
export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}