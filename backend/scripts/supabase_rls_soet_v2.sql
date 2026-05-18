alter table if exists attendance_transactions enable row level security;
alter table if exists mentor_mappings enable row level security;
alter table if exists leave_requests enable row level security;

drop policy if exists "teacher_attendance_own_rows" on attendance_transactions;
create policy "teacher_attendance_own_rows"
on attendance_transactions
for all
using (
  exists (
    select 1 from users u
    where u.id = auth.uid()
      and ('ADMIN' = any(u.roles) or 'DEAN' = any(u.roles) or 'HOD' = any(u.roles) or attendance_transactions.marked_by = auth.uid())
  )
);

drop policy if exists "mentor_own_mappings" on mentor_mappings;
create policy "mentor_own_mappings"
on mentor_mappings
for all
using (
  exists (
    select 1 from users u
    where u.id = auth.uid()
      and ('ADMIN' = any(u.roles) or 'DEAN' = any(u.roles) or 'HOD' = any(u.roles) or mentor_mappings.mentor_id = auth.uid())
  )
);

drop policy if exists "leave_teacher_or_hod" on leave_requests;
create policy "leave_teacher_or_hod"
on leave_requests
for all
using (
  exists (
    select 1 from users u
    where u.id = auth.uid()
      and (
        'ADMIN' = any(u.roles) or 'DEAN' = any(u.roles) or 'HOD' = any(u.roles) or leave_requests.teacher_id = auth.uid()
      )
  )
);
