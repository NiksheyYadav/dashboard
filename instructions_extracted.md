--- PAGE 1 ---
Updated Instructions for App Designer/Coder
Project: SOET Attendance, Mentorship & Faculty Leave-Arrangement Monitoring App –
SGT University
1. Core Objective
Develop a role-based app for SOET, SGT University, where teachers mark attendance only for
subjects assigned to them, mentors monitor only their assigned mentees, HoDs approve
leave/attendance exceptions, and the Dean monitors overall attendance, mentorship, faculty
compliance, and detention-risk reports.
2. User Roles
The app shall have the following logins:
1. Teacher Login
2. Mentor Login — may be part of Teacher Login
3. Activity Coordinator Login
4. HoD Login
5. Dean Login
6. Admin Login
3. Teacher Login Requirements
A. Subject Attendance
The teacher shall see only the subjects officially assigned to him/her by Admin/HoD.
The teacher should not manually search all subjects. The dashboard should display only
assigned subjects with:
Field Details
Programme Auto-mapped
Semester Auto-mapped
Section Auto-mapped
Subject Name Auto-mapped
Subject Code Auto-mapped
Lecture Slot As per timetable
Date Auto/current date with edit permission as per rule
The teacher will select the relevant assigned subject/slot and mark:
• Present

--- PAGE 2 ---
• Absent
• No Class Conducted
• Class Taken by Arrangement Teacher
Attendance should be locked after a defined time, e.g., 24 hours, unless reopened by
HoD/Admin.
B. Mentee List Visibility
Each teacher shall see only the mentees assigned to him/her.
The mentees may belong to:
• Same batch
• Different batches
• Different programmes/sections, if assigned by Admin/HoD
The mentor dashboard shall display a mentee-wise table with subject headers and attendance
percentage.
Suggested Mentee Attendance Table
Student Roll Subject Subject Subject Subject Overall Risk
Batch
Name No. 1 2 3 4 % Status
B.Tech CSE
Student A 101 82% 76% 68% 91% 79% Safe
Sem III
B.Tech AI
Student B 102 71% 64% 58% 80% 68% At Risk
Sem III
Colour Coding
Use colour coding for quick monitoring:
Attendance Range Colour Status
85% and above Green Good
75% to 84% Light Green/Blue Safe
65% to 74% Yellow/Orange Warning
Below 65% Red Critical
Approved leave/activity pending Grey/Amber Pending Approval
Mentor should be able to click on any subject percentage to see:
• Total classes held
• Classes attended
• Approved activity/leave attendance
• Absences

--- PAGE 3 ---
• Pending regularization
• Remarks/counselling history
4. Mentor Attendance Regularization
Mentor can initiate attendance regularization only for assigned mentees under approved
categories:
• Sick leave
• Internship
• Project work
• University duty
• Department-approved academic activity
• Approved external event
• Placement/training activity
Workflow:
Mentor → Submit request with proof/remarks → HoD Approval → Attendance updated
The system must maintain:
• Student name
• Reason
• Date/slot
• Supporting document
• Mentor remarks
• HoD approval/rejection
• Audit trail
5. Faculty Leave and Class Arrangement Module
A separate module shall be provided in Teacher Login for faculty leave and class arrangement.
A. Leave Application by Teacher
When a teacher is applying for leave, the teacher must make class arrangements before
submitting leave.
The teacher shall select:
• Leave date
• Leave type
• Reason for leave
• Assigned lectures affected
• Subject/section affected

--- PAGE 4 ---
• Proposed arrangement teacher for each lecture
B. Arrangement Teacher Selection
For each affected lecture, the system shall show a pre-fed list of available teachers who are
free during that lecture slot.
The system should automatically filter teachers based on:
• Free timetable slot
• Department/faculty availability
• Teaching load
• Eligibility/competence mapping, if available
• No clash with existing lecture
• Not already assigned for another arrangement during same slot
The leave-applying teacher can select a suitable arrangement teacher for each lecture.
Suggested Table
Available
Original Selected
Date Slot Subject Section Arrangement Status
Teacher Teacher
Teachers
12 10:00– Data Pending
CSE III Dr. X Dr. A, Dr. B, Dr. C Dr. B
Aug 11:00 Structures Acceptance
12 12:00– Pending
AI Basics AI III Dr. X Dr. D, Dr. E Dr. D
Aug 01:00 Acceptance
C. Approval by Arrangement Teacher
The selected arrangement teacher must approve/accept the class arrangement.
Workflow:
Leave Applying Teacher → Select Arrangement Teacher → Arrangement Teacher
Accepts/Rejects → HoD Reviews Leave
If the arrangement teacher rejects, the original teacher must select another available teacher.
D. HoD Leave Approval
The HoD shall see the leave application along with class arrangement status.
HoD dashboard should show:

