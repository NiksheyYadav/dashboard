--- PAGE 1 ---
SOET, SGT University | Attendance, Mentorship & Detention Monitoring App
SGT UNIVERSITY
School of Engineering & Technology (SOET)
Developer Specification Document
Attendance, Mentorship, Leave Arrangement, Extra
Class & Detention Monitoring App
Prepared for: Dr. Vivek Srivastava, SOET, SGT University
Purpose: App design, coding, database planning, workflow implementation and dashboard/report
development
Core Design Principle
The mentor is the key protagonist of the system. The app must not merely collect attendance; it must enable mentors to identify risk early,
counsel students, regularize approved cases, communicate with parents, issue warning letters through proper approval, and be monitored
by HoD/Dean for accountability.
Developer Instruction File | Version 1.0 Prepared By Dr. Vivek Srivastava, Dean SOET SGT University

--- PAGE 2 ---
SOET, SGT University | Attendance, Mentorship & Detention Monitoring App
1. Project Objective
Develop a role-based, web/mobile-friendly app for SOET, SGT University to manage classroom attendance, activity
attendance, mentor-led attendance regularization, faculty leave/class arrangement, extra/make-up classes, detention list
generation, parent communication, warning letters, and Dean/HoD-level monitoring.
2. Guiding Business Requirements
The system must ensure that teachers only see their assigned subjects, mentors only see their assigned mentees, and
HoDs/Dean can monitor attendance, compliance, mentor performance, pending approvals, detention risk, and defaulting
mentors. All attendance changes must maintain audit trails and approval logs.
3. Recommended Technology Approach
The system may be developed as a responsive web app with optional mobile PWA support. Suggested stack:
React/Next.js or Angular for frontend, Node.js/NestJS or Django/FastAPI for backend, PostgreSQL/MySQL for database,
role-based authentication, REST/GraphQL APIs, and PDF/Excel generation for reports and warning letters.
4. User Roles and Access Control
Role Access / Responsibility
Configure academic year, programmes, semesters, sections, subjects, timetable, faculty, students, mentor
Admin
mapping, HoD/Dean mapping, attendance rules, detention threshold, templates and approval workflows.
View only assigned subjects/classes; mark regular attendance; mark no class conducted; schedule extra/make-
Teacher
up classes for assigned batches; apply leave and arrange replacement teachers.
View only assigned mentees; see subject-wise attendance; initiate approved regularization; add counselling
Mentor
notes; generate parent summaries; initiate warning letters; maintain mentor intervention history.
Create approved activity attendance for seminars, workshops, industrial visits, placement events, expert
Activity Coordinator
lectures, university duties etc.; submit participation for HoD approval.
Arrangement Teacher Accept/reject arrangement class requests; mark attendance for accepted arrangement classes.
Approve leave/arrangements, mentor regularization, activity attendance, extra-class policies where enabled;
HoD
monitor department attendance, mentor performance, detained lists and warning actions.
School-level monitoring of all departments; view attendance trends, detention risk, pending approvals,
Dean
defaulting mentors, HoD compliance, reports and escalation dashboards.
5. Core App Modules
Module Purpose
Dashboard Role-specific overview with KPIs, alerts, pending actions and quick links.
Subject Attendance Teacher marks attendance only for assigned subject/section/slot.
Mentor sees assigned mentees only, with subject-wise color-coded attendance and intervention
Mentee Monitor
actions.
Teacher applies leave and selects available teachers for affected lectures; arrangement teacher
Leave & Arrangement
accepts; HoD approves.
Teacher schedules extra class from available batch slots; attendance counts for student detention
Extra / Make-Up Classes
and teacher course completion.
Activity Attendance Coordinator marks attendance for approved academic activities; HoD approves.
Mentor submits sick leave, internship, project, university duty or approved academic duty
Regularization
regularization for mentees.
Generate detention risk list, defaulter list, warning letters, parent summaries, and escalation
Detention & Warning
records.
Reports Excel/PDF reports for teacher, mentor, HoD, Dean and parent-facing summaries.
Settings / Admin Master data, timetable, thresholds, templates, permissions, academic calendar and audit rules.
Developer Instruction File | Version 1.0 Prepared By Dr. Vivek Srivastava, Dean SOET SGT University

