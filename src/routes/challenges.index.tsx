import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Target, Trophy } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { ProgressBar } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import { useBizCraft } from "@/lib/bizcraft/store";

export const Route = createFileRoute("/challenges/")({
  head: () => ({
    meta: [
      { title: "Challenges — BizCraft Basketball Quizzes" },
      {
        name: "description",
        content:
          "Play basketball-themed quiz challenges for every entrepreneur story and earn XP for each correct shot.",
      },
      { property: "og:title", content: "Challenges — BizCraft" },
      { property: "og:description", content: "Basketball quiz challenges for ABM students." },
    ],
  }),
  component: ChallengesPage,
});

function ChallengesPage() {
  const { db, currentUser, questionsForStory, latestAttempt } = useBizCraft();
  const stories = db.entrepreneur_stories.filter((s) => s.is_published);
  const totalAttempted = stories.filter(
    (s) => currentUser && latestAttempt(currentUser.id, s.id),
  ).length;

  return (
    <AppShell
      role="student"
      title="Challenges"
      subtitle="One basketball quiz challenge per entrepreneur story"
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
                <Target className="size-6 text-white" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-white">Challenges</h2>
                <p className="mt-0.5 text-sm text-white/70">
                  Answer correctly and shoot your way to the top!
                </p>
              </div>
            </div>

            {/* Progress pill */}
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              <Trophy className="size-4 text-orange" />
              {totalAttempted} / {stories.length} Attempted
            </div>
          </div>
        </div>

        {/* ── Challenge list ───────────────────────────────────── */}
        <div className="space-y-3">
          {stories.map((story) => {
            const questions = questionsForStory(story.id);
            const attempt = currentUser ? latestAttempt(currentUser.id, story.id) : undefined;
            const scorePct = attempt
              ? Math.round((attempt.score / attempt.total_questions) * 100)
              : 0;

            return (
              <div
                key={story.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card-story p-4 shadow-card sm:flex-row sm:items-center"
              >
                {/* Thumbnail */}
                <div className="relative shrink-0">
                  <img
                    src={story.photo_url}
                    alt={story.name}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  {attempt && (
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-success shadow">
                      <CheckCircle2 className="size-3.5 text-success-foreground" />
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-orange">
                    {story.business_type}
                  </p>
                  <h2 className="font-display text-base font-semibold">{story.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {story.business_name} · {questions.length} questions
                  </p>

                  {attempt ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-success">
                          <CheckCircle2 className="size-3.5" />
                          Best score: {attempt.score}/{attempt.total_questions} · {attempt.xp_earned} XP
                        </span>
                        <span>{scorePct}%</span>
                      </div>
                      <ProgressBar value={scorePct} tone="green" />
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">Not attempted yet</p>
                  )}
                </div>

                {/* Action */}
                <Button
                  asChild
                  disabled={questions.length === 0}
                  className="shrink-0"
                  variant={attempt ? "outline" : "default"}
                >
                  <Link to="/challenges/$storyId" params={{ storyId: story.id }}>
                    <Target className="size-4" />
                    {attempt ? "Retake Challenge" : "Start Challenge"}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

      </div>
    </AppShell>
  );
}
