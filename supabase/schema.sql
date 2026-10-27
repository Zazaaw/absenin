-- Magang Diary: skema untuk project Supabase kamu sendiri.
-- Jalankan di SQL Editor. Setelah itu isi env NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.

create extension if not exists pgcrypto;

-- Profil pengguna, satu baris per akun Supabase Auth.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique,
  email text unique not null,
  name text default '',
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- Otomatis buat profil saat user daftar lewat Supabase Auth.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (auth_id, email, name)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (email) do update set auth_id = excluded.auth_id;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  plan text not null default 'pro' check (plan in ('trial','pro','tim')),
  status text not null default 'active' check (status in ('active','revoked','expired')),
  daily_quota int not null default 6,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  device_id text,
  device_name text,
  note text default ''
);
create index if not exists licenses_email_idx on public.licenses(email);

create table if not exists public.usage_log (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references public.licenses(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  model text default '',
  prompt_tokens int default 0,
  completion_tokens int default 0,
  ok boolean not null default true,
  error text default '',
  template_id text default '',
  brief_length int default 0,
  offline boolean default false
);
create index if not exists usage_log_license_day_idx on public.usage_log(license_id, created_at desc);

create table if not exists public.remote_config (
  id int primary key default 1 check (id = 1),
  model text not null default 'gpt-4o-mini',
  default_daily_quota int not null default 6,
  max_brief_chars int not null default 1200,
  system_prompt_extra text default '',
  announcement text default '',
  min_extension_version text default '0.2.0',
  trial_days int not null default 7,
  updated_at timestamptz not null default now()
);
insert into public.remote_config (id) values (1) on conflict (id) do nothing;

create table if not exists public.telemetry (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  detail text default '',
  version text default '',
  license_id uuid references public.licenses(id) on delete set null,
  email text default ''
);
create index if not exists telemetry_created_idx on public.telemetry(created_at desc);

create table if not exists public.beta_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text unique not null,
  kampus text default '',
  note text default ''
);
alter table public.telemetry enable row level security;
alter table public.beta_signups enable row level security;

-- RLS: semua tabel dikunci; server memakai service role. Pengguna hanya boleh membaca datanya sendiri.
alter table public.profiles enable row level security;
alter table public.licenses enable row level security;
alter table public.usage_log enable row level security;
alter table public.remote_config enable row level security;

drop policy if exists "profil sendiri" on public.profiles;
create policy "profil sendiri" on public.profiles for select using (auth.uid() = auth_id);
drop policy if exists "lisensi sendiri" on public.licenses;
create policy "lisensi sendiri" on public.licenses for select using (email = (select email from public.profiles where auth_id = auth.uid()));
drop policy if exists "pemakaian sendiri" on public.usage_log;
create policy "pemakaian sendiri" on public.usage_log for select using (email = (select email from public.profiles where auth_id = auth.uid()));

-- Jadikan admin: update public.profiles set role = 'admin' where email = 'kamu@contoh.com';
