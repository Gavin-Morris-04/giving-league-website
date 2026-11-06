-- ─────────────────────────────────────────────────────────────────────────────
-- LOCAL DEVELOPMENT SEED — EXAMPLE DATA ONLY
--
-- Rows here use provenance = 'example' and obviously fake names so they can never be mistaken for real
-- listings. The public RLS policy only exposes provenance = 'verified', so these rows never appear on
-- the website even if this file is run against production by mistake.
--
-- Verified live data lives in src/data/verified/*.ts (the site's source of truth until the admin
-- dashboard exists). Import it with the steps in README.md → "Moving the directory into Supabase".
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.universities (slug, name, short_name, city, city_key, lat, lng, website, status) values
  ('example-u', 'Example University (test row)', 'Example U', 'Baton Rouge', 'baton-rouge', 30.45, -91.18, 'https://example.edu', 'not_yet')
on conflict (slug) do nothing;

insert into public.organizations (slug, name, website, summary) values
  ('example-food-pantry', 'Example Food Pantry (test row)', 'https://example.org', 'Fake organization used for local testing.')
on conflict (slug) do nothing;

insert into public.volunteer_opportunities
  (slug, org_slug, kind, title, summary, description, cause, city_key, service_area, location, nearby_campuses,
   time_commitment, requirements, group_eligibility, frequency, format, signup_url, info_url, status, last_verified, provenance)
values
  ('example-sorting-shift', 'example-food-pantry', 'resource', 'Example sorting shift (test row)',
   'Fake listing for local development.', 'Fake listing for local development. Never shown publicly.', 'hunger',
   'baton-rouge', 'Test area', 'Test street', '{example-u}', 'Two hours', '{"None — test data"}',
   'both', 'flexible', 'in_person', 'https://example.org/volunteer', 'https://example.org/volunteer', 'active', current_date, 'example')
on conflict (slug) do nothing;

insert into public.fundraising_campaigns (year, status) values (2027, 'planning') on conflict (year) do nothing;
