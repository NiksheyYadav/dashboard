import { MOCK_DASHBOARD_STATS } from "@/lib/data/mock-data";
import { DashboardStats } from "@/lib/types/attendance";

/**
 * Get dashboard summary statistics.
 * TODO: Replace with axios.get(`${BASE_URL}/analytics/summary`)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    return MOCK_DASHBOARD_STATS;
}
