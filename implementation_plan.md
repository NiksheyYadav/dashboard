# SOET Attendance, Mentorship & Detention Monitoring App — Implementation Plan

## Mobile App Phase 5: Detention, Warning & Reports

> [!NOTE]  
> This section covers the mobile app implementation of Phase 5, bridging the gap between the mobile frontend and the backend detention system.

### Goal Description
Implement the remaining Phase 5 features on the mobile application, specifically focusing on the Warning Letters workflow, Extra Classes scheduling, and Mobile Reports for Mentors and Deans.

### User Review Required
> [!IMPORTANT]
> **Priority of Features**: The dashboard currently shows 7 unreleased features. For Phase 5, I propose focusing on the most critical mobile workflows for teachers and mentors:
> 1. **Warning Letters**: Allowing mentors to view detention risk lists and initiate warnings.
> 2. **Extra Classes**: Allowing teachers to schedule make-up classes.
> 3. **Reports (Mobile)**: A simplified, read-only view of Parent Summaries and Detention Lists for Deans/HoDs on the go.
> 
> *Administrative features like Master Data, Staff Mgmt, and Policies are best suited for the Web Desktop App only and will remain as "Use Web Desktop" placeholders on mobile.* Do you agree with this prioritization?

### Proposed Changes

#### [NEW] `c:\eblock\mobile\app\(app)\warning-letters.tsx`
- **Purpose**: Mentor and HoD view for tracking students falling below attendance thresholds.
- **UI Components**:
  - Filterable list of students (Safe, Warning, Critical bands).
  - "Initiate Warning" action button for Mentors.
  - "Approve Warning" action for HoDs.

#### [NEW] `c:\eblock\mobile\app\(app)\extra-classes.tsx`
- **Purpose**: Teacher view for scheduling backlog compensation classes.
- **UI Components**:
  - Form to select Subject, Date, and Available Slot.
  - List of previously scheduled extra classes.

#### [NEW] `c:\eblock\mobile\app\(app)\reports.tsx`
- **Purpose**: Mobile-optimized analytics for HoD/Deans.
- **UI Components**:
  - Detention Risk Summary.
  - Mentor Compliance Score overview.
  - "Generate Parent Summary" action for Mentors.

### Verification Plan
- Verify routing from the new Dashboard grid.
- Ensure role-based access control restricts Warning Letters to Mentors/HoDs and Extra Classes to Teachers.
- Validate the mock data rendering for all three new screens.

---
## 1. Repo Audit Summary

### Current Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js + React + TypeScript | 16.1.6 / 19.2.3 |
| Styling | Tailwind CSS v4 + shadcn/ui (new-york) | v4 |
| State | Zustand + React Context | 5.0.11 |
| Charts | Recharts | 3.7.0 |
| Backend | FastAPI + SQLAlchemy + Alembic | Python |
| Database | PostgreSQL (Supabase) | — |
| Deployment | Vercel (hybrid Next.js + Python) | — |
| Auth | JWT (HS256) access + refresh tokens | — |

### What Already Works
- ✅ Auth (login/logout/refresh/password-reset)
- ✅ Dashboard shell (sidebar + topbar + layout)
- ✅ Student CRUD + detail views
- ✅ Attendance file upload (CSV-based bulk)
- ✅ Projects, Announcements, Events, Forms, Placement, Anonymous Messages
- ✅ Role-based navigation (5 roles)
- ✅ shadcn/ui component library (8 components)
- ✅ Dark mode support

### Critical Gaps (vs. SOET Spec)

