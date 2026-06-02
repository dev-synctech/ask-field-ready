
-- ===== Roles =====
create type public.app_role as enum ('admin','member');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ===== Profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "admins read all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ===== Entitlements =====
create type public.entitlement_status as enum ('active','inactive','refunded');

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status entitlement_status not null default 'inactive',
  stripe_session_id text,
  stripe_payment_intent text,
  amount_cents integer,
  granted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
grant select on public.entitlements to authenticated;
grant all on public.entitlements to service_role;
alter table public.entitlements enable row level security;
create policy "own entitlement" on public.entitlements for select to authenticated using (auth.uid() = user_id);
create policy "admins read all entitlements" on public.entitlements for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.is_paid(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.entitlements where user_id = _user_id and status = 'active')
$$;

-- ===== Content =====
create type public.content_type as enum ('lesson','playbook','video','checklist','scenario');
create type public.difficulty as enum ('foundational','intermediate','advanced');
create type public.publish_status as enum ('draft','published');

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.modules to authenticated;
grant all on public.modules to service_role;
alter table public.modules enable row level security;
create policy "paid read modules" on public.modules for select to authenticated using (public.is_paid(auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "admin write modules" on public.modules for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete set null,
  content_type content_type not null,
  title text not null,
  summary text,
  body_md text,
  tags text[] not null default '{}',
  difficulty difficulty not null default 'foundational',
  estimated_minutes integer,
  transcript text,
  related_checklist_id uuid,
  related_scenario_id uuid,
  storage_bucket text,
  storage_path text,
  publish_status publish_status not null default 'draft',
  admin_reviewed boolean not null default false,
  sanitized_approved boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.content_items to authenticated;
grant all on public.content_items to service_role;
alter table public.content_items enable row level security;
create policy "paid read published content" on public.content_items for select to authenticated using (
  (publish_status = 'published' and sanitized_approved = true and (public.is_paid(auth.uid()) or public.has_role(auth.uid(),'admin')))
  or public.has_role(auth.uid(),'admin')
);
create policy "admin write content" on public.content_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create index on public.content_items (content_type);
create index on public.content_items (module_id);
create index on public.content_items using gin (tags);

-- ===== Profile + role trigger =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'member');
  insert into public.entitlements (user_id, status) values (new.id, 'inactive');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Storage buckets (private) =====
insert into storage.buckets (id, name, public) values
  ('videos','videos', false),
  ('documents','documents', false)
on conflict (id) do nothing;

create policy "paid read videos" on storage.objects for select to authenticated
  using (bucket_id = 'videos' and (public.is_paid(auth.uid()) or public.has_role(auth.uid(),'admin')));
create policy "paid read documents" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (public.is_paid(auth.uid()) or public.has_role(auth.uid(),'admin')));
create policy "admin write videos" on storage.objects for all to authenticated
  using (bucket_id = 'videos' and public.has_role(auth.uid(),'admin'))
  with check (bucket_id = 'videos' and public.has_role(auth.uid(),'admin'));
create policy "admin write documents" on storage.objects for all to authenticated
  using (bucket_id = 'documents' and public.has_role(auth.uid(),'admin'))
  with check (bucket_id = 'documents' and public.has_role(auth.uid(),'admin'));
