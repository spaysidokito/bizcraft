import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Flame, Medal, Target } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { LevelPanel, ProgressBar, SectionHeading, StatCard } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import { useBizCraft } from "@/lib/bizcraft/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — BizCraft" },
      {
        name: "description",
        content:
          "Track your entrepreneur level, XP, completed stories, quizzes and badges on the BizCraft student dashboard.",
      },
      { property: "og:title", content: "Student Dashboard — BizCraft" },
      { property: "og:description", content: "Your entrepreneurship learning progress at a glance." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { currentUser, profile, db, statsFor, progressFor } = useBizCraft();

  if (!currentUser || !profile) {
    return (
      <AppShell role="student" title="Dashboard">
        <div />
      </AppShell>
    );
  }

  const stats = statsFor(currentUser.id);
  const stories = db.entrepreneur_stories.filter((s) => s.is_published);

  const lastProgress = [...db.student_progress]
    .filter((p) => p.student_id === currentUser.id)
    .sort((a, b) => b.last_viewed_at.localeCompare(a.last_viewed_at))[0];
  const continueStory = lastProgress
    ? stories.find((s) => s.id === lastProgress.story_id)
    : stories[0];

  return (
    <AppShell
      role="student"
      title={`Welcome back, ${currentUser.full_name.split(" ")[0]}!`}
    >
      <div className="space-y-6">
        <LevelPanel xp={profile.xp} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="XP Points" value={stats.xp} icon={<Flame className="size-5" />} tone="orange" />
          <StatCard
            label="Stories Completed"
            value={`${stats.stories_completed} / ${stories.length}`}
            icon={<BookOpen className="size-5" />}
            tone="purple"
          />
          <StatCard
            label="Quizzes Completed"
            value={stats.quizzes_completed}
            icon={<Target className="size-5" />}
            tone="green"
          />
          <StatCard
            label="Badges Earned"
            value={`${stats.badges.length} / ${db.badges.length}`}
            icon={<Medal className="size-5" />}
            tone="purple"
          />
        </div>

        {continueStory && (
          <section>
            <SectionHeading
              title="Continue Learning"
              description="Pick up where you left off."
            />
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card-story p-4 shadow-card sm:flex-row sm:items-center">
              <img
                src={continueStory.photo_url}
                alt={`${continueStory.name}, owner of ${continueStory.business_name}`}
                loading="lazy"
                width={800}
                height={600}
                className="h-32 w-full rounded-lg object-cover sm:w-48"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-orange">
                  {continueStory.business_type}
                </p>
                <h3 className="font-display text-lg font-semibold">{continueStory.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {continueStory.business_name} · {continueStory.location}
                </p>
                <p className="mt-2 line-clamp-2 text-sm">{continueStory.short_description}</p>
              </div>
              <Button asChild className="shrink-0">
                <Link to="/stories/$storyId" params={{ storyId: continueStory.id }}>
                  Continue Story
                </Link>
              </Button>
            </div>
          </section>
        )}

        <section>
          <SectionHeading
            title="Entrepreneur Stories"
            description="Real Filipino entrepreneurs and the lessons behind their businesses."
            action={
              <Button variant="outline" size="sm" asChild>
                <Link to="/stories">View all</Link>
              </Button>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.slice(0, 6).map((story) => {
              const p = progressFor(currentUser.id, story.id);
              const pct = p?.status === "completed" ? 100 : p ? 45 : 0;
              return (
                <article
                  key={story.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-card-story shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <img
                    src={story.photo_url}
                    alt={`${story.name}, owner of ${story.business_name}`}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="h-40 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-orange">
                      {story.business_type}
                    </p>
                    <h3 className="font-display text-base font-semibold">{story.name}</h3>
                    <p className="text-xs text-muted-foreground">{story.business_name}</p>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                      {story.short_description}
                    </p>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{pct}%</span>
                      </div>
                      <ProgressBar value={pct} />
                    </div>
                    <Button asChild className="mt-4 w-full" variant="outline">
                      <Link to="/stories/$storyId" params={{ storyId: story.id }}>
                        View Story
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
