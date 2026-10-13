create table if not exists public.cbse_pyqs (
  id uuid default gen_random_uuid() primary key,
  standard text not null check (standard in ('10', '12')),
  subject text not null,
  year text not null,
  paper_type text not null default 'Board Paper',
  set_number text,
  paper_url text not null unique,
  solution_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
grant select on public.cbse_pyqs to anon, authenticated;
grant all on public.cbse_pyqs to service_role;
alter table public.cbse_pyqs enable row level security;
create policy "Allow public read access" on public.cbse_pyqs for select to anon, authenticated using (true);
insert into public.cbse_pyqs (standard, subject, year, paper_type, set_number, paper_url, solution_url) values
('10','Science','2024','Board Paper','Set 1','https://www.cbse.gov.in/cbsenew/question-paper/2024/10/science_set1.pdf','https://www.cbse.gov.in/cbsenew/question-paper/2024/10/science_ms_set1.pdf'),
('10','Mathematics (Standard)','2024','Board Paper','Set 1','https://www.cbse.gov.in/cbsenew/question-paper/2024/10/math_standard_set1.pdf',null),
('12','Physics','2024','Board Paper','Set 1','https://www.cbse.gov.in/cbsenew/question-paper/2024/12/physics_set1.pdf','https://www.cbse.gov.in/cbsenew/question-paper/2024/12/physics_ms_set1.pdf'),
('12','Chemistry','2024','Board Paper','Set 1','https://www.cbse.gov.in/cbsenew/question-paper/2024/12/chemistry_set1.pdf',null)
on conflict (paper_url) do nothing;