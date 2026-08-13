import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { SectionHeading } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import {
  useBizCraft,
  DEFAULT_ACTIVITY_SETTINGS,
  DEFAULT_ACTIVITY_SCENARIOS,
} from "@/lib/bizcraft/store";
import type { ActivityScenario, ActivityScenarioChoice } from "@/lib/bizcraft/store";
import { toast } from "sonner";
import {
  Clock,
  Zap,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  ListChecks,
  Type,
  GripVertical,
} from "lucide-react";

export const Route = createFileRoute("/admin/activity-settings")({
  head: () => ({
    meta: [
      { title: "Admin — Activity Settings — BizCraft" },
      { name: "description", content: "Configure the interactive activity countdown and scenarios." },
    ],
  }),
  component: AdminActivitySettings,
});

// ─── Blank scenario template ────────────────────────────────────────────────
function blankScenario(): ActivityScenario {
  const id = `s-${Date.now()}`;
  return {
    id,
    prompt: "",
    type: "mc",
    choices: [
      { id: `${id}-c1`, label: "", points: 3 },
      { id: `${id}-c2`, label: "", points: 1 },
      { id: `${id}-c3`, label: "", points: 0 },
    ],
    bestChoiceId: `${id}-c1`,
    keywords: [],
    explanation: "",
  };
}

