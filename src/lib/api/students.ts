import { MOCK_STUDENTS } from "@/lib/data/mock-data";
import { PaginatedResponse } from "@/lib/types/api";
import { ReportFilters, Student, StudentQueryParams } from "@/lib/types/student";

// Base URL — switch to env var for backend integration
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Get paginated student list.
 * TODO: Replace mock implementation with real API call:
 * axios.get<PaginatedResponse<Student>>(`${BASE_URL}/students`, { params })
 */
export async function getStudents(
    params: StudentQueryParams = {}
): Promise<PaginatedResponse<Student>> {
    const { page = 1, limit = 4, course, semester, search, status } = params;

    let filtered = [...MOCK_STUDENTS];

    if (course && course !== "all") {
        filtered = filtered.filter((s) =>
            s.course.toLowerCase().replace(/[\s.]/g, "-").includes(course)
        );
    }
    if (semester) {
        filtered = filtered.filter((s) => s.semester === semester);
    }
    if (status) {
        filtered = filtered.filter((s) => s.status === status);
    }
    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.rollNo.toLowerCase().includes(q) ||
                s.course.toLowerCase().includes(q)
        );
    }

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
        data,
        total: 1248, // Mock total for pagination display
        page,
        limit,
    };
}

/**
 * Get student by ID.
 * TODO: Replace with axios.get<Student>(`${BASE_URL}/students/${id}`)
 */
export async function getStudentById(id: string): Promise<Student | undefined> {
    return MOCK_STUDENTS.find((s) => s.id === id);
}

/**
 * Create a new student.
 * TODO: Replace with axios.post<Student>(`${BASE_URL}/students`, data)
 */
export async function createStudent(
    data: Omit<Student, "id" | "cvStatus" | "attendancePercent" | "status" | "department">
): Promise<Student> {
    console.log("[MOCK] Creating student:", data);
    const newStudent: Student = {
        ...data,
        id: String(Date.now()),
        cvStatus: "PENDING",
        attendancePercent: 0,
        status: "Active",
        department: data.course,
    };
    return newStudent;
}

/**
 * Upload student CV.
 * TODO: Replace with real multipart/form-data POST:
 * const form = new FormData(); form.append("file", file);
 * axios.post(`${BASE_URL}/cv/upload?studentId=${studentId}`, form)
 */
export async function uploadStudentCV(
    studentId: string,
    _file: File
): Promise<{ success: boolean }> {
    console.log(`[MOCK] Uploading CV for student ${studentId}`, _file.name);
    return { success: true };
}

/**
 * Export student report.
 * TODO: Replace with axios.get(`${BASE_URL}/students/export`, { params: filters, responseType: "blob" })
 */
export async function exportStudentReport(
    _filters: ReportFilters
): Promise<Blob> {
    console.log("[MOCK] Exporting report with filters", _filters);
    return new Blob(["mock csv data"], { type: "text/csv" });
}

// Re-export BASE_URL for other API modules
export { BASE_URL };
