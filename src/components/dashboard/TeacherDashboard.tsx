"use client";

import DistributionDonut from "@/components/dashboard/DistributionDonut";
import StatCard from "@/components/dashboard/StatCard";
import StudentDirectoryTable from "@/components/dashboard/StudentDirectoryTable";
import WeeklyTrendChart from "@/components/dashboard/WeeklyTrendChart";
import { getDashboardStats } from "@/lib/api/analytics";
import { getDistribution, getWeeklyTrend } from "@/lib/api/attendance";
import { getStudents } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/auth-context";
import { PaginatedResponse } from "@/lib/types/api";
import { DashboardStats, DistributionData, WeeklyTrendData } from "@/lib/types/attendance";
import { Student } from "@/lib/types/student";
import { AlertTriangle, CalendarCheck, CloudUpload, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeacherDashboard() {
    const { role, user } = useAuth();
    const hasAttendanceAccess =
        role === "admin" ||
        role === "dean" ||
        role === "hod" ||
        (role === "coordinator" && user?.coordinatorType === "attendance");

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendData[]>([]);
    const [distribution, setDistribution] = useState<DistributionData | null>(null);
    const [students, setStudents] = useState<PaginatedResponse<Student> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [s, studs] = await Promise.all([
                    getDashboardStats(),
                    getStudents({ page: 1, limit: 4 }),
                ]);

                setStats(s);
                setStudents(studs);

                if (hasAttendanceAccess) {
                    const [wt, dist] = await Promise.all([
                        getWeeklyTrend().catch(() => [] as WeeklyTrendData[]),
                        getDistribution().catch(() => null),
                    ]);
                    setWeeklyTrend(wt);
                    setDistribution(dist);
                }
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [hasAttendanceAccess]);

    if (loading || !stats || !students) {
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
                {hasAttendanceAccess && (
                    <StatCard
                        icon={<CalendarCheck className="h-5 w-5 text-[#059669]" />}
                        iconBg="bg-emerald-50 dark:bg-emerald-950/30"
                        label="Avg Attendance"
                        value={`${stats.avgAttendance}%`}
                        trend={stats.avgAttendanceTrend}
                    />
                )}
                {hasAttendanceAccess && (
                    <StatCard
                        icon={<AlertTriangle className="h-5 w-5 text-[#dc2626]" />}
                        iconBg="bg-red-50 dark:bg-red-950/30"
                        label="Low Attendance"
                        value={stats.lowAttendance}
                        actionLabel="View List"
                        actionHref="/students?filter=low-attendance"
                    />
                )}
            </div>

            {/* Charts Row */}
            {hasAttendanceAccess && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <WeeklyTrendChart data={weeklyTrend} />
                    {distribution && <DistributionDonut data={distribution} />}
                </div>
            )}

            {/* Student Directory */}
            <StudentDirectoryTable initialData={students} />
        </div>
    );
}
