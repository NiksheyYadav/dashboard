export type CVStatus = "UPLOADED" | "PENDING" | "REJECTED";
export type StudentStatus = "Active" | "Inactive";

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  course: string;
  department: string;
  avatarUrl?: string;
  cvStatus: CVStatus;
  attendancePercent: number;
  semester: number;
  email?: string;
  phone?: string;
  joinedDate?: string;
  status: StudentStatus;
}

export interface StudentQueryParams {
  page?: number;
  limit?: number;
  course?: string;
  semester?: number;
  search?: string;
  academicYear?: string;
  status?: StudentStatus;
}

export interface ReportFilters {
  course?: string;
  semester?: number;
  format?: "csv" | "pdf";
}
