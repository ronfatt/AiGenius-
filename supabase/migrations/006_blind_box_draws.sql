create table if not exists public.blind_box_draws (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  box_id text not null,
  box_tier text not null check (box_tier in ('normal', 'star', 'rare')),
  reward_type text not null,
  reward_name text not null,
  reward_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists blind_box_draws_student_id_idx
on public.blind_box_draws(student_id);

alter table public.blind_box_draws enable row level security;

drop policy if exists "blind_box_draws_select_role_scope" on public.blind_box_draws;
drop policy if exists "blind_box_draws_student_insert_own" on public.blind_box_draws;
drop policy if exists "blind_box_draws_admin_manage" on public.blind_box_draws;

create policy "blind_box_draws_select_role_scope"
on public.blind_box_draws for select
using (
  public.is_admin()
  or public.is_student_owner(student_id)
  or public.is_parent_of_student(student_id)
  or public.is_teacher_for_student(student_id)
);

create policy "blind_box_draws_student_insert_own"
on public.blind_box_draws for insert
with check (public.is_student_owner(student_id));

create policy "blind_box_draws_admin_manage"
on public.blind_box_draws for all
using (public.is_admin())
with check (public.is_admin());