--- PAGE 3 ---
SOET, SGT University | Attendance, Mentorship & Detention Monitoring App
6. Master Data and Database Entities
Entity Important Fields
Student ID, roll no., name, programme, semester, section, batch, email, mobile, parent/guardian contact,
Student Master
mentor ID, active status.
Faculty ID, name, department, designation, email, mobile, role flags, teaching competency tags, active
Faculty Master
status.
Subject code, name, credits, programme, semester, section, planned lecture count, course plan topics,
Subject Master
assigned teacher.
Date/weekday, slot ID, start/end time, programme, semester, section, subject, teacher, room/lab, lecture
Timetable
type.
Mentor Mapping Mentor ID, student IDs, effective dates, mapped by Admin/HoD, status.
Attendance Transaction Student ID, subject, date, slot, status, marked by, class type, source, approval status, remarks, timestamp.
Leave & Arrangement Leave request, affected slots, selected arrangement teachers, acceptance status, HoD approval.
Subject, batch/section, date, free slot, reason, topic covered, attendance status, course completion
Extra Class
mapping.
Activity Attendance Activity type, coordinator, date/slot, participants, proof/document, approval status.
Mentorship Record Counselling notes, parent calls, warning issued, student response, improvement plan, next review date.
Warning Letter Student, mentor, reason, attendance data, letter stage, approval, issue date, parent copy status.
Audit Log Action, old value, new value, user, role, timestamp, IP/device, approval trail.
7. Attendance Business Rules
Rule Requirement
Teacher shall see and select only subjects officially assigned to him/her. No global subject list should
Assigned subject visibility
be visible to teachers.
Assigned mentee visibility Mentor shall see only assigned mentees, even if mentees belong to different batches/programmes.
Marked by subject teacher for regular class only. Counts for student attendance and teacher course
Regular attendance
completion.
Marked by teacher when regular class is not conducted. Does not count for student attendance,
No Class Conducted
detention calculation, or teacher course completion.
Taken by arrangement teacher during original teacher leave/unavailability. Counts for student
Arrangement class
attendance and detention calculation; does not count for original teacher course completion.
Taken by original subject teacher in available batch slot. Counts for student attendance, detention
Extra / make-up class
calculation and teacher course completion.
Marked by activity coordinator for approved academic activity; counts only after HoD approval and
Activity attendance
must be mapped to date/slot.
Mentor may initiate for sick leave, internship, project, university duty, approved academic duty etc.;
Mentor regularization
counts only after HoD approval and as per university rule.
A student cannot get two attendance credits for the same date/slot/subject. System must prevent
No duplicate attendance
duplicate records.
Audit trail Every submit, edit, approval, rejection, reopening and correction must be logged.
8. Teacher Login Functional Requirements
Teacher login should be fast, simple and limited to assigned responsibilities. The teacher should not have to search
through all subjects or all students.
Feature Developer Instruction
Display subject cards/dropdown containing only assigned subject-section combinations. Auto-fill
Assigned Subject Selection
programme, semester and section.
Allow Present, Absent, Remarks, Save Draft, Submit Attendance, Mark No Class Conducted. Lock
Attendance Marking
after defined time unless reopened by HoD/Admin.
If a teacher accepted an arrangement class, show it in his/her dashboard as Arrangement Class
Arrangement Class Visibility
and allow attendance marking.
Show leave form; auto-list affected lectures; system should show available replacement teachers
Leave Application
for each affected slot based on free timetable.
Allow teacher to select assigned subject, available batch free slot, reason, topic covered and class
Extra Class Scheduling
type. Extra class attendance counts for students and course completion.
Course Completion Show regular classes conducted, no class conducted, arrangement classes, extra classes, planned
Developer Instruction File | Version 1.0 Prepared By Dr. Vivek Srivastava, Dean SOET SGT University

