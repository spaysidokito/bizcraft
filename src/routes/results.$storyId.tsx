import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { StatCard } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import { useBizCraft } from "@/lib/bizcraft/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results/$storyId")({
  head: () => ({
    meta: [
      { title: "Quiz Results — BizCraft" },
      {
        name: "description",
        content:
          "Review your basketball quiz score, correct answers, XP earned and any new badges unlocked.",
      },
      { property: "og:title", content: "Quiz Results — BizCraft" },
      { property: "og:description", content: "Your challenge results and XP summary." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { storyId } = Route.useParams();
  const { db, currentUser, latestAttempt, statsFor } = useBizCraft();
  const [review, setReview] = useState(false);

  const story = db.entrepreneur_stories.find((s) => s.id === storyId);
  const attempt = currentUser ? latestAttempt(currentUser.id, storyId) : undefined;

  if (!story || !attempt) {
    return (
      <AppShell role="student" title="No results found">
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            You have not completed this challenge yet.
          </p>
          <Button asChild className="mt-4">
            <Link to="/challenges">Go to challenges</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const pct = Math.round((attempt.score / attempt.total_questions) * 100);
  const incorrect = attempt.total_questions - attempt.score;
  const stats = currentUser ? statsFor(currentUser.id) : null;
  const latestBadge = stats?.badges[stats.badges.length - 1];

  const published = db.entrepreneur_stories.filter((s) => s.is_published);
  const currentIdx = published.findIndex((s) => s.id === storyId);
  const nextStory = published[currentIdx + 1] ?? published[0];

  const message =
    pct >= 90
      ? "Excellent work! You clearly understood the entrepreneur's lessons."
      : pct >= 70
        ? "Good job! Review the lessons you missed and try again for a perfect score."
        : "Keep going. Re-read the story's key lessons and retake the challenge.";

  return (
    <AppShell role="student" title="Quiz Results" subtitle={`${story.name} · ${story.business_name}`}>
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Final Score
          </p>
          <p className="font-display text-4xl font-bold text-primary">
            {attempt.score} / {attempt.total_questions}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{pct}% correct</p>
          <p className="mx-auto mt-3 max-w-md text-sm">{message}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Correct Answers"
            value={attempt.score}
            icon={<CheckCircle2 className="size-5" />}
            tone="green"
          />
          <StatCard
            label="Incorrect Answers"
            value={incorrect}
            icon={<XCircle className="size-5" />}
            tone="default"
          />
          <StatCard label="XP Earned" value={`+${attempt.xp_earned}`} tone="orange" icon={<Award className="size-5" />} />
        </div>

        {latestBadge && (
          <div className="flex items-center gap-4 rounded-xl border border-border bg-orange-soft p-5">
            <span className="grid size-12 place-items-center rounded-full bg-orange text-orange-foreground">
              <Award className="size-6" />
            </span>
            <div>
              <p className="font-display text-base font-semibold">Badge unlocked: {latestBadge.name}</p>
              <p className="text-sm text-muted-foreground">{latestBadge.description}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setReview((v) => !v)}>
            {review ? "Hide Answers" : "Review Answers"}
          </Button>
          {nextStory && (
            <Button asChild variant="outline">
              <Link to="/stories/$storyId" params={{ storyId: nextStory.id }}>
                Next Story
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        {review && (
          <div className="space-y-3">
            {attempt.answers.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Detailed answers are not stored for this sample attempt.
              </p>
            )}
            {attempt.answers.map((ans, i) => {
              const q = db.quiz_questions.find((qq) => qq.id === ans.question_id);
              if (!q) return null;
              const chosen = q.choices.find((c) => c.id === ans.choice_id);
              const correct = q.choices.find((c) => c.id === q.correct_choice_id);
              return (
                <div key={ans.question_id} className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Question {i + 1}
                  </p>
                  <p className="mt-1 font-medium">{q.question_text}</p>
                  <p
                    className={cn(
                      "mt-2 text-sm",
                      ans.is_correct ? "text-success" : "text-destructive",
                    )}
                  >
                    Your answer: {chosen?.label}. {chosen?.text}
                  </p>
                  {!ans.is_correct && (
                    <p className="mt-1 text-sm text-success">
                      Correct answer: {correct?.label}. {correct?.text}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">{q.explanation}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
