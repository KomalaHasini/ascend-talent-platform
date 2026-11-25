-- =====================================================================
-- Ascend database setup. Paste ALL of this in Supabase -> SQL Editor -> Run
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- accounts ----------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  contact       text unique not null,      -- email or phone (kept private)
  username      text unique not null,      -- public name shown to everyone
  password_hash text not null,
  created_at    timestamptz not null default now()
);
alter table public.users enable row level security;   -- no policies = table is private

-- ---------- talents (posts) ----------
create table if not exists public.talents (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.users(id) on delete cascade,
  author       text not null,
  category     text not null,
  title        text not null,
  description  text not null,
  media_url    text,
  media_type   text,
  endorsements int  not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.talents enable row level security;

drop policy if exists "anyone can read talents" on public.talents;
create policy "anyone can read talents" on public.talents for select using (true);

drop policy if exists "anyone can post talents" on public.talents;
create policy "anyone can post talents" on public.talents for insert with check (true);

-- ---------- sign up ----------
create or replace function public.signup_user(p_contact text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  c        text := lower(trim(p_contact));
  base     text;
  uname    text;
  n        int := 0;
  new_user public.users;
begin
  if c = '' or coalesce(p_password, '') = '' then
    return json_build_object('error', 'Please fill both fields');
  end if;

  if exists (select 1 from public.users where contact = c) then
    return json_build_object('error', 'This email / phone number is already registered');
  end if;

  if position('@' in c) > 0 then
    base := split_part(c, '@', 1);
  else
    base := 'user' || right(regexp_replace(c, '\D', '', 'g'), 4);
  end if;

  uname := base;
  while exists (select 1 from public.users where username = uname) loop
    n := n + 1;
    uname := base || n;
  end loop;

  insert into public.users (contact, username, password_hash)
  values (c, uname, crypt(p_password, gen_salt('bf')))
  returning * into new_user;

  return json_build_object('id', new_user.id, 'username', new_user.username);
end;
$$;

-- ---------- log in ----------
create or replace function public.login_user(p_contact text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u public.users;
begin
  select * into u from public.users
  where contact = lower(trim(p_contact))
    and password_hash = crypt(p_password, password_hash);

  if not found then
    return json_build_object('error', 'Invalid email / phone number or password');
  end if;

  return json_build_object('id', u.id, 'username', u.username);
end;
$$;

-- ---------- public list of usernames (for the search bar) ----------
create or replace function public.list_usernames()
returns setof text
language sql
security definer
set search_path = public
as $$
  select username from public.users order by username;
$$;

-- ---------- endorse a talent ----------
create or replace function public.endorse_talent(talent_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.talents set endorsements = endorsements + 1 where id = talent_id;
$$;

grant execute on function public.signup_user(text, text)  to anon, authenticated;
grant execute on function public.login_user(text, text)   to anon, authenticated;
grant execute on function public.list_usernames()         to anon, authenticated;
grant execute on function public.endorse_talent(uuid)     to anon, authenticated;

-- ---------- storage for photos and videos ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)
on conflict (id) do nothing;

drop policy if exists "anyone can view media" on storage.objects;
create policy "anyone can view media" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "anyone can upload media" on storage.objects;
create policy "anyone can upload media" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'media');
