"use client";

import StatCard from "@/components/dashboard/StatCard";
import WeeklyTrendChart from "@/components/dashboard/WeeklyTrendChart";
import { useAuth } from "@/lib/auth/auth-context";
import { MOCK_WEEKLY_TREND } from "@/lib/data/mock-data";
import {
    CalendarCheck,
    CheckCircle2,
    Clock,
    FileText,
    Upload,
} from "lucide-react";
import Link from "next/link";

// Mock stats for student
const STUDENT_STATS = {
    attendancePercent: 92.4,
    attendanceTrend: 1.8,
    classesAttended: 142,
    totalClasses: 154,
    classesMissed: 12,
    cvStatus: "UPLOADED" as const,
};

const UPCOMING_CLASSES = [
    { id: 1, subject: "Data Structures & Algorithms", time: "09:00 AM", room: "E-201", professor: "Dr. Kumar" },
    { id: 2, subject: "Database Management Systems", time: "11:00 AM", room: "E-305", professor: "Prof. Singh" },
    { id: 3, subject: "Computer Networks", time: "02:00 PM", room: "E-102", professor: "Dr. Patel" },
    { id: 4, subject: "Software Engineering", time: "04:00 PM", room: "E-410", professor: "Prof. Sharma" },
];

export default function StudentDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.name?.split(" ")[0] ?? "Student"} 👋
                </h1>
                <p className="text-sm text-gray-500">
                    Here&apos;s your academic overview for today
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<CalendarCheck className="h-5 w-5 text-[#1a6fdb]" />}
                    iconBg="bg-blue-50"
                    label="My Attendance"
                    value={`${STUDENT_STATS.attendancePercent}%`}
                    trend={STUDENT_STATS.attendanceTrend}
                />
                <StatCard
                    icon={<CheckCircle2 className="h-5 w-5 text-[#059669]" />}
                    iconBg="bg-emerald-50"
                    label="Classes Attended"
                    value={STUDENT_STATS.classesAttended}
                    subtitle={`of ${STUDENT_STATS.totalClasses} total`}
                />
                <StatCard
                    icon={<Clock className="h-5 w-5 text-[#dc2626]" />}
                    iconBg="bg-red-50"
                    label="Classes Missed"
                    value={STUDENT_STATS.classesMissed}
                    actionLabel="View Details"
                    actionHref="/my-attendance"
                />
                <StatCard
                    icon={<FileText className="h-5 w-5 text-[#7c3aed]" />}
                    iconBg="bg-purple-50"
                    label="CV Status"
                    value={STUDENT_STATS.cvStatus === "UPLOADED" ? "Uploaded" : "Pending"}
                    actionLabel="Manage CV"
                    actionHref="/my-cv"
                />
            </div>

            {/* Charts + Upcoming Classes */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
                {/* Weekly Trend */}
                <WeeklyTrendChart data={MOCK_WEEKLY_TREND} />

                {/* Upcoming Classes */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-4 text-base font-semibold text-gray-900">
                        Today&apos;s Schedule
                    </h3>
                    <div className="space-y-3">
                        {UPCOMING_CLASSES.map((cls) => (
                            <div
                                key={cls.id}
                                className="flex items-start gap-3 rounded-lg border border-gray-50 p-3 transition-colors hover:bg-gray-50/50"
                            >
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                    <Clock className="h-4 w-4 text-[#1a6fdb]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {cls.subject}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {cls.time} · Room {cls.room} · {cls.professor}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                    href="/my-cv"
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-[#1a6fdb]/20 hover:bg-blue-50/30"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                        <Upload className="h-6 w-6 text-[#7c3aed]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Upload / Update CV</p>
                        <p className="text-xs text-gray-500">Keep your resume up to date</p>
                    </div>
                </Link>
                <Link
                    href="/my-attendance"
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-[#1a6fdb]/20 hover:bg-blue-50/30"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                        <CalendarCheck className="h-6 w-6 text-[#059669]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">View Attendance Report</p>
                        <p className="text-xs text-gray-500">Check your complete attendance records</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
