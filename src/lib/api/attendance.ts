import { apiGet } from "@/lib/api/client";
import { DistributionData, WeeklyTrendData } from "@/lib/types/attendance";

/**
 * Get weekly attendance trend data.
 * TODO: Replace with axios.get(`${BASE_URL}/attendance?type=weekly`)
 */
export async function getWeeklyTrend(): Promise<WeeklyTrendData[]> {
    return apiGet<WeeklyTrendData[]>("/attendance/weekly");
}

/**
 * Get overall attendance distribution.
 * TODO: Replace with axios.get(`${BASE_URL}/attendance/summary`)
 */
export async function getDistribution(): Promise<DistributionData> {
    return apiGet<DistributionData>("/attendance/summary");
}
