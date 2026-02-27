import { ApiError } from "@/lib/api/auth";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "/api/v1";

function buildUrl(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function getAccessToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }
    return localStorage.getItem("edupulse_auth_token");
}

export async function apiGet<T>(path: string): Promise<T> {
    const token = getAccessToken();
    const response = await fetch(buildUrl(path), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        let detail = "Request failed";
        try {
            const body = (await response.json()) as { detail?: string };
            if (body?.detail) {
                detail = body.detail;
            }
        } catch {
            // ignore parsing errors
        }
        throw new ApiError(detail, response.status);
    }

    return response.json() as Promise<T>;
}
