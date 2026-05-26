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

        elif req.report_type == ReportTypeEnum.EXTRA_CLASS:
            writer.writerow(["Teacher", "Subject", "Section", "Date", "Start Time", "End Time", "Type", "Conducted"])
            writer.writerow(["Dr. A. Sharma", "Data Structures", "CSE 3A", "2025-05-15", "14:00", "15:00", "Extra", "Yes"])
            writer.writerow(["Prof. R. Kumar", "DBMS", "CSE 3B", "2025-05-16", "16:00", "17:00", "Makeup", "No"])

        elif req.report_type == ReportTypeEnum.ACTIVITY:
            writer.writerow(["Activity Name", "Type", "Coordinator", "Date", "Participants", "Approved", "Attendance Credited"])
            writer.writerow(["AI Workshop", "Workshop", "Dr. S. Verma", "2025-05-10", "45", "Yes", "Yes"])
            writer.writerow(["Industrial Visit", "Industrial Visit", "Dr. P. Singh", "2025-05-08", "30", "Yes", "Yes"])

        elif req.report_type == ReportTypeEnum.COURSE_COMPLETION:
            writer.writerow(["Subject Code", "Subject Name", "Section", "Planned Lectures", "Conducted", "Completion %"])
            writer.writerow(["CS301", "Data Structures", "CSE 3A", "45", "38", "84.4%"])
            writer.writerow(["CS302", "DBMS", "CSE 3A", "45", "42", "93.3%"])

        elif req.report_type == ReportTypeEnum.STUDENT_WISE:
            writer.writerow(["Roll No", "Student Name", "Section", "Subject", "Total", "Attended", "Absent", "Attendance %", "Risk Level"])
            writer.writerow(["22CS101", "Rahul Sharma", "CSE 3A", "Data Structures", "38", "32", "6", "84.2%", "Safe"])
            writer.writerow(["22CS113", "Karan Mehta", "CSE 3A", "Data Structures", "38", "18", "20", "47.4%", "Detention"])
            
        else:
            writer.writerow(["Error", "Invalid report type"])

        return output.getvalue().encode("utf-8")