| Gap | Severity | Notes |
|-----|----------|-------|
| **No academic master data** (programmes, sections, subjects, timetable) | 🔴 Critical | Everything is hardcoded in `constants.ts` |
| **No role column in DB** — role derived from email substring | 🔴 Critical | `roleFromEmail()` is fragile and wrong |
| **No mentor system** — no mentor mapping, no mentee monitor | 🔴 Critical | Core requirement |
| **No subject-teacher mapping** | 🔴 Critical | Teachers can't see "only assigned subjects" |
| **No attendance transaction model** — only CSV upload | 🔴 Critical | Need per-student per-slot attendance records |
| **No leave/arrangement workflow** | 🔴 Critical | Missing entirely |
| **No extra class module** | 🔴 Critical | Missing entirely |
| **No activity attendance** | 🔴 Critical | Missing entirely |
| **No detention/warning system** | 🔴 Critical | Missing entirely |
| **No regularization workflow** | 🔴 Critical | Missing entirely |
| **No audit log** | 🔴 Critical | Required by spec |
| **No notification system** | 🟡 Medium | No in-app alerts/badges |
| **No reporting/export (Excel/PDF)** | 🟡 Medium | Reports page is stub |
| **Sidebar is white, not navy** | 🟡 Medium | Mockups show navy sidebar |
| **No coordinator template import** | 🔴 Critical | Priority module per requirements |
| **No HoD/Dean monitoring dashboards** | 🔴 Critical | Missing entirely |

---

## User Review Required

> [!IMPORTANT]
> **Database Migration Strategy**: The existing database has 11 tables (users, students, projects, etc.) with 9 Alembic migrations. The new schema adds ~20 new tables. I will **extend** the existing schema with new migrations — no destructive changes to existing tables.

> [!IMPORTANT]
> **Role System Overhaul**: The current system derives roles from email substrings (`roleFromEmail()`). The spec requires a proper `role` column on the `users` table with support for multi-role users (e.g., a teacher who is also a mentor). I will add a `roles` JSON array column and a `primary_role` column, while keeping backward compatibility during transition.

> [!WARNING]
> **Sidebar Redesign**: The mockups show a navy-blue sidebar with SGT University logo, but the current sidebar is white with "EduPulse" branding. This is a visual breaking change. I'll implement the navy sidebar matching mockups.

> [!IMPORTANT]
> **Backend PDF Parsing**: The coordinator import system requires PDF parsing with `pdfplumber`/`tabula-py`. This adds Python dependencies. Since the backend already runs Python on Vercel, this is compatible but adds ~50MB to the deployment bundle.

---

## Open Questions

> [!IMPORTANT]
> 1. **Supabase vs. self-hosted PostgreSQL**: The current `.env` points to Supabase. Is this the production database? Should new tables go to the same Supabase instance?
> 2. **Existing data preservation**: Are there real students/users in the current DB that must be preserved, or is this a dev/demo environment?
> 3. **Authentication**: Should we keep the email-based demo accounts, or implement proper role assignment via Admin panel?
> 4. **Timetable PDF format**: Do you have a sample timetable PDF that shows the exact grid layout to parse? The spec references "SGT timetable PDFs" — I need the real format to build the parser.
> 5. **Deployment**: Should I keep deploying to Vercel, or is there a different target environment?

---

## Proposed Changes

### Phase 0: Foundation — Data Model & Auth Overhaul

This phase creates the database foundation that everything else depends on.

---

#### [MODIFY] [enums.py](file:///c:/eblock/backend/app/core/enums.py)
Add comprehensive enums for the SOET system:
- `UserRoleEnum`: ADMIN, DEAN, HOD, TEACHER, MENTOR, ACTIVITY_COORDINATOR, ARRANGEMENT_TEACHER
- `AttendanceStatusEnum`: PRESENT, ABSENT, NO_CLASS_CONDUCTED
- `ClassTypeEnum`: REGULAR, ARRANGEMENT, EXTRA, MAKEUP, ACTIVITY
- `LeaveStatusEnum`: DRAFT, SUBMITTED, ARRANGEMENT_PENDING, HOD_PENDING, APPROVED, REJECTED
- `ArrangementStatusEnum`: PENDING, ACCEPTED, REJECTED
- `RegularizationStatusEnum`: SUBMITTED, HOD_APPROVED, HOD_REJECTED
- `WarningStageEnum`: ADVISORY, PARENT_INTIMATION, FORMAL_WARNING, CRITICAL, DETENTION
- `RiskLevelEnum`: SAFE, WARNING, CRITICAL, DETENTION
- `ApprovalStatusEnum`: PENDING, APPROVED, REJECTED

