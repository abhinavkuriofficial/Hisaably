"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { isActive, navItems } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="px-6 py-6">
        <Logo />
        <p className="mt-1 pl-[42px] text-xs text-muted-foreground">
          Every expense. Sorted.
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-white"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-white",
              )}
            >
              <Icon
                className={cn("size-[18px]", active && "text-brand-bright")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <p className="px-6 py-5 text-xs text-muted-foreground">
        Data is saved in this browser only.
      </p>
    </aside>
  );
}