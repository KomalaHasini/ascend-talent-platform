-- =====================================================================
-- Ascend: OPPORTUNITIES feature.
-- Paste ALL of this in Supabase -> SQL Editor -> New query -> Run.
-- (Safe to run more than once.)
-- =====================================================================

-- ---------- opportunities ----------
create table if not exists public.opportunities (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null check (category in ('performing','technical','academic','sports')),
  opp_type    text not null default 'Audition',   -- Audition, Competition, Event, Workshop...
  organiser   text not null,
  location    text,
  description text not null,
  min_tier    text not null default 'any'
              check (min_tier in ('any','silver','gold','platinum','legend')),
  deadline    date not null,
  apply_link  text,                                -- optional "more details" link
  created_at  timestamptz not null default now()
);
alter table public.opportunities enable row level security;

drop policy if exists "anyone can read opportunities" on public.opportunities;
create policy "anyone can read opportunities" on public.opportunities
  for select using (true);

-- ---------- applications (private: only visible in the Supabase dashboard) ----------
create table if not exists public.applications (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  user_id        uuid not null references public.users(id) on delete cascade,
  username       text not null,
  created_at     timestamptz not null default now(),
  unique (opportunity_id, user_id)
);
alter table public.applications enable row level security;

-- ---------- which opportunities has this user applied to? ----------
create or replace function public.my_applications(p_user uuid)
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select opportunity_id from public.applications where user_id = p_user;
$$;

-- ---------- apply (checks the tier on the server too) ----------
create or replace function public.apply_to_opportunity(p_user uuid, p_opportunity uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  opp  public.opportunities;
  u    public.users;
  best int;
  need int;
begin
  select * into opp from public.opportunities where id = p_opportunity;
  if not found then
    return json_build_object('error', 'Opportunity not found');
  end if;

  select * into u from public.users where id = p_user;
  if not found then
    return json_build_object('error', 'Please log in again');
  end if;

  if opp.deadline < current_date then
    return json_build_object('error', 'This opportunity is closed');
  end if;

  if exists (select 1 from public.applications
             where opportunity_id = p_opportunity and user_id = p_user) then
    return json_build_object('error', 'You already applied');
  end if;

  need := case opp.min_tier
            when 'silver' then 1 when 'gold' then 2
            when 'platinum' then 3 when 'legend' then 4 else 0 end;

  if need > 0 then
    select max(case when endorsements >= 50 then 4
                    when endorsements >= 25 then 3
                    when endorsements >= 10 then 2
                    when endorsements >= 3  then 1
                    else 0 end)
      into best
      from public.talents
     where author_id = p_user and category = opp.category;

    if best is null or best < need then
      return json_build_object('error', 'You do not meet the tier needed for this opportunity');
    end if;
  end if;

  insert into public.applications (opportunity_id, user_id, username)
  values (p_opportunity, p_user, u.username);

  return json_build_object('ok', true);
end;
$$;

-- ---------- permissions ----------
grant usage on schema public to anon, authenticated;
grant select on public.opportunities to anon, authenticated;
grant select, insert on public.talents to anon, authenticated;   -- safety net for the main feature too
grant execute on function public.my_applications(uuid)               to anon, authenticated;
grant execute on function public.apply_to_opportunity(uuid, uuid)    to anon, authenticated;

-- ---------- sample opportunities (only added when the table is empty) ----------
-- These are EXAMPLES. Edit or delete them in Table Editor -> opportunities.
insert into public.opportunities (title, category, opp_type, organiser, location, description, min_tier, deadline)
select * from (values
  ('Classical Dance Audition', 'performing', 'Audition', 'College Cultural Committee', 'Main Auditorium',
   'Auditions for the solo and group dance items of the annual cultural fest. Prepare a 2-minute performance.',
   'silver', current_date + 20),
  ('Lead Role in a Short Film', 'performing', 'Audition', 'Campus Film Club', 'Media Room',
   'The film club is casting a lead actor for its next short film. Bring a short monologue.',
   'gold', current_date + 25),
  ('Open Mic Night', 'performing', 'Event', 'Music Society', 'Open Air Theatre',
   'Singers, musicians and poets are invited to perform. Open to everyone, no tier needed.',
   'any', current_date + 12),
  ('Hackathon: Build for Good', 'technical', 'Competition', 'Coding Club', 'Computer Lab 2',
   '24-hour team hackathon. Build a working solution for a real campus problem.',
   'any', current_date + 30),
  ('Inter-College Debate Championship', 'academic', 'Competition', 'Literary Club', 'Seminar Hall',
   'Selection round for the college debate team. Speakers with proven skill are preferred.',
   'silver', current_date + 18),
  ('University Athletics Selection Trials', 'sports', 'Audition', 'Sports Department', 'College Ground',
   'Trials for the university athletics team in sprints, long jump and relay.',
   'gold', current_date + 28)
) as v(title, category, opp_type, organiser, location, description, min_tier, deadline)
where not exists (select 1 from public.opportunities);