--- PAGE 4 ---
SOET, SGT University | Attendance, Mentorship & Detention Monitoring App
lectures and percentage completion.
9. Mentor-Centric Requirements
Mentor as Key Protagonist
The mentor dashboard is the central intervention layer. Detention prevention, parent communication, warning letters and student
counselling should begin from the mentor dashboard. HoD and Dean dashboards must measure mentor responsiveness and default.
Mentor Feature Requirement
Assigned Mentee Table Show only assigned mentees with subject headers and corresponding attendance percentages.
Green: safe; Amber: warning; Red: critical; Grey: pending approval/no data. Thresholds configurable
Color Coding
by Admin.
Click any subject attendance to view total classes held, attended, absent, arrangement attendance,
Subject Drill-down
activity attendance, approved regularization and pending cases.
Mentor can record counselling note, student reason, corrective action, next review date, and student
Mentorship Notes
response.
Mentor can record phone/email/meeting communication with parent/guardian, attach summary,
Parent Communication
and schedule follow-up.
Mentor can submit approved category attendance regularization with proof/remarks for HoD
Regularization Request
approval.
Generate parent-friendly attendance summary for each mentee with subject-wise status, shortage,
Parent Summary Report
action taken and improvement advice.
Mentor can initiate warning letter for students below threshold after defined number of
Warning Letter Initiation
interventions.
System must track if mentor has not acted on low-attendance mentees within the defined timeline.
Mentor Default Tracking
This must be visible to HoD and Dean.
10. Leave and Class Arrangement Workflow
Step System Behaviour
1. Teacher applies leave Teacher selects leave type, date range and reason. System identifies affected lectures.
2. Available teachers For each affected lecture, system lists only teachers free in that slot and preferably from matching
shown department/competency.
3. Arrangement teacher
Selected teacher receives request and accepts or rejects. If rejected, original teacher selects another teacher.
accepts/rejects
4. HoD approval HoD sees leave application with class arrangement status. HoD approves/rejects leave.
Accepted arrangement teacher marks attendance. Attendance counts for student attendance/detention but not
5. Attendance marking
original teacher course completion.
6. Reporting Arrangement classes appear in separate reports for workload support and monitoring.
11. Extra / Make-Up Class Workflow
Step System Behaviour
1. Teacher identifies
Dashboard shows no class conducted, holiday/event loss and syllabus/course completion gap.
backlog
Teacher selects from pre-fed available slots for the specific batch/section. Prevent clashes with other classes,
2. Slot selection
exams or approved activities.
3. Topic mapping Teacher enters topic covered and reason such as syllabus backlog, no class compensation or slow progress.
4. Attendance marking Teacher marks attendance after class.
Attendance counts for student attendance/detention and teacher course completion. No Class Conducted is
5. Count logic
excluded until compensated.
Developer Instruction File | Version 1.0 Prepared By Dr. Vivek Srivastava, Dean SOET SGT University

--- PAGE 5 ---
SOET, SGT University | Attendance, Mentorship & Detention Monitoring App
12. Activity Attendance Workflow
Activity Type Handling
Seminar / Workshop / Expert Coordinator creates event, selects participants, maps slots, uploads proof and submits for HoD
Lecture approval.
Coordinator marks students participating; teacher marks No Class Conducted due to approved activity
Industrial Visit
where relevant.
Placement / Training / Hackathon Attendance credited only to participants and only after approval.
Project / Internship Mentor initiates or validates student-specific status; HoD approves.
University Duty Mentor/coordinator submits proof; HoD approves.
13. Detention List Generation
Detention Calculation Principle
The detention list must be generated using valid attendance after accounting for regular classes, arrangement classes, extra classes,
approved activity attendance, and approved mentor regularization. No Class Conducted must be excluded from the denominator and from
course completion unless compensated by extra class.
Counted for Student Attendance /
Attendance Source Counted for Teacher Course Completion?
Detention?
Regular class marked by assigned
Yes Yes
teacher
Arrangement class marked by accepted No for original teacher; visible as arrangement
Yes
arrangement teacher duty for substitute teacher
Extra / make-up class by original
Yes Yes
subject teacher
No, unless mapped by policy as academic contact
Approved activity attendance Yes
hour
Approved internship/project/university
Yes, as per policy No
duty
Configurable as per university rule; must be
Sick leave No
separately tagged
No Class Conducted No; exclude from denominator No
14. Detention List Views for Teacher, HoD and Dean
User Detention View / Report
Subject-wise shortage list for subjects taught by the teacher; students below threshold; attended vs held classes;
Teacher
impact of extra classes; no class conducted count; export option.
Mentee-wise detention risk list across all subjects; warning level; parent communication status; counselling status;
Mentor
pending regularization; next intervention due.
Department/programme/semester/section-wise detained and at-risk list; subject-wise shortage; teacher
HoD
compliance; mentor action status; pending approvals; warning letters issued.
School-wide detention dashboard with department comparison, programme trend, mentor default list, HoD pending
Dean
approvals, warning letters, parent report status and critical students.
Detention Report Columns Details
Student Details Name, roll no., programme, semester, section, mentor name, parent contact.
Attendance Details Subject-wise attended, valid classes held, attendance %, shortage classes required to reach threshold.
Regular, arrangement, extra class, approved activity, approved regularization, absent, pending
Attendance Breakup
approval.
Risk Level Safe / Watch / Warning / Critical / Detention Recommended. Thresholds configurable.
Mentor Action Counselling done, parent informed, warning letter issued, regularization pending, next follow-up date.
Approvals Pending HoD approvals, rejected cases, document status.
Export Excel and PDF, with filters by department, programme, semester, subject, mentor, risk status.
Developer Instruction File | Version 1.0 Prepared By Dr. Vivek Srivastava, Dean SOET SGT University

