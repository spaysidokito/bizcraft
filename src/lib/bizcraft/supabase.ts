import { createClient } from "@supabase/supabase-js";
import type { Db } from "./store";

const TABLE_NAME = "bizcraft_state";
const ROW_ID = "app";

export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (typeof window !== "undefined") {
      console.error(
        "Supabase is not configured in this environment. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.",
      );
    }
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

async function loadOldStateFromSupabase(client: ReturnType<typeof getSupabaseClient>) {
  const { data, error } = await client.from(TABLE_NAME).select("payload").eq("id", ROW_ID).maybeSingle();
  if (error) throw error;
  return (data?.payload as Db | null) ?? null;
}

export async function loadDbFromSupabase(): Promise<Db | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const [users, studentProfiles, stories, questions, attempts, badges, studentBadges, progress] =
    await Promise.all([
      client.from("users").select("*").order("id"),
      client.from("student_profiles").select("*").order("user_id"),
      client.from("entrepreneur_stories").select("*").order("id"),
      client.from("quiz_questions").select("*").order("id"),
      client.from("quiz_attempts").select("*").order("id"),
      client.from("badges").select("*").order("id"),
      client.from("student_badges").select("*").order("student_id"),
      client.from("student_progress").select("*").order("student_id"),
    ]);

  const error =
    users.error ||
    studentProfiles.error ||
    stories.error ||
    questions.error ||
    attempts.error ||
    badges.error ||
    studentBadges.error ||
    progress.error;

  if (error) {
    // If relational tables are not present yet, fall back to the old JSON payload state.
    return await loadOldStateFromSupabase(client);
  }

  if (!users.data || users.data.length === 0) {
    return await loadOldStateFromSupabase(client);
  }

  return {
    users: users.data,
    student_profiles: studentProfiles.data ?? [],
    entrepreneur_stories: stories.data ?? [],
    quiz_questions: questions.data ?? [],
    quiz_attempts: attempts.data ?? [],
    badges: badges.data ?? [],
    student_badges: studentBadges.data ?? [],
    student_progress: progress.data ?? [],
    session_user_id: null,
  };
}

export async function saveDbToSupabase(db: Db): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  // Safety guard: refuse to run a destructive save if local DB looks empty.
  if (!db.users || db.users.length === 0) {
    // Avoid accidental full-table overwrites when the client has no users.
    // Caller should restore data first or ensure the DB is populated.
    // We silently return to avoid crashing the app; this prevents wipes.
    // Consider logging/telemetry here in production.
    return;
  }

  const upsert = async (
    tableName: string,
    rows: unknown[],
    conflict?: string | string[],
  ) => {
    if (!rows || rows.length === 0) return;
    const { error } = await client.from(tableName).upsert(rows, { onConflict: conflict });
    if (error) throw error;
  };

  await upsert("users", db.users, "id");
  await upsert("student_profiles", db.student_profiles, "user_id");
  await upsert("entrepreneur_stories", db.entrepreneur_stories, "id");
  await upsert("quiz_questions", db.quiz_questions, "id");
  await upsert("quiz_attempts", db.quiz_attempts, "id");
  await upsert("badges", db.badges, "id");
  await upsert("student_badges", db.student_badges, ["student_id", "badge_id"]);
  await upsert("student_progress", db.student_progress, ["student_id", "story_id"]);
}
