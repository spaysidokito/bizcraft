import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ClipboardList, Target, Users } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { SectionHeading, StatCard } from "@/components/bizcraft/ui-bits";
import { useBizCraft } from "@/lib/bizcraft/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — BizCraft" },
      {
        name: "description",
        content:
          "BizCraft administrator overview of students, entrepreneur stories, quizzes and average scores.",
      },
      { property: "og:title", content: "Admin Dashboard — BizCraft" },
      { property: "og:description", content: "Overview of BizCraft usage and content." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { db } = useBizCraft();
  const students = db.users.filter((u) => u.role === "student");
  const attempts = db.quiz_attempts;
  const avg = attempts.length
    ? Math.round(
        attempts.reduce((s, a) => s + (a.score / a.total_questions) * 100, 0) / attempts.length,
      )
    : 0;

  const completionByStory = db.entrepreneur_stories
    .map((s) => ({
      story: s,
      count: db.student_progress.filter((p) => p.story_id === s.id && p.status === "completed")
        .length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <AppShell role="admin" title="Admin Dashboard" subtitle="BizCraft content and usage overview">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Students" value={students.length} icon={<Users className="size-5" />} tone="purple" />
          <StatCard
            label="Entrepreneur Stories"
            value={db.entrepreneur_stories.length}
            icon={<BookOpen className="size-5" />}
            tone="orange"
          />
          <StatCard
            label="Quiz Questions"
            value={db.quiz_questions.length}
            icon={<ClipboardList className="size-5" />}
            tone="green"
          />
          <StatCard label="Completed Quizzes" value={attempts.length} icon={<Target className="size-5" />} tone="purple" />
          <StatCard label="Average Quiz Score" value={`${avg}%`} tone="orange" />
          <StatCard label="Badges Defined" value={db.badges.length} tone="green" />
        </div>

        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <SectionHeading title="Most Completed Stories" />
          <ul className="space-y-2">
            {completionByStory.map(({ story, count }) => (
              <li key={story.id} className="flex items-center justify-between text-sm">
                <span>
                  {story.name} — <span className="text-muted-foreground">{story.business_name}</span>
                </span>
                <span className="font-medium">{count} completions</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