--- PAGE 6 ---
SOET, SGT University | Attendance, Mentorship & Detention Monitoring App
15. Parent Attendance Summary Report Through Mentors
The system shall generate parent-facing attendance summary reports routed through mentors. The report must be
simple, non-technical and suitable for email/WhatsApp/PDF sharing as per university policy.
Report Section Fields
Student Profile Name, roll no., programme, semester, section, mentor name and contact.
Overall Attendance Overall percentage, status, minimum required percentage, shortage classes.
Subject-wise Attendance Subject, classes held, attended, approved credits, absences, percentage, risk color.
Mentor Intervention Counselling dates, advice given, student response, improvement plan.
Suggested actions: ensure regular attendance, meet mentor/HoD, submit valid documents if
Parent Action Required
applicable.
Next Review Date Date for follow-up by mentor.
Disclaimer Attendance is subject to final verification and university rules.
16. Warning Letters and Escalation Workflow
Warning Stage Trigger and Workflow
Student falls below configurable threshold, e.g., 75% or risk band. System alerts mentor. Mentor
Stage 1: Advisory Alert
counsels student and records note.
Student remains below threshold after defined days/classes. Mentor generates parent summary and
Stage 2: Parent Intimation
records parent communication.
Mentor initiates warning letter. HoD reviews and approves. Letter issued to student and
Stage 3: Formal Warning Letter
parent/guardian.
Stage 4: Critical Detention Risk Student remains critical despite warning. HoD/Dean dashboard flags case for review.
Final list generated after approval workflow and pending regularizations are resolved or marked
Stage 5: Detention Recommendation
rejected.
Warning Letter Template Fields Description
Letter No. / Date Auto-generated.
Student Information Name, roll no., programme, semester, section.
Attendance Summary Overall and subject-wise percentage with shortage.
Prior Interventions Counselling dates, parent contact, previous warning if any.
Required Compliance Minimum attendance required and corrective action.
Signatory Mentor prepared by, HoD approved by, Dean visibility where required.
Delivery Tracking Email/SMS/printed copy, parent copy status, acknowledgement.
17. Mentor Accountability and Defaulting Mentor Dashboard
Dean-Level Requirement
Dean must be able to see which mentor is defaulting. A defaulting mentor is one who has assigned mentees in risk/critical attendance bands
but has not completed required interventions within the defined time window.
Default Metric Definition
Unreviewed At-Risk Mentees Number of mentees below threshold for whom mentor has not opened/reviewed case.
Counselling Pending Number of at-risk mentees without counselling note within X days of alert.
Parent Contact Pending Number of warning/critical mentees where parent communication is not recorded within X days.
Regularization Pending at Mentor Level Cases not submitted/updated by mentor despite student proof or pending category.
Warning Letter Pending Eligible students where mentor has not initiated warning letter.
Follow-up Overdue Cases where next review date has passed and no update is recorded.
Composite score based on timely review, counselling, parent contact, regularization closure and
Mentor Compliance Score
warning actions.
Dean / HoD Mentor Dashboard
Details
Columns
Developer Instruction File | Version 1.0 Prepared By Dr. Vivek Srivastava, Dean SOET SGT University

