import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { SectionHeading } from "@/components/bizcraft/ui-bits";
import { useBizCraft } from "@/lib/bizcraft/store";

export const Route = createFileRoute("/admin/activity-questions")({
  head: () => ({
    meta: [
      { title: "Admin — Activity Questions" },
      { name: "description", content: "Manage activity question bank" },
    ],
  }),
  component: AdminActivityQuestions,
});

function AdminActivityQuestions() {
  const { questionsForStory, saveQuestion, deleteQuestion } = useBizCraft();
  const [questions, setQuestions] = useState(() => questionsForStory("s-activity") || []);
  const [editing, setEditing] = useState<null | string>(null);
  const [form, setForm] = useState(() => ({
    question_text: "",
    choices: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  }));

  const refresh = () => setQuestions(questionsForStory("s-activity") || []);

  const handleAdd = () => {
    const idBase = `q-activity-${Date.now()}`;
    const newQ = {
      id: idBase,
      story_id: "s-activity",
      question_text: form.question_text,
      choices: form.choices.map((text, i) => ({ id: `${idBase}-c${i + 1}`, label: ("ABCD" as any)[i], text })),
      correct_choice_id: `${idBase}-c${form.correctIndex + 1}`,
      explanation: form.explanation,
    } as any;
    saveQuestion(newQ);
    setForm({ question_text: "", choices: ["", "", "", ""], correctIndex: 0, explanation: "" });
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this question?")) return;
    deleteQuestion(id);
    refresh();
  };

  return (
    <AppShell role="admin" title="Activity Questions">
      <div className="space-y-6">
        <SectionHeading title="Activity Question Bank" description="Manage multiple-choice scenarios used in the activity." />

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-medium">Add Question</h3>
          <div className="mt-3 grid gap-2">
            <input
              value={form.question_text}
              onChange={(e) => setForm((f) => ({ ...f, question_text: e.target.value }))}
              placeholder="Question text"
              className="input"
            />
            {form.choices.map((c, i) => (
              <input
                key={i}
                value={c}
                onChange={(e) => setForm((f) => ({ ...f, choices: f.choices.map((x, j) => (j === i ? e.target.value : x)) }))}
                placeholder={`Choice ${String.fromCharCode(65 + i)}`}
                className="input"
              />
            ))}
            <label className="text-sm">Correct choice index</label>
            <select value={form.correctIndex} onChange={(e) => setForm((f) => ({ ...f, correctIndex: Number(e.target.value) }))}>
              <option value={0}>A</option>
              <option value={1}>B</option>
              <option value={2}>C</option>
              <option value={3}>D</option>
            </select>
            <input
              value={form.explanation}
              onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
              placeholder="Short explanation"
              className="input"
            />
            <div>
              <button onClick={handleAdd} className="btn btn-primary">Add</button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-medium">Existing Questions</h3>
          <ul className="mt-3 space-y-3">
            {questions.map((q: any) => (
              <li key={q.id} className="rounded-md border p-3 bg-background">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{q.question_text}</div>
                    <div className="text-sm text-muted-foreground">{q.explanation}</div>
                    <ul className="mt-2 text-sm space-y-1">
                      {q.choices.map((c: any) => (
                        <li key={c.id} className={c.id === q.correct_choice_id ? "font-semibold" : ""}>
                          {c.label}. {c.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { navigator.clipboard?.writeText(q.id); alert('Copied id: ' + q.id); }} className="btn">Copy ID</button>
                    <button onClick={() => handleDelete(q.id)} className="btn btn-destructive">Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div>
          <Link to="/admin/" className="btn btn-outline">Back to Admin</Link>
        </div>
      </div>
    </AppShell>
  );
}
