import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBizCraft } from "@/lib/bizcraft/store";
import type { Badge } from "@/lib/bizcraft/types";

export const Route = createFileRoute("/admin/badges")({
  head: () => ({
    meta: [
      { title: "Manage Badges — BizCraft Admin" },
      {
        name: "description",
        content: "Create, edit and delete achievement badges and set their unlock requirements.",
      },
      { property: "og:title", content: "Manage Badges — BizCraft Admin" },
      { property: "og:description", content: "Badge configuration for the XP system." },
    ],
  }),
  component: AdminBadges,
});

const empty = (): Badge => ({
  id: `b-${Date.now()}`,
  name: "",
  description: "",
  requirement: "",
  icon: "Medal",
});

function AdminBadges() {
  const { db, saveBadge, deleteBadge } = useBizCraft();
  const [editing, setEditing] = useState<Badge | null>(null);

  return (
    <AppShell
      role="admin"
      title="Badges"
      subtitle="Achievements students can unlock"
      actions={
        <Button size="sm" onClick={() => setEditing(empty())}>
          <Plus className="size-4" /> Create Badge
        </Button>
      }
    >
      {editing && (
        <form
          className="mb-6 space-y-4 rounded-xl border border-border bg-card p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            saveBadge(editing);
            setEditing(null);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Badge Name</Label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Requirement</Label>
              <Input
                value={editing.requirement}
                onChange={(e) => setEditing({ ...editing, requirement: e.target.value })}
                placeholder="stories_completed >= 3"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Badge</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {db.badges.map((b) => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="font-display text-base font-semibold">{b.name}</p>
            <p className="text-sm text-muted-foreground">{b.description}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{b.requirement}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Earned by{" "}
              {db.student_badges.filter((sb) => sb.badge_id === b.id).length} student(s)
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(b)}>
                <Pencil className="size-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => deleteBadge(b.id)}>
                <Trash2 className="size-4 text-destructive" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