---

#### [NEW] New Database Models (20 entities in `backend/app/models/`)

| Model File | Entity | Key Fields |
|-----------|--------|------------|
| `academic_year.py` | `AcademicYear` | id, name, start_date, end_date, is_current |
| `programme.py` | `Programme` | id, name, code, department, academic_year_id |
| `semester.py` | `Semester` | id, number, programme_id, academic_year_id |
| `section.py` | `Section` | id, name, semester_id, programme_id |
| `subject.py` | `Subject` | id, code, name, credits, programme_id, semester_id, section_id, planned_lectures, assigned_teacher_id |
| `timetable_slot.py` | `TimetableSlot` | id, day, slot_number, start_time, end_time, subject_id, section_id, teacher_id, room, lecture_type |
| `faculty_role.py` | `FacultyRole` | id, user_id, role_type, department, is_primary |
| `mentor_mapping.py` | `MentorMapping` | id, mentor_id, student_id, effective_from, effective_to, mapped_by, status |
| `attendance_transaction.py` | `AttendanceTransaction` | id, student_id, subject_id, date, slot_id, status, marked_by, class_type, source_id, approval_status, remarks, timestamp |
| `leave_request.py` | `LeaveRequest` | id, teacher_id, leave_type, from_date, to_date, reason, status, hod_approval, created_at |
| `arrangement_assignment.py` | `ArrangementAssignment` | id, leave_request_id, slot_id, original_teacher_id, arrangement_teacher_id, status, acceptance_date |
| `extra_class.py` | `ExtraClass` | id, teacher_id, subject_id, section_id, date, slot_time, class_type, reason, topic_covered, attendance_status, course_completion_mapped |
| `activity.py` | `Activity` | id, name, type, coordinator_id, date, slot_ids, proof_document, approval_status, approved_by |
| `activity_participant.py` | `ActivityParticipant` | id, activity_id, student_id, attendance_credited |
| `regularization_request.py` | `RegularizationRequest` | id, mentor_id, student_id, reason_category, date, slot_id, proof_document, remarks, status, hod_decision |
| `counselling_note.py` | `CounsellingNote` | id, mentor_id, student_id, note, corrective_action, student_response, next_review_date |
| `parent_communication.py` | `ParentCommunication` | id, mentor_id, student_id, communication_type, summary, follow_up_date |
| `warning_letter.py` | `WarningLetter` | id, student_id, mentor_id, stage, reason, attendance_data, prior_interventions, hod_approval, issue_date, parent_copy_status |
| `audit_log.py` | `AuditLog` | id, action, entity_type, entity_id, old_value, new_value, user_id, user_role, timestamp, ip_address |
| `notification.py` | `Notification` | id, user_id, type, title, message, is_read, entity_type, entity_id, created_at |
| `import_log.py` | `ImportLog` | id, file_name, file_type, uploaded_by, status, total_records, success_count, error_count, errors_json, created_at |

---

#### [MODIFY] [user.py](file:///c:/eblock/backend/app/models/user.py)
Add fields:
- `name` (String 200)
- `phone` (String 30, nullable)
- `primary_role` (String 30, default "TEACHER")
- `roles` (JSON array, default ["TEACHER"])
- `designation` (String 100, nullable)
- `teaching_competency_tags` (JSON array, nullable)
- `is_active` (Boolean, default True)

#### [MODIFY] [student.py](file:///c:/eblock/backend/app/models/student.py)
Add fields:
- `section_id` (FK to sections)
- `programme_id` (FK to programmes)
- `semester_id` (FK to semesters)
- `batch` (String 50)
- `parent_name` (String 200)
- `parent_phone` (String 30)
- `parent_email` (String 320)
- `mentor_id` (FK to users, nullable)

