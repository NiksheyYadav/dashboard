import { BulkUploadResponse } from "@/lib/types/attendance-upload";

const _BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Upload attendance CSV file for bulk processing.
 * TODO: Replace with real API:
 * const form = new FormData(); form.append("file", file);
 * axios.post<BulkUploadResponse>(`${BASE_URL}/attendance/bulk-upload`, form)
 */
export async function uploadAttendanceCSV(
    _file: File
): Promise<BulkUploadResponse> {
    console.log("[MOCK] Uploading attendance CSV:", _file.name);
    return {
        processed: 150,
        duplicates: 3,
        errors: [],
    };
}

/**
 * Download sample CSV template.
 * TODO: Replace with axios.get(`${BASE_URL}/attendance/template`, { responseType: "blob" })
 */
export async function downloadSampleCSV(): Promise<Blob> {
    const content =
        "Student_ID,Date (YYYY-MM-DD),Course_ID,Status\nCS20210042,2026-01-15,CS101,Present\nME20220158,2026-01-15,ME201,Absent";
    return new Blob([content], { type: "text/csv" });
}
