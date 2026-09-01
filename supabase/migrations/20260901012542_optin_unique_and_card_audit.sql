-- Phase 6 additions (tickets #22, #25).
--
-- 1) One opt-in per session. Lets POST /api/optin detect "already opted
--    in" via a unique-violation error (23505) rather than a SELECT --
--    anon still has no SELECT grant on email_optins, same minimum-
--    privilege reasoning as the share_token retry logic in Phase 5.
alter table email_optins
  add constraint email_optins_session_id_key unique (session_id);

-- 2) Records that a parent card was generated for a result, without
--    storing the card text itself (Architecture doc: "Generated card
--    text is returned to the client and not stored"). Same pattern as
--    get_result_by_share_token() -- anon has no UPDATE grant on results
--    at all, so this goes through a SECURITY DEFINER function instead.
create or replace function mark_card_generated(p_share_token text)
returns void
language sql
security definer
set search_path = public
as $$
  update results
  set card_generated_at = now()
  where share_token = p_share_token
    and card_generated_at is null;
$$;

revoke all on function mark_card_generated(text) from public;
grant execute on function mark_card_generated(text) to anon, authenticated;