---

#### [MODIFY] [auth-context.tsx](file:///c:/eblock/src/lib/auth/auth-context.tsx)
- Replace `roleFromEmail()` with server-provided role from `/auth/me` response
- Add `UserRole` type: `"admin" | "dean" | "hod" | "teacher" | "mentor" | "activity_coordinator"`
- Support multi-role users (teacher + mentor combined)
- Backend `/auth/me` endpoint returns `roles[]` and `primary_role`

---

### Phase 1: Coordinator Template Import System (PRIORITY)

> [!IMPORTANT]
> This is the **foundation** — all other modules consume the imported academic data.

---

#### [NEW] `backend/app/modules/academic/` — Academic Data Management Module

| File | Purpose |
|------|---------|
| `router.py` | REST endpoints for CRUD + import/export |
| `service.py` | Business logic, validation, import parsing |
| `schemas.py` | Pydantic schemas for all academic entities |
| `parser.py` | PDF/Excel/CSV parser engine |
| `templates.py` | Template generation for download |
| `validators.py` | Clash detection, duplicate checks, import validation |

**API Endpoints:**
```
GET    /api/v1/academic/programmes
POST   /api/v1/academic/programmes
GET    /api/v1/academic/semesters
GET    /api/v1/academic/sections
GET    /api/v1/academic/subjects
GET    /api/v1/academic/timetable
GET    /api/v1/academic/mentor-mappings

POST   /api/v1/academic/import/timetable       ← Upload PDF/Excel
POST   /api/v1/academic/import/faculty-mapping
POST   /api/v1/academic/import/subject-allocation
POST   /api/v1/academic/import/mentor-mapping
POST   /api/v1/academic/import/student-master
POST   /api/v1/academic/import/preview          ← Parse & preview before commit
POST   /api/v1/academic/import/commit           ← Approve parsed import
GET    /api/v1/academic/import/history
POST   /api/v1/academic/import/rollback/{id}

GET    /api/v1/academic/templates/timetable     ← Download .xlsx template
GET    /api/v1/academic/templates/faculty
GET    /api/v1/academic/templates/subjects
GET    /api/v1/academic/templates/mentors
GET    /api/v1/academic/templates/students
```

**PDF Parsing Engine** (`parser.py`):
- Primary: `pdfplumber` for table extraction from structured timetable PDFs
- Fallback: `tabula-py` for alternative grid layouts
- Extracts: programme, semester, section, subject, faculty, slot, day, room/lab, group mapping
- Normalizes slot timings to standard format
- Resolves faculty names against existing user records
- Detects duplicate imports via content hashing

**Import Validation** (`validators.py`):
- No faculty double-booking per slot
- No section slot clashes
- No duplicate subjects per section/semester
- Slot format validation (time range, day-of-week)
- Semester-programme consistency
- Faculty availability cross-check

---

#### [NEW] `src/app/(dashboard)/academic-data/page.tsx` — Academic Data Management UI

Full coordinator panel with:
- **Template Downloads**: Cards for each template type with .xlsx download buttons
- **Upload Zone**: Drag-and-drop file upload with format detection (PDF/Excel/CSV)
- **Preview Table**: Parsed records displayed in editable table before commit
- **Validation Panel**: Errors (red), Warnings (amber), Suggestions (blue) with row-level detail
- **Conflict Resolution**: Side-by-side diff viewer for detected conflicts
- **Import History**: Table with date, file, status, records imported, rollback button
- **Failed Row Export**: Download failed rows as Excel for correction

---

### Phase 2: Subject Attendance Module

---

#### [NEW] `backend/app/modules/attendance/` — Attendance API Module

