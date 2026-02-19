"use client";

import AttendanceBarChart from "@/components/dashboard/AttendanceBarChart";
import DistributionDonut from "@/components/dashboard/DistributionDonut";
import StatCard from "@/components/dashboard/StatCard";
import StudentDirectoryTable from "@/components/dashboard/StudentDirectoryTable";
import WeeklyTrendChart from "@/components/dashboard/WeeklyTrendChart";
import { getDashboardStats } from "@/lib/api/analytics";
import { getDistribution, getTopPerformers, getWeeklyTrend } from "@/lib/api/attendance";
import { getStudents } from "@/lib/api/students";
import { PaginatedResponse } from "@/lib/types/api";
import { DashboardStats, DistributionData, TopPerformerData, WeeklyTrendData } from "@/lib/types/attendance";
import { Student } from "@/lib/types/student";
import { AlertTriangle, CalendarCheck, CloudUpload, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeacherDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [topPerformers, setTopPerformers] = useState<TopPerformerData[]>([]);
    const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendData[]>([]);
    const [distribution, setDistribution] = useState<DistributionData | null>(null);
    const [students, setStudents] = useState<PaginatedResponse<Student> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const [s, tp, wt, dist, studs] = await Promise.all([
                getDashboardStats(),
                getTopPerformers(),
                getWeeklyTrend(),
                getDistribution(),
                getStudents({ page: 1, limit: 4 }),
            ]);
            setStats(s);
            setTopPerformers(tp);
            setWeeklyTrend(wt);
            setDistribution(dist);
            setStudents(studs);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading || !stats || !distribution || !students) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#1a6fdb]" />
            </div>
        );
    }

    return (
        <div className="animate-slide-up space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<Users className="h-5 w-5 text-[#1a6fdb]" />}
                    iconBg="bg-blue-50 dark:bg-blue-950/30"
                    label="Total Students"
                    value={stats.totalStudents.toLocaleString()}
                    trend={stats.totalStudentsTrend}
                />
                <StatCard
                    icon={<CloudUpload className="h-5 w-5 text-[#7c3aed]" />}
                    iconBg="bg-purple-50 dark:bg-purple-950/30"
                    label="CVs Uploaded"
                    value={stats.cvsUploaded.toLocaleString()}
                    subtitle={stats.cvsUploadedLabel}
                />
                <StatCard
                    icon={<CalendarCheck className="h-5 w-5 text-[#059669]" />}
                    iconBg="bg-emerald-50 dark:bg-emerald-950/30"
                    label="Avg Attendance"
                    value={`${stats.avgAttendance}%`}
                    trend={stats.avgAttendanceTrend}
                />
                <StatCard
                    icon={<AlertTriangle className="h-5 w-5 text-[#dc2626]" />}
                    iconBg="bg-red-50 dark:bg-red-950/30"
                    label="Low Attendance"
                    value={stats.lowAttendance}
                    actionLabel="View List"
                    actionHref="/students?filter=low-attendance"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
                <AttendanceBarChart data={topPerformers} />
                <div className="flex flex-col gap-4">
                    <WeeklyTrendChart data={weeklyTrend} />
                    <DistributionDonut data={distribution} />
                </div>
            </div>

            {/* Student Directory */}
            <StudentDirectoryTable initialData={students} />
        </div>
    );
}
