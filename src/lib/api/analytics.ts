import { apiGet } from "@/lib/api/client";
import { DashboardStats } from "@/lib/types/attendance";

/**
 * Get dashboard summary statistics.
 * TODO: Replace with axios.get(`${BASE_URL}/analytics/summary`)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    return apiGet<DashboardStats>("/analytics/summary");
}
