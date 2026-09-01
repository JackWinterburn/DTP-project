-- Ada Course Finder -- row-level security (NFR7, ticket #6)
--
-- Design note (worth citing in the report's evaluation section): the
-- Architecture doc's one-line summary is "anonymous clients may insert
-- sessions/results and select a result only by its share_token". A plain
-- `for select using (true)` policy on `results` does NOT actually enforce
-- "only by its share_token" -- Postgres RLS filters rows, not the shape of
-- the client's query, so `using (true)` would let an anon key list every
-- row in the table with no filter at all. Instead, direct SELECT on
-- `results` is denied entirely, and lookups go through a single
-- SECURITY DEFINER function that requires the exact token as an argument.
-- This is the same anonymous, no-login trust model (a share_token is the
-- access control, same as "anyone with the link"), just enforced at a
-- boundary a client can't bypass by omitting a WHERE clause.

alter table schools        enable row level security;
alter table qr_codes       enable row level security;
alter table courses        enable row level security;
alter table quiz_sessions  enable row level security;
alter table results        enable row level security;
alter table email_optins   enable row level security;

revoke all on schools, qr_codes, courses, quiz_sessions, results, email_optins
  from anon, authenticated;

-- qr_codes: tokens are printed on public posters, so reading an active
-- code by token is not sensitive -- needed so the session-creation API
-- route (ticket #17) can resolve /q/{token} to a qr_code_id.
grant select on qr_codes to anon, authenticated;
create policy "qr_codes_select_active" on qr_codes
  for select
  using (active = true);

-- quiz_sessions: insert-only. No select/update grant at all -- completion
-- is set server-side by the results trigger (see the schema migration),
-- not by a client write.
grant insert on quiz_sessions to anon, authenticated;
create policy "quiz_sessions_insert" on quiz_sessions
  for insert
  with check (true);

-- results: insert-only via RLS/grants. There is deliberately no select
-- policy -- lookups happen only via get_result_by_share_token() below.
grant insert on results to anon, authenticated;
create policy "results_insert" on results
  for insert
  with check (true);

-- email_optins: insert-only, consent-gated personal data (NFR3). No
-- select/update/delete grant for anon at all.
grant insert on email_optins to anon, authenticated;
create policy "email_optins_insert" on email_optins
  for insert
  with check (true);

-- courses: no anon grant. Scoring runs client-side from the versioned
-- config in src/config (see Architecture doc Section 3) -- this table
-- exists for referential integrity and the qr_engagement view's join,
-- not for runtime reads.

-- schools: no anon grant, for the same reason -- only ever read via the
-- qr_engagement view under the dashboard role (Phase 7).

create or replace function get_result_by_share_token(p_share_token text)
returns setof results
language sql
security definer
set search_path = public
stable
as $$
  select * from results where share_token = p_share_token;
$$;

revoke all on function get_result_by_share_token(text) from public;
grant execute on function get_result_by_share_token(text) to anon, authenticated;

-- Dashboard role (Phase 7, tickets #26-28): read-only on the aggregate
-- view only, never on the underlying tables. Create the role and switch
-- the API route that powers the staff dashboard to use it once that
-- phase starts -- until then nothing uses this role.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'dashboard_reader') then
    create role dashboard_reader nologin;
  end if;
end
$$;

grant select on qr_engagement to dashboard_reader;
