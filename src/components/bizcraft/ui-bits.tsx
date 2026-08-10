import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { levelForXp, levelProgress, nextLevelForXp } from "@/lib/bizcraft/data";

export function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "purple" | "orange" | "green";
}) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    purple: "bg-primary-soft text-primary",
    orange: "bg-orange-soft text-orange",
    green: "bg-success-soft text-success",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        {icon && (
          <span className={cn("grid size-10 place-items-center rounded-lg", tones[tone])}>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="font-display text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  tone = "purple",
}: {
  value: number;
  className?: string;
  tone?: "purple" | "orange" | "green";
}) {
  const colors = { purple: "bg-primary", orange: "bg-orange", green: "bg-success" } as const;
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", colors[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function LevelPanel({ xp }: { xp: number }) {
  const level = levelForXp(xp);
  const next = nextLevelForXp(xp);
  const pct = levelProgress(xp);
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current Entrepreneur Level
          </p>
          <p className="font-display text-xl font-semibold">
            Level {level.level} — {level.title}
          </p>
        </div>
        <p className="text-sm font-semibold text-orange">{xp} XP</p>
      </div>
      <ProgressBar value={pct} className="mt-4" />
      <p className="mt-2 text-xs text-muted-foreground">
        {next
          ? `${next.min_xp - xp} XP more to reach Level ${next.level} — ${next.title}`
          : "Maximum level reached. Outstanding work!"}
      </p>
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
