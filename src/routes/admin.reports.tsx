import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/bizcraft/app-shell";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/bizcraft/ui-bits";
import { useBizCraft } from "@/lib/bizcraft/store";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — BizCraft Admin" },
      {
        name: "description",
        content: "Quiz attempt reports, story completion counts and class performance summaries.",
      },
      { property: "og:title", content: "Reports — BizCraft Admin" },
      { property: "og:description", content: "Class performance reporting for BizCraft." },
    ],
  }),
  component: AdminReports,
});

function AdminReports() {
  const { db, resetDemoData } = useBizCraft();
  const attempts = [...db.quiz_attempts]
    .filter((a) => db.users.find((u) => u.id === a.student_id)?.role === "student")
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at));

  return (
    <AppShell
      role="admin"
      title="Reports"
      subtitle="Recent quiz attempts and class performance"
      actions={
        <Button variant="outline" size="sm" onClick={resetDemoData}>
          Reset demo data
        </Button>
      }
    >
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <SectionHeading title="Recent Quiz Attempts" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-2">Student</th>
                <th className="p-2">Story</th>
                <th className="p-2">Score</th>
                <th className="p-2">XP</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="p-2">
                    {db.users.find((u) => u.id === a.student_id)?.full_name ?? "Unknown"}
                  </td>
                  <td className="p-2 text-muted-foreground">
                    {db.entrepreneur_stories.find((s) => s.id === a.story_id)?.name ?? "—"}
                  </td>
                  <td className="p-2">
                    {a.score}/{a.total_questions} (
                    {Math.round((a.score / a.total_questions) * 100)}%)
                  </td>
                  <td className="p-2 text-orange">+{a.xp_earned}</td>
                  <td className="p-2 text-muted-foreground">
                    {new Date(a.completed_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {attempts.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No quiz attempts recorded.</p>
        )}
      </section>
    </AppShell>
  );
}