--- PAGE 5 ---
• Leave applicant name
• Leave date
• Affected lectures
• Arrangement teacher selected
• Arrangement teacher acceptance status
• Remarks
• Final approval/rejection option
HoD should approve leave only after arrangement status is complete, unless exempted.
6. Arrangement Class Attendance Rule
Arrangement classes must be treated carefully in the system.
Key Rule
Arrangement classes shall be counted for student attendance but shall not be counted as
class completion by the original subject teacher.
This means:
Parameter Treatment
Student attendance Counted
Detention calculation Counted
Subject attendance percentage Counted
Class completion schedule of original teacher Not counted
Workload completion of original teacher Not counted
Arrangement teacher record Counted as arrangement duty
HoD/Dean monitoring Visible separately
This ensures that students are not detained due to faculty leave if they attended the arranged
class.
7. Attendance Marking for Arrangement Classes
Once the arrangement teacher accepts the class:
• The arranged lecture appears in the arrangement teacher’s dashboard.
• The arrangement teacher can mark attendance for that class.
• Attendance will be reflected in the student’s subject attendance.
• The class will be tagged as Arrangement Class.
• It will not increase the original teacher’s completed class count.
Suggested attendance tag:

--- PAGE 6 ---
• Regular Class
• Arrangement Class
• Activity Attendance
• Approved Leave/Internship/Project
• No Class Conducted
8. Detention List Rule
While generating the detained/shortage list:
The system shall count the following as valid attendance:
• Regular class attendance
• Arrangement class attendance
• Approved sick leave, if allowed under university policy
• Approved internship/project attendance
• Approved activity attendance
• Approved university duty
Arrangement class attendance must be included in student attendance percentage and detention
calculation.
However, arrangement classes must be separately visible in reports so that class completion
and faculty workload are not incorrectly inflated.
9. Activity-Based Attendance
For seminars, workshops, industrial visits, project reviews, placement activities, training
programmes, etc.:
• Activity Coordinator marks student participation.
• HoD approves the activity attendance.
• Subject teacher marks “No Class Conducted due to Approved Activity” where
applicable.
• Students receive attendance for the approved activity slot.
• No duplicate attendance shall be allowed for the same student and same slot.
10. HoD Dashboard Requirements
HoD shall be able to view:
1. Subject-wise attendance
2. Teacher-wise attendance marking status
3. Mentor-wise mentee attendance

--- PAGE 7 ---
4. Low attendance students
5. Pending mentor regularization requests
6. Pending activity attendance approvals
7. Faculty leave applications
8. Class arrangement status
9. Arrangement teacher acceptance/rejection
10. Regular class vs arrangement class report
11. No Class Conducted report
12. Detention-risk list
11. Dean Dashboard Requirements
Dean shall have school-level monitoring access across all SOET departments.
Dean should be able to view:
• Department-wise attendance summary
• Programme-wise and semester-wise attendance
• Students below 75%
• Mentor intervention status
• Faculty attendance marking compliance
• Faculty leave and arrangement class summary
• Arrangement classes conducted
• Activity-based attendance
• No Class Conducted cases
• Detention list with detailed attendance breakup
• Monthly trend report
Dean should mainly have monitoring rights, with limited administrative override if permitted.
12. Admin Configuration
Admin shall configure:
• Faculty master
• Student master
• Programme/semester/section
• Subject allocation
• Teacher-subject mapping
• Mentor-mentee mapping
• Timetable
• Lecture slots
• Free teacher availability
• HoD mapping
• Dean mapping
• Leave types

--- PAGE 8 ---
• Attendance rules
• Detention threshold
• Activity categories
• Approval hierarchy
13. Essential Business Rules
1. Teacher shall see only the subjects assigned to him/her.
2. Teacher shall mark attendance only for assigned subjects or approved arrangement
classes.
3. Mentor shall see only assigned mentees.
4. Mentee attendance table shall show subject-wise attendance with colour coding.
5. Leave application must include class arrangement details.
6. Arrangement teacher must accept the class before HoD leave approval.
7. HoD shall approve leave after checking arrangement status.
8. Arrangement class attendance shall count for student attendance and detention
calculation.
9. Arrangement class shall not count in original teacher’s class completion schedule.
10. Activity attendance shall require coordinator entry and HoD approval.
11. No duplicate attendance shall be allowed for the same student, date, and slot.
12. All approvals, changes, and attendance edits must have audit trail.
13. Reports must be downloadable in Excel and PDF.
Updated Instruction: Extra Class / Course Completion Provision
Add the following module to the earlier app instructions.
14. Extra Class / Make-Up Class Module
The app shall include a provision for extra classes/make-up classes in case a course is not
completed due to:
• Faculty leave
• Holidays
• Events
• Academic activity clashes
• No Class Conducted entries
• Slow course progress
• Any other valid academic reason
This module will allow the subject teacher to compensate pending lectures and complete the
syllabus/course plan.
A. Extra Class Selection by Teacher

