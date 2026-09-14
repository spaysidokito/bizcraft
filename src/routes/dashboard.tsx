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

  const quickTiles = [
    {
      to: "/stories" as const,
      label: "Entrepreneurship Hub",
      sub: "Read inspiring real stories",
      Icon: BookOpen,
      iconCls: "bg-primary-soft text-primary",
      btnCls: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
    {
      to: "/profile" as const,
      label: "My Progress",
      sub: "See your journey & achievements",
      Icon: Flame,
      iconCls: "bg-orange-soft text-orange",
      btnCls: "bg-orange text-orange-foreground hover:bg-orange/90",
    },
    {
      to: "/achievements" as const,
      label: "Achievements",
      sub: "Collect badges & unlock levels",
      Icon: Medal,
      iconCls: "bg-primary-soft text-primary",
      btnCls: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
    {
      to: "/activity" as const,
      label: "Activity",
      sub: "Practice real business decisions",
      Icon: Target,
      iconCls: "bg-success-soft text-success",
      btnCls: "bg-success text-success-foreground hover:bg-success/90",
    },
  ];

  return (
    <AppShell
      role="student"
      title={`Welcome back, ${currentUser.full_name.split(" ")[0]}!`}
    >
      <div className="space-y-6">

        {/* ── Hero Banner ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-8 sm:px-10 shadow-card">
          {/* Subtle decorative blobs */}
          <span className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full bg-white/5" />
          <span className="pointer-events-none absolute -bottom-12 right-8 size-36 rounded-full bg-white/5" />
          <span className="pointer-events-none absolute right-32 top-5 size-14 rounded-full bg-orange/20" />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: avatar + greeting */}
            <div className="flex items-center gap-4">
              <img
                src={
                  profile.avatar_url ??
                  `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUser.id}&backgroundColor=b6e3f4`
                }
                alt={currentUser.full_name}
                className="size-16 shrink-0 rounded-full border-4 border-white/30 bg-primary-soft object-cover shadow-md"
              />
              <div>
                <p className="text-sm font-medium text-white/70">Good day,</p>
                <h2 className="font-display text-2xl font-bold text-white leading-tight">
                  {currentUser.full_name.split(" ")[0]}!
                </h2>
                <p className="mt-0.5 text-sm text-white/70">
                  Small steps today, big dreams tomorrow.
                </p>
              </div>
            </div>

            {/* Right: XP pill + CTA */}
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
                <Flame className="size-4 text-orange" />
                {stats.xp} XP &nbsp;·&nbsp; {stats.badges.length} Badges
              </div>
              <Button
                asChild
                className="bg-orange text-orange-foreground hover:bg-orange/90 shadow-md"
              >
                <Link to="/stories">Browse Stories →</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Level progress bar ───────────────────────────────── */}
        <LevelPanel xp={profile.xp} />

        {/* ── Quick-access tiles ───────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickTiles.map(({ to, label, sub, Icon, iconCls, btnCls }) => (
            <div
              key={to}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card-story p-4 shadow-card"
            >
              <span className={`grid size-10 place-items-center rounded-lg ${iconCls}`}>
                <Icon className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold leading-tight">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">{sub}</p>
              </div>
              <Button asChild size="sm" className={`w-full text-xs ${btnCls}`}>
                <Link to={to}>View</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* ── Stats row ────────────────────────────────────────── */}
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

        {/* ── Continue Learning ────────────────────────────────── */}
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

        {/* ── Entrepreneur Stories grid ─────────────────────────── */}
        <section>
          <SectionHeading
            title="Entrepreneurship Hub"
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
