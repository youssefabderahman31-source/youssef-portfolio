-- Create companies table
create table if not exists companies (
  id text primary key,
  slug text not null unique,
  name text not null,
  logo text,
  description text,
  description_ar text,
  content text,
  content_ar text,
  document_file text,
  document_name text,
  document_type text
);

-- Create projects table
create table if not exists projects (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text,
  description_ar text,
  company_id text references companies(id) on delete cascade,
  document_file text,
  document_name text,
  document_type text,
  content text,
  content_ar text
);

-- Enable RLS and add public read policies (optional)
alter table companies enable row level security;
create policy "public can read companies" on public.companies for select using (true);

alter table projects enable row level security;
create policy "public can read projects" on public.projects for select using (true);
