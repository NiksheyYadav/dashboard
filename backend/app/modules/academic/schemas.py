from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime, time

class AcademicYearBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    is_current: bool = False

class AcademicYearOut(AcademicYearBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class ProgrammeBase(BaseModel):
    name: str
    code: str
    department: str
    academic_year_id: Optional[str] = None
    is_active: bool = True

class ProgrammeOut(ProgrammeBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class SemesterBase(BaseModel):
    number: int
    programme_id: str
    academic_year_id: Optional[str] = None
    is_active: bool = True

class SemesterOut(SemesterBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class SectionBase(BaseModel):
    name: str
    semester_id: str
    programme_id: str
    max_students: Optional[int] = 60

class SectionOut(SectionBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class SubjectBase(BaseModel):
    code: str
    name: str
    credits: int = 0
    programme_id: str
    semester_id: str
    section_id: Optional[str] = None
    planned_lectures: int = 0
    assigned_teacher_id: Optional[str] = None
    is_active: bool = True

class SubjectOut(SubjectBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class TimetableSlotBase(BaseModel):
    day_of_week: int
    slot_number: int
    start_time: time
    end_time: time
    subject_id: str
    section_id: str
    teacher_id: Optional[str] = None
    room: Optional[str] = None
    lecture_type: str = "theory"
    lab_group: Optional[str] = None
    is_active: bool = True

class TimetableSlotOut(TimetableSlotBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class ImportHistoryOut(BaseModel):
    id: str
    file_name: str
    file_type: str
    import_type: str
    status: str
    total_records: int
    success_count: int
    error_count: int
    warnings_count: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ImportErrorDetail(BaseModel):
    row: Optional[int] = None
    field: Optional[str] = None
    message: str

class ImportPreviewOut(BaseModel):
    import_id: str
    total_records: int
    success_count: int
    error_count: int
    warnings_count: int
    preview_data: Optional[List[Dict[str, Any]]] = None
    errors: Optional[List[ImportErrorDetail]] = None
