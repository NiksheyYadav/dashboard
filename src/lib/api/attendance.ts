import {
    MOCK_DISTRIBUTION,
    MOCK_TOP_PERFORMERS,
    MOCK_WEEKLY_TREND,
} from "@/lib/data/mock-data";
import { DistributionData, TopPerformerData, WeeklyTrendData } from "@/lib/types/attendance";

/**
 * Get top-performing students' attendance.
 * TODO: Replace with axios.get(`${BASE_URL}/attendance?type=top&semester=current`)
 */
export async function getTopPerformers(
    _semester?: string
): Promise<TopPerformerData[]> {
    return MOCK_TOP_PERFORMERS;
}

/**
 * Get weekly attendance trend data.
 * TODO: Replace with axios.get(`${BASE_URL}/attendance?type=weekly`)
 */
export async function getWeeklyTrend(): Promise<WeeklyTrendData[]> {
    return MOCK_WEEKLY_TREND;
}

/**
 * Get overall attendance distribution.
 * TODO: Replace with axios.get(`${BASE_URL}/attendance/summary`)
 */
export async function getDistribution(): Promise<DistributionData> {
    return MOCK_DISTRIBUTION;
}