**Endpoints:**
```
GET    /api/v1/attendance/assigned-subjects          ← Teacher's assigned subjects only
GET    /api/v1/attendance/today-schedule              ← Today's timetable for teacher
POST   /api/v1/attendance/mark                        ← Bulk mark attendance for a class
POST   /api/v1/attendance/mark-no-class               ← Mark No Class Conducted
GET    /api/v1/attendance/history/{subject_id}         ← Attendance records with filters
GET    /api/v1/attendance/student/{student_id}/summary ← Per-student complete summary
PUT    /api/v1/attendance/reopen/{transaction_id}      ← HoD reopens locked attendance
```

**Business Rules enforced:**
- Teacher sees only assigned subjects (filtered by `subject.assigned_teacher_id = current_user.id`)
- `UNIQUE(student_id, subject_id, date, slot_id)` constraint prevents duplicates
- Auto-lock after 24 hours unless reopened by HoD
- No Class Conducted excluded from denominators
- Every mutation writes to `audit_log`

---

#### [NEW] `src/app/(dashboard)/subject-attendance/page.tsx`
- Subject cards showing only assigned subjects (auto-mapped programme/semester/section)
- Click subject → attendance grid with student list
- Bulk mark Present/Absent + individual overrides
- "No Class Conducted" toggle
- Save Draft / Submit buttons
- History tab with date-wise records

---

### Phase 3: Mentor Module

---

#### [NEW] `backend/app/modules/mentor/` — Mentorship API Module

**Endpoints:**
```
GET    /api/v1/mentor/mentees                     ← Assigned mentees with attendance summary
GET    /api/v1/mentor/mentees/{id}/detail          ← Full subject-wise breakdown
POST   /api/v1/mentor/counselling-note             ← Add counselling note
POST   /api/v1/mentor/parent-communication         ← Log parent contact
POST   /api/v1/mentor/regularization-request       ← Submit regularization
GET    /api/v1/mentor/regularization-requests       ← List requests with status
POST   /api/v1/mentor/warning-letter/initiate      ← Start warning letter
GET    /api/v1/mentor/parent-summary/{student_id}   ← Generate parent PDF
GET    /api/v1/mentor/compliance-score              ← Mentor's own compliance
```

---

#### [NEW] `src/app/(dashboard)/mentee-monitor/page.tsx`
Matching the mockup exactly:
- **Summary Cards**: Total Mentees, Safe (≥75%), Warning (50-74%), Critical (<50%)
- **Search + Filter Bar**: Search by name/roll, filter by Safe/Warning/Critical
- **Mentee Table**: Student Name, Roll No., Batch, Subject-wise attendance %, Overall %, Risk Status, Action (⋯)
- **Color Coding**: Green (≥75%), Amber (50-74%), Red (<50%), Grey (pending)
- **Right Panel** (click student): Profile card, Overall Attendance donut, Attendance Trend chart, Pending Approvals
- **Mentorship Actions Bar**: View Details, Add Counselling Note, Request Regularization, Parent Contact Log

---

### Phase 4: Leave & Arrangement + Extra Classes

---

#### [NEW] `backend/app/modules/leave/` — Leave & Arrangement API

**Endpoints:**
```
POST   /api/v1/leave/apply                    ← Submit leave with affected lectures
GET    /api/v1/leave/affected-lectures         ← Auto-list lectures in date range
GET    /api/v1/leave/available-teachers/{slot}  ← Free teachers for arrangement
POST   /api/v1/leave/select-arrangement        ← Assign arrangement teacher
POST   /api/v1/leave/arrangement/respond       ← Accept/reject (arrangement teacher)
POST   /api/v1/leave/hod-approve/{id}          ← HoD approval
GET    /api/v1/leave/my-requests               ← Teacher's own leave requests
GET    /api/v1/leave/pending-arrangements       ← Arrangement requests awaiting response
GET    /api/v1/leave/hod-queue                  ← HoD approval queue
```

#### [NEW] `backend/app/modules/extra_class/` — Extra Class API

