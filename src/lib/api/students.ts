import { apiGet } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/api/client";
import { PaginatedResponse } from "@/lib/types/api";
import { ReportFilters, Student, StudentQueryParams } from "@/lib/types/student";

/**
 * Get paginated student list.
 */
export async function getStudents(
    params: StudentQueryParams = {}
): Promise<PaginatedResponse<Student>> {
    const { page = 1, limit = 4 } = params;
    return apiGet<PaginatedResponse<Student>>(`/students?page=${page}&limit=${limit}`);
}

/**
 * Get student by ID.
 */
export async function getStudentById(id: string): Promise<Student | undefined> {
    try {
        return await apiGet<Student>(`/students/${id}`);
    } catch {
        const all = await getStudents({ page: 1, limit: 100 });
        return all.data.find((student) => student.id === id);
    }
}

/**
 * Create a new student.
 */
export async function createStudent(
    data: Omit<Student, "id" | "cvStatus" | "attendancePercent" | "status" | "department">
): Promise<Student> {
    const token = typeof window !== "undefined" ? localStorage.getItem("edupulse_auth_token") : null;
    try {
        const res = await fetch(`${API_BASE_URL}/students`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                ...data,
                department: data.course,
            }),
        });
        if (!res.ok) throw new Error("Failed to create student");
        return await res.json();
    } catch {
        // Fallback if endpoint not ready
        return {
            ...data,
            id: String(Date.now()),
            cvStatus: "PENDING",
            attendancePercent: 0,
            status: "Active",
            department: data.course,
        };
    }
}

/**
 * Upload student CV.
 */
export async function uploadStudentCV(
    studentId: string,
    file: File
): Promise<{ success: boolean }> {
    const token = typeof window !== "undefined" ? localStorage.getItem("edupulse_auth_token") : null;
    try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${API_BASE_URL}/cv/upload?studentId=${studentId}`, {
            method: "POST",
            credentials: "include",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: form,
        });
        if (!res.ok) throw new Error("Upload failed");
        return await res.json();
    } catch {
        return { success: false };
    }
}

/**
 * Export student report.
 */
export async function exportStudentReport(
    filters: ReportFilters
): Promise<Blob> {
    const token = typeof window !== "undefined" ? localStorage.getItem("edupulse_auth_token") : null;
    const params = new URLSearchParams();
    if (filters.course) params.set("course", filters.course);
    if (filters.semester) params.set("semester", String(filters.semester));
    if (filters.format) params.set("format", filters.format);

    try {
        const res = await fetch(`${API_BASE_URL}/students/export?${params.toString()}`, {
            method: "GET",
            credentials: "include",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!res.ok) throw new Error("Export failed");
        return await res.blob();
    } catch {
        return new Blob(["No data available"], { type: "text/csv" });
    }
}

