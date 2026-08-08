-- ── Profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Lessons ─────────────────────────────────────────────────────────────────
create table if not exists public.lessons (
  id           uuid primary key default gen_random_uuid(),
  module_id    int not null,
  module_name  text not null,
  order_index  int not null,
  title        text not null,
  youtube_id   text not null,
  description  text not null default '',
  objectives   text[] not null default '{}',
  created_at   timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "Lessons are publicly readable"
  on public.lessons for select
  using (true);


-- ── User Progress ────────────────────────────────────────────────────────────
create table if not exists public.user_progress (
  user_id       uuid not null references auth.users(id) on delete cascade,
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  is_completed  boolean not null default false,
  completed_at  timestamptz,
  primary key (user_id, lesson_id)
);

alter table public.user_progress enable row level security;

create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);


-- ── Seed Lessons ─────────────────────────────────────────────────────────────
insert into public.lessons (module_id, module_name, order_index, title, youtube_id, description, objectives)
values

-- Module 1: Foundations of Breath
(1, 'Foundations of Breath', 1,
 'Introduction to Conscious Breathing',
 'U9DNAIkPMHk',
 'Welcome to Breathwork Mastery. In this opening lesson we explore what conscious breathing is, why it matters, and how shifting your attention to the breath can instantly change your physiological state. You will learn the difference between automatic and intentional breathing patterns.',
 ARRAY[
   'Understand the difference between automatic and conscious breathing',
   'Identify common dysfunctional breathing habits',
   'Experience a simple 2-minute breath awareness exercise'
 ]),

(1, 'Foundations of Breath', 2,
 'Anatomy of the Breath',
 'kgTL5GtBZlA',
 'A clear tour of the respiratory system — diaphragm, intercostals, lungs, and the role of the vagus nerve. Understanding the mechanics of breathing helps you work with your body rather than against it.',
 ARRAY[
   'Name the key muscles involved in healthy breathing',
   'Understand how the diaphragm drives optimal breath mechanics',
   'Learn how breathing affects the autonomic nervous system'
 ]),

(1, 'Foundations of Breath', 3,
 'The Breath-Body-Mind Connection',
 'inpok4MKVLM',
 'Breath is the only autonomic function we can consciously control, making it the most direct bridge between mind and body. This lesson covers the science of how breathing modulates heart rate, cortisol levels, and emotional states.',
 ARRAY[
   'Explain the link between breathing and the autonomic nervous system',
   'Understand how CO₂ tolerance affects anxiety and performance',
   'Describe the relaxation response and how breathing triggers it'
 ]),

(1, 'Foundations of Breath', 4,
 'Nasal vs. Mouth Breathing',
 '3bMDOe5zSEA',
 'One of the most impactful changes you can make is shifting from mouth to nasal breathing. This lesson explains why the nose is a sophisticated air-processing organ and how mouth breathing contributes to poor sleep, stress, and reduced athletic performance.',
 ARRAY[
   'List the physiological benefits of nasal breathing',
   'Identify signs that you are a chronic mouth breather',
   'Practice mouth-taping technique for nighttime nasal breathing'
 ]),

-- Module 2: Core Techniques
(2, 'Core Techniques', 5,
 'Box Breathing for Focus',
 'aNXKjGFUlMs',
 'Box breathing (4-4-4-4) is used by Navy SEALs, surgeons, and elite athletes to enter a state of calm focus on demand. In this lesson you will learn the technique, its physiological effects, and how to apply it before high-stakes moments.',
 ARRAY[
   'Execute box breathing with correct timing and posture',
   'Understand why equal-ratio breathing stabilises the nervous system',
   'Build a pre-performance box breathing ritual'
 ]),

(2, 'Core Techniques', 6,
 '4-7-8 Breathing for Sleep',
 'YRPh_GaiL8s',
 'Dr. Andrew Weil''s 4-7-8 technique is one of the most effective drug-free tools for falling asleep and managing acute anxiety. A long exhale activates the parasympathetic nervous system and slows heart rate within minutes.',
 ARRAY[
   'Perform the 4-7-8 pattern with proper tongue placement',
   'Understand the science of extended exhales and vagal tone',
   'Integrate 4-7-8 into a bedtime wind-down routine'
 ]),

(2, 'Core Techniques', 7,
 'Diaphragmatic Breathing Mastery',
 'Wemr-tkSMQI',
 'Most adults breathe shallowly into the chest, chronically activating a mild stress response. Diaphragmatic breathing re-trains the body''s default pattern, improving oxygen efficiency, posture, and baseline calm.',
 ARRAY[
   'Feel and isolate diaphragmatic movement',
   'Correct common mistakes: shoulder lifting, reverse breathing',
   'Practice belly-led breathing while lying, sitting, and standing'
 ]),

-- Module 3: Advanced Practices
(3, 'Advanced Practices', 8,
 'Wim Hof Method Basics',
 'tybOi4hjZFQ',
 'The Wim Hof Method combines a specific hyperventilation cycle with breath retention to alter blood chemistry, boost energy, and build stress resilience. This lesson covers the foundational round safely and responsibly.',
 ARRAY[
   'Complete one full Wim Hof breathing round',
   'Understand the physiology of alkalosis and breath retention',
   'Know the contraindications and safety guidelines'
 ]),

(3, 'Advanced Practices', 9,
 'Coherent Breathing & HRV',
 'Q_fFattg8q0',
 'Breathing at 5–6 breaths per minute (coherent breathing) creates resonance between the heart and lungs, maximising heart rate variability — the gold-standard marker of nervous system resilience. This session teaches paced breathing paired with HRV biofeedback concepts.',
 ARRAY[
   'Breathe at a 5 BPM rate using a visual pacer',
   'Understand what HRV is and why it matters for health',
   'Build a daily 10-minute coherent breathing practice'
 ]),

(3, 'Advanced Practices', 10,
 'Integrating Breathwork into Daily Life',
 'acUZdGd_3Dg',
 'Knowledge without application is inert. In this final lesson we build a personal breathwork stack — morning activation, midday reset, evening wind-down — and discuss how to track progress and keep the practice sustainable over months and years.',
 ARRAY[
   'Design a personalised daily breathing schedule',
   'Choose the right technique for each context (focus, calm, energy)',
   'Set up a simple habit-tracking system for breathwork'
 ]);
