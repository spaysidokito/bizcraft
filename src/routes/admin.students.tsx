import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { Input } from "@/components/ui/input";
import { useBizCraft } from "@/lib/bizcraft/store";
import { levelForXp } from "@/lib/bizcraft/data";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Manage Students — BizCraft Admin" },
      {
        name: "description",
        content: "Search students and review their XP, level, completed stories, quizzes and badges.",
      },
      { property: "og:title", content: "Manage Students — BizCraft Admin" },
      { property: "og:description", content: "Student progress monitoring for teachers." },
    ],
  }),
  component: AdminStudents,
});

function AdminStudents() {
  const { db, statsFor } = useBizCraft();
  const [q, setQ] = useState("");

  const students = db.users
    .filter((u) => u.role === "student")
    .filter((u) => `${u.full_name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell role="admin" title="Students" subtitle="View student progress, XP and achievements">
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search students"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Grade / Section</th>
              <th className="p-3">Level</th>
              <th className="p-3">XP</th>
              <th className="p-3">Stories</th>
              <th className="p-3">Quizzes</th>
              <th className="p-3">Avg. Score</th>
              <th className="p-3">Badges</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const profile = db.student_profiles.find((p) => p.user_id === s.id);
              const stats = statsFor(s.id);
              const level = levelForXp(stats.xp);
              return (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <p className="font-medium">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {profile ? `${profile.grade_level} · ${profile.section}` : "—"}
                  </td>
                  <td className="p-3">{`L${level.level} ${level.title}`}</td>
                  <td className="p-3 font-medium text-orange">{stats.xp}</td>
                  <td className="p-3">{stats.stories_completed}</td>
                  <td className="p-3">{stats.quizzes_completed}</td>
                  <td className="p-3">{stats.average_score}%</td>
                  <td className="p-3">{stats.badges.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {students.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">No students found.</p>
      )}
    </AppShell>
  );
}
