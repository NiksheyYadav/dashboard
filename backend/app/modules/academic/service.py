import io
import pandas as pd
from datetime import datetime
from uuid import UUID
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

import secrets
from app.models.import_log import ImportLog
from app.models.user import User
from app.models.student import Student
from app.modules.auth.service import AuthService
from app.utils.email import send_welcome_email
from app.modules.academic.parser import (
    parse_timetable,
    parse_faculty_mapping,
    parse_subject_allocation,
    parse_student_master,
    parse_mentor_mapping,
)
from app.modules.academic.schemas import ImportHistoryOut, ImportPreviewOut

class AcademicService:
    @staticmethod
    def get_template(template_type: str) -> io.BytesIO:
        """Generate empty Excel templates for download."""
        output = io.BytesIO()
        writer = pd.ExcelWriter(output, engine='openpyxl')
        
        columns_map = {
            "timetable": ["Day", "Slot", "Subject Code", "Section", "Teacher Email", "Room", "Type (Theory/Lab)"],
            "faculty": ["Name", "Email", "Department", "Designation", "Roles"],
            "subjects": ["Subject Code", "Subject Name", "Programme", "Semester", "Credits", "Section", "Planned Lectures"],
            "students": ["Roll No", "Name", "Programme", "Semester", "Section", "Batch", "Email", "Phone", "Parent Name", "Parent Phone"],
            "mentors": ["Mentor Email", "Student Roll No"],
        }
        
        cols = columns_map.get(template_type, ["Column1", "Column2"])
        df = pd.DataFrame(columns=cols)
        df.to_excel(writer, index=False, sheet_name="Template")
        writer.close()
        output.seek(0)
        return output

    @staticmethod
    async def process_import(db: Session, file: UploadFile, import_type: str, user_id: str) -> ImportPreviewOut:
        content = await file.read()
        filename = file.filename
        
        # Parse based on type
        if import_type == "timetable":
            res = parse_timetable(content, filename)
        elif import_type == "faculty":
            res = parse_faculty_mapping(content, filename)
        elif import_type == "subjects":
            res = parse_subject_allocation(content, filename)
        elif import_type == "students":
            res = parse_student_master(content, filename)
        elif import_type == "mentors":
            res = parse_mentor_mapping(content, filename)
        else:
            raise HTTPException(status_code=400, detail="Invalid import type")

        # Create import log in PREVIEW status
        log = ImportLog(
            file_name=filename,
            file_type=filename.split(".")[-1][:20],
            import_type=import_type,
            uploaded_by=UUID(user_id),
            status="preview",
            total_records=res["total_records"],
            success_count=res["success_count"],
            error_count=res["error_count"],
            warnings_count=res["warnings_count"],
            errors_json=res["errors"],
            preview_data=res["preview_data"],
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return ImportPreviewOut(
            import_id=str(log.id),
            total_records=log.total_records,
            success_count=log.success_count,
            error_count=log.error_count,
            warnings_count=log.warnings_count,
            preview_data=log.preview_data,
            errors=log.errors_json,
        )

    @staticmethod
    def commit_import(db: Session, import_id: str, user_id: str) -> bool:
        log = db.scalar(select(ImportLog).where(ImportLog.id == UUID(import_id)))
        if not log:
            raise HTTPException(status_code=404, detail="Import not found")
        if log.status != "preview":
            raise HTTPException(status_code=400, detail="Import is not in preview state")

        # Implementation of actual DB insertion into core tables based on log.import_type
        if log.import_type == "faculty":
            for row in log.preview_data:
                email = str(row.get("Email", "")).strip().lower()
                name = str(row.get("Name", "")).strip()
                department = str(row.get("Department", "")).strip()
                designation = str(row.get("Designation", "")).strip()
                
                if not email:
                    continue
                
                existing = db.scalar(select(User).where(User.email == email))
                if not existing:
                    raw_password = secrets.token_urlsafe(8)
                    new_user = AuthService.register_user(
                        db, email=email, password=raw_password, department=department
                    )
                    new_user.name = name
                    new_user.designation = designation
                    send_welcome_email(to_email=email, raw_password=raw_password, role="faculty")
                    
        elif log.import_type == "students":
            for row in log.preview_data:
                roll_no = str(row.get("Roll No", "")).strip()
                name = str(row.get("Name", "")).strip()
                programme = str(row.get("Programme", "")).strip()
                semester = row.get("Semester", 1)
                batch = str(row.get("Batch", "")).strip()
                
                if not roll_no:
                    continue
                
                try:
                    sem_int = int(semester)
                except ValueError:
                    sem_int = 1
                
                existing = db.scalar(select(Student).where(Student.roll_no == roll_no))
                if not existing:
                    new_student = Student(
                        roll_no=roll_no,
                        name=name,
                        course=programme,
                        department="Unknown", 
                        semester=sem_int,
                        batch=batch
                    )
                    db.add(new_student)

        log.status = "committed"
        log.committed_at = datetime.utcnow()
        db.commit()
        return True

    @staticmethod
    def rollback_import(db: Session, import_id: str, user_id: str) -> bool:
        log = db.scalar(select(ImportLog).where(ImportLog.id == UUID(import_id)))
        if not log:
            raise HTTPException(status_code=404, detail="Import not found")
        if log.status != "committed":
            raise HTTPException(status_code=400, detail="Import is not committed")

        # Implement rollback logic here (delete records linked to this import)
        log.status = "rolled_back"
        log.rolled_back_at = datetime.utcnow()
        db.commit()
        return True

    @staticmethod
    def get_import_history(db: Session) -> list[ImportHistoryOut]:
        logs = db.scalars(select(ImportLog).order_by(ImportLog.created_at.desc()).limit(50)).all()
        return [ImportHistoryOut.model_validate(log) for log in logs]