**Endpoints:**
```
POST   /api/v1/extra-class/schedule            ← Schedule extra/make-up class
GET    /api/v1/extra-class/available-slots      ← Free batch slots
GET    /api/v1/extra-class/my-classes           ← Teacher's scheduled extras
POST   /api/v1/extra-class/{id}/mark-attendance ← Mark attendance for extra class
GET    /api/v1/extra-class/course-completion    ← Course completion overview
```

---

#### [NEW] `src/app/(dashboard)/leave-arrangement/page.tsx`
Matching the mockup:
- **Stats Cards**: Total Lectures Affected, Arrangements Accepted, Pending Approval
- **Leave Application Form**: Leave Type, From/To Date, Reason
- **Workflow Progress**: Stepper (Teacher Submission → Arrangement Acceptance → HoD Approval)
- **Affected Lectures Table**: Date, Slot, Subject, Section, Original Teacher, Available Teachers (multi-select chips), Selected Teacher, Status (badges)
- **Action Buttons**: Save Draft, Submit Leave Request

#### [NEW] `src/app/(dashboard)/extra-classes/page.tsx`
Matching the mockup:
- **Schedule Form**: Subject dropdown (assigned only), Programme/Semester/Section (auto), Date picker, Available Slot dropdown, Class Type (Extra/Make-Up radio), Reason, Topic Covered
- **Stats Cards**: Pending Backlog, Extra Classes Scheduled, Course Completion %
- **Course Completion Overview**: Progress bars (Regular, No Class Conducted, Extra Classes Added)
- **Scheduled Extra Classes Table**: Date, Slot, Subject, Section, Reason, Topic, Attendance Status, Lecture Count Status

---

### Phase 5: HoD & Dean Monitoring Dashboards

---

#### [NEW] `backend/app/modules/monitoring/` — Monitoring & Reporting API

**Endpoints:**
```
GET    /api/v1/monitoring/department-summary     ← Programme-wise attendance stats
GET    /api/v1/monitoring/detention-risk-list     ← Students below threshold
GET    /api/v1/monitoring/faculty-compliance      ← Teacher attendance marking status
GET    /api/v1/monitoring/mentor-compliance       ← Mentor intervention tracking
GET    /api/v1/monitoring/pending-approvals       ← All pending approvals for HoD
GET    /api/v1/monitoring/dean/school-summary     ← Cross-department overview
GET    /api/v1/monitoring/dean/defaulting-mentors ← Mentors not acting on at-risk students
GET    /api/v1/monitoring/trend/{period}          ← Monthly/weekly attendance trends
```

---

#### [MODIFY] `src/app/(dashboard)/dashboard/page.tsx`
Replace single `TeacherDashboard` with role-based dashboard routing:
- `role === "teacher"` → `<TeacherDashboard />`
- `role === "hod"` → `<HoDDashboard />`
- `role === "dean"` → `<DeanDashboard />`

#### [NEW] `src/components/dashboard/HoDDashboard.tsx`
#### [NEW] `src/components/dashboard/DeanDashboard.tsx`

Matching the **Monitoring Dashboard** mockup:
- **Summary Cards**: Overall Attendance, Students Below 75%, Pending Approvals, Faculty Compliance, Arrangement Classes, Extra Classes
- **Department/Programme Summary**: Table with Dept, Students, Avg Attendance, Below 75%, Pending Cases
- **Pending Approvals**: Table with Type, Details, Requested By, Date, Status, Action
- **Department-wise Comparison**: Horizontal bar chart
- **Detention Risk List**: Student Name, Programme, Overall %, Major Shortage Subjects, Mentor, Status (High/Medium/Low)
- **Faculty Compliance**: Teacher Name, Attendance Completion %, Leave Requests, No. of Classes Not Conducted, Extra Classes Taken

---

### Phase 6: Reporting & Exports

---

#### [NEW] `backend/app/modules/reports/` — Report Generation API

