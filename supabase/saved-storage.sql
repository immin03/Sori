-- Candidate migration; NOT applied. Run in a dedicated test project first.
-- Configure Supabase Third-party Auth for the exact Firebase project and assign
-- authenticated role claims before use. Firebase UID is text, not auth.users UUID.
create table if not exists public.sori_saved_phrases (
  user_id text not null,
  phrase_id text not null check (length(phrase_id) > 0),
  primary key (user_id, phrase_id)
);
create table if not exists public.sori_user_state (
  user_id text primary key,
  last_practice_at timestamptz
);
alter table public.sori_saved_phrases enable row level security;
alter table public.sori_user_state enable row level security;
revoke all on public.sori_saved_phrases, public.sori_user_state from anon;
grant select, insert, delete on public.sori_saved_phrases to authenticated;
grant select, insert, update on public.sori_user_state to authenticated;
-- upsert conflict-resolution may require UPDATE even for the same primary key.
grant update on public.sori_saved_phrases to authenticated;
create policy sori_saved_owner on public.sori_saved_phrases
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);
create policy sori_state_owner on public.sori_user_state
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);
