import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Check, Medal, Pencil, Target, User, X } from "lucide-react";
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

/* ── Avatar picker modal ─────────────────────────────────────── */
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

/* ── Profile page ────────────────────────────────────────────── */
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

        {/* ── Hero banner ──────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-7 sm:px-10 shadow-card">
          <span className="pointer-events-none absolute -right-8 -top-8 size-44 rounded-full bg-white/5" />
          <span className="pointer-events-none absolute -bottom-10 right-12 size-28 rounded-full bg-white/5" />
          <span className="pointer-events-none absolute right-28 top-4 size-12 rounded-full bg-orange/20" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={avatarUrl}
                  alt={currentUser.full_name}
                  className="size-16 rounded-full border-4 border-white/30 bg-primary-soft object-cover shadow-md"
                />
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-orange shadow hover:bg-orange/90 transition-colors"
                  aria-label="Change avatar"
                >
                  <Pencil className="size-3 text-orange-foreground" />
                </button>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white leading-tight">
                  {currentUser.full_name}
                </h2>
                <p className="text-sm text-white/70">@{currentUser.username}</p>
                <p className="text-sm text-white/70">{currentUser.email}</p>
              </div>
            </div>

            {/* Level badge */}
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              <User className="size-4 text-orange" />
              Level {level.level} — {level.title}
            </div>
          </div>
        </div>

        {/* ── Edit info card ───────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card-story p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold">Personal Information</h3>
            {!editingInfo && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setForm({
                    full_name: currentUser.full_name,
                    email: currentUser.email,
                    username: currentUser.username,
                  });
                  setEditingInfo(true);
                }}
              >
                <Pencil className="size-4" /> Edit Info
              </Button>
            )}
          </div>

          {editingInfo ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="prof-name">Full Name</Label>
                  <Input
                    id="prof-name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="prof-username">Username</Label>
                  <Input
                    id="prof-username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="prof-email">Email</Label>
                  <Input
                    id="prof-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveInfo}>
                  <Check className="size-4" /> Save Changes
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelInfo}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <dl className="grid gap-y-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full Name</dt>
                <dd className="mt-0.5 font-medium">{currentUser.full_name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Username</dt>
                <dd className="mt-0.5 font-medium">@{currentUser.username}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
                <dd className="mt-0.5 font-medium">{currentUser.email}</dd>
              </div>
            </dl>
          )}
        </div>

        {/* ── Level progress ───────────────────────────────────── */}
        <LevelPanel xp={profile.xp} />

        {/* ── Stats grid ───────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="XP Points" value={stats.xp} icon={<Target className="size-5" />} tone="orange" />
          <StatCard label="Stories Completed" value={stats.stories_completed} icon={<BookOpen className="size-5" />} tone="purple" />
          <StatCard label="Quizzes Completed" value={stats.quizzes_completed} icon={<Target className="size-5" />} tone="green" />
          <StatCard label="Average Quiz Score" value={`${stats.average_score}%`} icon={<Medal className="size-5" />} tone="purple" />
        </div>

        {/* ── Earned badges ────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card-story p-5 shadow-card">
          <h2 className="font-display text-base font-semibold mb-3">Earned Badges</h2>
          {stats.badges.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No badges yet. Complete a story and its challenge to earn your first badge.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-3">
              {stats.badges.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-orange-soft px-3 py-2 text-sm"
                >
                  <Medal className="size-4 text-orange shrink-0" />
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
