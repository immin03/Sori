-- Sori shared trips. Apply only to the dedicated Sori project.
-- Browser roles cannot read these tables or call the privileged RPC.
create schema if not exists sori_private;
revoke all on schema sori_private from public, anon, authenticated;
grant usage on schema sori_private to service_role;
create table sori_private.trips (
 id uuid primary key default gen_random_uuid(), plan jsonb not null,
 version integer not null default 1, created_at timestamptz not null default now()
);
create table sori_private.members (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references sori_private.trips(id) on delete cascade,
 name text not null check (length(name) between 1 and 40), role text not null check (role in ('owner','guest')),
 token_hash text unique not null check(length(token_hash)=64), active boolean not null default true,
 created_at timestamptz not null default now()
);
create unique index sori_trip_single_owner on sori_private.members(trip_id) where role='owner';
create index sori_member_trip on sori_private.members(trip_id,created_at);
create table sori_private.invites (
 hash text primary key check(length(hash)=64), trip_id uuid not null references sori_private.trips(id) on delete cascade,
 expires_at timestamptz not null default now()+interval '7 days', used boolean not null default false
);
create index sori_invite_trip on sori_private.invites(trip_id);
create table sori_private.comments (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references sori_private.trips(id) on delete cascade,
 member_id uuid not null references sori_private.members(id), body text not null check(length(body) between 1 and 500),
 created timestamptz not null default now()
);
create index sori_comment_trip on sori_private.comments(trip_id,created desc,id);
create index sori_comment_member on sori_private.comments(member_id);
create table sori_private.rate_limits (
 bucket text primary key, count integer not null default 1, resets_at timestamptz not null
);
alter table sori_private.trips enable row level security;
alter table sori_private.members enable row level security;
alter table sori_private.invites enable row level security;
alter table sori_private.comments enable row level security;
alter table sori_private.rate_limits enable row level security;
revoke all on all tables in schema sori_private from public, anon, authenticated;
grant select,insert,update,delete on all tables in schema sori_private to service_role;

create function sori_private.snapshot(p_id uuid) returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('id',t.id,'plan',t.plan,'version',t.version,
 'members',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'name',m.name,'role',m.role) order by m.created_at,m.id)
 from sori_private.members m where m.trip_id=t.id and m.active),'[]'::jsonb),
 'comments',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'body',c.body,'created',c.created,'name',c.name) order by c.created desc,c.id)
 from (select c.id,c.body,c.created,m.name from sori_private.comments c join sori_private.members m on m.id=c.member_id
 where c.trip_id=t.id order by c.created desc,c.id limit 60)c),'[]'::jsonb))
 from sori_private.trips t where t.id=p_id
$$;
revoke all on function sori_private.snapshot(uuid) from public, anon, authenticated;
grant execute on function sori_private.snapshot(uuid) to service_role;

