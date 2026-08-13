import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Medal, Pencil, X } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { LevelPanel, StatCard } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBizCraft } from "@/lib/bizcraft/store";
import { levelForXp } from "@/lib/bizcraft/data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile — BizCraft" },
      {
        name: "description",
        content: "Your BizCraft profile: entrepreneur level, XP, quiz averages and badges.",
      },
      { property: "og:title", content: "Student Profile — BizCraft" },
      { property: "og:description", content: "Your BizCraft learning profile." },
    ],
  }),
  component: ProfilePage,
});

/* ── Avatar options (DiceBear Avataaars) ── */
const AVATARS = Array.from({ length: 12 }, (_, i) => ({
  id: `avatar-${i}`,
  url: `https://api.dicebear.com/9.x/avataaars/svg?seed=bizcraft${i}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
}));

function AvatarPicker({
  current,
  onSelect,
  onClose,
}: {
  current: string | null;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Choose Your Avatar</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map((av) => (
            <button
              key={av.id}
              onClick={() => { onSelect(av.url); onClose(); }}
              className={`relative rounded-xl border-2 p-2 transition-all hover:scale-105 ${
                current === av.url
                  ? "border-primary shadow-md"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg">
                <img src={av.url} alt={av.id} className="h-full w-full object-cover" />
              </div>
              {current === av.url && (
                <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { currentUser, profile, statsFor, updateProfile } = useBizCraft();
  const [editingInfo, setEditingInfo] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [form, setForm] = useState({
    full_name: currentUser?.full_name ?? "",
    email: currentUser?.email ?? "",
    username: currentUser?.username ?? "",
  });

  if (!currentUser || !profile) {
    return (
      <AppShell role="student" title="Profile">
        <div />
      </AppShell>
    );
  }

  const stats = statsFor(currentUser.id);
  const level = levelForXp(profile.xp);
  const avatarUrl =
    profile.avatar_url ??
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUser.id}&backgroundColor=b6e3f4`;

  const handleSaveInfo = () => {
    updateProfile({ full_name: form.full_name, email: form.email, username: form.username });
    setEditingInfo(false);
  };

  const handleCancelInfo = () => {
    setForm({ full_name: currentUser.full_name, email: currentUser.email, username: currentUser.username });
    setEditingInfo(false);
  };

  return (
    <AppShell role="student" title="Profile" subtitle="Your learning record in BizCraft">
      {showAvatarPicker && (
        <AvatarPicker
          current={profile.avatar_url}
          onSelect={(url) => updateProfile({ avatar_url: url })}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}

      <div className="space-y-6">
        {/* Identity Card */}
        <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card-story p-6 shadow-card sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={avatarUrl}
              alt={currentUser.full_name}
              className="size-24 rounded-full border-4 border-white bg-primary-soft shadow-md object-cover"
            />
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary/90 transition-colors"
              aria-label="Change avatar"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 w-full">
            {editingInfo ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="prof-name">Full Name</Label>
                    <Input id="prof-name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="prof-username">Username</Label>
                    <Input id="prof-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="bg-white" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="prof-email">Email</Label>
                    <Input id="prof-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveInfo}><Check className="size-4" /> Save Changes</Button>
                  <Button size="sm" variant="outline" onClick={handleCancelInfo}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">{currentUser.full_name}</h2>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                  <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
                  <p className="mt-1 text-sm font-medium text-primary">Level {level.level} — {level.title}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  // Ensure form is populated with current values when entering edit mode
                  setForm({
                    full_name: currentUser.full_name,
                    email: currentUser.email,
                    username: currentUser.username
                  });
                  setEditingInfo(true);
                }}>
                  <Pencil className="size-4" /> Edit Info
                </Button>
              </div>
            )}
          </div>
        </div>

        <LevelPanel xp={profile.xp} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="XP Points" value={stats.xp} tone="orange" />
          <StatCard label="Stories Completed" value={stats.stories_completed} tone="purple" />
          <StatCard label="Quizzes Completed" value={stats.quizzes_completed} tone="green" />
          <StatCard label="Average Quiz Score" value={`${stats.average_score}%`} tone="purple" />
        </div>

        <section className="rounded-xl border border-border bg-card-story p-5 shadow-card">
          <h2 className="font-display text-base font-semibold">Earned Badges</h2>
          {stats.badges.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No badges yet. Complete a story and its challenge to earn your first badge.
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-3">
              {stats.badges.map((b) => (
                <li key={b.id} className="flex items-center gap-2 rounded-lg border border-border bg-orange-soft px-3 py-2 text-sm">
                  <Medal className="size-4 text-orange" />
                  <span className="font-medium">{b.name}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
