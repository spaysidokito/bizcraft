import { createFileRoute } from "@tanstack/react-router";
import { Lock, Medal, Star } from "lucide-react";
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

  const unlockedBadges = db.badges.filter((b) => earned.has(b.id));
  const lockedBadges = db.badges.filter((b) => !earned.has(b.id));

  return (
    <AppShell
      role="student"
      title="Achievements"
      subtitle={`${earned.size} of ${db.badges.length} badges unlocked`}
    >
      <div className="space-y-6">

        {/* ── Hero banner ──────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-7 sm:px-10 shadow-card">
          <span className="pointer-events-none absolute -right-8 -top-8 size-44 rounded-full bg-white/5" />
          <span className="pointer-events-none absolute -bottom-10 right-12 size-28 rounded-full bg-white/5" />
          <span className="pointer-events-none absolute right-28 top-4 size-12 rounded-full bg-orange/20" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10">
                <Medal className="size-6 text-white" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-white">Achievements</h2>
                <p className="mt-0.5 text-sm text-white/70">
                  Complete stories and quizzes to unlock badges
                </p>
              </div>
            </div>

            {/* Badge count pill */}
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              <Star className="size-4 text-orange" />
              {earned.size} / {db.badges.length} Unlocked
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative z-10 mt-5">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>Overall badge progress</span>
              <span>{db.badges.length > 0 ? Math.round((earned.size / db.badges.length) * 100) : 0}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-orange transition-all duration-500"
                style={{
                  width: `${db.badges.length > 0 ? (earned.size / db.badges.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Unlocked badges ──────────────────────────────────── */}
        {unlockedBadges.length > 0 && (
          <section>
            <h3 className="mb-3 font-display text-sm font-semibold text-foreground">
              🏆 Earned Badges
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card-story p-5 shadow-card"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-orange text-orange-foreground shadow-md">
                    <Medal className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-semibold">{badge.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{badge.description}</p>
                    <span className="mt-2 inline-block rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                      ✓ Unlocked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Locked badges ────────────────────────────────────── */}
        {lockedBadges.length > 0 && (
          <section>
            <h3 className="mb-3 font-display text-sm font-semibold text-muted-foreground">
              🔒 Locked Badges
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start gap-4 rounded-xl border border-dashed border-border bg-muted/30 p-5"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                    <Lock className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-semibold text-muted-foreground">
                      {badge.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{badge.description}</p>
                    <span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      Locked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {db.badges.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No badges configured yet. Ask your administrator to add some!
          </p>
        )}

      </div>
    </AppShell>
  );
}
