import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect, Component } from "react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { SectionHeading } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBizCraft, DEFAULT_ACTIVITY_SETTINGS, DEFAULT_ACTIVITY_SCENARIOS } from "@/lib/bizcraft/store";
import type { ActivityScenario } from "@/lib/bizcraft/store";
import { toast } from "sonner";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Interactive Activity — BizCraft" },
      { name: "description", content: "Practice decision-making with short business scenarios." },
    ],
  }),
  component: ActivityPage,
});


function ActivityPage() {
  const { currentUser, submitQuiz, questionsForStory, awardXp, awardBadge, db } = useBizCraft();
  const activitySettings = db.activity_settings ?? DEFAULT_ACTIVITY_SETTINGS;
  const COUNTDOWN_SECONDS = activitySettings.countdownSeconds;
  const autoAdvance = activitySettings.autoAdvance;
  const [index, setIndex] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState<import("@/lib/bizcraft/types").QuizAnswer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [lastPts, setLastPts] = useState(0);
  const [lastExplanation, setLastExplanation] = useState<string | undefined>(undefined);
  const [lastCorrect, setLastCorrect] = useState<boolean | undefined>(undefined);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultXp, setResultXp] = useState(0);
  const [mcOnly] = useState(true);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const sessionScenarios = useMemo(() => {
    const source = (db.activity_scenarios?.length ? db.activity_scenarios : DEFAULT_ACTIVITY_SCENARIOS) as ActivityScenario[];
    const copy = [...source];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(5, copy.length));
  }, [db.activity_scenarios]);

  // Auto-advance countdown: ticks down while feedbackVisible, then calls handleNext
  const handleNextRef = React.useRef<() => void>(() => {});

  useEffect(() => {
    if (!feedbackVisible) return;
    setCountdown(COUNTDOWN_SECONDS);
    if (!autoAdvance) return; // countdown display only — no auto-advance
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNextRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [feedbackVisible, autoAdvance, COUNTDOWN_SECONDS]);

  if (!currentUser) {
    return (
      <AppShell role="student" title="Interactive Activity">
        <div className="p-6">Please sign in to try the activity.</div>
      </AppShell>
    );
  }

  const scene = sessionScenarios[index];

  // Safety check: if no scene available, show a message
  if (!scene && !finished) {
    return (
      <AppShell role="student" title="Interactive Activity">
        <div className="space-y-6">
          <SectionHeading title="Interactive Activity" description="Practice decisions with short scenarios." />
          <div className="rounded-xl border border-border bg-card-story p-6 shadow-card">
            <p className="text-muted-foreground">
              No activity questions are currently available. Please check back later or contact your administrator.
            </p>
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const submitAnswer = () => {
    if (!scene) return;
    let pts = 0;
    if (scene.type === "mc" && scene.choices) {
      const choice = scene.choices.find((c) => c.id === selected);
      pts = choice?.points ?? 0;
      setLastCorrect(Boolean(scene.bestChoiceId && selected === scene.bestChoiceId));
    }
    if (scene.type === "text") {
      const text = freeText.toLowerCase();
      pts = scene.keywords?.some((k) => text.includes(k)) ? 3 : 1;
      setLastCorrect(undefined);
    }

    const newTotal = totalPoints + pts;
    setTotalPoints(newTotal);
    setLastPts(pts);
    setLastExplanation(scene.explanation);
    setFeedbackVisible(true);
    setSelected(null);
    setFreeText("");
    setSessionAnswers((prev) => [
      ...prev,
      { question_id: scene.id, choice_id: selected ?? "", is_correct: pts >= 3 },
    ]);

    // success micro-interactions for strong answers
    if (pts >= 3) {
      setShowConfetti(true);
      toast.success("Nice! +" + pts + " points");
      playBeep(true);
      // hide confetti after short delay
      setTimeout(() => setShowConfetti(false), 1200);
    } else if (pts > 0) {
      toast("+" + pts + " points");
      playBeep(false);
    }
    // start countdown to auto-advance
    setCountdown(3);
  };
  const reset = () => {
    setIndex(0);
    setSelected(null);
    setFreeText("");
    setTotalPoints(0);
    setFinished(false);
    setSessionAnswers([]);
  };

  function playBeep(success: boolean) {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = success ? "sine" : "triangle";
      o.frequency.value = success ? 880 : 440;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 180);
    } catch {
      /* ignore audio errors */
    }
  }

  const handleNext = () => {
    setFeedbackVisible(false);
    if (index + 1 >= sessionScenarios.length) {
      setFinished(true);
      const xp = Math.max(5, totalPoints * 10);
      awardXp(xp);
      setResultXp(xp);
      toast.success(`You earned ${xp} XP this session`);
      // award a simple activity badge if threshold met
      if (totalPoints >= 10) {
        awardBadge("b-2");
      }
      // show results modal with confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1600);
      setShowResultsModal(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  // Keep the ref in sync so the countdown interval can call the latest handleNext
  handleNextRef.current = handleNext;

  const tier = totalPoints >= 6 ? "Ambitious" : totalPoints >= 3 ? "Growing" : "Beginner";

  return (
    <AppShell role="student" title="Interactive Activity">
      <ErrorBoundary>
        <div className="space-y-6">
          <SectionHeading title="Interactive Activity" description="Practice decisions with short scenarios." />

        {!finished ? (
          <div className="relative rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-card">
            {/* confetti removed */}
            <p className="text-sm text-muted-foreground">Scenario {index + 1} of {sessionScenarios.length}</p>
            <h2 className="mt-2 font-display text-lg font-semibold">{scene?.prompt || "Loading..."}</h2>

            {scene?.type === "mc" && scene.choices && (
              <div className="mt-4 space-y-2">
                {scene.choices.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      feedbackVisible ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-yellow-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="choice"
                      checked={selected === c.id}
                      onChange={() => !feedbackVisible && setSelected(c.id)}
                      disabled={feedbackVisible}
                      className="accent-yellow-500"
                    />
                    <span className="text-sm">{c.label}</span>
                  </label>
                ))}
              </div>
            )}

            {scene?.type === "text" && (
              <div className="mt-4 space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  disabled={feedbackVisible}
                  className={feedbackVisible ? "cursor-not-allowed opacity-60" : ""}
                />
                <p className="text-xs text-muted-foreground">Try to mention practical channels or tactics.</p>
              </div>
            )}

            <div className="mt-4">
              {!feedbackVisible ? (
                <div className="flex gap-3">
                  <Button onClick={submitAnswer} disabled={!scene || (scene.type === "mc" ? !selected : !freeText)}>
                    Submit
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/dashboard">Cancel</Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border border-border bg-background p-4">
                  <p className="font-medium">Feedback</p>
                  {lastExplanation && <p className="mt-2 text-sm text-muted-foreground">{lastExplanation}</p>}
                  <p className="mt-2">Points this question: <strong>{lastPts}</strong></p>
                  <p className="mt-1 text-sm text-muted-foreground">XP preview: <strong>{Math.max(5, totalPoints * 10)}</strong></p>
                  {/* Countdown auto-advance indicator */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {/* Circular countdown ring */}
                      <div className="relative h-9 w-9 flex-shrink-0">
                        <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15"
                            fill="none"
                            stroke="#eab308"
                            strokeWidth="3"
                            strokeDasharray={`${2 * Math.PI * 15}`}
                            strokeDashoffset={`${2 * Math.PI * 15 * (1 - countdown / COUNTDOWN_SECONDS)}`}
                            strokeLinecap="round"
                            style={{ transition: "stroke-dashoffset 0.9s linear" }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-yellow-600">
                          {countdown}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {autoAdvance ? "Auto-advancing…" : "Take your time"}
                      </span>
                    </div>
                    <Button size="sm" onClick={handleNext} className="ml-auto">
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-card">
            {/* show confetti in modal instead of here */}
            <h3 className="font-display text-lg font-semibold">Results</h3>
            <p className="mt-2">Points earned: {totalPoints}</p>
            <p className="mt-1">Entrepreneurial tier: {tier}</p>
            <p className="mt-2 text-sm text-muted-foreground">XP awarded and saved to your profile.</p>
            <div className="mt-4 flex gap-3">
              <Button onClick={reset}>Try Again</Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
        {showResultsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-full max-w-lg p-6">
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-2xl text-center">
                <h2 className="font-display text-2xl font-semibold">Well done!</h2>
                <p className="mt-3 text-sm text-muted-foreground">You completed the activity.</p>
                <p className="mt-4 text-lg">XP earned: <strong>{resultXp}</strong></p>
                <p className="mt-2">Points: <strong>{totalPoints}</strong> · Tier: <strong>{tier}</strong></p>
                <div className="mt-4 flex justify-center gap-3">
                  <Button onClick={() => { setShowResultsModal(false); reset(); }}>Try Again</Button>
                  <Button variant="outline" asChild>
                    <Link to="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </ErrorBoundary>
    </AppShell>
  );
}

// Confetti removed

class ErrorBoundary extends Component<{}, { hasError: boolean; error?: Error }> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // log for debugging
    // eslint-disable-next-line no-console
    console.error("Activity error:", error, info);
    try {
      // show a toast to the user
      // use a small delay to ensure sonner is ready
      setTimeout(() => {
        // @ts-ignore
        toast.error?.("An error occurred in the activity. Refresh to try again.");
      }, 10);
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="rounded-md border border-destructive bg-destructive/10 p-6">
            <h3 className="font-semibold">Something went wrong in this activity</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try refreshing the page or go back to the dashboard.</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Retry
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}

export default ActivityPage;
