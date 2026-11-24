import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
        H
      </span>
      <span className="text-lg font-semibold tracking-tight">Hisaably</span>
    </Link>
  );
}