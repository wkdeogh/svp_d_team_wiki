create extension if not exists "pgcrypto";

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  created_at timestamptz not null default now(),
  status text not null default 'published'
);

create table if not exists public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  event_date date not null,
  category text not null,
  author_name text not null,
  author_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'published'
);

create table if not exists public.photo_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  cover_url text not null default '',
  created_at timestamptz not null default now(),
  status text not null default 'published'
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.photo_albums(id) on delete set null,
  title text not null,
  caption text not null default '',
  image_url text not null default '',
  event_date date null,
  created_at timestamptz not null default now(),
  created_by uuid null,
  status text not null default 'published'
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nickname text not null default '',
  bio text not null default '',
  join_story text not null default '',
  avatar_url text not null default '',
  created_at timestamptz not null default now(),
  status text not null default 'published'
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  reaction_type text not null,
  user_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.guestbook_entries enable row level security;
alter table public.timeline_entries enable row level security;
alter table public.photo_albums enable row level security;
alter table public.photos enable row level security;
alter table public.members enable row level security;
alter table public.reactions enable row level security;
alter table public.reports enable row level security;

do $$ begin
  create policy "public read guestbook" on public.guestbook_entries for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public insert guestbook" on public.guestbook_entries for insert with check (length(trim(name)) > 0 and length(trim(message)) > 0);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated update guestbook" on public.guestbook_entries for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read timeline" on public.timeline_entries for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public insert timeline" on public.timeline_entries for insert with check (length(trim(title)) > 0 and length(trim(content)) > 0);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated update timeline" on public.timeline_entries for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read albums" on public.photo_albums for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public insert albums" on public.photo_albums for insert with check (length(trim(title)) > 0);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated update albums" on public.photo_albums for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read photos" on public.photos for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public insert photos" on public.photos for insert with check (length(trim(title)) > 0);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated update photos" on public.photos for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read members" on public.members for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public insert members" on public.members for insert with check (length(trim(name)) > 0);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated update members" on public.members for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read reactions" on public.reactions for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public insert reactions" on public.reactions for insert with check (length(trim(target_type)) > 0 and length(trim(reaction_type)) > 0 and length(trim(user_key)) > 0);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read reports" on public.reports for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public insert reports" on public.reports for insert with check (length(trim(target_type)) > 0 and length(trim(reason)) > 0);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated update reports" on public.reports for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

create index if not exists guestbook_entries_created_at_idx on public.guestbook_entries (created_at desc);
create index if not exists timeline_entries_event_date_idx on public.timeline_entries (event_date asc);
create index if not exists photos_event_date_idx on public.photos (event_date desc);
create index if not exists reactions_target_idx on public.reactions (target_type, target_id);
create index if not exists reports_target_idx on public.reports (target_type, target_id);
