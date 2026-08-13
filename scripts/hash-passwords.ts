import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "path";
import bcrypt from "bcryptjs";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const confirmed = process.env.MIGRATE_HASH_CONFIRM === "true";
const dryRun = process.env.MIGRATE_HASH_DRY_RUN !== "false" && !confirmed;
if (!confirmed) {
  console.warn(
    "MIGRATE_HASH_CONFIRM not set — running in dry-run mode. No changes will be made.",
  );
}

const client = createClient(url, serviceKey, { auth: { persistSession: false } });

async function run() {
  console.log("Loading users...");
  const { data, error } = await client.from("users").select("*");
  if (error) {
    console.error("Error fetching users:", error.message);
    process.exit(1);
  }

  const rows = data ?? [];
  const plaintext = rows.filter((r: any) => Boolean(r.password) && !String(r.password).startsWith("$2"));

  if (plaintext.length === 0) {
    console.log("No plaintext passwords found. Nothing to do.");
    return;
  }
  console.log(`Found ${plaintext.length} user(s) with plaintext passwords.`);

  if (dryRun) {
    console.log("Dry-run mode: the following user ids would be updated:");
    for (const row of plaintext) console.log(" -", row.id);
    console.log("");
    console.log(
      "To perform the actual migration, set MIGRATE_HASH_CONFIRM=true in .env.local and re-run this script.",
    );
    return;
  }

  if (!confirmed) {
    console.error("Refusing to run unsafe migration without MIGRATE_HASH_CONFIRM=true.");
    process.exit(1);
  }

  console.log("Hashing and updating passwords now...");
  for (const row of plaintext) {
    try {
      const hashed = bcrypt.hashSync(String(row.password), 10);
      const updatedRow = { ...row, password: hashed };
      const { error: upsertErr } = await client.from("users").upsert([updatedRow], { onConflict: "id" });
      if (upsertErr) {
        console.error("Failed to upsert hashed password for user", row.id, upsertErr.message);
        process.exit(1);
      }
      console.log("Hashed and updated user:", row.id);
    } catch (err: any) {
      console.error("Error hashing/upserting for user", row.id, err?.message ?? err);
      process.exit(1);
    }
  }

  console.log("Password hashing migration completed.");
}

void run();
