-- ─────────────────────────────────────────────────────────────────────────────
-- The Giving League (working name) — initial schema
--
-- Security model
--   • Row Level Security is ON for every table.
--   • Public (anon) visitors can READ only published directory data.
--   • Public visitors can NOT write anything directly. Website forms post to Next.js server actions,
--     which validate input and insert with the service-role key (server-only, never sent to browsers).
--   • Staff access for the future admin dashboard is granted through public.staff + public.is_staff(),
--     tied to Supabase Auth users. No staff exist until you add them.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ── Enums ───────────────────────────────────────────────────────────────────
create type campus_status       as enum ('participating', 'launching', 'not_yet');
create type cause               as enum ('hunger','housing','animals','environment','disaster','youth','seniors','health','community');
create type listing_kind        as enum ('resource', 'event');
create type group_eligibility   as enum ('individuals', 'groups', 'both');
create type frequency           as enum ('one_time', 'recurring', 'flexible');
create type opportunity_format  as enum ('in_person', 'remote', 'hybrid');
create type opportunity_status  as enum ('active', 'seasonal', 'paused', 'expired');
create type provenance          as enum ('verified', 'example');
create type event_status        as enum ('concept', 'scheduled', 'completed', 'cancelled');
create type inquiry_status      as enum ('new', 'in_review', 'responded', 'closed', 'spam');
create type submission_status   as enum ('pending_review', 'approved', 'rejected', 'needs_info');
create type campaign_status     as enum ('planning', 'live', 'closed');

-- ── Staff (future admin dashboard) ──────────────────────────────────────────
create table public.staff (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null check (role in ('admin', 'editor', 'reviewer')),
  created_at timestamptz not null default now()
);

create or replace function public.is_staff(min_role text default 'reviewer')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff s
    where s.user_id = auth.uid()
      and case min_role
            when 'admin'  then s.role = 'admin'
            when 'editor' then s.role in ('admin', 'editor')
            else true
          end
  );
$$;

-- ── Reference & directory data ──────────────────────────────────────────────
create table public.universities (
  slug             text primary key,
  name             text not null,
  short_name       text not null,
  city             text not null,
  city_key         text not null,
  lat              double precision not null,
  lng              double precision not null,
  website          text not null,
  status           campus_status not null default 'not_yet',
  status_note      text,
  student_contact  jsonb,                         -- only after the contact agrees to be listed
  updated_at       timestamptz not null default now()
);

create table public.organizations (
  slug        text primary key,
  name        text not null,
  website     text not null,
  summary     text not null,
  is_partner  boolean not null default false,   -- true ONLY with a written partnership
  updated_at  timestamptz not null default now()
);

create table public.volunteer_opportunities (
  slug               text primary key,
  org_slug           text not null references public.organizations (slug) on update cascade,
  kind               listing_kind not null,
  title              text not null,
  summary            text not null,
  description        text not null,
  cause              cause not null,
  secondary_causes   cause[] not null default '{}',
  city_key           text not null,
  service_area       text not null,
  location           text not null,                 -- street or district only
  nearby_campuses    text[] not null default '{}',
  time_commitment    text not null,
  requirements       text[] not null default '{}',
  minimum_age        smallint,
  group_eligibility  group_eligibility not null,
  group_notes        text,
  frequency          frequency not null,
  format             opportunity_format not null default 'in_person',
  signup_url         text not null check (signup_url ~* '^https?://'),
  info_url           text not null check (info_url ~* '^https?://'),
  start_date         date,
  end_date           date,
  status             opportunity_status not null default 'active',
  last_verified      date not null,
  verified_by        uuid references auth.users (id),
  provenance         provenance not null default 'verified',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint event_has_dates check (kind = 'resource' or start_date is not null),
  constraint dates_ordered check (end_date is null or start_date is null or end_date >= start_date)
);
create index on public.volunteer_opportunities (city_key);
create index on public.volunteer_opportunities using gin (nearby_campuses);

create table public.community_events (
  slug              text primary key,
  title             text not null,
  series            text not null,
  summary           text not null,
  description       text not null,
  cause             cause not null,
  status            event_status not null default 'concept',
  start_date        date,
  end_date          date,
  city_key          text,
  campuses          text[] not null default '{}',
  registration_url  text check (registration_url is null or registration_url ~* '^https?://'),
  what_to_expect    text[] not null default '{}',
  ways_to_help      text[] not null default '{}',
  outcome_summary   text,                          -- honest post-event report
  updated_at        timestamptz not null default now(),
  constraint scheduled_has_date check (status in ('concept', 'cancelled') or start_date is not null)
);

create table public.fundraising_campaigns (
  id           uuid primary key default gen_random_uuid(),
  year         smallint not null unique,
  status       campaign_status not null default 'planning',
  beneficiary  text,                               -- set only after written approval
  start_date   date,
  end_date     date,
  updated_at   timestamptz not null default now()
);

create table public.campaign_totals (
  campaign_id      uuid not null references public.fundraising_campaigns (id) on delete cascade,
  university_slug  text not null references public.universities (slug),
  raised_cents     bigint not null check (raised_cents >= 0),
  enrolled         integer check (enrolled > 0),
  source_note      text not null,                  -- e.g. "Beneficiary platform export 2027-04-02"
  verified_at      timestamptz not null default now(),
  primary key (campaign_id, university_slug)
);

