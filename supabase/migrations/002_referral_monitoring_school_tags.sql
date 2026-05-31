-- Referral codes, monitor links, parent child links, and school tags.

alter table public.student_profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by_student_id uuid references public.student_profiles(id) on delete set null;

create table if not exists public.teacher_student_links (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'pending', 'removed')),
  source text not null default 'student_code',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, student_id)
);

create table if not exists public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'pending', 'removed')),
  source text not null default 'student_code',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parent_id, student_id)
);

create table if not exists public.school_tags (
  id uuid primary key default gen_random_uuid(),
  centre_id uuid references public.centres(id) on delete cascade,
  name text not null,
  code text not null unique,
  area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_school_tags (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  school_tag_id uuid not null references public.school_tags(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, school_tag_id)
);

create index if not exists student_profiles_referral_code_idx
on public.student_profiles(referral_code);

create index if not exists teacher_student_links_teacher_id_idx
on public.teacher_student_links(teacher_id);

create index if not exists teacher_student_links_student_id_idx
on public.teacher_student_links(student_id);

create index if not exists parent_student_links_parent_id_idx
on public.parent_student_links(parent_id);

create index if not exists parent_student_links_student_id_idx
on public.parent_student_links(student_id);

create index if not exists school_tags_centre_id_idx
on public.school_tags(centre_id);

create trigger teacher_student_links_set_updated_at
before update on public.teacher_student_links
for each row execute function public.set_updated_at();

create trigger parent_student_links_set_updated_at
before update on public.parent_student_links
for each row execute function public.set_updated_at();

create trigger school_tags_set_updated_at
before update on public.school_tags
for each row execute function public.set_updated_at();

create or replace function public.is_parent_of_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_profiles sp
    where sp.id = target_student_id
      and auth.uid() = any(sp.parent_ids)
  )
  or exists (
    select 1
    from public.parent_student_links psl
    where psl.student_id = target_student_id
      and psl.parent_id = auth.uid()
      and psl.status = 'active'
  );
$$;

create or replace function public.is_teacher_for_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classrooms c
    join public.classroom_students cs on cs.classroom_id = c.id
    where cs.student_id = target_student_id
      and c.teacher_id = auth.uid()
  )
  or exists (
    select 1
    from public.teacher_student_links tsl
    where tsl.student_id = target_student_id
      and tsl.teacher_id = auth.uid()
      and tsl.status = 'active'
  );
$$;

alter table public.teacher_student_links enable row level security;
alter table public.parent_student_links enable row level security;
alter table public.school_tags enable row level security;
alter table public.profile_school_tags enable row level security;

create policy "teacher_student_links_select_own_or_admin"
on public.teacher_student_links for select
using (
  teacher_id = auth.uid()
  or public.is_student_owner(student_id)
  or public.is_parent_of_student(student_id)
  or (public.is_admin() and public.can_access_student(student_id))
);

create policy "teacher_student_links_insert_own_teacher"
on public.teacher_student_links for insert
with check (teacher_id = auth.uid() and public.current_user_role() = 'teacher');

create policy "teacher_student_links_admin_manage"
on public.teacher_student_links for all
using (public.is_admin() and public.can_access_student(student_id))
with check (public.is_admin() and public.can_access_student(student_id));

create policy "parent_student_links_select_own_or_admin"
on public.parent_student_links for select
using (
  parent_id = auth.uid()
  or public.is_student_owner(student_id)
  or public.is_teacher_for_student(student_id)
  or (public.is_admin() and public.can_access_student(student_id))
);

create policy "parent_student_links_insert_own_parent"
on public.parent_student_links for insert
with check (parent_id = auth.uid() and public.current_user_role() = 'parent');

create policy "parent_student_links_admin_manage"
on public.parent_student_links for all
using (public.is_admin() and public.can_access_student(student_id))
with check (public.is_admin() and public.can_access_student(student_id));

create policy "school_tags_select_centre_scope"
on public.school_tags for select
using (centre_id is null or public.is_same_centre(centre_id) or public.is_admin());

create policy "school_tags_admin_manage"
on public.school_tags for all
using (public.is_admin())
with check (public.is_admin());

create policy "profile_school_tags_select_related"
on public.profile_school_tags for select
using (
  profile_id = auth.uid()
  or public.is_admin()
  or (
    public.is_teacher()
    and exists (
      select 1
      from public.profile_school_tags own_tag
      where own_tag.profile_id = auth.uid()
        and own_tag.school_tag_id = profile_school_tags.school_tag_id
    )
  )
);

create policy "profile_school_tags_admin_manage"
on public.profile_school_tags for all
using (public.is_admin())
with check (public.is_admin());
