-- ── Add role column to profiles ─────────────────────────────────────────────
alter table public.profiles
add column if not exists role text not null default 'student'
check (role in ('student', 'admin'));

-- Update the trigger function to also set role on signup (always 'student' by default)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$;