--- PAGE 9 ---
The teacher shall see only the batches/sections and subjects assigned to him/her.
For scheduling an extra class, the teacher shall select:
Field Requirement
Subject From assigned subjects only
Programme/Semester/Section Auto-mapped from subject allocation
Date Selected by teacher
Available Slot From pre-fed dropdown based on free slots of that student batch
Class Type Extra Class / Make-Up Class
Reason Leave, holiday, no class conducted, syllabus backlog, etc.
Topic Covered Mandatory entry
Remarks Optional
B. Available Slot Dropdown
The system shall show only those slots where the concerned student batch/section is free.
The available slots should be generated from:
• Student batch timetable
• Free lecture periods
• Vacant slots
• Lunch/break rules, if applicable
• Working day calendar
• Special timetable restrictions
• HoD/Admin-approved extra class slots
The system should prevent clashes with:
• Existing regular classes
• Approved activities
• Industrial visits
• Exams/tests
• Other already scheduled extra classes
• Faculty’s own timetable clash
C. Attendance for Extra Class
Once the extra class is scheduled and conducted, the teacher shall mark attendance for that
class.
This attendance shall be:

--- PAGE 10 ---
Parameter Treatment
Student attendance Counted
Detention calculation Counted
Subject attendance percentage Counted
Teacher’s course completion lecture count Counted
Syllabus/course progress Counted
Replacement for No Class Conducted lecture Allowed
Audit trail Mandatory
D. Difference Between Arrangement Class and Extra Class
The system must clearly distinguish between Arrangement Class and Extra Class.
Extra Class /
Feature Arrangement Class
Make-Up Class
Reason Teacher is on leave/unavailable
Taken by Arrangement teacher
Attendance counted for student Yes
Counted in detention calculation Yes
Counted in original teacher’s
No
course completion
Counted in arrangement teacher
Yes
duty record
Avoid student attendance loss during
Purpose
teacher absence
Feature Extra Class / Make-Up Class
Course backlog/syllabus completion/no class
Reason
conducted compensation
Taken by Original subject teacher
Attendance counted for student Yes
Counted in detention calculation Yes
Counted in original teacher’s course
Yes
completion
Counted in syllabus/course progress Yes
Purpose Complete pending syllabus and lecture requirement
E. Treatment of “No Class Conducted”
If a regular lecture is marked as No Class Conducted, it shall not be counted as:
• Class held
• Student attendance opportunity

--- PAGE 11 ---
• Teacher’s completed lecture
• Course completion progress
However, the teacher may later compensate it by scheduling an Extra Class/Make-Up Class
through available batch slots.
Once the extra class is conducted:
• It shall count in student attendance.
• It shall count in detention calculation.
• It shall count in teacher’s total lectures for course completion.
• It shall be visible separately as an extra/make-up lecture.
F. HoD Monitoring for Extra Classes
HoD dashboard shall show:
• Subject-wise regular classes conducted
• No Class Conducted lectures
• Extra classes scheduled
• Extra classes completed
• Attendance in extra classes
• Teacher-wise course completion status
• Syllabus progress
• Pending lecture backlog
• Extra class approval status, if approval is enabled
HoD may approve or review extra classes depending on university rules.
G. Dean Monitoring for Extra Classes
Dean dashboard shall include:
• Department-wise course completion status
• Teacher-wise lecture completion
• Subject-wise backlog
• No Class Conducted vs Extra Class compensation
• Extra class attendance impact on detention list
• Monthly academic compliance report
Updated Key Business Rules
1. Teacher shall see and select only the subjects assigned to him/her.
2. Teacher shall see only mentees assigned to him/her.

--- PAGE 12 ---
3. Mentee table shall show subject-wise attendance with colour coding.
4. Arrangement classes shall count for student attendance and detention but not for
original teacher’s course completion.
5. Extra classes/make-up classes taken by the original teacher shall count for student
attendance, detention calculation, and teacher’s course completion.
6. No Class Conducted lectures shall not count in course completion or student attendance.
7. No Class Conducted lectures may be compensated through extra classes using available
batch slots.
8. Extra class slots shall be selected from pre-fed dropdowns based on batch availability.
9. The system shall prevent timetable clashes for students and teachers.
10. All regular, arrangement, activity, leave, and extra class attendance must be separately
tagged in reports.
11. Detention list shall include valid attendance from regular classes, arrangement classes,
approved activities, approved regularization, and extra classes.
12. Course completion report shall exclude No Class Conducted and arrangement classes
but include regular and extra classes taken by the concerned subject teacher.
Updated One-Line Requirement for Developer
Build a role-based SOET attendance, mentorship, leave-arrangement, and course-completion
monitoring app where teachers see only assigned subjects and mentees, mentors monitor
colour-coded mentee attendance, faculty leave requires accepted class arrangements,
arrangement classes count for student attendance but not teacher course completion, and
extra/make-up classes selected from available batch slots count for both student
attendance/detention and teacher course completion, excluding No Class Conducted lectures.

