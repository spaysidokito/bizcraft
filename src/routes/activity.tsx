import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  Check,
  Coins,
  LineChart,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { Button } from "@/components/ui/button";
import { useBizCraft, DEFAULT_ACTIVITY_SCENARIOS } from "@/lib/bizcraft/store";
import type { ActivityScenario } from "@/lib/bizcraft/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Business Challenge — BizCraft" },
      { name: "description", content: "Build a business by making smart decisions." },
    ],
  }),
  component: ActivityPage,
});

const businessTypes = [
  { id: "food", name: "Food & Beverage", detail: "Serve something people crave", icon: "🍜", color: "from-orange-100 to-amber-50" },
  { id: "fashion", name: "Clothing & Retail", detail: "Create a look of your own", icon: "🧵", color: "from-pink-100 to-rose-50" },
  { id: "tech", name: "Tech & Apps", detail: "Solve a problem with tech", icon: "💻", color: "from-sky-100 to-blue-50" },
  { id: "beauty", name: "Beauty & Care", detail: "Help customers feel great", icon: "🧴", color: "from-fuchsia-100 to-pink-50" },
  { id: "home", name: "Home & Local", detail: "Improve everyday spaces", icon: "🪴", color: "from-emerald-100 to-lime-50" },
];

const stages = ["Choose Business", "Build", "Launch", "Survive", "Grow"] as const;

const scoreLabels = [
  { key: "money", label: "Money", icon: Coins, color: "text-amber-500", bar: "bg-amber-400" },
  { key: "growth", label: "Growth", icon: LineChart, color: "text-sky-500", bar: "bg-sky-400" },
  { key: "customers", label: "Customers", icon: Users, color: "text-rose-500", bar: "bg-rose-400" },
  { key: "entrepreneur", label: "Entrepreneur", icon: Zap, color: "text-violet-500", bar: "bg-violet-400" },
] as const;

type ScoreKey = (typeof scoreLabels)[number]["key"];
type Scores = Record<ScoreKey, number>;

const emptyScores: Scores = { money: 0, growth: 0, customers: 0, entrepreneur: 0 };

const capitalOptions = [
  {
    id: "spend",
    label: "Spend ₱7,000 on my first product",
    impact: { money: 1, growth: 3, customers: 3, entrepreneur: 2 },
  },
  {
    id: "invest",
    label: "Invest ₱5,000 in a smaller selection",
    impact: { money: 2, growth: 2, customers: 2, entrepreneur: 3 },
  },
  {
    id: "save",
    label: "Save ₱9,000 and test demand first",
    impact: { money: 3, growth: 1, customers: 1, entrepreneur: 2 },
  },
] as const;

const stageArt: Record<number, string> = {
  1: "/activity-char-build.jpg",
  2: "/activity-char-launch.jpg",
  3: "/activity-char-survive.jpg",
  4: "/activity-char-grow.jpg",
};

const journeyBadges = [
  { label: "First Venture", icon: "①" },
  { label: "Smart Decision-Maker", icon: "✦" },
  { label: "Business Builder", icon: "⌁" },
  { label: "Customer Champion", icon: "♟" },
  { label: "Risk Taker", icon: "⚡" },
  { label: "BizCraft Entrepreneur", icon: "🏆" },
];

function addScores(a: Scores, b: Scores): Scores {
  return {
    money: a.money + b.money,
    growth: a.growth + b.growth,
    customers: a.customers + b.customers,
    entrepreneur: a.entrepreneur + b.entrepreneur,
  };
}

function impactFromPoints(points: number): Scores {
  const p = Math.max(0, Number.isFinite(points) ? points : 0);
  return {
    money: p,
    growth: p >= 2 ? p : Math.max(0, p - 1),
    customers: p,
    entrepreneur: Math.max(1, p),
  };
}

function totalScore(scores: Scores) {
  return Object.values(scores).reduce((sum, value) => sum + value, 0);
}

