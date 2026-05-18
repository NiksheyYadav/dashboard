from datetime import date, datetime
from io import BytesIO
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.soet import (
    ArrangementAssignment,
    AttendanceTransaction,
    CounsellingNote,
    ExtraClass,
    LeaveRequest,
    MentorMapping,
    Notification,
    ParentCommunication,
    Programme,
    RegularizationRequest,
    Section,
    Semester,
    Subject,
    TimetableSlot,
    WarningLetter,
)
from app.models.student import Student
from app.models.user import User
from app.modules.auth.dependencies import AuthContext, RequireRole
from app.modules.soet.schemas import (
    ArrangementAssignRequest,
    ArrangementDecisionRequest,
    BulkAttendanceMarkRequest,
    ExtraClassCreateRequest,
    LeaveApplyRequest,
    MentorNoteRequest,
    NoClassRequest,
    ParentCommunicationRequest,
    RegularizationRequestCreate,
)
from lib.attendance_calculator import calculate_student_attendance

soet_router = APIRouter(tags=["soet"])


def _has_role(auth: AuthContext, allowed: set[str]) -> bool:
    return bool(set(role.upper() for role in (auth.user.roles or [])).intersection(allowed))


def _notify(db: Session, user_id: str, type_: str, message: str) -> None:
    db.add(Notification(user_id=user_id, type=type_, message=message))


def _emit_parent_report_event(student_id: str) -> None:
    print(f"Parent report generation event queued for student {student_id}")