// ─── Inline scenario editor ──────────────────────────────────────────────────
function ScenarioEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: ActivityScenario;
  onSave: (s: ActivityScenario) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ActivityScenario>(() => ({
    ...initial,
    choices: initial.choices ? initial.choices.map((c) => ({ ...c })) : [],
    keywords: initial.keywords ? [...initial.keywords] : [],
  }));

  const setField = <K extends keyof ActivityScenario>(k: K, v: ActivityScenario[K]) =>
    setDraft((prev) => ({ ...prev, [k]: v }));

  const setChoiceField = (idx: number, field: keyof ActivityScenarioChoice, value: string | number) =>
    setDraft((prev) => ({
      ...prev,
      choices: (prev.choices ?? []).map((c, i) =>
        i === idx ? { ...c, [field]: value } : c
      ),
    }));

  const addChoice = () => {
    const newId = `${draft.id}-c${Date.now()}`;
    setDraft((prev) => ({
      ...prev,
      choices: [...(prev.choices ?? []), { id: newId, label: "", points: 0 }],
    }));
  };

  const removeChoice = (idx: number) =>
    setDraft((prev) => {
      const updated = (prev.choices ?? []).filter((_, i) => i !== idx);
      return {
        ...prev,
        choices: updated,
        bestChoiceId:
          prev.bestChoiceId === (prev.choices ?? [])[idx]?.id
            ? updated[0]?.id
            : prev.bestChoiceId,
      };
    });

  const handleSubmit = () => {
    if (!draft.prompt.trim()) {
      toast.error("Scenario prompt is required.");
      return;
    }
    if (draft.type === "mc") {
      const choices = draft.choices ?? [];
      if (choices.length < 2) {
        toast.error("Multiple-choice scenarios need at least 2 choices.");
        return;
      }
      if (choices.some((c) => !c.label.trim())) {
        toast.error("All choice labels must be filled in.");
        return;
      }
    }
    if (draft.type === "text" && (!draft.keywords || draft.keywords.length === 0)) {
      toast.error("Text scenarios need at least one keyword.");
      return;
    }
    onSave(draft);
  };

  return (
    <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-5 space-y-4 shadow-sm">
      {/* Type toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Type:</span>
        <div className="flex rounded-lg overflow-hidden border border-border">
          <button
            onClick={() => setField("type", "mc")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              draft.type === "mc" ? "bg-yellow-400 text-white" : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <ListChecks className="size-3.5" /> Multiple Choice
          </button>
          <button
            onClick={() => setField("type", "text")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              draft.type === "text" ? "bg-yellow-400 text-white" : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <Type className="size-3.5" /> Free Text
          </button>
        </div>
      </div>

      {/* Prompt */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Scenario Prompt
        </label>
        <textarea
          rows={2}
          value={draft.prompt}
          onChange={(e) => setField("prompt", e.target.value)}
          placeholder="Write the business scenario question…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
        />
      </div>

      {/* MC Choices */}
      {draft.type === "mc" && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Answer Choices
          </label>
          {(draft.choices ?? []).map((c, i) => (
            <div key={c.id} className="flex items-center gap-2">
              <input
                type="radio"
                name={`best-${draft.id}`}
                checked={draft.bestChoiceId === c.id}
                onChange={() => setField("bestChoiceId", c.id)}
                className="accent-yellow-500 flex-shrink-0"
                title="Mark as best answer"
              />
              <input
                type="text"
                value={c.label}
                onChange={(e) => setChoiceField(i, "label", e.target.value)}
                placeholder={`Choice ${i + 1} label`}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">pts</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={c.points}
                  onChange={(e) => setChoiceField(i, "points", Number(e.target.value))}
                  className="w-14 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
              {(draft.choices ?? []).length > 2 && (
                <button
                  onClick={() => removeChoice(i)}
                  className="text-destructive hover:text-destructive/80 transition-colors"
                  title="Remove choice"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">
            ● Radio = best answer (max points). Adjust points per choice (0–10).
          </p>
          <button
            onClick={addChoice}
            className="flex items-center gap-1.5 text-xs text-yellow-600 hover:text-yellow-700 font-medium"
          >
            <Plus className="size-3.5" /> Add choice
          </button>
        </div>
      )}

      {/* Keywords (text type) */}
      {draft.type === "text" && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Keywords (comma-separated)
          </label>
          <input
            type="text"
            value={(draft.keywords ?? []).join(", ")}
            onChange={(e) =>
              setField(
                "keywords",
                e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
              )
            }
            placeholder="e.g. social, facebook, promo"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <p className="text-[11px] text-muted-foreground">
            If a student's answer contains any keyword, they earn full points.
          </p>
        </div>
      )}

      {/* Explanation */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Explanation (shown in feedback)
        </label>
        <textarea
          rows={2}
          value={draft.explanation ?? ""}
          onChange={(e) => setField("explanation", e.target.value)}
          placeholder="Brief explanation shown after the student answers…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
        />
      </div>

      {/* Editor actions */}
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={handleSubmit} className="gap-1.5 bg-yellow-400 text-white hover:bg-yellow-500">
          <Save className="size-3.5" /> Save Scenario
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1.5">
          <X className="size-3.5" /> Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Scenario card (collapsed view) ─────────────────────────────────────────
function ScenarioCard({
  scenario,
  index,
  onEdit,
  onDelete,
}: {
  scenario: ActivityScenario;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card-story shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical className="size-4 text-muted-foreground flex-shrink-0 opacity-40" />
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-yellow-700 flex-shrink-0">
          {index + 1}
        </span>
        <span className={`mr-2 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          scenario.type === "mc"
            ? "bg-purple-100 text-purple-700"
            : "bg-blue-100 text-blue-700"
        }`}>
          {scenario.type === "mc" ? "MC" : "Text"}
        </span>
        <p className="flex-1 text-sm font-medium line-clamp-1">{scenario.prompt}</p>
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
            title={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          <button
            onClick={onEdit}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
            title="Edit"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-border bg-background px-4 py-3 space-y-2 text-sm">
          {scenario.type === "mc" && scenario.choices && (
            <ul className="space-y-1">
              {scenario.choices.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${
                    c.id === scenario.bestChoiceId ? "bg-green-500" : "bg-muted-foreground/30"
                  }`} />
                  <span className={c.id === scenario.bestChoiceId ? "font-semibold" : ""}>
                    {c.label}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">{c.points} pts</span>
                </li>
              ))}
            </ul>
          )}
          {scenario.type === "text" && scenario.keywords && (
            <div className="flex flex-wrap gap-1">
              {scenario.keywords.map((k) => (
                <span key={k} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                  {k}
                </span>
              ))}
            </div>
          )}
          {scenario.explanation && (
            <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
              <span className="font-medium">Explanation:</span> {scenario.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
function AdminActivitySettings() {
  const { db, saveActivitySettings, saveActivityScenario, deleteActivityScenario } = useBizCraft();
  const stored = db.activity_settings ?? DEFAULT_ACTIVITY_SETTINGS;
  const scenarios: ActivityScenario[] = db.activity_scenarios?.length
    ? db.activity_scenarios
    : DEFAULT_ACTIVITY_SCENARIOS;

  // ── Settings state ──────────────────────────────────────────────────────
  const [countdownSeconds, setCountdownSeconds] = useState(stored.countdownSeconds);
  const [autoAdvance, setAutoAdvance] = useState(stored.autoAdvance);
  const [settingsDirty, setSettingsDirty] = useState(false);

  const handleCountdownChange = (val: number) => { setCountdownSeconds(val); setSettingsDirty(true); };
  const handleToggle = () => { setAutoAdvance((prev) => !prev); setSettingsDirty(true); };
  const handleSaveSettings = () => {
    saveActivitySettings({ countdownSeconds, autoAdvance });
    setSettingsDirty(false);
    toast.success("Activity settings saved.");
  };
  const handleResetSettings = () => {
    setCountdownSeconds(DEFAULT_ACTIVITY_SETTINGS.countdownSeconds);
    setAutoAdvance(DEFAULT_ACTIVITY_SETTINGS.autoAdvance);
    setSettingsDirty(true);
  };

  // ── Scenario CRUD state ─────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null); // null = none
  const [addingNew, setAddingNew] = useState(false);

  const handleSaveScenario = (s: ActivityScenario) => {
    saveActivityScenario(s);
    setEditingId(null);
    setAddingNew(false);
    toast.success("Scenario saved.");
  };

  const handleDeleteScenario = (id: string) => {
    if (!window.confirm("Delete this scenario? This cannot be undone.")) return;
    deleteActivityScenario(id);
    toast.success("Scenario deleted.");
  };

  // Preview ring math
  const r = 28;
  const circ = 2 * Math.PI * r;

  return (
    <AppShell role="admin" title="Activity Settings">
      <div className="space-y-8 max-w-3xl">
        <SectionHeading
          title="Activity Settings"
          description="Configure countdown behaviour and manage the scenario question bank."
        />

        {/* ── Auto-advance toggle ─────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card-story p-6 shadow-card space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 flex-shrink-0">
              <Zap className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Auto-Advance</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                When enabled, the activity automatically moves to the next scenario after the
                countdown ends. When disabled, only the manual <em>Next</em> button works.
              </p>
            </div>
            <button
              id="auto-advance-toggle"
              role="switch"
              aria-checked={autoAdvance}
              onClick={handleToggle}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ${
                autoAdvance ? "bg-yellow-400" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                  autoAdvance ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        {/* ── Countdown duration ──────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card-story p-6 shadow-card space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 flex-shrink-0">
              <Clock className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Countdown Duration</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Seconds shown after a student submits before auto-advancing. Range: 3 – 30 s.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
              <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
                <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
                <circle
                  cx="36" cy="36" r={r}
                  fill="none" stroke="#eab308" strokeWidth="5"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * 0.35}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-yellow-600">
                {countdownSeconds}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <input
                id="countdown-slider"
                type="range" min={3} max={30} step={1}
                value={countdownSeconds}
                onChange={(e) => handleCountdownChange(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 s</span><span>30 s</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[3, 5, 10, 15, 20].map((s) => (
              <button key={s} onClick={() => handleCountdownChange(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  countdownSeconds === s
                    ? "bg-yellow-400 text-white"
                    : "bg-muted text-muted-foreground hover:bg-yellow-100 hover:text-yellow-700"
                }`}
              >{s}s</button>
            ))}
          </div>
        </section>

        {/* Saved summary + save button */}
        <section className="rounded-xl border border-dashed border-yellow-300 bg-yellow-50 p-4 text-sm">
          <p className="font-medium text-yellow-800">Currently saved configuration</p>
          <ul className="mt-1 space-y-0.5 text-yellow-700">
            <li>Auto-advance: <strong>{stored.autoAdvance ? "Enabled" : "Disabled"}</strong></li>
            <li>Countdown: <strong>{stored.countdownSeconds} seconds</strong></li>
          </ul>
        </section>
        <div className="flex items-center gap-3">
          <Button id="save-activity-settings" onClick={handleSaveSettings} disabled={!settingsDirty}
            className="bg-yellow-400 text-white hover:bg-yellow-500 disabled:opacity-50">
            Save Settings
          </Button>
          <Button variant="outline" id="reset-activity-settings" onClick={handleResetSettings} className="gap-2">
            <RotateCcw className="size-3.5" /> Reset to Defaults
          </Button>
        </div>

        {/* ── Scenario CRUD ───────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Scenario Question Bank</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {scenarios.length} scenario{scenarios.length !== 1 ? "s" : ""} · 5 are picked randomly per session
              </p>
            </div>
            {!addingNew && (
              <Button
                id="add-scenario-btn"
                onClick={() => { setAddingNew(true); setEditingId(null); }}
                className="gap-2 bg-yellow-400 text-white hover:bg-yellow-500"
                size="sm"
              >
                <Plus className="size-4" /> Add Scenario
              </Button>
            )}
          </div>

          {/* New scenario form */}
          {addingNew && (
            <div className="mb-4">
              <ScenarioEditor
                initial={blankScenario()}
                onSave={handleSaveScenario}
                onCancel={() => setAddingNew(false)}
              />
            </div>
          )}

          {/* Scenario list */}
          <div className="space-y-3">
            {scenarios.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No scenarios yet. Click <strong>Add Scenario</strong> to create the first one.
              </div>
            )}
            {scenarios.map((s, i) =>
              editingId === s.id ? (
                <ScenarioEditor
                  key={s.id}
                  initial={s}
                  onSave={handleSaveScenario}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <ScenarioCard
                  key={s.id}
                  scenario={s}
                  index={i}
                  onEdit={() => { setEditingId(s.id); setAddingNew(false); }}
                  onDelete={() => handleDeleteScenario(s.id)}
                />
              )
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
