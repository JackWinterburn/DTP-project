-- Ada Course Finder -- core schema
-- Mirrors Architecture doc Section 4 exactly. Apply in the Supabase SQL
-- editor (Database > SQL Editor) or via `supabase db push` once the
-- project is linked with the Supabase CLI.
--
-- No personal data lives in this migration's tables except email_optins,
-- which is isolated on purpose (NFR3, GDPR Art. 17 one-row erasure).

create extension if not exists pgcrypto;

-- Reference data ------------------------------------------------------

create table schools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  town        text
);

create table qr_codes (
  id          uuid primary key default gen_random_uuid(),
  token       text unique not null,          -- short code in the poster URL /q/{token}
  school_id   uuid references schools(id),
  location    text,                          -- e.g. "IT room 2 poster"
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table courses (
  id          text primary key,              -- e.g. 'tlevel-digital'
  name        text not null,
  is_tlevel   boolean not null default false
);

-- Anonymous engagement data (NO personal data) -------------------------

create table quiz_sessions (
  id            uuid primary key default gen_random_uuid(),
  qr_code_id    uuid references qr_codes(id),   -- null if reached organically
  device_class  text check (device_class in ('mobile', 'desktop')),
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  retake_of     uuid references quiz_sessions(id)
);

create table results (
  id                 uuid primary key default gen_random_uuid(),
  share_token        text unique not null,   -- unguessable; the persistence mechanism
  session_id         uuid not null references quiz_sessions(id),
  quiz_version       int not null,           -- which question/scoring config produced it
  matches            jsonb not null,         -- [{course_id, score_pct, reasons: [...]}]
  card_generated_at  timestamptz,            -- parent card audit, no card text stored
  created_at         timestamptz not null default now()
);

-- Consent-gated personal data, isolated for easy erasure (GDPR Art. 17) -

create table email_optins (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid references quiz_sessions(id),
  email           text not null,
  consent_version text not null,             -- which privacy notice they agreed to
  consented_at    timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- Ada's per-school engagement view (staff dashboard, Phase 7) ----------

create view qr_engagement as
select
  s.name  as school,
  q.token,
  q.location,
  count(qs.id)             as scans,
  count(qs.completed_at)   as completions,
  count(*) filter (
    where r.matches -> 0 ->> 'course_id' like 'tlevel%'
  )                        as tlevel_top_matches
from qr_codes q
join schools s          on s.id = q.school_id
left join quiz_sessions qs on qs.qr_code_id = q.id
left join results r        on r.session_id = qs.id
group by s.name, q.token, q.location;

-- Auto-complete a session when its result lands, so the client never
-- needs write access to quiz_sessions after creating it (see the RLS
-- migration for why: anon only gets INSERT on quiz_sessions, no UPDATE).
create or replace function mark_session_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update quiz_sessions
  set completed_at = new.created_at
  where id = new.session_id
    and completed_at is null;
  return new;
end;
$$;

create trigger results_mark_session_completed
  after insert on results
  for each row
  execute function mark_session_completed();

comment on table quiz_sessions is 'Anonymous engagement record. No account, no personal data. See Architecture doc Section 4.';
comment on table results is 'One row per completed quiz. matches JSONB shape: [{course_id, score_pct, reasons: string[]}], scored client-side against src/config quiz content.';
comment on table email_optins is 'Isolated, consent-gated. Erasure = delete one row (GDPR Art. 17). Never joined to results in application queries.';