-- ── Inbound submissions (written by server actions with the service role) ──
create table public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        citext not null,
  topic        text not null,
  message      text not null,
  status       inquiry_status not null default 'new',
  source_path  text,
  user_agent   text,
  created_at   timestamptz not null default now()
);

create table public.campus_interest (            -- campus representative + Geaux Give Week interest
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         citext not null,
  campus_slug   text not null,                   -- a university slug or 'other'
  other_campus  text,
  role          text not null,
  interest      text not null,
  message       text,
  status        inquiry_status not null default 'new',
  source_path   text,
  user_agent    text,
  created_at    timestamptz not null default now()
);

create table public.partnership_inquiries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         citext not null,
  organization  text not null,
  website       text,
  org_type      text not null,
  interest      text not null,
  message       text not null,
  status        inquiry_status not null default 'new',
  source_path   text,
  user_agent    text,
  created_at    timestamptz not null default now()
);

create table public.submitted_opportunities (
  id                 uuid primary key default gen_random_uuid(),
  org_name           text not null,
  org_website        text not null,
  contact_name       text not null,
  contact_email      citext not null,
  title              text not null,
  description        text not null,
  cause              cause not null,
  city               text not null,
  signup_url         text not null,
  kind               listing_kind not null,
  event_date         date,
  group_eligibility  group_eligibility not null,
  minimum_age        smallint,
  requirements       text,
  status             submission_status not null default 'pending_review',
  reviewer_notes     text,
  published_slug     text references public.volunteer_opportunities (slug),
  source_path        text,
  user_agent         text,
  created_at         timestamptz not null default now()
);

create table public.update_subscribers (
  email          citext primary key,
  campus_slug    text,
  topics         text[] not null default '{}',
  unsubscribed   boolean not null default false,
  source_path    text,
  user_agent     text,
  created_at     timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.staff                    enable row level security;
alter table public.universities             enable row level security;
alter table public.organizations            enable row level security;
alter table public.volunteer_opportunities  enable row level security;
alter table public.community_events         enable row level security;
alter table public.fundraising_campaigns    enable row level security;
alter table public.campaign_totals          enable row level security;
alter table public.contact_messages         enable row level security;
alter table public.campus_interest          enable row level security;
alter table public.partnership_inquiries    enable row level security;
alter table public.submitted_opportunities  enable row level security;
alter table public.update_subscribers       enable row level security;

-- Public read of published directory data only
create policy "public read universities" on public.universities for select using (true);
create policy "public read organizations" on public.organizations for select using (true);
create policy "public read verified listings" on public.volunteer_opportunities
  for select using (provenance = 'verified' and status in ('active', 'seasonal'));
create policy "public read events" on public.community_events for select using (status <> 'cancelled');
create policy "public read campaigns" on public.fundraising_campaigns for select using (true);
create policy "public read live totals" on public.campaign_totals
  for select using (exists (select 1 from public.fundraising_campaigns c where c.id = campaign_id and c.status in ('live', 'closed')));

-- Staff (future admin dashboard)
create policy "staff read self" on public.staff for select using (user_id = auth.uid() or public.is_staff('admin'));
create policy "admins manage staff" on public.staff for all using (public.is_staff('admin')) with check (public.is_staff('admin'));

create policy "editors manage universities" on public.universities for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy "editors manage organizations" on public.organizations for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy "editors manage listings" on public.volunteer_opportunities for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy "editors manage events" on public.community_events for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy "admins manage campaigns" on public.fundraising_campaigns for all using (public.is_staff('admin')) with check (public.is_staff('admin'));
create policy "admins manage totals" on public.campaign_totals for all using (public.is_staff('admin')) with check (public.is_staff('admin'));

create policy "staff review contact" on public.contact_messages for select using (public.is_staff());
create policy "staff update contact" on public.contact_messages for update using (public.is_staff()) with check (public.is_staff());
create policy "staff review campus interest" on public.campus_interest for select using (public.is_staff());
create policy "staff update campus interest" on public.campus_interest for update using (public.is_staff()) with check (public.is_staff());
create policy "staff review partnerships" on public.partnership_inquiries for select using (public.is_staff());
create policy "staff update partnerships" on public.partnership_inquiries for update using (public.is_staff()) with check (public.is_staff());
create policy "staff review submissions" on public.submitted_opportunities for select using (public.is_staff());
create policy "staff update submissions" on public.submitted_opportunities for update using (public.is_staff()) with check (public.is_staff());
create policy "admins read subscribers" on public.update_subscribers for select using (public.is_staff('admin'));

-- No INSERT policies exist for anon/authenticated on submission tables: only the service role
-- (used exclusively inside server actions) can insert.

-- ── Housekeeping ────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger touch_universities before update on public.universities for each row execute function public.touch_updated_at();
create trigger touch_organizations before update on public.organizations for each row execute function public.touch_updated_at();
create trigger touch_listings before update on public.volunteer_opportunities for each row execute function public.touch_updated_at();
create trigger touch_events before update on public.community_events for each row execute function public.touch_updated_at();
create trigger touch_campaigns before update on public.fundraising_campaigns for each row execute function public.touch_updated_at();

-- Expire dated listings automatically (run daily via pg_cron or a scheduled function)
create or replace function public.expire_past_events() returns void language sql as $$
  update public.volunteer_opportunities
     set status = 'expired'
   where kind = 'event' and coalesce(end_date, start_date) < current_date and status <> 'expired';
$$;
