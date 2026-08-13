import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { ProgressBar } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBizCraft } from "@/lib/bizcraft/store";

export const Route = createFileRoute("/stories/")({
  head: () => ({
    meta: [
      { title: "Entrepreneur Stories — BizCraft" },
      {
        name: "description",
        content:
          "Browse real Filipino entrepreneur stories with biographies, interviews and key business lessons for ABM students.",
      },
      { property: "og:title", content: "Entrepreneur Stories — BizCraft" },
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

  const stories = db.entrepreneur_stories
    .filter((s) => s.is_published)
    .filter((s) =>
      [s.name, s.business_name, s.business_type, s.location]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

  return (
    <AppShell
      role="student"
      title="Entrepreneur Stories"
      subtitle="Learning modules based on real interviews with business owners"
    >
      <div className="mb-6 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, business or location"
          className="pl-9 bg-white border-2 border-border shadow-card rounded-xl h-11 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => {
          const p = currentUser ? progressFor(currentUser.id, story.id) : undefined;
          const pct = p?.status === "completed" ? 100 : p ? 45 : 0;
          return (
            <article
              key={story.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card-story shadow-card transition-shadow hover:shadow-card-hover"
            >
              <img
                src={story.photo_url}
                alt={`${story.name}, owner of ${story.business_name}`}
                loading="lazy"
                width={800}
                height={600}
                className="h-44 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-orange">
                  {story.business_type}
                </p>
                <h2 className="font-display text-base font-semibold">{story.name}</h2>
                <p className="text-xs text-muted-foreground">{story.business_name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {story.location}
                </p>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                  {story.short_description}
                </p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
                <Button asChild className="mt-4 w-full">
                  <Link to="/stories/$storyId" params={{ storyId: story.id }}>
                    View Story
                  </Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {stories.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No entrepreneur stories match your search.
        </p>
      )}
    </AppShell>
  );
}
