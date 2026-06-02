-- English curriculum fields for published learning tasks.
-- Keeps the original schema working while allowing full task rendering.

alter table public.learning_tasks
  add column if not exists school_grade text,
  add column if not exists cefr_level text,
  add column if not exists skill_domain text,
  add column if not exists task_band text,
  add column if not exists questions jsonb not null default '[]'::jsonb,
  add column if not exists content jsonb not null default '{}'::jsonb;

create index if not exists learning_tasks_school_grade_idx
on public.learning_tasks(school_grade);

create index if not exists learning_tasks_cefr_level_idx
on public.learning_tasks(cefr_level);

create index if not exists learning_tasks_skill_domain_idx
on public.learning_tasks(skill_domain);

create index if not exists learning_tasks_questions_gin_idx
on public.learning_tasks using gin(questions);
