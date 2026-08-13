import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

const client = createClient(url, anonKey, { auth: { persistSession: false } });

async function run() {
  const table = "bizcraft_state";
  const { data, error } = await client.from(table).select("payload").eq("id", "app").maybeSingle();

  if (error) {
    console.error("Error loading old state:", error.message);
    process.exit(1);
  }

  if (!data?.payload) {
    console.error("No old state row found in bizcraft_state.");
    process.exit(1);
  }

  const payload = data.payload;

  const insert = async (tableName: string, rows: unknown[], conflict?: string | string[]) => {
    if (rows.length === 0) return;
    const { error: insertError } = await client.from(tableName).upsert(rows, {
      onConflict: conflict,
    });
    if (insertError) {
      console.error(`Error inserting into ${tableName}:`, insertError.message);
      process.exit(1);
    }
  };

  await insert("users", payload.users, "id");
  await insert("student_profiles", payload.student_profiles, "user_id");
  await insert("entrepreneur_stories", payload.entrepreneur_stories, "id");
  await insert("quiz_questions", payload.quiz_questions, "id");
  await insert("quiz_attempts", payload.quiz_attempts, "id");
  await insert("badges", payload.badges, "id");
  await insert("student_badges", payload.student_badges, ["student_id", "badge_id"]);
  await insert("student_progress", payload.student_progress, ["student_id", "story_id"]);

  console.log("Migration completed successfully.");
}

void run();
