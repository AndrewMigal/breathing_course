-- ── Add email to profiles ────────────────────────────────────────────────────
alter table public.profiles
add column if not exists email text;

-- Update trigger to also store email on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'student',
    new.email
  );
  return new;
end;
$$;
