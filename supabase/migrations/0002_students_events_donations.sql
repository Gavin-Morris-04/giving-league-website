-- ─────────────────────────────────────────────────────────────────────────────
-- The Cause Krewe — 0002: high school eligibility, charity events, donations & verified fundraising reports.
-- Same security model as 0001: RLS on every table, public read of published data only, writes via server
-- actions (service role) or staff (is_staff). No payment data is ever stored.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Geaux Give Week tables keep their own names (college-only competition) ──
alter table if exists public.fundraising_campaigns rename to ggw_campaigns;
alter table if exists public.campaign_totals rename to ggw_campaign_totals;

-- ── Partnerships now arrive through the contact form ──
drop table if exists public.partnership_inquiries;
alter table public.contact_messages add column if not exists organization text;

-- ── School representative interest (adults only) ──
alter table public.campus_interest
  add column if not exists relationship text,
  add column if not exists school_name text;

-- ── Youth eligibility on volunteer listings (never inferred) ──
create type minor_policy as enum ('allowed', 'with_guardian_consent', 'with_adult', 'youth_program', 'adults_only', 'unverified');
alter table public.volunteer_opportunities
  add column if not exists minors_policy minor_policy not null default 'unverified',
  add column if not exists guardian_permission text not null default 'unverified' check (guardian_permission in ('required','not_required','unverified')),
  add column if not exists school_groups text not null default 'unverified' check (school_groups in ('yes','no','unverified')),
  add column if not exists schedule_days text not null default 'unverified' check (schedule_days in ('weekdays','weekends','both','unverified')),
  add column if not exists service_hours text not null default 'unverified' check (service_hours in ('yes','unverified')),
  add column if not exists eligibility_note text;

-- ── Charity events directory (separate from volunteer opportunities) ──
create type charity_event_type as enum ('walk_run','ride','golf','gala','collection_drive','toy_drive','cleanup','build','other');
create type recurrence as enum ('one_time','annual','seasonal','unconfirmed');

create table public.charity_events (
  slug               text primary key,
  name               text not null,
  host               text not null,
  host_url           text not null check (host_url ~* '^https?://'),
  summary            text not null,
  description        text not null,
  event_type         charity_event_type not null,
  cause              cause not null,
  city_key           text not null,
  location           text not null,
  recurrence         recurrence not null,
  typical_months     smallint[] not null default '{}',
  typical_timing     text not null,
  -- The NEXT occurrence, only when confirmed on the organizer's official site. Never last year's date.
  confirmed_start    date,
  confirmed_end      date,
  confirmed_time     text,
  confirmed_source   text,
  last_held_start    date,
  last_held_end      date,
  participation      text[] not null default '{}',
  cost               text not null default 'unverified' check (cost in ('free','paid','varies','unverified')),
  high_school        text not null default 'unverified' check (high_school in ('yes','with_guardian','with_adult','no','unverified')),
  college            text not null default 'unverified' check (college in ('yes','unverified')),
  audience_note      text,
  registration_url   text not null check (registration_url ~* '^https?://'),
  info_url           text not null check (info_url ~* '^https?://'),
  last_verified      date not null,
  provenance         provenance not null default 'verified',
  updated_at         timestamptz not null default now(),
  constraint confirmed_has_source check (confirmed_start is null or confirmed_source is not null)
);

create table public.submitted_charity_events (
  id                uuid primary key default gen_random_uuid(),
  org_name          text not null,
  org_website       text not null,
  contact_name      text not null,
  contact_email     citext not null,
  event_name        text not null,
  description       text not null,
  event_type        charity_event_type not null,
  cause             cause not null,
  city              text not null,
  recurrence        text not null,
  event_date        date,
  typical_timing    text,
  registration_url  text not null,
  cost              text not null,
  age_rules         text,
  status            submission_status not null default 'pending_review',
  reviewer_notes    text,
  published_slug    text references public.charity_events (slug),
  source_path       text,
  user_agent        text,
  created_at        timestamptz not null default now()
);

-- ── Donations: charities + verified fundraising (Methods A, B and C) ──
create table public.charities (
  id                             text primary key,
  name                           text not null,
  description                    text not null,
  cause                          text not null,
  scope                          text not null,
  website_url                    text not null check (website_url ~* '^https?://'),
  official_donation_url          text not null check (official_donation_url ~* '^https?://'),
  campaign_donation_url          text check (campaign_donation_url is null or campaign_donation_url ~* '^https?://'),
  tracking_status                text not null default 'none' check (tracking_status in ('none','pending_setup','manual','integration')),
  verification_status            text not null default 'verified' check (verification_status in ('verified','unverified')),
  corporate_giving_available     boolean not null default false,
  corporate_giving_url           text,
  workplace_giving_url           text,
  matching_gift_url              text,
  corporate_giving_description   text,
  last_verified                  date not null,
  updated_at                     timestamptz not null default now()
);

