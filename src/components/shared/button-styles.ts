import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";

// One place for button looks, used by <button> and <Link> alike
export function buttonStyles(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === "outline" && "border border-border hover:bg-accent",
    variant === "ghost" && "text-muted-foreground hover:bg-accent hover:text-foreground",
    variant === "danger" && "bg-destructive text-white hover:bg-destructive/90",
    className,
  );
}