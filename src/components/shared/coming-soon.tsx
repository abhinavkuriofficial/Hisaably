import { Hammer } from "lucide-react";

// Temporary card for pages we will build in later milestones
export function ComingSoon({ milestone }: { milestone: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-card">
        <Hammer className="size-5 text-brand-bright" />
      </span>
      <p className="mt-4 font-medium">Coming soon</p>
      <p className="mt-1 text-sm text-muted-foreground">
        We build this screen in Milestone {milestone}.
      </p>
    </div>
  );
}