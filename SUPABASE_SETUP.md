# Supabase setup for BizCraft

## 1) Create a Supabase project
- Go to https://supabase.com and create a new project.
- Copy the project URL and the anon key.

## 2) Add environment variables
Create a .env.local file in the project root with:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3) Create the table
In Supabase SQL editor, run:

```sql
create table if not exists public.bizcraft_state (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bizcraft_state enable row level security;
```

## 4) Optional: allow anonymous writes for local demo use
If you want the current app setup to work immediately without auth, run:

```sql
create policy if not exists "Allow all for anon"
  on public.bizcraft_state
  for all
  using (true)
  with check (true);
```

## 5) Restart the app
Run:

```bash
npm run dev
```

The app will now load/save the BizCraft state from Supabase when the environment variables are present.