-- SECURITY INVOKER: only the server service role has privileges. Every trip
-- operation rechecks a hashed membership capability while holding the trip lock.
create function public.sori_trip_request(
 p_action text, p_trip uuid default null, p_token_hash text default '',
 p_body jsonb default '{}'::jsonb, p_new_hash text default '', p_rate_bucket text default ''
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 v_id uuid; v_member sori_private.members; v_invite sori_private.invites;
 v_mid uuid; v_count integer; v_status integer:=200; v_data jsonb; v_version integer;
 v_name text:=trim(p_body->>'name'); v_body text:=trim(p_body->>'body');
begin
 if jsonb_typeof(p_body) is distinct from 'object' then raise exception sqlstate 'P0400' using message='Invalid request.'; end if;
 if p_action in ('create','join') and (v_name is null or length(v_name)<1 or length(v_name)>40) then
  raise exception sqlstate 'P0400' using message='Enter a name of 1–40 characters.'; end if;
 if p_action in ('create','join','invite') and p_new_hash !~ '^[a-f0-9]{64}$' then
  raise exception sqlstate 'P0400' using message='Invalid credential.'; end if;
 if p_action='create' then
  if length(p_rate_bucket)<>64 then raise exception sqlstate 'P0400' using message='Invalid request.'; end if;
  -- A bounded global budget also applies if client IP headers are unreliable.
  insert into sori_private.rate_limits(bucket,count,resets_at) values('global-create',1,now()+interval '1 hour')
  on conflict(bucket) do update set count=case when sori_private.rate_limits.resets_at<=now() then 1 else sori_private.rate_limits.count+1 end,
  resets_at=case when sori_private.rate_limits.resets_at<=now() then now()+interval '1 hour' else sori_private.rate_limits.resets_at end
  returning count into v_count;
  if v_count>200 then raise exception sqlstate 'P0429' using message='Trip creation is busy. Please try later.'; end if;
  -- A transaction-safe hourly bucket, shared across Edge Function instances.
  insert into sori_private.rate_limits(bucket,count,resets_at) values(p_rate_bucket,1,now()+interval '1 hour')
  on conflict(bucket) do update set count=case when sori_private.rate_limits.resets_at<=now() then 1 else sori_private.rate_limits.count+1 end,
  resets_at=case when sori_private.rate_limits.resets_at<=now() then now()+interval '1 hour' else sori_private.rate_limits.resets_at end
  returning count into v_count;
  if v_count>20 then raise exception sqlstate 'P0429' using message='Too many trips. Please try later.'; end if;
  delete from sori_private.rate_limits where resets_at<now()-interval '1 day';
  insert into sori_private.trips(plan) values(p_body->'plan') returning id into v_id;
  insert into sori_private.members(trip_id,name,role,token_hash) values(v_id,v_name,'owner',p_new_hash) returning id into v_mid;
  v_status:=201;v_data:=jsonb_build_object('trip',sori_private.snapshot(v_id),'memberId',v_mid);
 elsif p_action in ('preview','join') then
  select * into v_invite from sori_private.invites where hash=p_token_hash;
  if not found then raise exception sqlstate 'P0410' using message='This invitation expired or was already used. Ask for a new link.'; end if;
  v_id:=v_invite.trip_id;
  -- All modifications of membership and invites take the same parent lock.
  perform 1 from sori_private.trips where id=v_id for update;
  select * into v_invite from sori_private.invites where hash=p_token_hash and not used and expires_at>now();
  if not found then raise exception sqlstate 'P0410' using message='This invitation expired or was already used. Ask for a new link.'; end if;
  if p_action='preview' then v_data:=jsonb_build_object('tripId',v_id);
  else
   select count(*) into v_count from sori_private.members where trip_id=v_id and active;
   if v_count>=8 then raise exception sqlstate 'P0409' using message='This trip already has eight people.'; end if;
   update sori_private.invites set used=true where hash=p_token_hash;
   insert into sori_private.members(trip_id,name,role,token_hash) values(v_id,v_name,'guest',p_new_hash) returning id into v_mid;
   update sori_private.trips set version=version+1 where id=v_id;
   v_status:=201;v_data:=jsonb_build_object('trip',sori_private.snapshot(v_id),'memberId',v_mid);
  end if;
 else
  perform 1 from sori_private.trips where id=p_trip for update;
  select * into v_member from sori_private.members where trip_id=p_trip and token_hash=p_token_hash and active;
  if not found then raise exception sqlstate 'P0401' using message='This trip needs a valid invitation or membership.'; end if;
  if p_action in ('invite','cancel_invites','remove_member') and v_member.role<>'owner' then
   raise exception sqlstate 'P0403' using message='Only the trip creator can manage invitations and members.'; end if;
  case p_action
   when 'read' then v_data:=sori_private.snapshot(p_trip);
   when 'update' then
    if jsonb_typeof(p_body->'version') is distinct from 'number' then raise exception sqlstate 'P0400' using message='Invalid trip version.'; end if;
    select version into v_version from sori_private.trips where id=p_trip;
    if v_version::text<>(p_body->>'version') then raise exception sqlstate 'P0409' using message='A friend changed this trip. Reload and try your change again.'; end if;
    update sori_private.trips set plan=p_body->'plan',version=version+1 where id=p_trip;
    v_data:=sori_private.snapshot(p_trip);
   when 'invite' then
    select count(*) into v_count from sori_private.invites where trip_id=p_trip and not used and expires_at>now();
    if v_count>=20 then raise exception sqlstate 'P0409' using message='There are already enough active invitations for this trip.'; end if;
    insert into sori_private.invites(hash,trip_id) values(p_new_hash,p_trip);v_status:=201;v_data:='{}'::jsonb;
   when 'cancel_invites' then
    update sori_private.invites set used=true where trip_id=p_trip and not used;v_data:='{"ok":true}'::jsonb;
   when 'comment' then
    if v_body is null or length(v_body)<1 or length(v_body)>500 then raise exception sqlstate 'P0400' using message='Write a comment of 1–500 characters.'; end if;
    select count(*) into v_count from sori_private.comments where trip_id=p_trip;
    if v_count>=200 then raise exception sqlstate 'P0409' using message='Comment limit reached for this trip.'; end if;
    insert into sori_private.comments(trip_id,member_id,body) values(p_trip,v_member.id,v_body);
    update sori_private.trips set version=version+1 where id=p_trip;v_status:=201;v_data:=sori_private.snapshot(p_trip);
   when 'remove_member' then
    update sori_private.members set active=false where trip_id=p_trip and id=(p_body->>'target')::uuid and role='guest' and active;
    if not found then raise exception sqlstate 'P0404' using message='Guest not found.'; end if;
    update sori_private.trips set version=version+1 where id=p_trip;v_data:=sori_private.snapshot(p_trip);
   else raise exception sqlstate 'P0405' using message='Method not allowed.';
  end case;
 end if;
 return jsonb_build_object('status',v_status,'data',v_data);
exception when sqlstate 'P0400' or sqlstate 'P0401' or sqlstate 'P0403' or sqlstate 'P0404' or sqlstate 'P0405' or sqlstate 'P0409' or sqlstate 'P0410' or sqlstate 'P0429' then
 return jsonb_build_object('status',substring(sqlstate from 3)::integer,'data',jsonb_build_object('error',sqlerrm));
end $$;
revoke all on function public.sori_trip_request(text,uuid,text,jsonb,text,text) from public, anon, authenticated;
grant execute on function public.sori_trip_request(text,uuid,text,jsonb,text,text) to service_role;
