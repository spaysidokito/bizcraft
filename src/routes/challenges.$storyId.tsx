import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { CheckCircle2, XCircle, Target } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { ProgressBar } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBizCraft } from "@/lib/bizcraft/store";
import { XP_RULES } from "@/lib/bizcraft/data";
import type { QuizAnswer } from "@/lib/bizcraft/types";

export const Route = createFileRoute("/challenges/$storyId")({
  head: () => ({
    meta: [
      { title: "Basketball Quiz Challenge — BizCraft" },
      {
        name: "description",
        content:
          "Answer entrepreneurship questions and shoot for the hoop. Every correct answer scores a basket and earns XP.",
      },
      { property: "og:title", content: "Basketball Quiz Challenge — BizCraft" },
      { property: "og:description", content: "Gamified quiz on real entrepreneur stories." },
    ],
  }),
  component: QuizPage,
});

type Phase = "answering" | "shooting" | "feedback";

function QuizPage() {
  const { storyId } = Route.useParams();
  const { db, questionsForStory, submitQuiz } = useBizCraft();
  const navigate = useNavigate();

  const story = db.entrepreneur_stories.find((s) => s.id === storyId);
  const questions = questionsForStory(storyId);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [phase, setPhase] = useState<Phase>("answering");
  const [selected, setSelected] = useState<string | null>(null);
  const [xp, setXp] = useState(0);

  // ── BUG FIX: store correctness in a ref so it's stable during animation ──
  // isCorrect derived from state can be stale between renders during the
  // "shooting" phase. Using a ref guarantees the animation class applied to
  // the ball matches the answer that was actually chosen.
  const isCorrectRef = useRef(false);

  if (!story || questions.length === 0) {
    return (
      <AppShell role="student" title="Challenge unavailable">
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            This challenge has no questions yet. Please choose another story.
          </p>
          <Button asChild className="mt-4">
            <Link to="/challenges">Back to challenges</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const question = questions[Math.min(index, questions.length - 1)]!;
  const score = answers.filter((a) => a.is_correct).length;

  // Use the ref value during animation phases; derive from state only for feedback display
  const isCorrect = isCorrectRef.current;
  const shotIndex = question.choices.findIndex((c) => c.id === selected);

  const shoot = (choiceId: string) => {
    if (phase !== "answering") return;

    // ── FIX: compute and persist correctness immediately ──
    const correct = choiceId === question.correct_choice_id;
    isCorrectRef.current = correct;

    setSelected(choiceId);
    setPhase("shooting");

    window.setTimeout(() => {
      setAnswers((prev) => [
        ...prev,
        { question_id: question.id, choice_id: choiceId, is_correct: correct },
      ]);
      if (correct) setXp((v) => v + XP_RULES.correct_answer);
      setPhase("feedback");
    }, 1000);
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      isCorrectRef.current = false;
      setPhase("answering");
      return;
    }
    // Last question — submit and go to results
    submitQuiz(storyId, answers);
    navigate({ to: "/results/$storyId", params: { storyId } });
  };

  const shooting = phase === "shooting" || phase === "feedback";
  // Offset the ball so it appears to come from the chosen answer column
  const offsetX = shotIndex >= 0 ? (1.5 - shotIndex) * 26 : 0;
  const progressPct = (index / questions.length) * 100;

  return (
    <AppShell
      role="student"
      title="Basketball Quiz Challenge"
      subtitle={`${story.name} · ${story.business_name}`}
    >
      <div className="space-y-4">

        {/* ── Hero strip with scoreboard ───────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-primary px-5 py-5 sm:px-8 shadow-card">
          <span className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/5" />
          <span className="pointer-events-none absolute -bottom-8 right-16 size-24 rounded-full bg-white/5" />

          <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Question */}
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">Question</p>
              <p className="font-display text-lg font-bold text-white">
                {index + 1} <span className="text-sm font-normal text-white/60">of {questions.length}</span>
              </p>
            </div>
            {/* Score */}
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">Score</p>
              <p className="font-display text-lg font-bold text-white">
                {score} <span className="text-sm font-normal text-white/60">/ {questions.length}</span>
              </p>
            </div>
            {/* XP */}
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">XP Earned</p>
              <p className="font-display text-lg font-bold text-orange">{xp}</p>
            </div>
            {/* Progress */}
            <div className="flex flex-col justify-center rounded-xl bg-white/10 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/60">Progress</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-orange transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Question card ─────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Question {index + 1}
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold leading-snug">
            {question.question_text}
          </h2>
        </div>

        {/* ── Basketball court ──────────────────────────────────── */}
        <div className="relative h-72 overflow-hidden rounded-xl border border-border bc-court shadow-card sm:h-80">
          {/* Court markings */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-b-[8rem] border-2 border-t-0 border-court-line sm:w-80" />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-court-line" />
          </div>

          {/* Backboard + hoop */}
          <div className="absolute left-1/2 top-6 -translate-x-1/2 text-center">
            <div className="mx-auto h-16 w-28 rounded-md border-4 border-foreground/70 bg-surface/80 sm:w-32" />
            <div
              className={cn(
                "mx-auto -mt-1 h-2 w-20 rounded-full bg-orange",
                phase === "feedback" && isCorrect && "bc-net-swish",
              )}
            />
            <div
              className={cn(
                "mx-auto h-8 w-16 origin-top rounded-b-2xl border-x-2 border-b-2 border-dashed border-surface",
                phase === "feedback" && isCorrect && "bc-net-swish",
              )}
            />
          </div>

          {/* Ball — key changes only when a new shot is taken, locking the animation class */}
          <div
            key={`${question.id}-${selected ?? "idle"}`}
            className={cn(
              "absolute bottom-6 left-1/2 -ml-6 size-12 rounded-full border-2 border-orange-foreground/20 bg-orange shadow-card",
              shooting && (isCorrect ? "bc-ball-made" : "bc-ball-miss"),
            )}
            style={
              {
                "--bc-x": `${offsetX}px`,
                "--bc-y": "-172px",
              } as React.CSSProperties
            }
          >
            <span className="absolute inset-0 rounded-full border-t-2 border-orange-foreground/30" />
            <span className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-orange-foreground/30" />
            <span className="absolute top-1/2 h-0.5 w-full -translate-y-1/2 bg-orange-foreground/30" />
          </div>

          {/* Result banner inside court */}
          {phase === "feedback" && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <span
                className={cn(
                  "rounded-full px-5 py-1.5 font-display text-sm font-semibold shadow-card",
                  isCorrect
                    ? "bg-success text-success-foreground"
                    : "bg-destructive text-destructive-foreground",
                )}
              >
                {isCorrect ? `🏀 Swish! +${XP_RULES.correct_answer} XP` : "❌ Missed shot!"}
              </span>
            </div>
          )}
        </div>

        {/* ── Answer choices ────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2">
          {question.choices.map((choice) => {
            const chosen = selected === choice.id;
            const revealCorrect = phase === "feedback" && choice.id === question.correct_choice_id;
            const revealWrong = phase === "feedback" && chosen && !isCorrect;
            return (
              <button
                key={choice.id}
                type="button"
                disabled={phase !== "answering"}
                onClick={() => shoot(choice.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-4 text-left text-sm transition-colors disabled:cursor-not-allowed",
                  phase === "answering" && "hover:border-primary hover:bg-primary-soft",
                  !revealCorrect && !revealWrong && "border-border",
                  revealCorrect && "border-success bg-success-soft",
                  revealWrong && "border-destructive bg-destructive/10",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full bg-orange font-display text-sm font-bold text-orange-foreground",
                    revealCorrect && "bg-success text-success-foreground",
                    revealWrong && "bg-destructive text-destructive-foreground",
                  )}
                >
                  {choice.label}
                </span>
                <span className="flex-1">{choice.text}</span>
                {revealCorrect && <CheckCircle2 className="size-5 shrink-0 text-success" />}
                {revealWrong && <XCircle className="size-5 shrink-0 text-destructive" />}
              </button>
            );
          })}
        </div>

        {/* ── Feedback / explanation card ───────────────────────── */}
        {phase === "feedback" && (
          <div className={cn(
            "rounded-xl border p-5 shadow-card",
            isCorrect ? "border-success/30 bg-success-soft" : "border-destructive/30 bg-destructive/5",
          )}>
            <p className="font-display text-sm font-semibold">
              {isCorrect ? "🎉 Nice shot! Keep it up!" : "📖 Here's the correct answer"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{question.explanation}</p>
            <Button
              className={cn("mt-4 w-full sm:w-auto", isCorrect ? "" : "bg-primary")}
              onClick={next}
            >
              {index + 1 < questions.length ? "Next Question →" : "Finish Challenge 🏆"}
            </Button>
          </div>
        )}

        {/* ── Prompt ───────────────────────────────────────────── */}
        {phase === "answering" && (
          <p className="text-center text-sm text-muted-foreground">
            Choose an answer to take your shot.
          </p>
        )}

      </div>
    </AppShell>
  );
}
