import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, MapPin, Search } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { ProgressBar } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBizCraft } from "@/lib/bizcraft/store";

export const Route = createFileRoute("/stories/")({
  head: () => ({
    meta: [
      { title: "Entrepreneurship Hub — BizCraft" },
      {
        name: "description",
        content:
          "Browse real Filipino entrepreneur stories with biographies, interviews and key business lessons for ABM students.",
      },
      { property: "og:title", content: "Entrepreneurship Hub — BizCraft" },
      {
        property: "og:description",
        content: "Educational interviews with real small business owners.",
      },
    ],
  }),
  component: StoriesPage,
});

function StoriesPage() {
  const { db, currentUser, progressFor } = useBizCraft();
  const [query, setQuery] = useState("");

  const allStories = db.entrepreneur_stories.filter((s) => s.is_published);
  const stories = allStories.filter((s) =>
    [s.name, s.business_name, s.business_type, s.location]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <AppShell
      role="student"
      title="Entrepreneurship Hub"
      subtitle="Explore inspiring stories from real business owners"
    >
      <div className="space-y-6">

        {/* ── Page hero strip ──────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-7 sm:px-10 shadow-card">
          {/* Decorative blobs */}
          <span className="pointer-events-none absolute -right-8 -top-8 size-44 rounded-full bg-white/5" />
          <span className="pointer-events-none absolute -bottom-10 right-12 size-28 rounded-full bg-white/5" />
          <span className="pointer-events-none absolute right-28 top-4 size-12 rounded-full bg-orange/20" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10">
                <BookOpen className="size-6 text-white" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Entrepreneurship Hub
                </h2>
                <p className="mt-0.5 text-sm text-white/70">
                  {allStories.length} learning modules based on real entrepreneur interviews
                </p>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stories…"
                className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40 focus:bg-white/15 transition"
              />
            </div>
          </div>
        </div>

        {/* ── Results count ───────────────────────────────────── */}
        {query && (
          <p className="text-sm text-muted-foreground">
            {stories.length === 0
              ? "No stories match your search."
              : `Showing ${stories.length} of ${allStories.length} stories for "${query}"`}
          </p>
        )}

        {/* ── Story cards grid ─────────────────────────────────── */}
        {stories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => {
              const p = currentUser ? progressFor(currentUser.id, story.id) : undefined;
              const pct = p?.status === "completed" ? 100 : p ? 45 : 0;
              const isCompleted = pct === 100;

              return (
                <article
                  key={story.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-card-story shadow-card transition-shadow hover:shadow-card-hover"
                >
                  {/* Thumbnail */}
                  <div className="relative">
                    <img
                      src={story.photo_url}
                      alt={`${story.name}, owner of ${story.business_name}`}
                      loading="lazy"
                      width={800}
                      height={600}
                      className="h-44 w-full object-cover"
                    />
                    {isCompleted && (
                      <span className="absolute right-2 top-2 rounded-full bg-success px-2 py-0.5 text-xs font-semibold text-success-foreground shadow">
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-orange">
                      {story.business_type}
                    </p>
                    <h2 className="mt-0.5 font-display text-base font-semibold leading-snug">
                      {story.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">{story.business_name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      {story.location}
                    </p>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                      {story.short_description}
                    </p>

                    {/* Progress */}
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{pct}%</span>
                      </div>
                      <ProgressBar value={pct} />
                    </div>

                    <Button asChild className="mt-4 w-full">
                      <Link to="/stories/$storyId" params={{ storyId: story.id }}>
                        {pct > 0 && !isCompleted ? "Continue Story" : isCompleted ? "Review Story" : "View Story"}
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No entrepreneur stories match your search.
          </p>
        )}

      </div>
    </AppShell>
  );
}
