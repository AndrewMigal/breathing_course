-- ── Courses ──────────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  price        numeric(10,2) not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Courses are publicly readable"
  on public.courses for select
  using (true);

-- Seed the one course with a stable known UUID
insert into public.courses (id, title, description, price)
values (
  '00000000-0000-0000-0000-000000000001',
  'Breathwork Mastery',
  'A complete breathwork course covering foundations, core techniques, and advanced practices. 10 lessons across 3 modules.',
  97.00
)
on conflict (id) do nothing;


-- ── Purchases ────────────────────────────────────────────────────────────────
create table if not exists public.purchases (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  status      text not null default 'active'
              check (status in ('active', 'pending', 'refunded')),
  created_at  timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.purchases enable row level security;

create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "Users can insert own purchases"
  on public.purchases for insert
  with check (auth.uid() = user_id);