@soet_router.get("/attendance/assigned-subjects")
def get_assigned_subjects(auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN", "HOD", "DEAN"])), db: Session = Depends(get_db)):
    subjects = db.scalars(select(Subject).where(Subject.assigned_teacher_id == auth.user.id).order_by(Subject.name.asc())).all()
    return [{"id": str(subject.id), "code": subject.code, "name": subject.name, "planned_lecture_count": subject.planned_lecture_count} for subject in subjects]


@soet_router.post("/attendance/mark")
def mark_attendance(payload: BulkAttendanceMarkRequest, auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    for row in payload.students:
        tx = db.scalar(
            select(AttendanceTransaction).where(
                AttendanceTransaction.student_id == row.student_id,
                AttendanceTransaction.date == payload.date,
                AttendanceTransaction.slot_id == payload.slot_id,
            )
        )
        if tx:
            tx.status = row.status
            tx.remarks = row.remarks
            tx.class_type = payload.class_type
            tx.marked_by = auth.user.id
            tx.source = payload.source
            continue
        db.add(
            AttendanceTransaction(
                student_id=row.student_id,
                subject_id=payload.subject_id,
                date=payload.date,
                slot_id=payload.slot_id,
                status=row.status,
                class_type=payload.class_type,
                remarks=row.remarks,
                marked_by=auth.user.id,
                source=payload.source,
            )
        )
    db.commit()
    for row in payload.students:
        attendance = calculate_student_attendance(db, row.student_id, payload.subject_id)
        mentors = db.scalars(select(MentorMapping.mentor_id).where(MentorMapping.student_id == row.student_id)).all()
        if attendance["percentage"] < 75:
            for mentor_id in mentors:
                _notify(db, mentor_id, "attendance_drop", f"Student {row.student_id} dropped below 75% attendance.")
        if attendance["percentage"] < 65:
            for mentor_id in mentors:
                _notify(db, mentor_id, "attendance_critical", f"Student {row.student_id} dropped below 65% attendance.")
            hods = db.scalars(select(User.id).where(User.roles.any("HOD"))).all()
            for hod_id in hods:
                _notify(db, hod_id, "attendance_critical_hod", f"Critical attendance alert for student {row.student_id}.")
    db.commit()
    return {"detail": "Attendance marked successfully"}


@soet_router.post("/attendance/mark-no-class")
def mark_no_class(payload: NoClassRequest, auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    subject = db.scalar(select(Subject).where(Subject.id == payload.subject_id))
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    semester = db.scalar(select(Semester).where(Semester.id == subject.semester_id))
    programme = db.scalar(select(Programme).where(Programme.id == subject.programme_id))
    students_query = select(Student.id)
    if semester:
        students_query = students_query.where(Student.semester == semester.number)
    if programme and programme.code:
        prefix = programme.code[:2] if len(programme.code) >= 2 else programme.code
        students_query = students_query.where(Student.course.ilike(f"%{prefix}%"))
    students = db.scalars(students_query).all()
    for student_id in students:
        existing = db.scalar(
            select(AttendanceTransaction).where(
                AttendanceTransaction.student_id == student_id,
                AttendanceTransaction.date == payload.date,
                AttendanceTransaction.slot_id == payload.slot_id,
            )
        )
        if existing:
            existing.status = "no_class"
            existing.class_type = "regular"
            existing.remarks = payload.remarks
            existing.marked_by = auth.user.id
            continue
        db.add(
            AttendanceTransaction(
                student_id=student_id,
                subject_id=payload.subject_id,
                date=payload.date,
                slot_id=payload.slot_id,
                status="no_class",
                class_type="regular",
                remarks=payload.remarks,
                marked_by=auth.user.id,
            )
        )
    db.commit()
    _notify(db, auth.user.id, "attendance_no_class", f"No class conducted marked for {payload.date}.")
    db.commit()
    return {"detail": "Slot marked as no class"}


@soet_router.get("/attendance/history/{subject_id}")
def attendance_history(subject_id: str, db: Session = Depends(get_db), auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN", "HOD", "DEAN"]))):
    history = db.execute(
        select(
            AttendanceTransaction.date,
            AttendanceTransaction.class_type,
            func.count(AttendanceTransaction.id).label("count"),
            func.sum(case((AttendanceTransaction.status.in_(["present", "regularized"]), 1), else_=0)).label("present_count"),
        )
        .where(AttendanceTransaction.subject_id == subject_id)
        .group_by(AttendanceTransaction.date, AttendanceTransaction.class_type)
        .order_by(AttendanceTransaction.date.desc())
        .limit(10)
    ).all()
    return [
        {"date": item.date, "type": item.class_type, "count": int(item.present_count or 0), "total": int(item.count or 0)}
        for item in history
    ]


@soet_router.get("/attendance/summary/{student_id}")
def attendance_summary(student_id: str, auth: AuthContext = Depends(RequireRole(["TEACHER", "MENTOR", "HOD", "DEAN", "ADMIN"])), db: Session = Depends(get_db)):
    subjects = db.scalars(select(Subject)).all()
    return [
        {"subject_id": str(subject.id), "subject": subject.name, **calculate_student_attendance(db, student_id, str(subject.id))}
        for subject in subjects
    ]


@soet_router.get("/attendance/students/{subject_id}")
def attendance_students(subject_id: str, auth: AuthContext = Depends(RequireRole(["TEACHER", "HOD", "DEAN", "ADMIN"])), db: Session = Depends(get_db)):
    subject = db.scalar(select(Subject).where(Subject.id == subject_id))
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    semester = db.scalar(select(Semester).where(Semester.id == subject.semester_id))
    programme = db.scalar(select(Programme).where(Programme.id == subject.programme_id))
    query = select(Student)
    if semester:
        query = query.where(Student.semester == semester.number)
    if programme and programme.code:
        prefix = programme.code[:2] if len(programme.code) >= 2 else programme.code
        query = query.where(Student.course.ilike(f"%{prefix}%"))
    students = db.scalars(query.order_by(Student.roll_no.asc())).all()
    return [{"id": str(student.id), "roll_no": student.roll_no, "name": student.name} for student in students]


@soet_router.get("/attendance/calculate")
def attendance_calculate(student_id: str = Query(...), subject_id: str = Query(...), auth: AuthContext = Depends(RequireRole(["TEACHER", "MENTOR", "HOD", "DEAN", "ADMIN"])), db: Session = Depends(get_db)):
    return calculate_student_attendance(db, student_id, subject_id)


@soet_router.get("/dashboard/teacher")
def teacher_dashboard(auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    today = date.today()
    today_classes = db.scalar(
        select(func.count(TimetableSlot.id))
        .join(Subject, Subject.id == TimetableSlot.subject_id)
        .where(Subject.assigned_teacher_id == auth.user.id)
    ) or 0
    marked_today = db.scalar(
        select(func.count(func.distinct(AttendanceTransaction.slot_id))).where(
            AttendanceTransaction.marked_by == auth.user.id,
            AttendanceTransaction.date == today,
        )
    ) or 0
    pending = max(today_classes - marked_today, 0)
    subject_count = db.scalar(select(func.count(Subject.id)).where(Subject.assigned_teacher_id == auth.user.id)) or 0
    mentees = db.scalar(select(func.count(MentorMapping.id)).where(MentorMapping.mentor_id == auth.user.id)) or 0
    return {"todays_classes": today_classes, "pending_attendance": pending, "assigned_subjects": subject_count, "assigned_mentees": mentees}


@soet_router.get("/dashboard/hod")
def hod_dashboard(auth: AuthContext = Depends(RequireRole(["HOD", "ADMIN"])), db: Session = Depends(get_db)):
    return {
        "department_attendance_average": db.scalar(select(func.avg(Student.attendance_percent))) or 0,
        "pending_leave_approvals": db.scalar(select(func.count(LeaveRequest.id)).where(LeaveRequest.hod_status == "pending")) or 0,
        "pending_regularization": db.scalar(select(func.count(RegularizationRequest.id)).where(RegularizationRequest.hod_status == "pending")) or 0,
    }


@soet_router.get("/dashboard/dean")
def dean_dashboard(auth: AuthContext = Depends(RequireRole(["DEAN", "ADMIN"])), db: Session = Depends(get_db)):
    return {
        "overall_attendance": db.scalar(select(func.avg(Student.attendance_percent))) or 0,
        "below_75_count": db.scalar(select(func.count(Student.id)).where(Student.attendance_percent < 75)) or 0,
        "departments": db.scalar(select(func.count(func.distinct(Programme.id)))) or 0,
    }


@soet_router.get("/mentor/mentees")
def mentor_mentees(auth: AuthContext = Depends(RequireRole(["MENTOR", "TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    rows = db.execute(
        select(Student.id, Student.name, Student.roll_no, Student.attendance_percent)
        .join(MentorMapping, MentorMapping.student_id == Student.id)
        .where(MentorMapping.mentor_id == auth.user.id)
    ).all()
    return [
        {
            "id": str(row.id),
            "name": row.name,
            "roll_no": row.roll_no,
            "overall_percentage": row.attendance_percent,
            "risk_status": "Safe" if row.attendance_percent >= 75 else "Warning" if row.attendance_percent >= 50 else "Critical",
        }
        for row in rows
    ]


@soet_router.get("/mentor/mentee/{id}/drilldown")
def mentor_mentee_drilldown(id: str, auth: AuthContext = Depends(RequireRole(["MENTOR", "TEACHER", "ADMIN", "HOD", "DEAN"])), db: Session = Depends(get_db)):
    subjects = db.scalars(select(Subject)).all()
    return [{"subject_id": str(subject.id), "subject": subject.name, **calculate_student_attendance(db, id, str(subject.id))} for subject in subjects]


@soet_router.post("/mentor/counselling-note")
def add_counselling_note(payload: MentorNoteRequest, auth: AuthContext = Depends(RequireRole(["MENTOR", "TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    note = CounsellingNote(mentor_id=auth.user.id, student_id=payload.student_id, note=payload.note, student_response=payload.student_response, corrective_action=payload.corrective_action, next_review_date=payload.next_review_date)
    db.add(note)
    db.commit()
    return {"detail": "Counselling note added"}


@soet_router.post("/mentor/parent-communication")
def add_parent_communication(payload: ParentCommunicationRequest, auth: AuthContext = Depends(RequireRole(["MENTOR", "TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    communication = ParentCommunication(mentor_id=auth.user.id, student_id=payload.student_id, channel=payload.channel, summary=payload.summary, followup_date=payload.followup_date)
    db.add(communication)
    db.commit()
    return {"detail": "Parent communication added"}


@soet_router.post("/mentor/regularization-request")
def add_regularization_request(payload: RegularizationRequestCreate, auth: AuthContext = Depends(RequireRole(["MENTOR", "TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    request = RegularizationRequest(
        mentor_id=auth.user.id,
        student_id=payload.student_id,
        category=payload.category,
        date_from=payload.date_from,
        date_to=payload.date_to,
        reason=payload.reason,
        proof_url=payload.proof_url,
        audit_trail={"created_by": str(auth.user.id), "created_at": datetime.utcnow().isoformat()},
    )
    db.add(request)
    db.commit()
    return {"detail": "Regularization request submitted"}


@soet_router.get("/mentor/generate-parent-report/{id}")
def generate_parent_report(id: str, background_tasks: BackgroundTasks, auth: AuthContext = Depends(RequireRole(["MENTOR", "TEACHER", "HOD", "ADMIN"])), db: Session = Depends(get_db)):
    student = db.scalar(select(Student).where(Student.id == id))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    background_tasks.add_task(_emit_parent_report_event, id)
    pdf = BytesIO()
    pdf_canvas = canvas.Canvas(pdf, pagesize=A4)
    pdf_canvas.setFont("Helvetica-Bold", 14)
    pdf_canvas.drawString(40, 800, "Parent Summary Report")
    pdf_canvas.setFont("Helvetica", 11)
    pdf_canvas.drawString(40, 780, f"Student: {student.name} ({student.roll_no})")
    pdf_canvas.drawString(40, 762, f"Overall Attendance: {student.attendance_percent:.1f}%")
    pdf_canvas.drawString(40, 744, "Generated by EduPulse SOET Monitoring")
    pdf_canvas.showPage()
    pdf_canvas.save()
    pdf.seek(0)
    return StreamingResponse(pdf, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="parent-report-{student.roll_no}.pdf"'})


@soet_router.post("/leave/apply")
def apply_leave(payload: LeaveApplyRequest, auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    leave = LeaveRequest(teacher_id=auth.user.id, leave_type=payload.leave_type, from_date=payload.from_date, to_date=payload.to_date, reason=payload.reason)
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return {"id": str(leave.id), "detail": "Leave request created"}


@soet_router.get("/leave/available-teachers/{slot_id}")
def leave_available_teachers(slot_id: str, auth: AuthContext = Depends(RequireRole(["TEACHER", "HOD", "ADMIN"])), db: Session = Depends(get_db)):
    busy_teachers = db.scalars(select(Subject.assigned_teacher_id).join(TimetableSlot, TimetableSlot.subject_id == Subject.id).where(TimetableSlot.id == slot_id)).all()
    users = db.scalars(select(Subject.assigned_teacher_id).where(Subject.assigned_teacher_id.is_not(None))).all()
    available = [uid for uid in set(users) if uid not in set(busy_teachers)]
    return [{"teacher_id": str(uid)} for uid in available]


@soet_router.post("/leave/assign-arrangement")
def assign_arrangement(payload: ArrangementAssignRequest, auth: AuthContext = Depends(RequireRole(["TEACHER", "HOD", "ADMIN"])), db: Session = Depends(get_db)):
    assignment = ArrangementAssignment(**payload.model_dump())
    db.add(assignment)
    _notify(db, payload.arrangement_teacher_id, "arrangement_request", "Arrangement class assignment pending your acceptance.")
    db.commit()
    return {"detail": "Arrangement assigned"}


@soet_router.post("/leave/arrangement/accept-reject/{id}")
def accept_reject_arrangement(id: str, payload: ArrangementDecisionRequest, auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    assignment = db.scalar(select(ArrangementAssignment).where(ArrangementAssignment.id == id))
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    assignment.acceptance_status = payload.decision
    db.commit()
    return {"detail": "Arrangement status updated"}


@soet_router.get("/leave/hod-pending")
def leave_hod_pending(auth: AuthContext = Depends(RequireRole(["HOD", "ADMIN"])), db: Session = Depends(get_db)):
    rows = db.scalars(select(LeaveRequest).where(LeaveRequest.hod_status == "pending").order_by(LeaveRequest.created_at.desc())).all()
    return [{"id": str(row.id), "teacher_id": str(row.teacher_id), "from_date": row.from_date, "to_date": row.to_date, "leave_type": row.leave_type} for row in rows]


@soet_router.post("/leave/hod-approve/{id}")
def leave_hod_approve(id: str, auth: AuthContext = Depends(RequireRole(["HOD", "ADMIN"])), db: Session = Depends(get_db)):
    leave = db.scalar(select(LeaveRequest).where(LeaveRequest.id == id))
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    leave.hod_status = "approved"
    db.commit()
    return {"detail": "Leave approved"}


@soet_router.get("/extra-class/available-slots/{section_id}/{slot_date}")
def extra_class_available_slots(section_id: str, slot_date: date, auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    slots = db.scalars(select(TimetableSlot).where(TimetableSlot.section_id == section_id)).all()
    occupied = db.scalars(select(ExtraClass.slot_id).where(ExtraClass.section_id == section_id, ExtraClass.date == slot_date)).all()
    return [{"id": str(slot.id), "weekday": slot.weekday, "start_time": str(slot.start_time), "end_time": str(slot.end_time)} for slot in slots if slot.id not in occupied]


@soet_router.post("/extra-class/schedule")
def extra_class_schedule(payload: ExtraClassCreateRequest, auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    extra = ExtraClass(**payload.model_dump(), teacher_id=auth.user.id)
    db.add(extra)
    _notify(db, auth.user.id, "extra_class_reminder", f"Extra class scheduled for {payload.date}. Mark attendance after class.")
    db.commit()
    db.refresh(extra)
    return {"id": str(extra.id), "detail": "Extra class scheduled"}


@soet_router.post("/extra-class/mark-attendance/{id}")
def extra_class_mark_attendance(id: str, auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN"])), db: Session = Depends(get_db)):
    extra = db.scalar(select(ExtraClass).where(ExtraClass.id == id))
    if not extra:
        raise HTTPException(status_code=404, detail="Extra class not found")
    extra.attendance_marked = True
    db.commit()
    return {"detail": "Attendance marked for extra class"}


@soet_router.get("/extra-class/list/{teacher_id}")
def extra_class_list(teacher_id: str, auth: AuthContext = Depends(RequireRole(["TEACHER", "ADMIN", "HOD", "DEAN"])), db: Session = Depends(get_db)):
    rows = db.scalars(select(ExtraClass).where(ExtraClass.teacher_id == teacher_id).order_by(ExtraClass.date.desc())).all()
    return [{"id": str(row.id), "date": row.date, "subject_id": str(row.subject_id), "section_id": str(row.section_id), "class_type": row.class_type, "attendance_marked": row.attendance_marked, "approved": row.approved} for row in rows]


def _xlsx_response(filename: str, rows: list[list[object]], headers: list[str]) -> StreamingResponse:
    workbook = Workbook()
    sheet = workbook.active
    sheet.append(headers)
    for row in rows:
        sheet.append(row)
    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f'attachment; filename="{filename}"'})


def _pdf_response(filename: str, title: str, lines: list[str]) -> StreamingResponse:
    output = BytesIO()
    pdf = canvas.Canvas(output, pagesize=A4)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(40, 800, title)
    pdf.setFont("Helvetica", 10)
    y = 780
    for line in lines:
        pdf.drawString(40, y, line)
        y -= 16
        if y < 60:
            pdf.showPage()
            y = 800
    pdf.save()
    output.seek(0)
    return StreamingResponse(output, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@soet_router.get("/reports/detention-risk")
def report_detention_risk(
    format: str = Query("xlsx", pattern="^(xlsx|pdf)$"),
    dept: Optional[str] = None,
    prog: Optional[str] = None,
    sem: Optional[int] = None,
    risk_level: Optional[str] = None,
    auth: AuthContext = Depends(RequireRole(["HOD", "DEAN", "ADMIN"])),
    db: Session = Depends(get_db),
):
    query = select(Student)
    if sem:
        query = query.where(Student.semester == sem)
    if dept:
        query = query.where(Student.department.ilike(f"%{dept}%"))
    students = db.scalars(query).all()
    rows = []
    for student in students:
        mentor_id = db.scalar(select(MentorMapping.mentor_id).where(MentorMapping.student_id == student.id).limit(1))
        parent_contact = db.scalar(select(func.count(ParentCommunication.id)).where(ParentCommunication.student_id == student.id)) or 0
        counselling_done = db.scalar(select(func.count(CounsellingNote.id)).where(CounsellingNote.student_id == student.id)) or 0
        warning_issued = db.scalar(select(func.count(WarningLetter.id)).where(WarningLetter.student_id == student.id)) or 0
        rows.append([
            student.name,
            student.roll_no,
            student.course,
            student.semester,
            student.department,
            str(mentor_id) if mentor_id else "",
            "Yes" if parent_contact else "No",
            "N/A",
            student.attendance_percent,
            risk_level or ("Safe" if student.attendance_percent >= 75 else "Detention Risk"),
            "Yes" if counselling_done else "No",
            "Yes" if warning_issued else "No",
        ])
    if format == "pdf":
        lines = [f"{r[0]} | {r[1]} | {r[8]}%" for r in rows]
        return _pdf_response("detention-risk.pdf", "Detention Risk Report", lines)
    return _xlsx_response("detention-risk.xlsx", rows, ["Name", "Roll No.", "Programme", "Sem", "Section", "Mentor", "Parent Contact", "Subject-wise %", "Overall %", "Risk", "Counselling Done", "Warning Issued"])


@soet_router.get("/reports/subject-attendance")
def report_subject_attendance(auth: AuthContext = Depends(RequireRole(["HOD", "DEAN", "ADMIN"])), db: Session = Depends(get_db)):
    rows = db.execute(
        select(Subject.name, func.count(AttendanceTransaction.id), func.sum(case((AttendanceTransaction.status == "present", 1), else_=0)))
        .join(AttendanceTransaction, AttendanceTransaction.subject_id == Subject.id, isouter=True)
        .group_by(Subject.name)
    ).all()
    return _xlsx_response("subject-attendance.xlsx", [[r[0], int(r[1] or 0), int(r[2] or 0)] for r in rows], ["Subject", "Total", "Present"])


@soet_router.get("/reports/mentor-compliance")
def report_mentor_compliance(auth: AuthContext = Depends(RequireRole(["HOD", "DEAN", "ADMIN"])), db: Session = Depends(get_db)):
    rows = db.execute(select(MentorMapping.mentor_id, func.count(MentorMapping.id)).group_by(MentorMapping.mentor_id)).all()
    return [{"mentor_id": str(row[0]), "assigned_mentees": int(row[1])} for row in rows]


@soet_router.get("/reports/teacher-compliance")
def report_teacher_compliance(auth: AuthContext = Depends(RequireRole(["HOD", "DEAN", "ADMIN"])), db: Session = Depends(get_db)):
    rows = db.execute(select(Subject.assigned_teacher_id, func.count(Subject.id)).group_by(Subject.assigned_teacher_id)).all()
    return [{"teacher_id": str(row[0]), "assigned_subjects": int(row[1])} for row in rows]


@soet_router.get("/reports/course-completion")
def report_course_completion(
    teacher_id: Optional[str] = None,
    format: str = Query("xlsx", pattern="^(xlsx|pdf)$"),
    auth: AuthContext = Depends(RequireRole(["TEACHER", "HOD", "DEAN", "ADMIN"])),
    db: Session = Depends(get_db),
):
    teacher = teacher_id or str(auth.user.id)
    rows = db.execute(
        select(
            Subject.name,
            Section.name,
            Subject.planned_lecture_count,
            func.sum(case((AttendanceTransaction.class_type == "regular", 1), else_=0)).label("regular_count"),
            func.sum(case((AttendanceTransaction.class_type == "extra", 1), else_=0)).label("extra_count"),
            func.sum(case((AttendanceTransaction.status == "no_class", 1), else_=0)).label("no_class_count"),
        )
        .join(TimetableSlot, TimetableSlot.subject_id == Subject.id, isouter=True)
        .join(Section, Section.id == TimetableSlot.section_id, isouter=True)
        .join(AttendanceTransaction, AttendanceTransaction.subject_id == Subject.id, isouter=True)
        .where(Subject.assigned_teacher_id == teacher)
        .group_by(Subject.name, Section.name, Subject.planned_lecture_count)
    ).all()
    report_rows = [[r[0], r[1], int(r[2] or 0), int(r[3] or 0), int(r[4] or 0), int(r[5] or 0), round(((int(r[3] or 0) + int(r[4] or 0)) / max(int(r[2] or 1), 1)) * 100, 1)] for r in rows]
    if format == "pdf":
        return _pdf_response("course-completion.pdf", "Course Completion Report", [f"{r[0]} ({r[1]}): {r[6]}%" for r in report_rows])
    return _xlsx_response("course-completion.xlsx", report_rows, ["Subject", "Section", "Planned", "Regular Conducted", "Extra", "No Class", "% Complete"])


@soet_router.get("/reports/parent-summary/{student_id}")
def report_parent_summary(student_id: str, format: str = Query("pdf", pattern="^(pdf|xlsx)$"), auth: AuthContext = Depends(RequireRole(["MENTOR", "TEACHER", "HOD", "DEAN", "ADMIN"])), db: Session = Depends(get_db)):
    student = db.scalar(select(Student).where(Student.id == student_id))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if format == "xlsx":
        return _xlsx_response("parent-summary.xlsx", [[student.name, student.roll_no, student.course, student.attendance_percent]], ["Name", "Roll No.", "Programme", "Overall %"])
    return _pdf_response("parent-summary.pdf", "Parent Summary", [f"Student Profile: {student.name}", f"Overall Attendance: {student.attendance_percent}%", "Disclaimer: This report is system-generated."])


@soet_router.get("/notifications")
def list_notifications(unread: bool = Query(False), auth: AuthContext = Depends(RequireRole(["TEACHER", "MENTOR", "ACTIVITY_COORDINATOR", "HOD", "DEAN", "ADMIN"])), db: Session = Depends(get_db)):
    query = select(Notification).where(Notification.user_id == auth.user.id)
    if unread:
        query = query.where(Notification.read.is_(False))
    rows = db.scalars(query.order_by(Notification.created_at.desc()).limit(5)).all()
    return [{"id": str(row.id), "type": row.type, "message": row.message, "read": row.read, "created_at": row.created_at} for row in rows]
