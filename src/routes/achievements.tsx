import { createFileRoute } from "@tanstack/react-router";
import { Lock, Medal } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { useBizCraft } from "@/lib/bizcraft/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — BizCraft" },
      {
        name: "description",
        content: "View the BizCraft badges you have unlocked and the ones still locked.",
      },
      { property: "og:title", content: "Achievements — BizCraft" },
      { property: "og:description", content: "Badges earned from stories and quiz challenges." },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { db, currentUser } = useBizCraft();
  const earned = new Set(
    db.student_badges.filter((b) => b.student_id === currentUser?.id).map((b) => b.badge_id),
  );

  return (
    <AppShell
      role="student"
      title="Achievements"
      subtitle={`${earned.size} of ${db.badges.length} badges unlocked`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {db.badges.map((badge) => {
          const unlocked = earned.has(badge.id);
          return (
            <div
              key={badge.id}
              className={cn(
                "rounded-xl border p-5 shadow-card",
                unlocked ? "border-border bg-card-story" : "border-dashed border-border bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "grid size-12 place-items-center rounded-full",
                  unlocked ? "bg-orange text-orange-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {unlocked ? <Medal className="size-6" /> : <Lock className="size-5" />}
              </span>
              <h2 className="mt-3 font-display text-base font-semibold">{badge.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{badge.description}</p>
              <p
                className={cn(
                  "mt-3 text-xs font-medium",
                  unlocked ? "text-success" : "text-muted-foreground",
                )}
              >
                {unlocked ? "Unlocked" : "Locked"}
              </p>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