--- PAGE 7 ---
SOET, SGT University | Attendance, Mentorship & Detention Monitoring App
Mentor Name Faculty mentor name and department.
Assigned Mentees Total assigned mentees.
At-Risk Mentees Number below threshold / warning / critical.
Action Taken Counselling done, parent contact done, warning letters initiated.
Pending Actions Counselling pending, parent contact pending, warning pending, follow-up overdue.
Default Status On Track / Watch / Defaulting / Critical Default.
Compliance Score Percentage or points-based score.
Action View details, send reminder, escalate to HoD, download report.
18. Role-Based Dashboard Requirements
Dashboard Must Show
Today classes, pending attendance, assigned subjects, assigned mentees, quick actions, course completion,
Teacher Dashboard
extra class backlog, leave arrangement status.
Assigned mentees, risk classification, subject-wise shortages, pending interventions, parent reports,
Mentor Dashboard
warning letters, counselling notes.
Department attendance, detained/at-risk students, pending approvals, teacher compliance, mentor
HoD Dashboard
compliance, leave/arrangement, extra classes, warning letters.
School-level summary, department comparison, detention risk, pending HoD approvals, defaulting
Dean Dashboard
mentors, high-risk students, parent communication status, warning letters and trend analytics.
Developer Instruction File | Version 1.0 Prepared By Dr. Vivek Srivastava, Dean SOET SGT University

--- PAGE 8 ---
SOET, SGT University | Attendance, Mentorship & Detention Monitoring App
19. Required Reports and Exports
Report Users Purpose
Daily Attendance Report Teacher/HoD/Dean Date-wise subject and student attendance.
Subject-wise Attendance Report Teacher/HoD Classes held, attended, shortage, no class conducted, extra classes.
Student-wise Attendance Report Mentor/HoD/Dean Complete attendance breakup by subject and source.
Mentee Summary Report Mentor Assigned mentee list with risk status and actions.
Parent Attendance Summary Mentor Parent-facing PDF/email summary.
Warning Letter Register Mentor/HoD/Dean All warning letters initiated, approved, issued and acknowledged.
Detention Risk List Teacher/Mentor/HoD/Dean Students below threshold or likely to be detained.
Final Detention List HoD/Dean Final list after regularization and approvals.
Mentor Default Report HoD/Dean Mentors defaulting on intervention timelines.
Attendance marking status, no class conducted, extra classes, leave
Teacher Compliance Report HoD/Dean
arrangements.
Activity Attendance Report HoD/Dean Activity-wise attendance and approvals.
Planned lectures, regular classes, extra classes, no class conducted,
Course Completion Report Teacher/HoD/Dean
percentage completion.
20. Alerts and Notification Rules
Trigger Notification To
Teacher has not marked attendance within
Teacher, HoD; repeated default visible to Dean.
deadline
Student below warning threshold Mentor and student; parent only as per escalation rule.
Student critical below threshold Mentor, HoD and Dean dashboard alert.
Mentor action overdue Mentor reminder; visible to HoD and Dean as default.
Parent communication pending Mentor reminder; HoD visibility after defined time.
Warning letter eligible but not initiated Mentor and HoD alert; Dean dashboard count.
Regularization pending approval HoD reminder; Dean view for long-pending cases.
Arrangement teacher acceptance pending Arrangement teacher and original teacher; HoD visibility.
Extra class scheduled but attendance not
Teacher reminder; HoD visibility.
marked
21. UI/UX Design Instructions
UI Area Instruction
Gen Z-friendly minimal design: clean white background, pastel accents, rounded cards, light shadows,
Design Style
simple icons and uncluttered tables.
Role Clarity Each screen should clearly show user role and scope: Teacher, Mentor, HoD or Dean.
Restricted Data Visibility Clearly indicate “Only assigned subjects shown” and “Only assigned mentees shown.”
Color Coding Use consistent green/amber/red/grey status colors across dashboard, reports and warning workflows.
Mobile Support Attendance marking, mentee review and approvals should be mobile-responsive.
Mentor dashboard must include quick actions: counselling note, parent contact, regularization, warning
Fast Actions
letter, parent report.
Accessibility Use readable fonts, high contrast, keyboard-friendly inputs and clear status text along with colors.
22. Approval and Permission Matrix
Action Teacher Mentor Coordinator HoD Dean Admin
Yes, assigned
Mark regular attendance No No View/Reopen View Configure
only
Mark arrangement
If accepted No No View View Configure
attendance
Yes, assigned Approve/View
Schedule extra class No No View Configure
only if enabled
Submit mentor Yes, mentees
No No Approve/Reject View Configure
regularization only
Developer Instruction File | Version 1.0 Prepared By Dr. Vivek Srivastava, Dean SOET SGT University

