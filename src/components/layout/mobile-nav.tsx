"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { isActive, navItems } from "./nav-items";

// Top bar on phones (hidden on desktop)
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
      <Logo />
    </header>
  );
}

// Bottom navigation on phones (hidden on desktop)
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-secondary/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-brand-bright" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}