**Endpoints:**
```
GET    /api/v1/reports/daily-attendance          ← Excel/PDF
GET    /api/v1/reports/subject-attendance         ← By subject with teacher
GET    /api/v1/reports/student-attendance/{id}    ← Full student breakup
GET    /api/v1/reports/mentee-summary             ← Mentor's mentee list
GET    /api/v1/reports/parent-summary/{student_id} ← Parent-facing PDF
GET    /api/v1/reports/warning-register           ← All warning letters
GET    /api/v1/reports/detention-list             ← Final detention list
GET    /api/v1/reports/mentor-default              ← Defaulting mentors
GET    /api/v1/reports/teacher-compliance          ← Teacher marking status
GET    /api/v1/reports/activity-attendance          ← Activity-wise
GET    /api/v1/reports/course-completion            ← Per teacher/subject
```

All endpoints accept `?format=excel` or `?format=pdf` query parameter.

Uses: `openpyxl` for Excel, `reportlab` or `weasyprint` for PDF generation.

---

#### [MODIFY] `src/app/(dashboard)/reports/page.tsx`
Full reports page with:
- Report type selector cards
- Filter panel (date range, department, programme, semester, subject, mentor, risk status)
- Preview table
- Download buttons (Excel + PDF)

---

### Phase 7: Activity Attendance & Notifications

---

#### [NEW] `backend/app/modules/activities/` — Activity Attendance API
#### [NEW] `src/app/(dashboard)/activity-attendance/page.tsx`

---

#### [NEW] `backend/app/modules/notifications/` — Notification Engine
#### [NEW] `src/components/layout/NotificationBell.tsx`

Badge with count in topbar, dropdown with recent notifications, mark-as-read.

---

### UI Overhaul — Navy Sidebar + SGT Branding

---

#### [MODIFY] [Sidebar.tsx](file:///c:/eblock/src/components/layout/Sidebar.tsx)
- Background: `bg-[#0a1628]` (navy) instead of `bg-white`
- Text: white/light gray instead of dark
- Active state: `bg-[#1a56db]` rounded pill
- Logo: SGT University crest with "SOET" subtitle
- Footer: "SOET | School of Engineering & Technology"
- Navigation items match mockup: Dashboard, Subject Attendance, Mentee Monitor, Leave & Arrangement, Extra Classes, Activity Attendance, Reports, Settings

#### [MODIFY] [Topbar.tsx](file:///c:/eblock/src/components/layout/Topbar.tsx)
- Add notification bell with badge count
- Show page title + subtitle
- User profile dropdown with role badge

#### [MODIFY] [globals.css](file:///c:/eblock/src/app/globals.css)
- Add SOET design tokens (navy palette, gold accents)
- Card styles: white background, rounded-xl, subtle shadow
- Badge styles matching mockup (green/amber/red/grey)

---

### Attendance Calculation Engine

---

#### [NEW] `backend/app/modules/attendance/engine.py`

Single shared calculation model:

