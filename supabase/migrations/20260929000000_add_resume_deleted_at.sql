alter table public.resumes
  add column if not exists deleted_at timestamptz;