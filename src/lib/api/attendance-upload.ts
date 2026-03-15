import { BulkUploadResponse } from "@/lib/types/attendance-upload";

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Upload attendance CSV file for bulk processing.
 */
export async function uploadAttendanceCSV(
    file: File
): Promise<BulkUploadResponse> {
    const form = new FormData();
    form.append("file", file);
    try {
        const res = await fetch(`${BASE_URL}/attendance/bulk-upload`, {
            method: "POST",
            body: form,
        });
        if (!res.ok) throw new Error("Upload failed");
        return await res.json();
    } catch {
        console.warn("Attendance upload API not available, returning empty result");
        return { processed: 0, duplicates: 0, errors: ["Backend not available"] };
    }
}

/**
 * Download sample CSV template with Name, Roll No., and 30 Lecture columns.
 */
export async function downloadSampleCSV(): Promise<Blob> {
    const lectureHeaders = Array.from({ length: 30 }, (_, i) => `Lecture ${i + 1}`);
    const headers = ["Name", "Roll No.", ...lectureHeaders];
    const content = headers.join(",");
    return new Blob([content], { type: "text/csv" });
}

