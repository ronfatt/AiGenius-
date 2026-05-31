-- Five-letter access codes for students, teachers, and parents.

alter table public.profiles
  add column if not exists profile_code text unique;

update public.profiles
set profile_code = translate(substr(md5(id::text), 1, 5), '0123456789abcdef', 'ABCDEFGHIJKLMNOP')
where profile_code is null or profile_code !~ '^[A-Z]{5}$';

update public.student_profiles
set referral_code = translate(substr(md5(id::text), 1, 5), '0123456789abcdef', 'ABCDEFGHIJKLMNOP')
where referral_code is null or referral_code !~ '^[A-Z]{5}$';

alter table public.student_profiles
  drop constraint if exists student_profiles_referral_code_format;

alter table public.student_profiles
  add constraint student_profiles_referral_code_format
  check (referral_code is null or referral_code ~ '^[A-Z]{5}$');

alter table public.profiles
  drop constraint if exists profiles_profile_code_format;

alter table public.profiles
  add constraint profiles_profile_code_format
  check (profile_code is null or profile_code ~ '^[A-Z]{5}$');

create index if not exists profiles_profile_code_idx
on public.profiles(profile_code);
