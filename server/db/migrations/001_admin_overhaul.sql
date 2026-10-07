-- SpotS Migration: Admin Overhaul & Multi-city expansion
-- Run in Supabase SQL editor. Safe to re-run.

-- 1. Alter spots table
alter table spots add column if not exists city varchar(80) not null default 'Patna';
alter table spots alter column state drop default;
alter table spots add column if not exists landmark varchar(120);

-- Update search_text generation
-- Drop old search_text column and re-add with city and landmark
alter table spots drop column if exists search_text;

create or replace function spot_search_text(
  p_name text, p_area text, p_street text, p_landmark text, p_city text, p_description text, p_tags text[], p_category_slug text
) returns text language sql immutable parallel safe as $$
  select lower(
    coalesce(p_name, '') || ' ' || coalesce(p_area, '') || ' ' || coalesce(p_street, '') || ' ' ||
    coalesce(p_landmark, '') || ' ' || coalesce(p_city, '') || ' ' ||
    coalesce(p_description, '') || ' ' || coalesce(array_to_string(p_tags, ' '), '') || ' ' ||
    coalesce(p_category_slug, '')
  )
$$;

alter table spots add column search_text text generated always as
  (spot_search_text(name, area, street, landmark, city, description, tags, category_slug)) stored;

-- 2. Alter events table
alter table events add column if not exists end_time time;
alter table events drop constraint if exists events_end_time_check;
alter table events add constraint events_end_time_check check (end_time is null or end_time > start_time);

-- 3. Alter spot_submissions table
alter table spot_submissions add column if not exists reject_reason varchar(300);
alter table spot_submissions add column if not exists street varchar(160);
alter table spot_submissions add column if not exists landmark varchar(120);
alter table spot_submissions add column if not exists area varchar(80);
alter table spot_submissions add column if not exists city varchar(80);
alter table spot_submissions add column if not exists state varchar(60);
alter table spot_submissions add column if not exists pincode varchar(6);

-- 4. Update expire_past_events
create or replace function expire_past_events()
returns integer language plpgsql as $$
declare
  v_completed integer;
  v_ongoing   integer;
begin
  -- 1. Complete events whose end_time (or end of day if null) has passed
  update events set status = 'completed'
  where status in ('upcoming', 'ongoing')
    and (event_date + coalesce(end_time, '23:59:59'::time)) < (now() at time zone 'Asia/Kolkata');
  get diagnostics v_completed = row_count;

  -- 2. Transition upcoming events whose start_time has passed to ongoing
  update events set status = 'ongoing'
  where status = 'upcoming'
    and (event_date + start_time) <= (now() at time zone 'Asia/Kolkata');
  get diagnostics v_ongoing = row_count;

  return v_completed + v_ongoing;
end $$;

-- 5. Update spot_facets
create or replace function spot_facets()
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'cities', coalesce((
      select jsonb_agg(s.c order by s.c)
      from (select distinct city as c from spots where status = 'active' and city is not null and city <> '') s
    ), '[]'::jsonb),
    'areas', coalesce((
      select jsonb_agg(s.a order by s.a)
      from (select distinct area as a from spots where status = 'active' and area is not null and area <> '') s
    ), '[]'::jsonb),
    'pincodes', coalesce((
      select jsonb_agg(s.p order by s.p)
      from (select distinct pincode as p from spots where status = 'active' and pincode is not null) s
    ), '[]'::jsonb),
    'by_city', coalesce((
      select jsonb_object_agg(
        city_groups.city,
        jsonb_build_object(
          'areas', city_groups.areas,
          'pincodes', city_groups.pincodes
        )
      )
      from (
        select
          city,
          coalesce(jsonb_agg(distinct area) filter (where area is not null and area <> ''), '[]'::jsonb) as areas,
          coalesce(jsonb_agg(distinct pincode) filter (where pincode is not null), '[]'::jsonb) as pincodes
        from spots
        where status = 'active' and city is not null and city <> ''
        group by city
      ) city_groups
    ), '{}'::jsonb)
  )
$$;
