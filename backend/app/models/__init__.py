# Existing models
from app.models.announcement import Announcement
from app.models.anonymous_message import AnonymousMessage
from app.models.event import Event
from app.models.form import FormDefinition, FormResponse
from app.models.password_reset import PasswordResetToken
from app.models.placement_record import PlacementRecord
from app.models.project import Project
from app.models.refresh_token import RefreshToken
from app.models.session import Session
from app.models.student import Student
from app.models.user import User

# SOET Academic Structure models
from app.models.academic_year import AcademicYear
from app.models.programme import Programme
from app.models.semester import Semester
from app.models.section import Section
from app.models.subject import Subject
from app.models.timetable_slot import TimetableSlot
from app.models.mentor_mapping import MentorMapping

# SOET Attendance & Workflow models
from app.models.attendance_transaction import AttendanceTransaction
from app.models.leave_request import LeaveRequest
from app.models.arrangement_assignment import ArrangementAssignment
from app.models.extra_class import ExtraClass
from app.models.activity import Activity
from app.models.activity_participant import ActivityParticipant
from app.models.regularization_request import RegularizationRequest

# SOET Mentorship & Warning models
from app.models.counselling_note import CounsellingNote
from app.models.parent_communication import ParentCommunication
from app.models.warning_letter import WarningLetter

# System models
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.models.import_log import ImportLog

__all__ = [
    # Original
    "User", "Session", "RefreshToken", "Student",
    "PasswordResetToken", "AnonymousMessage", "PlacementRecord",
    "Announcement", "Event", "Project", "FormDefinition", "FormResponse",
    # SOET Academic
    "AcademicYear", "Programme", "Semester", "Section", "Subject",
    "TimetableSlot", "MentorMapping",
    # SOET Attendance
    "AttendanceTransaction", "LeaveRequest", "ArrangementAssignment",
    "ExtraClass", "Activity", "ActivityParticipant", "RegularizationRequest",
    # SOET Mentorship
    "CounsellingNote", "ParentCommunication", "WarningLetter",
    # System
    "AuditLog", "Notification", "ImportLog",
]
