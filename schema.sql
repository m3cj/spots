-- SpotS — authoritative Postgres schema for Supabase (PRD §6).
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- Promote someone after their first Google sign-in (there is no user-management UI in v1):
--   update users set role = 'super_admin' where email = 'you@example.com';
--   update users set role = 'spoter'      where email = 'contributor@example.com';

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin create type user_role         as enum ('explorer', 'spoter', 'super_admin');            exception when duplicate_object then null; end $$;
do $$ begin create type spot_status       as enum ('active', 'draft', 'archived');                  exception when duplicate_object then null; end $$;
do $$ begin create type best_time         as enum ('morning', 'day', 'night', 'anytime');           exception when duplicate_object then null; end $$;
do $$ begin create type event_status      as enum ('upcoming', 'ongoing', 'completed', 'cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type submission_status as enum ('pending', 'approved', 'rejected');              exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Feeds spots.search_text so the feed can search name, area, street, landmark, city, description, tags and category in one filter.
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

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists users (
  id            integer generated always as identity primary key,
  google_id     varchar(64)  not null unique,
  display_name  varchar(120) not null,
  email         varchar(254) not null unique,
  avatar_url    text,
  role          user_role    not null default 'explorer',
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

create table if not exists categories (
  id          integer generated always as identity primary key,
  slug        varchar(40) not null unique
              check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug <> 'all'),
  name        varchar(60) not null,
  icon        varchar(60) not null,
  color       varchar(7)  not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists spots (
  id                  integer generated always as identity primary key,
  name                varchar(120) not null,
  category_slug       varchar(40)  not null references categories (slug) on update cascade on delete restrict,
  status              spot_status  not null default 'draft',
  hero_img            text,
  lat                 double precision not null check (lat between -90 and 90),
  lng                 double precision not null check (lng between -180 and 180),
  gmap_link           text,
  description         text,
  direction           text,
  tags                text[]       not null default '{}',
  best_time_to_visit  best_time    not null default 'anytime',
  street              varchar(160),
  landmark            varchar(120),
  area                varchar(80),
  city                varchar(80)  not null default 'Patna',
  pincode             varchar(6)   check (pincode ~ '^[0-9]{6}$'),
  state               varchar(60)  not null,
  like_count          integer      not null default 0 check (like_count >= 0),
  views               integer      not null default 0 check (views >= 0),
  contacts            varchar(200),
  created_by          integer references users (id) on delete set null,
  created_at          timestamptz  not null default now(),
  updated_at          timestamptz  not null default now(),
  search_text         text generated always as
                        (spot_search_text(name, area, street, landmark, city, description, tags, category_slug)) stored
);

create table if not exists spot_images (
  id          integer generated always as identity primary key,
  spot_id     integer      not null references spots (id) on delete cascade,
  image_url   text         not null,
  caption     varchar(200),
  sort_order  integer      not null default 0,
  created_at  timestamptz  not null default now()
);

create table if not exists events (
  id            integer generated always as identity primary key,
  title         varchar(160) not null,
  spot_id       integer      not null references spots (id) on delete restrict,
  event_date    date         not null,
  start_time    time         not null,
  end_time      time         check (end_time is null or end_time > start_time),
  categories    varchar(200) not null default '',   -- comma-separated category slugs (PRD §6)
  status        event_status not null default 'upcoming',
  age_limit     integer      check (age_limit >= 0),
  price         numeric(10, 2) check (price >= 0),  -- null = free
  booking_link  text,
  hero_img      text,                               -- falls back to the venue's hero_img in the API
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

create table if not exists likes (
  id          integer generated always as identity primary key,
  user_id     integer     not null references users (id) on delete cascade,
  spot_id     integer     not null references spots (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, spot_id)
);

create table if not exists bookmarks (
  id          integer generated always as identity primary key,
  user_id     integer     not null references users (id) on delete cascade,
  spot_id     integer     not null references spots (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, spot_id)
);

-- category_slug is deliberately not a foreign key: a suggestion may name a category that does not exist yet.
create table if not exists spot_submissions (
  id                  integer generated always as identity primary key,
  user_id             integer           not null references users (id) on delete cascade,
  name                varchar(120)      not null,
  category_slug       varchar(40)       not null,
  lat                 double precision  not null check (lat between -90 and 90),
  lng                 double precision  not null check (lng between -180 and 180),
  description         text              not null,
  best_time_to_visit  best_time         not null,
  image_url           text,
  status              submission_status not null default 'pending',
  reject_reason       varchar(300),
  street              varchar(160),
  landmark            varchar(120),
  area                varchar(80),
  city                varchar(80),
  state               varchar(60),
  pincode             varchar(6),
  created_at          timestamptz       not null default now(),
  updated_at          timestamptz       not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists spots_status_created_idx   on spots (status, created_at desc);
create index if not exists spots_category_idx         on spots (category_slug);
create index if not exists spots_hot_idx              on spots (like_count desc, views desc) where status = 'active';
create index if not exists spots_created_by_idx       on spots (created_by);
create index if not exists spot_images_spot_idx       on spot_images (spot_id, sort_order);
create index if not exists events_status_date_idx     on events (status, event_date);
create index if not exists events_spot_idx            on events (spot_id);
create index if not exists likes_spot_idx             on likes (spot_id);
create index if not exists bookmarks_user_created_idx on bookmarks (user_id, created_at desc);
create index if not exists bookmarks_spot_idx         on bookmarks (spot_id);
create index if not exists submissions_status_idx     on spot_submissions (status, created_at desc);
create index if not exists submissions_user_idx       on spot_submissions (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at before update on users
  for each row execute function set_updated_at();

-- Likes and views bump counters on spots; those must not count as an edit.
drop trigger if exists trg_spots_updated_at on spots;
create trigger trg_spots_updated_at before update on spots
  for each row when (old.like_count = new.like_count and old.views = new.views)
  execute function set_updated_at();

drop trigger if exists trg_events_updated_at on events;
create trigger trg_events_updated_at before update on events
  for each row execute function set_updated_at();

drop trigger if exists trg_submissions_updated_at on spot_submissions;
create trigger trg_submissions_updated_at before update on spot_submissions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Functions the API calls through supabase.rpc(). Each runs in one transaction,
-- which keeps the denormalised spots.like_count in step with the likes table.
-- ---------------------------------------------------------------------------
create or replace function like_spot(p_user_id integer, p_spot_id integer)
returns jsonb language plpgsql as $$
declare
  v_inserted integer;
  v_count    integer;
begin
  if not exists (select 1 from spots where id = p_spot_id and status = 'active') then
    return null;
  end if;

  insert into likes (user_id, spot_id) values (p_user_id, p_spot_id)
  on conflict (user_id, spot_id) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update spots set like_count = like_count + 1 where id = p_spot_id returning like_count into v_count;
  else
    select like_count into v_count from spots where id = p_spot_id;
  end if;

  return jsonb_build_object('liked', true, 'like_count', v_count);
end $$;

create or replace function unlike_spot(p_user_id integer, p_spot_id integer)
returns jsonb language plpgsql as $$
declare
  v_deleted integer;
  v_count   integer;
begin
  if not exists (select 1 from spots where id = p_spot_id) then
    return null;
  end if;

  delete from likes where user_id = p_user_id and spot_id = p_spot_id;
  get diagnostics v_deleted = row_count;

  if v_deleted > 0 then
    update spots set like_count = greatest(like_count - 1, 0) where id = p_spot_id returning like_count into v_count;
  else
    select like_count into v_count from spots where id = p_spot_id;
  end if;

  return jsonb_build_object('liked', false, 'like_count', v_count);
end $$;

create or replace function increment_spot_views(p_spot_id integer)
returns integer language sql as $$
  update spots set views = views + 1 where id = p_spot_id and status = 'active' returning views;
$$;

-- Events whose date/time has passed (Asia/Kolkata) become completed; active ones become ongoing.
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

-- Replaces a spot's gallery; array order becomes sort_order.
create or replace function replace_spot_images(p_spot_id integer, p_images jsonb)
returns void language plpgsql as $$
begin
  delete from spot_images where spot_id = p_spot_id;

  insert into spot_images (spot_id, image_url, caption, sort_order)
  select p_spot_id, e.item ->> 'image_url', nullif(e.item ->> 'caption', ''), (e.idx - 1)::integer
  from jsonb_array_elements(p_images) with ordinality as e(item, idx);
end $$;

create or replace function admin_dashboard_stats()
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'total_spots',         (select count(*) from spots),
    'active_spots',        (select count(*) from spots where status = 'active'),
    'draft_spots',         (select count(*) from spots where status = 'draft'),
    'pending_submissions', (select count(*) from spot_submissions where status = 'pending'),
    'active_events',       (select count(*) from events where status in ('upcoming', 'ongoing')),
    'total_users',         (select count(*) from users)
  )
$$;

-- ---------------------------------------------------------------------------
-- Access control. Only the Express API (service role) touches the database; the
-- browser never talks to Supabase. RLS with no policies plus revoked grants keeps
-- the public anon key from reading or writing anything.
-- ---------------------------------------------------------------------------
alter table users            enable row level security;
alter table categories       enable row level security;
alter table spots            enable row level security;
alter table spot_images      enable row level security;
alter table events           enable row level security;
alter table likes            enable row level security;
alter table bookmarks        enable row level security;
alter table spot_submissions enable row level security;

revoke all on table users, categories, spots, spot_images, events, likes, bookmarks, spot_submissions
  from anon, authenticated;

grant select, insert, update, delete
  on table users, categories, spots, spot_images, events, likes, bookmarks, spot_submissions
  to service_role;

revoke all on function
  like_spot(integer, integer), unlike_spot(integer, integer), increment_spot_views(integer),
  expire_past_events(), spot_facets(), replace_spot_images(integer, jsonb), admin_dashboard_stats()
  from public, anon, authenticated;

grant execute on function
  like_spot(integer, integer), unlike_spot(integer, integer), increment_spot_views(integer),
  expire_past_events(), spot_facets(), replace_spot_images(integer, jsonb), admin_dashboard_stats()
  to service_role;

-- ---------------------------------------------------------------------------
-- Seed: canonical categories (PRD §6.2). Admin-managed after this.
-- ---------------------------------------------------------------------------
insert into categories (slug, name, icon, color, sort_order) values
  ('cafes',    'Cafés',    'FiCoffee',      '#F97316', 1),
  ('heritage', 'Heritage', 'MdTempleHindu', '#8B5CF6', 2),
  ('parks',    'Parks',    'LuTreePine',    '#10B981', 3),
  ('ghat',     'Ghats',    'MdWater',       '#EC4899', 4),
  ('shopping', 'Bazaars',  'FiShoppingBag', '#F59E0B', 5),
  ('secrets',  'Secrets',  'FiEye',         '#06B6D4', 6)
on conflict (slug) do nothing;
