import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ClipboardList, Target, Users } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { SectionHeading, StatCard } from "@/components/bizcraft/ui-bits";
import { useBizCraft } from "@/lib/bizcraft/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

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

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

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

  // Chart data: Story completions for bar chart
  const storyCompletionData = completionByStory.slice(0, 7).map(({ story, count }) => ({
    name: story.name.split(" ")[0], // First name only for brevity
    completions: count,
  }));

  // Chart data: Quiz performance distribution
  const quizScoreDistribution = [
    { range: "0-20%", count: attempts.filter((a) => (a.score / a.total_questions) * 100 <= 20).length },
    { range: "21-40%", count: attempts.filter((a) => {
      const pct = (a.score / a.total_questions) * 100;
      return pct > 20 && pct <= 40;
    }).length },
    { range: "41-60%", count: attempts.filter((a) => {
      const pct = (a.score / a.total_questions) * 100;
      return pct > 40 && pct <= 60;
    }).length },
    { range: "61-80%", count: attempts.filter((a) => {
      const pct = (a.score / a.total_questions) * 100;
      return pct > 60 && pct <= 80;
    }).length },
    { range: "81-100%", count: attempts.filter((a) => (a.score / a.total_questions) * 100 > 80).length },
  ];

  // Chart data: Student progress overview (pie chart)
  const progressOverview = [
    { name: "Completed Stories", value: db.student_progress.filter((p) => p.status === "completed").length },
    { name: "In Progress", value: db.student_progress.filter((p) => p.status === "in_progress").length },
    { name: "Not Started", value: (students.length * db.entrepreneur_stories.length) - db.student_progress.length },
  ];

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

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Story Completions Bar Chart */}
          <section className="rounded-xl border border-border bg-card-story p-5 shadow-card">
            <SectionHeading title="Most Completed Stories" />
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storyCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  />
                  <Bar dataKey="completions" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Student Progress Pie Chart */}
          <section className="rounded-xl border border-border bg-card-story p-5 shadow-card">
            <SectionHeading title="Overall Progress Distribution" />
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressOverview}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {progressOverview.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Quiz Score Distribution */}
        <section className="rounded-xl border border-border bg-card-story p-5 shadow-card">
          <SectionHeading title="Quiz Score Distribution" />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizScoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} name="Number of Attempts" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card-story p-5 shadow-card">
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
