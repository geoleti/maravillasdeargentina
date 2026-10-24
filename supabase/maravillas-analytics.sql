-- Ejecutar una sola vez en SQL Editor del proyecto Supabase configurado.
-- No modifica tablas ni funciones de GeoData. El tablero de agregados es público.
begin;
create table if not exists public.maravillas_events (
 event_id uuid primary key,
 created_at timestamptz not null default now(),
 event_name text not null check(event_name in ('page_view','place_view','random_click')),
 visitor_id uuid not null, session_id uuid not null,
 place_id text, place_name text, province text, source text,
 device text, browser text, referrer text
);
create index if not exists maravillas_events_date_idx on public.maravillas_events(created_at);
alter table public.maravillas_events enable row level security;
revoke all on public.maravillas_events from anon,authenticated;
create or replace function public.log_maravillas_event(
 p_event_id uuid,p_event_name text,p_visitor_id uuid,p_session_id uuid,
 p_place_id text default null,p_place_name text default null,p_province text default null,
 p_source text default null,p_device text default null,p_browser text default null,p_referrer text default null
) returns void language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if p_event_name not in ('page_view','place_view','random_click') then raise exception 'Evento no admitido'; end if;
 if p_event_name='place_view' and (p_place_id is null or p_place_id !~ '^[a-z0-9-]{1,100}$') then raise exception 'Lugar inválido'; end if;
 insert into public.maravillas_events(event_id,event_name,visitor_id,session_id,place_id,place_name,province,source,device,browser,referrer)
 values(p_event_id,p_event_name,p_visitor_id,p_session_id,left(p_place_id,100),left(p_place_name,180),left(p_province,100),left(p_source,20),
 case when p_device in ('desktop','mobile','tablet') then p_device else 'Otro' end,
 case when p_browser in ('Chrome','Edge','Firefox','Safari','Opera') then p_browser else 'Otro' end,
 case when p_referrer in ('LinkedIn','Google','GitHub','Mismo sitio','Otros sitios') then p_referrer else 'Directo / sin referencia' end)
 on conflict(event_id) do nothing;
end $$;
create or replace function public.get_maravillas_dashboard(p_days integer default 30)
returns jsonb language sql stable security definer set search_path=pg_catalog,public as $$
with bounds as (
 select case when p_days=0 then null else
 (((now() at time zone 'America/Argentina/Buenos_Aires')::date - (greatest(1,least(coalesce(p_days,30),3650))-1))::timestamp at time zone 'America/Argentina/Buenos_Aires') end start_at
), e as (
 select m.* from public.maravillas_events m cross join bounds b where b.start_at is null or m.created_at>=b.start_at
), summary as (
 select count(*) filter(where event_name='page_view') visits,
 count(distinct visitor_id) visitors,count(distinct session_id) sessions,
 count(*) filter(where event_name='place_view') place_views,
 count(*) filter(where event_name='random_click') random_clicks,
 count(distinct place_id) filter(where event_name='place_view') places_seen,
 max(created_at) last_event from e
), daily as (
 select (created_at at time zone 'America/Argentina/Buenos_Aires')::date day,
 count(*) filter(where event_name='page_view') visits,count(distinct visitor_id) visitors,
 count(*) filter(where event_name='place_view') place_views from e group by 1
), places as (
 select place_id,max(place_name) place_name,max(province) province,count(*) views,
 count(distinct visitor_id) visitors,count(distinct session_id) sessions
 from e where event_name='place_view' group by place_id order by count(*) desc,place_id limit 500
), devices as (select device label,count(*) visits from e where event_name='page_view' group by device order by count(*) desc),
 browsers as (select browser label,count(*) visits from e where event_name='page_view' group by browser order by count(*) desc),
 referrers as (select referrer label,count(*) visits from e where event_name='page_view' group by referrer order by count(*) desc)
select jsonb_build_object(
 'period_days',p_days,'summary',(select to_jsonb(s) from summary s),
 'daily',coalesce((select jsonb_agg(to_jsonb(d) order by d.day) from daily d),'[]'::jsonb),
 'places',coalesce((select jsonb_agg(to_jsonb(p)) from places p),'[]'::jsonb),
 'devices',coalesce((select jsonb_agg(to_jsonb(d)) from devices d),'[]'::jsonb),
 'browsers',coalesce((select jsonb_agg(to_jsonb(b)) from browsers b),'[]'::jsonb),
 'referrers',coalesce((select jsonb_agg(to_jsonb(r)) from referrers r),'[]'::jsonb),
 'collection_started_at',(select min(created_at) from public.maravillas_events)
);
$$;
revoke all on function public.log_maravillas_event(uuid,text,uuid,uuid,text,text,text,text,text,text,text) from public;
revoke all on function public.get_maravillas_dashboard(integer) from public;
grant execute on function public.log_maravillas_event(uuid,text,uuid,uuid,text,text,text,text,text,text,text) to anon,authenticated;
grant execute on function public.get_maravillas_dashboard(integer) to anon,authenticated;
notify pgrst, 'reload schema';
commit;
