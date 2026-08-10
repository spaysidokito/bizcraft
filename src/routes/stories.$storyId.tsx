import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, CheckCircle2, Lightbulb, MapPin, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/bizcraft/app-shell";
import { SectionHeading } from "@/components/bizcraft/ui-bits";
import { Button } from "@/components/ui/button";
import { useBizCraft } from "@/lib/bizcraft/store";

export const Route = createFileRoute("/stories/$storyId")({
  head: () => ({
    meta: [
      { title: "Entrepreneur Story — BizCraft" },
      {
        name: "description",
        content:
          "Read the full entrepreneur interview, biography and key business lessons, then start the basketball quiz challenge.",
      },
      { property: "og:title", content: "Entrepreneur Story — BizCraft" },
      { property: "og:description", content: "Full interview and key lessons for ABM students." },
    ],
  }),
  component: StoryDetailPage,
});

function StoryDetailPage() {
  const { storyId } = Route.useParams();
  const { db, currentUser, markStoryViewed, questionsForStory, progressFor } = useBizCraft();
  const navigate = useNavigate();
  const story = db.entrepreneur_stories.find((s) => s.id === storyId);

  useEffect(() => {
    if (currentUser && story) markStoryViewed(story.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, story?.id]);

  if (!story) {
    return (
      <AppShell role="student" title="Story not found">
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">This entrepreneur story is unavailable.</p>
          <Button asChild className="mt-4">
            <Link to="/stories">Back to stories</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const questions = questionsForStory(story.id);
  const completed =
    currentUser && progressFor(currentUser.id, story.id)?.status === "completed";

  return (
    <AppShell
      role="student"
      title={story.name}
      subtitle={`${story.business_name} · ${story.business_type}`}
      actions={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/stories">
            <ArrowLeft className="size-4" /> All stories
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <img
              src={story.photo_url}
              alt={`${story.name}, owner of ${story.business_name}`}
              width={800}
              height={600}
              className="h-64 w-full object-cover"
            />
            <div className="p-5">
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {story.location}
              </p>
              <h2 className="mt-2 font-display text-lg font-semibold">Biography</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {story.biography}
              </p>
            </div>
          </div>

          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <SectionHeading title="Video Interview" description="Watch before answering the challenge." />
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted text-center">
              <PlayCircle className="size-10 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Video placeholder</p>
              <p className="mt-1 max-w-sm px-4 text-xs break-all text-muted-foreground">
                {story.video_url}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                The administrator can replace this with the actual interview link.
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <SectionHeading title="Story / Interview Transcript" />
            <div className="space-y-4">
              {story.content.map((para, i) => (
                <p key={i} className="whitespace-pre-line text-sm leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Lightbulb className="size-4 text-orange" /> Key Lessons
            </h2>
            <ul className="mt-3 space-y-3">
              {story.key_lessons.map((lesson, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-primary-soft p-5">
            <h2 className="font-display text-base font-semibold text-primary">
              Basketball Quiz Challenge
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {questions.length} questions · earn up to {questions.length * 20 + 25} XP
            </p>
            {completed && (
              <p className="mt-2 text-xs font-medium text-success">
                You have already completed this story. You may retake the challenge.
              </p>
            )}
            <Button
              className="mt-4 w-full"
              disabled={questions.length === 0}
              onClick={() => navigate({ to: "/challenges/$storyId", params: { storyId: story.id } })}
            >
              Start Challenge
            </Button>
            {questions.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                No quiz questions have been added for this story yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
