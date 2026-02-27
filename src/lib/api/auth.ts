const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "/api/v1";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface MeResponse {
    id: string;
    email: string;
    status: string;
    department?: string | null;
}

export interface HealthResponse {
    status: string;
}

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

function buildUrl(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function backendHealthUrl(): string {
    try {
        const base = API_BASE_URL;
        // Handle relative URLs — proxy /health through the same rewrite
        if (base.startsWith("/")) {
            // Strip /api/v1 suffix and append /health
            const root = base.replace(/\/api\/v1\/?$/, "");
            return `${root}/health`;
        }
        const parsed = new URL(base);
        parsed.pathname = "/health";
        parsed.search = "";
        parsed.hash = "";
        return parsed.toString();
    } catch {
        return "/health";
    }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(buildUrl(path), {
        ...init,
        credentials: "include",
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
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
            // ignore
        }
        throw new ApiError(detail, response.status);
    }

    return response.json() as Promise<T>;
}

export async function loginWithPassword(payload: LoginPayload): Promise<TokenResponse> {
    return apiRequest<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getCurrentUser(accessToken: string): Promise<MeResponse> {
    return apiRequest<MeResponse>("/auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export async function refreshAccessToken(): Promise<TokenResponse> {
    return apiRequest<TokenResponse>("/auth/refresh", {
        method: "POST",
    });
}

export async function logoutSession(accessToken: string): Promise<{ detail: string }> {
    return apiRequest<{ detail: string }>("/auth/logout", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export async function getBackendHealth(): Promise<HealthResponse> {
    const response = await fetch(backendHealthUrl(), {
        method: "GET",
        credentials: "omit",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new ApiError("Backend health check failed", response.status);
    }

    return response.json() as Promise<HealthResponse>;
}
