from datetime import date, time

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.soet import Programme, Section, Semester, Subject, TimetableSlot
from app.models.student import Student
from app.models.user import User


def _get_or_create_programme(db, name: str, code: str) -> Programme:
    programme = db.scalar(select(Programme).where(Programme.code == code))
    if programme:
        return programme
    programme = Programme(name=name, code=code)
    db.add(programme)
    db.flush()
    return programme


def seed() -> None:
    db = SessionLocal()
    try:
        programmes = [
            _get_or_create_programme(db, "B.Tech Computer Science", "BTCS"),
            _get_or_create_programme(db, "B.Tech Electronics & Communication", "BTEC"),
            _get_or_create_programme(db, "B.Tech Mechanical Engineering", "BTME"),
        ]

        sem_4 = Semester(number=4, academic_year="2025-26")
        sem_6 = Semester(number=6, academic_year="2025-26")
        db.add_all([sem_4, sem_6])
        db.flush()

        sections = [
            Section(name="A", programme_id=programmes[0].id, semester_id=sem_4.id),
            Section(name="B", programme_id=programmes[0].id, semester_id=sem_4.id),
            Section(name="C", programme_id=programmes[1].id, semester_id=sem_6.id),
            Section(name="D", programme_id=programmes[2].id, semester_id=sem_6.id),
        ]
        db.add_all(sections)
        db.flush()

        teachers = list(db.scalars(select(User).limit(6)).all())
        subjects = [
            Subject(code="CS401", name="Operating Systems", credits=4, programme_id=programmes[0].id, semester_id=sem_4.id, planned_lecture_count=48, assigned_teacher_id=teachers[0].id if len(teachers) > 0 else None),
            Subject(code="CS402", name="Database Systems", credits=4, programme_id=programmes[0].id, semester_id=sem_4.id, planned_lecture_count=48, assigned_teacher_id=teachers[1].id if len(teachers) > 1 else None),
            Subject(code="CS601", name="Machine Learning", credits=4, programme_id=programmes[0].id, semester_id=sem_6.id, planned_lecture_count=42, assigned_teacher_id=teachers[2].id if len(teachers) > 2 else None),
            Subject(code="EC601", name="Digital Communication", credits=4, programme_id=programmes[1].id, semester_id=sem_6.id, planned_lecture_count=42, assigned_teacher_id=teachers[3].id if len(teachers) > 3 else None),
            Subject(code="ME601", name="Thermal Engineering", credits=4, programme_id=programmes[2].id, semester_id=sem_6.id, planned_lecture_count=42, assigned_teacher_id=teachers[4].id if len(teachers) > 4 else None),
            Subject(code="AS401", name="Engineering Mathematics", credits=3, programme_id=programmes[2].id, semester_id=sem_4.id, planned_lecture_count=36, assigned_teacher_id=teachers[5].id if len(teachers) > 5 else None),
        ]
        db.add_all(subjects)
        db.flush()

        slots = [
            TimetableSlot(
                weekday="Monday",
                start_time=time(9, 0),
                end_time=time(9, 50),
                subject_id=subjects[0].id,
                section_id=sections[0].id,
                room="E-204",
                lecture_type="regular",
                effective_from=date(2026, 1, 1),
                effective_to=date(2026, 6, 30),
            ),
            TimetableSlot(
                weekday="Tuesday",
                start_time=time(10, 0),
                end_time=time(10, 50),
                subject_id=subjects[1].id,
                section_id=sections[1].id,
                room="E-205",
                lecture_type="regular",
                effective_from=date(2026, 1, 1),
                effective_to=date(2026, 6, 30),
            ),
        ]
        db.add_all(slots)

        existing_students = db.scalar(select(Student.id).limit(1))
        if not existing_students:
            for i in range(45):
                db.add(
                    Student(
                        name=f"Student {i+1}",
                        roll_no=f"SOET25{i+1:03d}",
                        course="B.Tech CS",
                        department="SOET",
                        semester=4 if i < 25 else 6,
                        email=f"student{i+1}@sgtu.edu",
                        phone=f"999990{i+1:04d}"[-10:],
                    )
                )

        db.commit()
        print("SOET v2 seed data inserted.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
