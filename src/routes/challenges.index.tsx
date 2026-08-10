import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Target } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
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

  return (
    <AppShell
      role="student"
      title="Challenges"
      subtitle="One basketball quiz challenge per entrepreneur story"
    >
      <div className="space-y-4">
        {stories.map((story) => {
          const questions = questionsForStory(story.id);
          const attempt = currentUser ? latestAttempt(currentUser.id, story.id) : undefined;
          return (
            <div
              key={story.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center"
            >
              <img
                src={story.photo_url}
                alt={story.name}
                loading="lazy"
                width={800}
                height={600}
                className="h-20 w-20 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-semibold">{story.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {story.business_name} · {questions.length} questions
                </p>
                {attempt && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
                    <CheckCircle2 className="size-3.5" /> Best attempt: {attempt.score}/
                    {attempt.total_questions} · {attempt.xp_earned} XP earned
                  </p>
                )}
              </div>
              <Button asChild disabled={questions.length === 0} className="shrink-0">
                <Link to="/challenges/$storyId" params={{ storyId: story.id }}>
                  <Target className="size-4" />
                  {attempt ? "Retake Challenge" : "Start Challenge"}
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
