import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBizCraft } from "@/lib/bizcraft/store";
import type { EntrepreneurStory } from "@/lib/bizcraft/types";

export const Route = createFileRoute("/admin/stories")({
  head: () => ({
    meta: [
      { title: "Manage Entrepreneur Stories — BizCraft Admin" },
      {
        name: "description",
        content:
          "Add, edit and delete entrepreneur stories including photo, video URL, biography and key lessons.",
      },
      { property: "og:title", content: "Manage Entrepreneur Stories — BizCraft Admin" },
      { property: "og:description", content: "Content management for entrepreneur stories." },
    ],
  }),
  component: AdminStories,
});

const empty = (): EntrepreneurStory => ({
  id: `s-${Date.now()}`,
  name: "",
  business_name: "",
  business_type: "",
  location: "",
  photo_url: "",
  short_description: "",
  biography: "",
  video_url: "",
  content: [],
  key_lessons: [],
  is_published: true,
});

function AdminStories() {
  const { db, saveStory, deleteStory } = useBizCraft();
  const [editing, setEditing] = useState<EntrepreneurStory | null>(null);

  const set = <K extends keyof EntrepreneurStory>(k: K, v: EntrepreneurStory[K]) =>
    setEditing((s) => (s ? { ...s, [k]: v } : s));

  return (
    <AppShell
      role="admin"
      title="Entrepreneur Stories"
      subtitle="Add, edit or remove learning content"
      actions={
        <Button size="sm" onClick={() => setEditing(empty())}>
          <Plus className="size-4" /> Add Story
        </Button>
      }
    >
      {editing && (
        <form
          className="mb-6 space-y-4 rounded-xl border border-border bg-card p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            saveStory(editing);
            setEditing(null);
          }}
        >
          <h2 className="font-display text-base font-semibold">
            {db.entrepreneur_stories.some((s) => s.id === editing.id) ? "Edit" : "New"} story
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Entrepreneur Name</Label>
              <Input value={editing.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={editing.business_name}
                onChange={(e) => set("business_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Input
                value={editing.business_type}
                onChange={(e) => set("business_type", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={editing.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Entrepreneur Image URL</Label>
              <Input
                value={editing.photo_url}
                onChange={(e) => set("photo_url", e.target.value)}
                placeholder="https://…/photo.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input value={editing.video_url} onChange={(e) => set("video_url", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Short Description</Label>
            <Input
              value={editing.short_description}
              onChange={(e) => set("short_description", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Biography</Label>
            <Textarea
              rows={3}
              value={editing.biography}
              onChange={(e) => set("biography", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Story / Interview Content (one paragraph per line)</Label>
            <Textarea
              rows={5}
              value={editing.content.join("\n")}
              onChange={(e) => set("content", e.target.value.split("\n").filter(Boolean))}
            />
          </div>
          <div className="space-y-2">
            <Label>Key Lessons (one per line)</Label>
            <Textarea
              rows={4}
              value={editing.key_lessons.join("\n")}
              onChange={(e) => set("key_lessons", e.target.value.split("\n").filter(Boolean))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Story</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {db.entrepreneur_stories.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center"
          >
            {s.photo_url && (
              <img
                src={s.photo_url}
                alt={s.name}
                loading="lazy"
                width={800}
                height={600}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-muted-foreground">
                {s.business_name} · {s.business_type} · {s.location}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(s)}>
                <Pencil className="size-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => deleteStory(s.id)}>
                <Trash2 className="size-4 text-destructive" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
