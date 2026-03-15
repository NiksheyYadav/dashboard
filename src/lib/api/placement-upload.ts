import { API_BASE_URL } from "@/lib/api/client";
import { PlacementUploadResponse } from "@/lib/types/placement-upload";

function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("edupulse_auth_token");
}

/**
 * Upload placement data from a CSV or Excel file.
 */
export async function uploadPlacementData(
    file: File
): Promise<PlacementUploadResponse> {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/placement/upload`, {
        method: "POST",
        credentials: "include",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        let detail = "Upload failed";
        try {
            const body = (await response.json()) as { detail?: string };
            if (body?.detail) detail = body.detail;
        } catch {
            // ignore
        }
        throw new Error(detail);
    }

    return response.json() as Promise<PlacementUploadResponse>;
}

/**
 * Template column headers matching the Heading.csv format.
 */
const TEMPLATE_HEADERS = [
    "Sl. No.",
    "Roll No.",
    "STUDENT'S NAME",
    "Photo Id",
    "Gender",
    "Type",
    "Contact No.",
    "E-mail",
    "X Result",
    "XII Result",
    "Course",
    "Branch",
    "Designation",
    "Name of the company",
    "Industry",
    "Date of Drive",
    "Company Offers 1",
    "Probation/Training duration",
    "Stipend during training per month",
    "Package",
    "Offer letter",
    "Email/Contact Details of HR",
];

/**
 * Download the placement template as a CSV file.
 * Generates the file client-side so it works without backend.
 */
export function downloadPlacementTemplate(): void {
    const csvContent = TEMPLATE_HEADERS.map((h) =>
        h.includes(",") ? `"${h}"` : h
    ).join(",");
    const blob = new Blob(["\uFEFF" + csvContent + "\n"], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Placement_Template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
