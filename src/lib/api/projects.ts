import { ApiError } from "@/lib/api/auth";
import { API_BASE_URL, apiGet } from "@/lib/api/client";
import {
    AssignedStudent,
    Project,
    ProjectFormData
} from "@/lib/types/project";

function getAccessToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }
    return localStorage.getItem("edupulse_auth_token");
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        let detail = "Request failed";
        try {
            const data = (await response.json()) as { detail?: string };
            if (data?.detail) {
                detail = data.detail;
            }
        } catch {
            // ignore
        }
        throw new ApiError(detail, response.status);
    }

    return response.json() as Promise<T>;
}

async function apiPut<T>(path: string, body?: unknown): Promise<T> {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "PUT",
        credentials: "include",
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        let detail = "Request failed";
        try {
            const data = (await response.json()) as { detail?: string };
            if (data?.detail) {
                detail = data.detail;
            }
        } catch {
            // ignore
        }
        throw new ApiError(detail, response.status);
    }

    return response.json() as Promise<T>;
}

async function apiDelete<T>(path: string): Promise<T> {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        let detail = "Request failed";
        try {
            const data = (await response.json()) as { detail?: string };
            if (data?.detail) {
                detail = data.detail;
            }
        } catch {
            // ignore
        }
        throw new ApiError(detail, response.status);
    }

    return response.json() as Promise<T>;
}

/**
 * Get all projects with optional filtering.
 */
export async function getProjects(filters?: {
    status?: string;
    type?: string;
    search?: string;
}): Promise<Project[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type_filter", filters.type);
    if (filters?.search) params.append("search", filters.search);

    const queryString = params.toString();
    return apiGet<Project[]>(`/projects${queryString ? `?${queryString}` : ""}`);
}

/**
 * Get a single project by ID.
 */
export async function getProjectById(id: string): Promise<Project> {
    return apiGet<Project>(`/projects/${id}`);
}

/**
 * Create a new project.
 */
export async function createProject(data: ProjectFormData): Promise<Project> {
    // Faculty coordinator is populated by the backend from the authenticated user
    const payload: Record<string, unknown> = {
        title: data.title,
        type: data.type,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        flow: data.flow || "internal",
    };

    // Add external faculty if project is external
    if (data.flow === "external" && data.externalFaculty) {
        payload.externalFaculty = data.externalFaculty;
    }

    return apiPost<Project>("/projects", payload);
}

/**
 * Update a project.
 */
export async function updateProject(id: string, data: Partial<ProjectFormData>): Promise<Project> {
    const payload: Record<string, unknown> = {};

    if (data.title) payload.title = data.title;
    if (data.type) payload.type = data.type;
    if (data.description) payload.description = data.description;
    if (data.startDate) payload.startDate = data.startDate;
    if (data.endDate) payload.endDate = data.endDate;

    return apiPut<Project>(`/projects/${id}`, payload);
}

/**
 * Delete a project.
 */
export async function deleteProject(id: string): Promise<{ message: string }> {
    return apiDelete<{ message: string }>(`/projects/${id}`);
}

/**
 * Approve a pending project.
 */
export async function approveProject(id: string): Promise<Project> {
    return apiPost<Project>(`/projects/${id}/approve`);
}

/**
 * Reject a pending project.
 */
export async function rejectProject(id: string, reason: string): Promise<Project> {
    return apiPost<Project>(`/projects/${id}/reject?reason=${encodeURIComponent(reason)}`);
}

/**
 * Add a student to a project.
 */
export async function addStudentToProject(
    projectId: string,
    student: AssignedStudent
): Promise<Project> {
    return apiPost<Project>(`/projects/${projectId}/students`, student);
}

/**
 * Remove a student from a project.
 */
export async function removeStudentFromProject(
    projectId: string,
    studentId: string
): Promise<Project> {
    return apiDelete<Project>(`/projects/${projectId}/students/${studentId}`);
}

/**
 * Mark a project as completed.
 */
export async function completeProject(id: string): Promise<Project> {
    return apiPost<Project>(`/projects/${id}/complete`);
}
