-- AiGenius Pet Learning System
-- Initial Supabase schema with role-based row level security.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'teacher', 'student', 'parent');
create type public.learning_task_status as enum ('draft', 'assigned', 'submitted', 'reviewed', 'archived');
create type public.submission_status as enum ('pending', 'submitted', 'reviewed', 'late');
create type public.reward_source_type as enum ('task', 'behavior', 'quiz', 'battle', 'manual');
create type public.pet_rarity as enum ('common', 'rare', 'epic', 'legendary');
create type public.pet_stage as enum ('baby', 'junior', 'advanced', 'legendary');
create type public.card_rarity as enum ('common', 'rare', 'epic', 'legendary');
create type public.battle_mode as enum ('solo', 'class_boss', 'student_vs_student');

create table public.centres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  centre_id uuid references public.centres(id) on delete set null,
  name text not null,
  email text not null unique,
  role public.user_role not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  centre_id uuid not null references public.centres(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  subject text not null,
  grade text not null,
  schedule text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  parent_ids uuid[] not null default '{}',
  school_grade text not null,
  actual_learning_level numeric(4, 1) not null default 1.0,
  target_learning_level numeric(4, 1) not null default 1.0,
  subjects text[] not null default '{}',
  pet_id uuid,
  total_xp integer not null default 0 check (total_xp >= 0),
  star_coins integer not null default 0 check (star_coins >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  attendance_rate numeric(5, 2) not null default 0 check (attendance_rate between 0 and 100),
  homework_completion_rate numeric(5, 2) not null default 0 check (homework_completion_rate between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classroom_students (
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (classroom_id, student_id)
);

create table public.subject_skills (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  subject text not null,
  skill_name text not null,
  level numeric(4, 1) not null default 1.0,
  mastery_percentage numeric(5, 2) not null default 0 check (mastery_percentage between 0 and 100),
  weakness_tag text,
  last_assessed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_tasks (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classrooms(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  description text not null,
  subject text not null,
  skill_tags text[] not null default '{}',
  difficulty_level integer not null default 1 check (difficulty_level between 1 and 5),
  due_date timestamptz,
  xp_reward integer not null default 20 check (xp_reward >= 0),
  coin_reward integer not null default 5 check (coin_reward >= 0),
  status public.learning_task_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.learning_tasks(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  score numeric(5, 2) check (score between 0 and 100),
  status public.submission_status not null default 'pending',
  teacher_feedback text,
  auto_feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (task_id, student_id)
);

create table public.reward_transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  source_type public.reward_source_type not null,
  source_id uuid,
  xp_amount integer not null default 0 check (xp_amount >= 0),
  coin_amount integer not null default 0 check (coin_amount >= 0),
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.student_profiles(id) on delete cascade,
  name text not null,
  species text not null,
  rarity public.pet_rarity not null default 'common',
  stage public.pet_stage not null default 'baby',
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  power integer not null default 0 check (power between 0 and 100),
  wisdom integer not null default 0 check (wisdom between 0 and 100),
  speed integer not null default 0 check (speed between 0 and 100),
  focus integer not null default 0 check (focus between 0 and 100),
  courage integer not null default 0 check (courage between 0 and 100),
  kindness integer not null default 0 check (kindness between 0 and 100),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_profiles
  add constraint student_profiles_pet_id_fkey
  foreign key (pet_id) references public.pets(id) on delete set null
  deferrable initially deferred;

create table public.pet_cards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rarity public.card_rarity not null default 'common',
  type text not null,
  effect text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_card_inventory (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  card_id uuid not null references public.pet_cards(id) on delete cascade,
  quantity integer not null default 1 check (quantity >= 0),
  obtained_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, card_id)
);

create table public.battles (
  id uuid primary key default gen_random_uuid(),
  mode public.battle_mode not null,
  participant_ids uuid[] not null default '{}',
  result jsonb not null default '{}'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  rewards jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.parent_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  month text not null,
  summary text not null,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  recommendations text[] not null default '{}',
  teacher_comment text,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, month)
);

create index profiles_centre_id_idx on public.profiles(centre_id);
create index profiles_role_idx on public.profiles(role);
create index classrooms_centre_id_idx on public.classrooms(centre_id);
create index classrooms_teacher_id_idx on public.classrooms(teacher_id);
create index classroom_students_student_id_idx on public.classroom_students(student_id);
create index student_profiles_user_id_idx on public.student_profiles(user_id);
create index subject_skills_student_id_idx on public.subject_skills(student_id);
create index learning_tasks_class_id_idx on public.learning_tasks(class_id);
create index learning_tasks_teacher_id_idx on public.learning_tasks(teacher_id);
create index task_submissions_task_id_idx on public.task_submissions(task_id);
create index task_submissions_student_id_idx on public.task_submissions(student_id);
create index reward_transactions_student_id_idx on public.reward_transactions(student_id);
create index pets_student_id_idx on public.pets(student_id);
create index student_card_inventory_student_id_idx on public.student_card_inventory(student_id);
create index parent_reports_student_id_idx on public.parent_reports(student_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger centres_set_updated_at
before update on public.centres
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger classrooms_set_updated_at
before update on public.classrooms
for each row execute function public.set_updated_at();

create trigger student_profiles_set_updated_at
before update on public.student_profiles
for each row execute function public.set_updated_at();

create trigger subject_skills_set_updated_at
before update on public.subject_skills
for each row execute function public.set_updated_at();

create trigger learning_tasks_set_updated_at
before update on public.learning_tasks
for each row execute function public.set_updated_at();

create trigger task_submissions_set_updated_at
before update on public.task_submissions
for each row execute function public.set_updated_at();

create trigger pets_set_updated_at
before update on public.pets
for each row execute function public.set_updated_at();

create trigger pet_cards_set_updated_at
before update on public.pet_cards
for each row execute function public.set_updated_at();

create trigger student_card_inventory_set_updated_at
before update on public.student_card_inventory
for each row execute function public.set_updated_at();

create trigger parent_reports_set_updated_at
before update on public.parent_reports
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_centre_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select centre_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'teacher', false);
$$;

create or replace function public.is_student_owner(target_student_id uuid)
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
      and sp.user_id = auth.uid()
  );
$$;

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
  );
$$;

create or replace function public.is_teacher_for_class(target_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classrooms c
    where c.id = target_classroom_id
      and c.teacher_id = auth.uid()
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
  );
$$;

create or replace function public.is_same_centre(target_centre_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_centre_id = public.current_user_centre_id();
$$;

create or replace function public.can_access_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_student_owner(target_student_id)
    or public.is_parent_of_student(target_student_id)
    or public.is_teacher_for_student(target_student_id)
    or exists (
      select 1
      from public.student_profiles sp
      join public.profiles p on p.id = sp.user_id
      where sp.id = target_student_id
        and public.is_admin()
        and p.centre_id = public.current_user_centre_id()
    );
$$;

alter table public.centres enable row level security;
alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.classroom_students enable row level security;
alter table public.student_profiles enable row level security;
alter table public.subject_skills enable row level security;
alter table public.learning_tasks enable row level security;
alter table public.task_submissions enable row level security;
alter table public.reward_transactions enable row level security;
alter table public.pets enable row level security;
alter table public.pet_cards enable row level security;
alter table public.student_card_inventory enable row level security;
alter table public.battles enable row level security;
alter table public.parent_reports enable row level security;

create policy "centres_select_same_centre"
on public.centres for select
using (public.is_same_centre(id));

create policy "centres_admin_manage"
on public.centres for all
using (public.is_admin() and public.is_same_centre(id))
with check (public.is_admin() and public.is_same_centre(id));

create policy "profiles_select_role_scope"
on public.profiles for select
using (
  id = auth.uid()
  or (public.is_admin() and centre_id = public.current_user_centre_id())
  or (
    public.is_teacher()
    and centre_id = public.current_user_centre_id()
    and role in ('student', 'parent', 'teacher')
  )
);

create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_admin_manage"
on public.profiles for all
using (public.is_admin() and centre_id = public.current_user_centre_id())
with check (public.is_admin() and centre_id = public.current_user_centre_id());

create policy "classrooms_select_role_scope"
on public.classrooms for select
using (
  (public.is_admin() and public.is_same_centre(centre_id))
  or teacher_id = auth.uid()
  or exists (
    select 1
    from public.classroom_students cs
    join public.student_profiles sp on sp.id = cs.student_id
    where cs.classroom_id = classrooms.id
      and (sp.user_id = auth.uid() or auth.uid() = any(sp.parent_ids))
  )
);

create policy "classrooms_teacher_update_assigned"
on public.classrooms for update
using (teacher_id = auth.uid())
with check (teacher_id = auth.uid());

create policy "classrooms_admin_manage"
on public.classrooms for all
using (public.is_admin() and public.is_same_centre(centre_id))
with check (public.is_admin() and public.is_same_centre(centre_id));

create policy "classroom_students_select_role_scope"
on public.classroom_students for select
using (
  public.is_teacher_for_class(classroom_id)
  or public.can_access_student(student_id)
);

create policy "classroom_students_admin_manage"
on public.classroom_students for all
using (
  public.is_admin()
  and exists (
    select 1 from public.classrooms c
    where c.id = classroom_students.classroom_id
      and c.centre_id = public.current_user_centre_id()
  )
)
with check (
  public.is_admin()
  and exists (
    select 1 from public.classrooms c
    where c.id = classroom_students.classroom_id
      and c.centre_id = public.current_user_centre_id()
  )
);

create policy "student_profiles_select_role_scope"
on public.student_profiles for select
using (public.can_access_student(id));

create policy "student_profiles_student_update_own"
on public.student_profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "student_profiles_teacher_update_assigned"
on public.student_profiles for update
using (public.is_teacher_for_student(id))
with check (public.is_teacher_for_student(id));

create policy "student_profiles_admin_manage"
on public.student_profiles for all
using (
  public.is_admin()
  and exists (
    select 1
    from public.profiles p
    where p.id = student_profiles.user_id
      and p.centre_id = public.current_user_centre_id()
  )
)
with check (
  public.is_admin()
  and exists (
    select 1
    from public.profiles p
    where p.id = student_profiles.user_id
      and p.centre_id = public.current_user_centre_id()
  )
);

create policy "subject_skills_select_accessible_student"
on public.subject_skills for select
using (public.can_access_student(student_id));

create policy "subject_skills_teacher_manage_assigned"
on public.subject_skills for all
using (
  public.is_teacher_for_student(student_id)
  or (public.is_admin() and public.can_access_student(student_id))
)
with check (
  public.is_teacher_for_student(student_id)
  or (public.is_admin() and public.can_access_student(student_id))
);

create policy "learning_tasks_select_role_scope"
on public.learning_tasks for select
using (
  teacher_id = auth.uid()
  or public.is_teacher_for_class(class_id)
  or exists (
    select 1
    from public.classroom_students cs
    where cs.classroom_id = learning_tasks.class_id
      and public.can_access_student(cs.student_id)
  )
  or (
    public.is_admin()
    and exists (
      select 1
      from public.classrooms c
      where c.id = learning_tasks.class_id
        and c.centre_id = public.current_user_centre_id()
    )
  )
);

create policy "learning_tasks_teacher_manage_assigned"
on public.learning_tasks for all
using (
  teacher_id = auth.uid()
  or (
    public.is_admin()
    and exists (
      select 1
      from public.classrooms c
      where c.id = learning_tasks.class_id
        and c.centre_id = public.current_user_centre_id()
    )
  )
)
with check (
  teacher_id = auth.uid()
  or (
    public.is_admin()
    and exists (
      select 1
      from public.classrooms c
      where c.id = learning_tasks.class_id
        and c.centre_id = public.current_user_centre_id()
    )
  )
);

create policy "task_submissions_select_role_scope"
on public.task_submissions for select
using (
  public.can_access_student(student_id)
  or exists (
    select 1
    from public.learning_tasks lt
    where lt.id = task_submissions.task_id
      and lt.teacher_id = auth.uid()
  )
);

create policy "task_submissions_student_insert_own"
on public.task_submissions for insert
with check (public.is_student_owner(student_id));

create policy "task_submissions_student_update_own_pending"
on public.task_submissions for update
using (public.is_student_owner(student_id) and status in ('pending', 'submitted', 'late'))
with check (
  public.is_student_owner(student_id)
  and status in ('pending', 'submitted', 'late')
);

create policy "task_submissions_teacher_review_assigned"
on public.task_submissions for update
using (
  exists (
    select 1
    from public.learning_tasks lt
    where lt.id = task_submissions.task_id
      and lt.teacher_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.learning_tasks lt
    where lt.id = task_submissions.task_id
      and lt.teacher_id = auth.uid()
  )
);

create policy "task_submissions_admin_manage"
on public.task_submissions for all
using (public.is_admin() and public.can_access_student(student_id))
with check (public.is_admin() and public.can_access_student(student_id));

create policy "reward_transactions_select_role_scope"
on public.reward_transactions for select
using (public.can_access_student(student_id));

create policy "reward_transactions_teacher_insert_assigned"
on public.reward_transactions for insert
with check (
  public.is_teacher_for_student(student_id)
  or (public.is_admin() and public.can_access_student(student_id))
);

create policy "reward_transactions_admin_manage"
on public.reward_transactions for all
using (public.is_admin() and public.can_access_student(student_id))
with check (public.is_admin() and public.can_access_student(student_id));

create policy "pets_select_accessible_student"
on public.pets for select
using (public.can_access_student(student_id));

create policy "pets_teacher_update_assigned"
on public.pets for update
using (public.is_teacher_for_student(student_id))
with check (public.is_teacher_for_student(student_id));

create policy "pets_admin_manage"
on public.pets for all
using (public.is_admin() and public.can_access_student(student_id))
with check (public.is_admin() and public.can_access_student(student_id));

create policy "pet_cards_select_authenticated"
on public.pet_cards for select
to authenticated
using (true);

create policy "pet_cards_admin_manage"
on public.pet_cards for all
using (public.is_admin())
with check (public.is_admin());

create policy "student_card_inventory_select_accessible_student"
on public.student_card_inventory for select
using (public.can_access_student(student_id));

create policy "student_card_inventory_student_update_own"
on public.student_card_inventory for update
using (public.is_student_owner(student_id))
with check (public.is_student_owner(student_id));

create policy "student_card_inventory_teacher_insert_assigned"
on public.student_card_inventory for insert
with check (
  public.is_teacher_for_student(student_id)
  or public.is_student_owner(student_id)
  or (public.is_admin() and public.can_access_student(student_id))
);

create policy "student_card_inventory_admin_manage"
on public.student_card_inventory for all
using (public.is_admin() and public.can_access_student(student_id))
with check (public.is_admin() and public.can_access_student(student_id));

create policy "battles_select_participant_or_staff"
on public.battles for select
using (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = any(battles.participant_ids)
      and public.can_access_student(sp.id)
  )
);

create policy "battles_student_insert_own"
on public.battles for insert
with check (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = any(participant_ids)
      and (
        public.is_student_owner(sp.id)
        or public.is_teacher_for_student(sp.id)
        or (public.is_admin() and public.can_access_student(sp.id))
      )
  )
);

create policy "battles_admin_manage"
on public.battles for all
using (
  public.is_admin()
  and exists (
    select 1
    from public.student_profiles sp
    where sp.id = any(battles.participant_ids)
      and public.can_access_student(sp.id)
  )
)
with check (
  public.is_admin()
  and exists (
    select 1
    from public.student_profiles sp
    where sp.id = any(participant_ids)
      and public.can_access_student(sp.id)
  )
);

create policy "parent_reports_select_role_scope"
on public.parent_reports for select
using (public.can_access_student(student_id));

create policy "parent_reports_teacher_manage_assigned"
on public.parent_reports for all
using (
  public.is_teacher_for_student(student_id)
  or (public.is_admin() and public.can_access_student(student_id))
)
with check (
  public.is_teacher_for_student(student_id)
  or (public.is_admin() and public.can_access_student(student_id))
);