create table public.fundraising_campaigns (
  id                        uuid primary key default gen_random_uuid(),
  charity_id                text not null references public.charities (id),
  campaign_name             text not null,
  campaign_identifier       text not null,              -- the charity platform's own page/campaign id
  campaign_url              text not null check (campaign_url ~* '^https?://'),
  currency                  char(3) not null default 'USD',
  verification_method       text not null check (verification_method in ('charity_campaign_report','approved_integration','manual_official_report')),
  reporting_period_start    date not null,
  reporting_period_end      date,
  status                    text not null default 'draft' check (status in ('draft','active','closed')),
  -- Set when this campaign's money is also counted inside another campaign: prevents double counting.
  included_in_campaign_id   uuid references public.fundraising_campaigns (id),
  created_at                timestamptz not null default now(),
  unique (charity_id, campaign_identifier)
);

-- Append-only history of CUMULATIVE verified totals. Corrections are new rows that supersede old ones.
create table public.fundraising_reports (
  id                      uuid primary key default gen_random_uuid(),
  campaign_id             uuid not null references public.fundraising_campaigns (id),
  reported_amount_cents   bigint not null check (reported_amount_cents >= 0),
  as_of                   date not null,
  verified_at             timestamptz not null default now(),
  source_reference        text not null check (length(trim(source_reference)) > 0),
  entered_by              uuid not null references auth.users (id),
  kind                    text not null default 'cumulative' check (kind in ('cumulative','correction')),
  supersedes_report_id    uuid references public.fundraising_reports (id),
  voided                  boolean not null default false,
  note                    text
);
create index on public.fundraising_reports (campaign_id, as_of desc, verified_at desc);

-- Latest valid cumulative report per campaign (same rule as src/lib/fundraising/totals.ts).
create or replace view public.verified_campaign_totals as
with live as (
  select r.* from public.fundraising_reports r
  where not r.voided
    and not exists (select 1 from public.fundraising_reports s where s.supersedes_report_id = r.id and not s.voided)
), latest as (
  select distinct on (campaign_id) * from live order by campaign_id, as_of desc, verified_at desc
)
select c.id as campaign_id, c.charity_id, c.campaign_name, l.reported_amount_cents, l.as_of, l.verified_at, l.source_reference
from public.fundraising_campaigns c
join latest l on l.campaign_id = c.id
where c.status <> 'draft'
  and (c.included_in_campaign_id is null
       or not exists (select 1 from latest p where p.campaign_id = c.included_in_campaign_id));

-- Staff-only entry point for Method C (and the Method B importer). Never callable by the public.
create or replace function public.record_fundraising_report(
  p_campaign_id uuid, p_amount_cents bigint, p_as_of date, p_source_reference text, p_entered_by uuid,
  p_kind text default 'cumulative', p_supersedes_report_id uuid default null, p_note text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if auth.role() <> 'service_role' and not public.is_staff('editor') then
    raise exception 'Only authorized staff can record fundraising reports';
  end if;
  insert into public.fundraising_reports (campaign_id, reported_amount_cents, as_of, source_reference, entered_by, kind, supersedes_report_id, note)
  values (p_campaign_id, p_amount_cents, p_as_of, p_source_reference, p_entered_by, p_kind, p_supersedes_report_id, p_note)
  returning id into new_id;
  return new_id;
end; $$;
revoke all on function public.record_fundraising_report from public, anon, authenticated;

-- ── Privacy-conscious link analytics (aggregate counts only; never donations) ──
create table public.link_metrics (
  day          date not null default current_date,
  charity_id   text not null,
  event        text not null check (event in ('donate_click','learn_more_click','campaign_click','corporate_click')),
  count        integer not null default 0,
  primary key (day, charity_id, event)
);

create or replace function public.increment_link_metric(p_charity_id text, p_event text) returns void
language sql security definer set search_path = public as $$
  insert into public.link_metrics (day, charity_id, event, count) values (current_date, p_charity_id, p_event, 1)
  on conflict (day, charity_id, event) do update set count = public.link_metrics.count + 1;
$$;
revoke all on function public.increment_link_metric from public, anon, authenticated;

-- ── RLS ──
alter table public.charity_events            enable row level security;
alter table public.submitted_charity_events  enable row level security;
alter table public.charities                 enable row level security;
alter table public.fundraising_campaigns     enable row level security;
alter table public.fundraising_reports       enable row level security;
alter table public.link_metrics              enable row level security;

create policy "public read verified charity events" on public.charity_events for select using (provenance = 'verified');
create policy "editors manage charity events" on public.charity_events for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy "staff review event submissions" on public.submitted_charity_events for select using (public.is_staff());
create policy "staff update event submissions" on public.submitted_charity_events for update using (public.is_staff()) with check (public.is_staff());
create policy "public read charities" on public.charities for select using (true);
create policy "editors manage charities" on public.charities for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy "public read active campaigns" on public.fundraising_campaigns for select using (status <> 'draft');
create policy "admins manage campaigns" on public.fundraising_campaigns for all using (public.is_staff('admin')) with check (public.is_staff('admin'));
create policy "staff read reports" on public.fundraising_reports for select using (public.is_staff());
-- No INSERT/UPDATE/DELETE policies on fundraising_reports: rows are added only via record_fundraising_report().
create policy "admins read link metrics" on public.link_metrics for select using (public.is_staff('admin'));

create trigger touch_charity_events before update on public.charity_events for each row execute function public.touch_updated_at();
create trigger touch_charities before update on public.charities for each row execute function public.touch_updated_at();
