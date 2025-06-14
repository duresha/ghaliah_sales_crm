-- Create the company_notes table
create table public.company_notes (
  id uuid not null default gen_random_uuid (),
  company_id uuid not null references public.companies (id) on delete cascade,
  note text not null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint company_notes_pkey primary key (id)
);

-- Add RLS policies
alter table public.company_notes enable row level security;

-- Create policy for authenticated users to view notes
create policy "Authenticated users can view company notes"
  on public.company_notes
  for select
  to authenticated
  using (true);

-- Create policy for authenticated users to insert notes
create policy "Authenticated users can insert company notes"
  on public.company_notes
  for insert
  to authenticated
  with check (true);

-- Create policy for authenticated users to update notes
create policy "Authenticated users can update company notes"
  on public.company_notes
  for update
  to authenticated
  using (true)
  with check (true);

-- Add comment for clarity
comment on table public.company_notes is 'Stores notes associated with companies';
