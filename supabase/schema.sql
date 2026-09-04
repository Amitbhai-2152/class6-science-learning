-- Class 6 Learning Hub account storage
-- Run this in the Supabase SQL editor after creating the project.

create table if not exists public.student_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1,
  updated_at timestamptz not null default now()
);

create index if not exists student_state_updated_at_idx
  on public.student_state (updated_at);

alter table public.student_state enable row level security;

drop policy if exists "student_state_select_own" on public.student_state;
drop policy if exists "student_state_insert_own" on public.student_state;
drop policy if exists "student_state_update_own" on public.student_state;
drop policy if exists "student_state_delete_own" on public.student_state;

create policy "student_state_select_own"
  on public.student_state for select
  using (auth.uid() = user_id);

create policy "student_state_insert_own"
  on public.student_state for insert
  with check (auth.uid() = user_id);

create policy "student_state_update_own"
  on public.student_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "student_state_delete_own"
  on public.student_state for delete
  using (auth.uid() = user_id);

create or replace function public.touch_student_state_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists student_state_touch_updated_at on public.student_state;
create trigger student_state_touch_updated_at
before update on public.student_state
for each row execute function public.touch_student_state_updated_at();
