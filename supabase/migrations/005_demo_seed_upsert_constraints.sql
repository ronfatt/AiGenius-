-- Idempotent demo seed helpers.

create unique index if not exists subject_skills_student_skill_unique
on public.subject_skills(student_id, skill_name);

create unique index if not exists parent_reports_student_month_unique
on public.parent_reports(student_id, month);
