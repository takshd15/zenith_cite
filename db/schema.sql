create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 320),
  business_name text not null check (char_length(business_name) between 1 and 180),
  website text not null check (char_length(website) between 4 and 2048),
  problem text not null check (char_length(problem) between 1 and 3000),
  competitor text check (competitor is null or char_length(competitor) <= 300),
  interest text not null default 'snapshot' check (interest in ('snapshot', 'visibility-audit', 'growth', 'authority')),
  timezone text not null check (char_length(timezone) between 1 and 100),
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists booking_requests_created_at_idx
  on public.booking_requests (created_at desc);

create index if not exists booking_requests_email_idx
  on public.booking_requests (lower(email));

alter table public.booking_requests enable row level security;
revoke all on table public.booking_requests from anon, authenticated;

comment on table public.booking_requests is
  'Booking-link requests submitted through the Zenith website.';
