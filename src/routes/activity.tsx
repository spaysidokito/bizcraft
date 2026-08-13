import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { SectionHeading } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBizCraft } from "@/lib/bizcraft/store";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Interactive Activity — BizCraft" },
      { name: "description", content: "Practice decision-making with short business scenarios." },
    ],
  }),
  component: ActivityPage,
});

type Choice = { id: string; label: string; points: number };

const SCENARIOS: {
  id: string;
  prompt: string;
  type: "mc" | "text";
  choices?: Choice[];
  keywords?: string[];
}[] = [
  {
    id: "s1",
    prompt: "Your supplier delivers late and you risk losing customers. What do you do?",
    type: "mc",
    choices: [
      { id: "c1", label: "Find an alternate supplier quickly", points: 3 },
      { id: "c2", label: "Contact supplier and negotiate faster delivery", points: 2 },
      { id: "c3", label: "Absorb delay and wait", points: 0 },
    ],
  },
  {
    id: "s2",
    prompt: "A customer complains about product quality. How do you respond?",
    type: "mc",
    choices: [
      { id: "c1", label: "Offer refund/replace and investigate", points: 3 },
      { id: "c2", label: "Explain policy and decline", points: 0 },
      { id: "c3", label: "Apologize and ask for more details", points: 2 },
    ],
  },
  {
    id: "s3",
    prompt:
      "Describe briefly how you'd market a small food stall on a budget (one or two sentences).",
    type: "text",
    keywords: ["social", "facebook", "tiktok", "flyer", "word of mouth", "promo"],
  },
  {
    id: "s4",
    prompt:
      "You have leftover inventory that isn't selling. Which option increases cashflow fastest?",
    type: "mc",
    choices: [
      { id: "c1", label: "Run a limited-time discount/promo", points: 3 },
      { id: "c2", label: "Bundle with other products", points: 2 },
      { id: "c3", label: "Keep price and wait for demand", points: 0 },
    ],
  },
  {
    id: "s5",
    prompt:
      "A supplier offers a bulk discount but requires larger upfront payment. What do you consider?",
    type: "mc",
    choices: [
      { id: "c1", label: "Calculate cashflow and accept if affordable", points: 3 },
      { id: "c2", label: "Always accept for lower unit cost", points: 1 },
      { id: "c3", label: "Decline to avoid cash strain", points: 1 },
    ],
  },
  {
    id: "s6",
    prompt:
      "You're hiring your first assistant. List one quality or question you'd focus on (one sentence).",
    type: "text",
    keywords: ["reliable", "honest", "experience", "availability", "skill", "attitude"],
  },
  {
    id: "s7",
    prompt:
      "A sudden cash shortage means you must prioritize payments. Which do you pay first?",
    type: "mc",
    choices: [
      { id: "c1", label: "Salaries and critical suppliers", points: 3 },
      { id: "c2", label: "Rent and utilities only", points: 2 },
      { id: "c3", label: "Delay all non-essential bills", points: 1 },
    ],
  },
  {
    id: "s8",
    prompt:
      "You want to expand online. Briefly name one digital channel you'll start with and why.",
    type: "text",
    keywords: ["facebook", "tiktok", "instagram", "lazada", "shopee", "website"],
  },
  {
    id: "s9",
    prompt:
      "A competitor drops price aggressively. What strategic move protects your business?",
    type: "mc",
    choices: [
      { id: "c1", label: "Differentiate with service/quality", points: 3 },
      { id: "c2", label: "Match price immediately", points: 1 },
      { id: "c3", label: "Ignore and maintain position", points: 1 },
    ],
  },
  {
    id: "s10",
    prompt:
      "Describe one low-cost way to get repeat customers for a small retail business.",
    type: "text",
    keywords: ["loyalty", "discount", "membership", "follow up", "promo", "bundle"],
  },
];

function ActivityPage() {
  const { currentUser, awardXp } = useBizCraft();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [finished, setFinished] = useState(false);

  const sessionScenarios = useMemo(() => {
    const copy = [...SCENARIOS];
    // simple shuffle
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(5, copy.length));
  }, []);

  if (!currentUser) {
    return (
      <AppShell role="student" title="Interactive Activity">
        <div className="p-6">Please sign in to try the activity.</div>
      </AppShell>
    );
  }

  const scene = sessionScenarios[index];

  const submitAnswer = () => {
    let pts = 0;
    if (scene.type === "mc" && scene.choices) {
      const choice = scene.choices.find((c) => c.id === selected);
      pts = choice?.points ?? 0;
    }
    if (scene.type === "text") {
      const text = freeText.toLowerCase();
      pts = scene.keywords?.some((k) => text.includes(k)) ? 3 : 1;
    }
    const newTotal = totalPoints + pts;
    setTotalPoints(newTotal);
    setSelected(null);
    setFreeText("");
    if (index + 1 >= sessionScenarios.length) {
      setFinished(true);
      const xp = Math.max(5, newTotal * 10);
      awardXp(xp);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const reset = () => {
    setIndex(0);
    setSelected(null);
    setFreeText("");
    setTotalPoints(0);
    setFinished(false);
  };

  const tier = totalPoints >= 6 ? "Ambitious" : totalPoints >= 3 ? "Growing" : "Beginner";

  return (
    <AppShell role="student" title="Interactive Activity">
      <div className="space-y-6">
        <SectionHeading title="Interactive Activity" description="Practice decisions with short scenarios." />

        {!finished ? (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-card">
            <p className="text-sm text-muted-foreground">Scenario {index + 1} of {sessionScenarios.length}</p>
            <h2 className="mt-2 font-display text-lg font-semibold">{scene.prompt}</h2>

            {scene.type === "mc" && scene.choices && (
              <div className="mt-4 space-y-2">
                {scene.choices.map((c) => (
                  <label key={c.id} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="choice"
                      checked={selected === c.id}
                      onChange={() => setSelected(c.id)}
                    />
                    <span className="text-sm">{c.label}</span>
                  </label>
                ))}
              </div>
            )}

            {scene.type === "text" && (
              <div className="mt-4 space-y-2">
                <Label>Answer</Label>
                <Textarea value={freeText} onChange={(e) => setFreeText(e.target.value)} />
                <p className="text-xs text-muted-foreground">Try to mention practical channels or tactics.</p>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <Button onClick={submitAnswer} disabled={scene.type === "mc" ? !selected : !freeText}>
                Submit
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Cancel</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-card">
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
      </div>
    </AppShell>
  );
}

export default ActivityPage;
