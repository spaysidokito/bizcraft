import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/bizcraft/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBizCraft } from "@/lib/bizcraft/store";
import { levelForXp } from "@/lib/bizcraft/data";
import type { StudentProfile, User } from "@/lib/bizcraft/types";

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
  const { db, statsFor, saveStudent, deleteStudent } = useBizCraft();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<{ user: User; profile: StudentProfile } | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<User | null>(null);

  const students = db.users
    .filter((u) => u.role === "student")
    .filter((u) => `${u.full_name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  const emptyStudent = (): { user: User; profile: StudentProfile } => {
    const id = `u-${Date.now()}`;
    return {
      user: {
        id,
        full_name: "",
        email: "",
        username: "",
        password: "",
        role: "student",
      },
      profile: {
        user_id: id,
        grade_level: "",
        section: "",
        xp: 0,
        avatar_url: null,
      },
    };
  };

  return (
    <AppShell
      role="admin"
      title="Students"
      subtitle="View student progress, XP and achievements"
      actions={
        <Button size="sm" onClick={() => setEditing(emptyStudent())}>
          <Plus className="size-4" /> Add User
        </Button>
      }
    >
      {editing && (
        <form
          className="mb-6 space-y-4 rounded-xl border border-border bg-card-story p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            const isEditing = db.users.some((u) => u.id === editing.user.id);
            saveStudent(editing.user, editing.profile);
            setEditing(null);
            toast.success(isEditing ? "Student saved successfully." : "Student added successfully.");
          }}
        >
          <h2 className="font-display text-base font-semibold">
            {db.users.some((u) => u.id === editing.user.id) ? "Edit Student" : "New Student"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editing.user.full_name}
                onChange={(e) => setEditing({ ...editing, user: { ...editing.user, full_name: e.target.value } })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editing.user.email}
                onChange={(e) => setEditing({ ...editing, user: { ...editing.user, email: e.target.value } })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={editing.user.username}
                onChange={(e) => setEditing({ ...editing, user: { ...editing.user, username: e.target.value } })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={editing.user.password}
                onChange={(e) => setEditing({ ...editing, user: { ...editing.user, password: e.target.value } })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>XP</Label>
              <Input
                type="number"
                min={0}
                value={editing.profile.xp}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    profile: { ...editing.profile, xp: Number(e.target.value) },
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              {db.users.some((u) => u.id === editing.user.id) ? "Save User" : "Add User"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 bg-white border-2 border-border shadow-card rounded-xl h-11"
          placeholder="Search students"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card-story shadow-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Username</th>
              <th className="p-3">Level</th>
              <th className="p-3">XP</th>
              <th className="p-3">Stories</th>
              <th className="p-3">Quizzes</th>
              <th className="p-3">Avg. Score</th>
              <th className="p-3">Badges</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, index) => {
              const stats = statsFor(s.id);
              const level = levelForXp(stats.xp);
              return (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <p className="font-medium">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">@{s.username}</td>
                  <td className="p-3">{`L${level.level} ${level.title}`}</td>
                  <td className="p-3 font-medium text-orange">{stats.xp}</td>
                  <td className="p-3">{stats.stories_completed}</td>
                  <td className="p-3">{stats.quizzes_completed}</td>
                  <td className="p-3">{stats.average_score}%</td>
                  <td className="p-3">{stats.badges.length}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing({ user: s, profile: db.student_profiles.find((p) => p.user_id === s.id) ?? { user_id: s.id, grade_level: "", section: "", xp: 0, avatar_url: null } })}>
                        <Pencil className="size-4" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteCandidate(s)}>
                        <Trash2 className="size-4 text-destructive" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {students.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">No students found.</p>
      )}

      <AlertDialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCandidate ? (
                <>This will permanently remove {deleteCandidate.full_name} and all associated student progress and quiz data.</>
              ) : (
                <>This will permanently remove the selected student and all related data.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteCandidate) {
                    deleteStudent(deleteCandidate.id);
                    toast.success("Student deleted successfully.");
                  }
                  setDeleteCandidate(null);
                }}
              >
                Delete student
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
