import csv
import io
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.modules.reports.schemas import ReportRequest, ReportTypeEnum
from app.models.student import Student
from app.models.attendance_transaction import AttendanceTransaction

class ReportService:
    @staticmethod
    def generate_report(db: Session, req: ReportRequest) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output)
        
        if req.report_type == ReportTypeEnum.ATTENDANCE_SUMMARY:
            writer.writerow(["Student ID", "Name", "Total Classes", "Attended", "Attendance %"])
            # Mock data for Phase 6
            writer.writerow(["S001", "John Doe", "100", "85", "85.0%"])
            writer.writerow(["S002", "Jane Smith", "100", "92", "92.0%"])
            
        elif req.report_type == ReportTypeEnum.LOW_ATTENDANCE:
            writer.writerow(["Student ID", "Name", "Section", "Attendance %"])
            writer.writerow(["S003", "Alice Johnson", "CSE 2A", "65.0%"])
            
        elif req.report_type == ReportTypeEnum.LEAVE_SUMMARY:
            writer.writerow(["Teacher Name", "Leave Type", "From", "To", "Status"])
            writer.writerow(["Dr. A. Sharma", "Casual Leave", "2025-05-12", "2025-05-14", "Approved"])
            
        elif req.report_type == ReportTypeEnum.MENTOR_REPORT:
            writer.writerow(["Mentor Name", "Mentee Name", "Last Counselling Date", "Remarks"])
            writer.writerow(["Dr. A. Sharma", "John Doe", "2025-05-10", "Needs improvement in math"])
            
        else:
            writer.writerow(["Error", "Invalid report type"])

        return output.getvalue().encode("utf-8")