```python
def calculate_student_attendance(student_id, subject_id=None):
    """
    Valid Classes Held = Regular + Arrangement + Extra + Approved Activity - No Class Conducted
    Student Attended = Present(Regular) + Present(Arrangement) + Present(Extra) 
                     + Approved Activity + Approved Regularization
    Attendance % = Attended / Valid Classes Held × 100
    Shortage = ceil(threshold% × Valid Classes Held / 100) - Attended
    """

def calculate_teacher_course_completion(teacher_id, subject_id):
    """
    Completed = Regular classes by teacher + Extra/Make-up by teacher
    Exclude: No Class Conducted, Arrangement classes
    Completion % = Completed / Planned Lectures × 100
    """

## Open Questions
- Do you have a preferred library for Excel generation in Python (e.g., `openpyxl`, `pandas`), or should I use `pandas` since it handles data frames natively?
- Should PDF reports be generated using `WeasyPrint` (HTML to PDF) or `ReportLab`? `ReportLab` is lighter but requires manual layout coding.

## Proposed Changes

---

### Reports API Backend
Develop the backend logic to generate required CSV/Excel exports for attendance and leave data.

#### [NEW] [schemas.py](file:///c:/eblock/backend/app/modules/reports/schemas.py)
- Input schemas for filtering reports (e.g., date ranges, section ID, programme ID).

#### [NEW] [service.py](file:///c:/eblock/backend/app/modules/reports/service.py)
- Service logic to query `Student`, `AttendanceTransaction`, and `LeaveRequest` data and construct the report data.
- Logic to export data using `pandas` (Excel/CSV).

#### [NEW] [router.py](file:///c:/eblock/backend/app/modules/reports/router.py)
- Endpoint `GET /api/v1/reports/attendance/export` returning a downloadable file.
- Endpoint `GET /api/v1/reports/leaves/export`.

---

### Reports UI Integration
Connect the existing Reports page to the new backend API.

#### [MODIFY] [page.tsx](file:///c:/eblock/src/app/(dashboard)/reports/page.tsx)
- Wire the "Export to Excel" buttons to trigger the backend API and handle file blob downloads.

---

### Activity Attendance API Backend (Phase 7)
Develop the backend logic to manage non-academic activity attendance (like sports, cultural events) and systemic notifications.

#### [NEW] [schemas.py](file:///c:/eblock/backend/app/modules/activity/schemas.py)
- Schemas for `ActivityCreate`, `ParticipantList`, and `AttendanceCreditUpdate`.

#### [NEW] [service.py](file:///c:/eblock/backend/app/modules/activity/service.py)
- Service logic to create activities, register participants, and credit attendance.

#### [NEW] [router.py](file:///c:/eblock/backend/app/modules/activity/router.py)
- Endpoints for `POST /api/v1/activities`, `POST /api/v1/activities/{id}/participants`, and `PUT /api/v1/activities/{id}/credit`.

---

### Activity Attendance UI Integration (Phase 7)
Connect the existing Activity Attendance page to the new backend API.

#### [MODIFY] [page.tsx](file:///c:/eblock/src/app/(dashboard)/activity-attendance/page.tsx)
- Wire the "Create Activity" and "Mark Participants" buttons to trigger the backend API.

def calculate_mentor_compliance(mentor_id):
    """
    Weighted score: counselling timeliness, parent contact, 
    regularization closure, warning actions, follow-up closure
    """
```

---

## Verification Plan

### Automated Tests

1. **Database migrations**: Run `alembic upgrade head` — verify all 20+ new tables created
2. **API smoke tests**: `pytest` against all new endpoints with role-based auth
3. **Attendance engine**: Unit tests for calculation logic covering all attendance types
4. **Import validation**: Test with sample timetable data — verify clash detection, duplicate prevention
5. **Build check**: `npm run build` — verify no TypeScript errors
6. **Frontend check**: Navigate all new pages in browser, verify role-based routing

### Manual Verification

1. **Login as Teacher** → verify only assigned subjects visible → mark attendance → verify lock after 24h
2. **Login as Mentor** → verify only assigned mentees → check color coding → add counselling note
3. **Leave flow** → apply leave → arrangement teacher accepts → HoD approves → verify attendance counting
4. **Extra class** → schedule → mark attendance → verify course completion update
5. **HoD dashboard** → verify all monitoring panels populated
6. **Dean dashboard** → verify cross-department overview
7. **Import flow** → download template → fill data → upload → preview → approve → verify DB populated
8. **Reports** → generate each report type → verify Excel/PDF download

### Key Invariants to Test

- `UNIQUE(student_id, subject_id, date, slot_id)` prevents duplicate attendance ✓
- Arrangement attendance ≠ original teacher's course completion ✓
- No Class Conducted excluded from denominators ✓
- Extra class counted for both student attendance AND teacher course completion ✓
- All mutations create audit log entries ✓