--- PAGE 9 ---
SOET, SGT University | Attendance, Mentorship & Detention Monitoring App
Submit activity attendance No No Yes Approve/Reject View Configure
View Template
Generate parent summary No Yes No View
summary configure
Template
Initiate warning letter No Yes No Approve/Issue View/Escalate
configure
View
View Generate
Generate final detention list assigned No Generate Dept Configure rules
mentees School
subject
View defaulting mentors No No No Dept-level School-level No
23. Attendance Calculation Logic
Use the following simplified logic; exact rules should be parameterized in Admin Settings.
Metric Formula / Logic
Regular classes conducted + arrangement classes + extra classes + approved activity slots where
Valid Classes Held for Subject
applicable - no class conducted exclusions.
Present in regular + present in arrangement + present in extra + approved activity + approved
Student Attended Count
regularization credits.
Attendance % Student Attended Count / Valid Classes Held x 100.
Shortage Classes Minimum additional attended classes needed to reach configured threshold.
Regular classes taken by original teacher + extra/make-up classes taken by original teacher.
Teacher Course Completion Count
Exclude no class conducted and arrangement classes.
Weighted score based on intervention timeliness, counselling, parent contact, regularization
Mentor Compliance Score
closure, warning actions and follow-up closure.
24. Non-Functional Requirements
Area Requirement
Security Role-based access control, encrypted passwords, HTTPS, secure session management, audit trail.
Attendance list should load quickly for 100+ students; dashboard summaries should be cached or
Performance
precomputed where required.
Scalability Architecture should support all SOET departments and future expansion to other schools/faculties.
Auditability All changes and approvals must be traceable for disputes and compliance.
Data Export Excel and PDF exports required for all major reports.
Admin should be able to bulk upload students, faculty, timetable, subjects and mentor mapping using
Data Import
Excel templates.
Backup Daily database backup and versioned report storage.
Privacy Parent/student contact data visible only to authorized users.
25. Acceptance Criteria for Developer
• Teacher can view and mark attendance only for assigned subjects.
• Mentor can view only assigned mentees and subject-wise color-coded attendance.
• Leave module auto-lists affected lectures and shows only free arrangement teachers for each slot.
• Arrangement teacher acceptance is required before/alongside HoD leave approval.
• Arrangement attendance counts for student detention but not original teacher course completion.
• Extra class slot selection uses available batch slots and counts for both student attendance and teacher course completion.
• Activity attendance is credited only after approval and cannot duplicate slot attendance.
• Teacher, mentor, HoD and Dean can generate detention-related views appropriate to role.
• Mentor can generate parent summaries and initiate warning letters.
• Dean can see defaulting mentors and drill down to mentor-wise pending interventions.
• All key reports can be exported to Excel/PDF.
• All edits, approvals and rejections have audit trail.
Developer Instruction File | Version 1.0 Prepared By Dr. Vivek Srivastava, Dean SOET SGT University

--- PAGE 10 ---
SOET, SGT University | Attendance, Mentorship & Detention Monitoring App
26. Suggested Development Milestones
Phase Deliverables
Phase 1: Master Data &
Role login, permissions, master data and mappings.
Authentication
Phase 2: Attendance Core Assigned subject attendance, locking and reports.
Phase 3: Mentor Module Mentee dashboard, counselling, parent log and regularization.
Phase 4: Leave, Arrangement &
Leave workflow, arrangement attendance and extra class scheduling.
Extra Classes
Phase 5: Detention, Warning &
Detention lists, warnings, parent summaries and mentor accountability.
Parent Reports
Phase 6: HoD/Dean Dashboards Monitoring, mentor defaulting dashboard, analytics and exports.
Phase 7: QA, Security & Deployment Testing, security review, deployment and training.
Developer Instruction File | Version 1.0 Prepared By Dr. Vivek Srivastava, Dean SOET SGT University

