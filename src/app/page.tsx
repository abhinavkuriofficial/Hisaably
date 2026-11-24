"use client";

import Link from "next/link";
import { ArrowRight, Info, Wallet } from "lucide-react";
import { useAppData } from "@/providers/app-data-provider";
import { getDashboardStats, getRecentActivity } from "@/lib/dashboard";
import { formatINR } from "@/lib/money";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonStyles } from "@/components/shared/button-styles";
import { GroupCard } from "@/components/groups/group-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  const { data, isLoaded, resetToDemo } = useAppData();

  if (!isLoaded) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="h-96 animate-pulse rounded-xl bg-card" />
      </>
    );
  }

  const name = data.profile.name.trim();
  const title = name ? `Hi, ${name} 👋` : "Hi there 👋";

  // ---- First visit with no data at all ----
  if (data.groups.length === 0) {
    return (
      <>
        <PageHeader title={title} description="Every expense. Sorted." />
        <EmptyState
          icon={Wallet}
          title="Start your first group"
          description="Make a group for a trip, your flat or friends, add who paid for what, and Hisaably will work out who owes whom."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/groups/new" className={buttonStyles("primary")}>
                Create a group
              </Link>
              <button onClick={resetToDemo} className={buttonStyles("outline")}>
                Try demo data
              </button>
            </div>
          }
        />
      </>
    );
  }

  const stats = getDashboardStats(data);
  const activity = getRecentActivity(data, 8);
  const hasDemo = data.groups.some((g) => g.isDemo);

  return (
    <>
      <PageHeader title={title} description="Your groups, balances and recent activity at a glance." />

      {hasDemo && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-bright" />
          <p>
            Groups marked <span className="font-medium text-white">DEMO</span> are sample data so you
            can try things out. You can remove them any time from Settings.
          </p>
        </div>
      )}

      {/* ---- Your numbers ---- */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard label="You get back" value={formatINR(stats.youGet)} tone="positive" />
        <StatCard label="You owe" value={formatINR(stats.youOwe)} tone="negative" />
        <StatCard
          label="Overall"
          value={formatINR(Math.abs(stats.net))}
          tone={stats.net > 0 ? "positive" : stats.net < 0 ? "negative" : "default"}
          hint={stats.net > 0 ? "You are owed overall" : stats.net < 0 ? "You owe overall" : "All settled up"}
        />
        <StatCard
          label="Your share this month"
          value={formatINR(stats.yourShareThisMonth)}
          hint={`Across ${stats.groupCount} ${stats.groupCount === 1 ? "group" : "groups"}`}
        />
      </div>

      {/* ---- Shortcuts ---- */}
      <div className="mt-6">
        <QuickActions groups={data.groups} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* ---- Groups ---- */}
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your groups</h2>
            <Link href="/groups" className="flex items-center gap-1 text-sm text-brand-bright hover:underline">
              See all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.groups.slice(0, 4).map((g) => (
              <GroupCard key={g.id} group={g} data={data} />
            ))}
          </div>
        </section>

        {/* ---- Recent activity ---- */}
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Recent activity</h2>
          <div className="rounded-xl border border-border bg-card">
            <RecentActivity items={activity} />
          </div>
        </section>
      </div>
    </>
  );
}