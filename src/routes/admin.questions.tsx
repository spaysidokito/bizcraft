import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBizCraft } from "@/lib/bizcraft/store";
import type { QuizQuestion } from "@/lib/bizcraft/types";

export const Route = createFileRoute("/admin/questions")({
  head: () => ({
    meta: [
      { title: "Manage Quiz Questions — BizCraft Admin" },
      {
        name: "description",
        content:
          "Create quiz questions with four choices, a correct answer, an explanation and an assigned entrepreneur story.",
      },
      { property: "og:title", content: "Manage Quiz Questions — BizCraft Admin" },
      { property: "og:description", content: "Quiz bank management for teachers." },
    ],
  }),
  component: AdminQuestions,
});

const labels = ["A", "B", "C", "D"] as const;

function emptyQuestion(storyId: string): QuizQuestion {
  const id = `q-${Date.now()}`;
  const choices = labels.map((label, i) => ({ id: `${id}-c${i + 1}`, label, text: "" }));
  return {
    id,
    story_id: storyId,
    question_text: "",
    choices,
    correct_choice_id: choices[0]!.id,
    explanation: "",
  };
}

function AdminQuestions() {
  const { db, saveQuestion, deleteQuestion } = useBizCraft();
  const [storyFilter, setStoryFilter] = useState(db.entrepreneur_stories[0]?.id ?? "");
  const [editing, setEditing] = useState<QuizQuestion | null>(null);

  const questions = db.quiz_questions.filter((q) => q.story_id === storyFilter);

  return (
    <AppShell
      role="admin"
      title="Quiz Questions"
      subtitle="Question bank per entrepreneur story"
      actions={
        <Button size="sm" onClick={() => setEditing(emptyQuestion(storyFilter))} disabled={!storyFilter}>
          <Plus className="size-4" /> Add Question
        </Button>
      }
    >
      <div className="mb-4 max-w-sm space-y-2">
        <Label>Entrepreneur Story</Label>
        <Select value={storyFilter} onValueChange={setStoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select a story" />
          </SelectTrigger>
          <SelectContent>
            {db.entrepreneur_stories.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} — {s.business_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {editing && (
        <form
          className="mb-6 space-y-4 rounded-xl border border-border bg-card p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            saveQuestion(editing);
            setEditing(null);
          }}
        >
          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea
              rows={2}
              value={editing.question_text}
              onChange={(e) => setEditing({ ...editing, question_text: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {editing.choices.map((c, i) => (
              <div key={c.id} className="space-y-2">
                <Label>Choice {c.label}</Label>
                <Input
                  value={c.text}
                  onChange={(e) => {
                    const choices = [...editing.choices];
                    choices[i] = { ...c, text: e.target.value };
                    setEditing({ ...editing, choices });
                  }}
                  required
                />
              </div>
            ))}
          </div>
          <div className="max-w-xs space-y-2">
            <Label>Correct Answer</Label>
            <Select
              value={editing.correct_choice_id}
              onValueChange={(v) => setEditing({ ...editing, correct_choice_id: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {editing.choices.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Explanation</Label>
            <Textarea
              rows={2}
              value={editing.explanation}
              onChange={(e) => setEditing({ ...editing, explanation: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Question</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {questions.map((q, i) => {
          const correct = q.choices.find((c) => c.id === q.correct_choice_id);
          return (
            <div key={q.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Question {i + 1}
                  </p>
                  <p className="font-medium">{q.question_text}</p>
                  <p className="mt-1 text-sm text-success">
                    Correct: {correct?.label}. {correct?.text}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{q.explanation}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(q)}>
                    <Pencil className="size-4" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteQuestion(q.id)}>
                    <Trash2 className="size-4 text-destructive" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {questions.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No questions yet for this story.
          </p>
        )}
      </div>
    </AppShell>
  );
}