function ActivityPage() {
  const { currentUser, db, awardXp, awardBadge } = useBizCraft();
  const scenarios = useMemo(() => {
    const source = (db.activity_scenarios?.length ? db.activity_scenarios : DEFAULT_ACTIVITY_SCENARIOS) as ActivityScenario[];
    return source.filter((scenario) => scenario.type === "mc" && scenario.choices?.length).slice(0, 3);
  }, [db.activity_scenarios]);

  const [stage, setStage] = useState(0);
  const [business, setBusiness] = useState<string | null>(null);
  const [capital, setCapital] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [view, setView] = useState<"play" | "result">("play");
  const [awarded, setAwarded] = useState(false);

  const scores = useMemo(() => {
    let next = { ...emptyScores };
    if (business) next = addScores(next, { money: 1, growth: 1, customers: 2, entrepreneur: 2 });
    const capitalImpact = capitalOptions.find((option) => option.id === capital)?.impact;
    if (capitalImpact) next = addScores(next, capitalImpact);
    decisions.forEach((choiceId, scenarioIndex) => {
      const choice = scenarios[scenarioIndex]?.choices?.find((item) => item.id === choiceId);
      if (choice) next = addScores(next, impactFromPoints(choice.points));
    });
    return next;
  }, [business, capital, decisions, scenarios]);

  if (!currentUser) {
    return (
      <AppShell role="student" title="Business Challenge">
        <div className="rounded-2xl border border-border bg-card p-6">Please sign in to try the activity.</div>
      </AppShell>
    );
  }

  const currentScenario = scenarios[stage - 2];
  const selectedDecision = decisions[stage - 2];
  const points = totalScore(scores);
  const completePct = view === "result" ? 100 : Math.round((stage / 4) * 100);

  const chooseDecision = (choiceId: string) => {
    const index = stage - 2;
    setDecisions((prev) => {
      const next = [...prev];
      next[index] = choiceId;
      return next;
    });
  };

  const next = () => {
    if (stage === 0 && !business) return toast.error("Choose a business first.");
    if (stage === 1 && !capital) return toast.error("Choose how you will use your capital.");
    if (stage >= 2 && !selectedDecision) return toast.error("Choose one decision to continue.");
    if (stage < 4) return setStage((value) => value + 1);

    setView("result");
    if (!awarded) {
      const xp = Math.max(15, points * 4);
      awardXp(xp);
      awardBadge("b-2");
      setAwarded(true);
      toast.success(`You earned ${xp} XP`);
    }
  };

  const restart = () => {
    setStage(0);
    setBusiness(null);
    setCapital(null);
    setDecisions([]);
    setReflection("");
    setView("play");
    setAwarded(false);
  };

  const selectedBusiness = businessTypes.find((item) => item.id === business);
  const capitalValue = 10000 + scores.money * 1700;
  const satisfaction = Math.min(99, 58 + scores.customers * 4);
  const growth = Math.min(99, 42 + scores.growth * 5);

  return (
    <AppShell role="student" title="Business Challenge" subtitle="Make decisions and watch your business score grow">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex items-center justify-between gap-4 overflow-x-auto rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
          {stages.map((label, index) => {
            const done = view === "result" || index < stage;
            const current = view === "play" && index === stage;
            return (
              <div key={label} className="flex min-w-max items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-bold",
                    done || current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-4" /> : index + 1}
                </span>
                <span className={cn("text-xs font-semibold", current || view === "result" ? "text-foreground" : "text-muted-foreground")}>
                  {label}
                </span>
                {index < stages.length - 1 && <span className="mx-1 h-px w-5 bg-border" />}
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {view === "result" ? "Challenge complete" : `Step ${stage + 1} of 5`}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold">
                {view === "result" ? "Your Business Result" : stages[stage]}
              </h1>
            </div>
            <div className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{completePct}% complete</div>
          </div>

          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              {view === "play" && stage === 0 && (
                <>
                  <p className="mb-5 text-muted-foreground">What kind of business excites you most?</p>
                  <div className="grid gap-3 sm:grid-cols-5">
                    {businessTypes.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBusiness(item.id)}
                        className={cn(
                          "rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                          business === item.id ? "border-primary ring-2 ring-primary/30" : "border-border",
                        )}
                      >
                        <div className={cn("flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br text-4xl", item.color)}>
                          {item.icon}
                        </div>
                        <p className="mt-3 text-sm font-bold">{item.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {view === "play" && stage === 1 && (
                <DecisionPanel
                  title="You have ₱10,000 capital. What will you do first?"
                  options={capitalOptions.map((option) => ({ id: option.id, label: option.label }))}
                  value={capital}
                  onChange={setCapital}
                />
              )}

              {view === "play" && stage >= 2 && currentScenario && (
                <DecisionPanel
                  title={currentScenario.prompt}
                  options={currentScenario.choices?.map((choice) => ({ id: choice.id, label: choice.label })) ?? []}
                  value={selectedDecision}
                  onChange={chooseDecision}
                />
              )}

              {view === "result" && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-primary-soft p-5">
                    <div className="flex items-start gap-3">
                      <Trophy className="mt-0.5 size-6 shrink-0 text-primary" />
                      <div>
                        <p className="font-display text-lg font-bold">Congratulations!</p>
                        <p className="text-sm text-muted-foreground">
                          You steered {selectedBusiness?.name ?? "your business"} through all 5 challenges.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <ResultStat icon={<Building2 className="size-4" />} label="Business Level" value="Growing Entrepreneur" />
                      <ResultStat icon={<Coins className="size-4" />} label="Final Capital" value={`₱${capitalValue.toLocaleString()}`} />
                      <ResultStat icon={<Users className="size-4" />} label="Customer Satisfaction" value={`${satisfaction}%`} />
                      <ResultStat icon={<LineChart className="size-4" />} label="Business Growth" value={`${growth}%`} />
                    </div>
                    <p className="mt-4 text-sm font-semibold">
                      Final score: <span className="text-primary">{points} points</span>
                      <span className="ml-2 font-normal text-muted-foreground">· Decisions 5/5</span>
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold">Reflection</h2>
                    <p className="mt-1 text-sm text-muted-foreground">What would you do differently in your real business?</p>
                    <textarea
                      value={reflection}
                      onChange={(event) => setReflection(event.target.value)}
                      placeholder="Share your biggest lesson..."
                      className="mt-3 min-h-24 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Award className="size-4 text-primary" />
                      <h2 className="font-display text-lg font-semibold">You&apos;re now a BizCraft Entrepreneur</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">Keep learning. Keep dreaming. The future is yours.</p>
                    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                      {journeyBadges.map((badge) => (
                        <div key={badge.label} className="flex flex-col items-center rounded-xl border border-border bg-background p-3 text-center">
                          <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-xl">{badge.icon}</span>
                          <span className="mt-2 text-[10px] font-semibold leading-tight">{badge.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {view === "play" && stageArt[stage] && (
              <div className="hidden w-44 shrink-0 overflow-hidden rounded-2xl border border-border bg-primary-soft lg:block">
                <img src={stageArt[stage]} alt="" className="h-full w-full object-cover object-top" />
              </div>
            )}
            {view === "result" && (
              <div className="hidden w-44 shrink-0 items-center justify-center rounded-2xl bg-primary-soft p-4 text-center lg:flex">
                <div>
                  <Sparkles className="mx-auto size-8 text-primary" />
                  <p className="mt-3 text-4xl font-display font-bold text-primary">{points}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total points</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-4 sm:px-7">
            {view === "play" ? (
              <>
                <Button variant="ghost" onClick={() => setStage((value) => value - 1)} disabled={stage === 0} className="gap-2 text-muted-foreground">
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button onClick={next} className="gap-2">
                  {stage === 4 ? "Finish Challenge" : "Next"}
                  <ArrowRight className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <button type="button" onClick={restart} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                  Try Again
                </button>
                <Button asChild className="gap-2">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Your Business Score</h2>
            <span className="text-sm font-bold text-primary">{points} pts</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            {scoreLabels.map(({ key, label, icon: Icon, color, bar }) => {
              const value = scores[key];
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Icon className={cn("size-3.5", color)} />
                      {label}
                    </span>
                    <strong>{value}</strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", bar)}
                      style={{ width: `${Math.min(100, value * 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function DecisionPanel({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { id: string; label: string }[];
  value?: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="max-w-2xl font-display text-xl font-semibold">{title}</h2>
      <div className="mt-5 space-y-3">
        {options.map((option, index) => {
          const selected = value === option.id;
          return (
            <button
              type="button"
              key={option.id}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition",
                selected ? "border-primary bg-primary-soft ring-2 ring-primary/20" : "border-border bg-background hover:border-primary/50 hover:bg-primary-soft/60",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-sm font-medium">{option.label}</span>
              {selected && <Check className="ml-auto size-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
    </div>
  );
}

export default ActivityPage;
