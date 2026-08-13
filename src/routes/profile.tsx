import { createFileRoute } from "@tanstack/react-router";
import { Medal, User as UserIcon } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { LevelPanel, StatCard } from "@/components/bizcraft/ui-bits";
import { useBizCraft } from "@/lib/bizcraft/store";
import { levelForXp } from "@/lib/bizcraft/data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile — BizCraft" },
      {
        name: "description",
        content:
          "Your BizCraft profile: entrepreneur level, XP, quiz averages and badges.",
      },
      { property: "og:title", content: "Student Profile — BizCraft" },
      { property: "og:description", content: "Your BizCraft learning profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { currentUser, profile, statsFor } = useBizCraft();
  if (!currentUser || !profile) {
    return (
      <AppShell role="student" title="Profile">
        <div />
      </AppShell>
    );
  }
  const stats = statsFor(currentUser.id);
  const level = levelForXp(profile.xp);

  return (
    <AppShell role="student" title="Profile" subtitle="Your learning record in BizCraft">
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card-story p-6 text-center shadow-card sm:flex-row sm:text-left">
          <span className="grid size-20 place-items-center rounded-full bg-primary-soft text-primary">
            <UserIcon className="size-9" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold">{currentUser.full_name}</h2>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            <p className="mt-1 text-sm font-medium text-primary">
              Level {level.level} — {level.title}
            </p>
          </div>
        </div>

        <LevelPanel xp={profile.xp} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="XP Points" value={stats.xp} tone="orange" />
          <StatCard label="Stories Completed" value={stats.stories_completed} tone="purple" />
          <StatCard label="Quizzes Completed" value={stats.quizzes_completed} tone="green" />
          <StatCard label="Average Quiz Score" value={`${stats.average_score}%`} tone="purple" />
        </div>

        <section className="rounded-xl border border-border bg-card-story p-5 shadow-card">
          <h2 className="font-display text-base font-semibold">Earned Badges</h2>
          {stats.badges.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No badges yet. Complete a story and its challenge to earn your first badge.
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-3">
              {stats.badges.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-orange-soft px-3 py-2 text-sm"
                >
                  <Medal className="size-4 text-orange" />
                  <span className="font-medium">{b.name}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
