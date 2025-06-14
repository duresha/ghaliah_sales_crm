-- Add notes and deadline_date columns to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS deadline_date date;
