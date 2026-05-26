/**
 * Shared API base URL for all frontend API calls.
 * Uses NEXT_PUBLIC_API_URL env var if set, otherwise falls back to "/api/v1"
 * which works both locally (via Next.js rewrites) and on Vercel (via vercel.json rewrites).
 */
export const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "/api/v1";

/**
 * Helper to build a full API URL from a path.
 * @param path - e.g. "/attendance/mark" or "attendance/mark"
 */
export function apiUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE}${cleanPath}`;
}
