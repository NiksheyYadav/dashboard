"use client";

import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type AttendanceStatus = "Present" | "Absent" | "Leave";

interface AttendanceRecord {
    id: string;
    date: string;
    subject: string;
    status: AttendanceStatus;
    time: string;
}

const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
    { id: "1", date: "2026-02-19", subject: "Data Structures & Algorithms", status: "Present", time: "09:00 AM" },
    { id: "2", date: "2026-02-19", subject: "Database Management Systems", status: "Present", time: "11:00 AM" },
    { id: "3", date: "2026-02-18", subject: "Computer Networks", status: "Absent", time: "02:00 PM" },
    { id: "4", date: "2026-02-18", subject: "Software Engineering", status: "Present", time: "04:00 PM" },
    { id: "5", date: "2026-02-17", subject: "Data Structures & Algorithms", status: "Present", time: "09:00 AM" },
    { id: "6", date: "2026-02-17", subject: "Database Management Systems", status: "Leave", time: "11:00 AM" },
    { id: "7", date: "2026-02-14", subject: "Computer Networks", status: "Present", time: "02:00 PM" },
    { id: "8", date: "2026-02-14", subject: "Software Engineering", status: "Present", time: "04:00 PM" },
    { id: "9", date: "2026-02-13", subject: "Data Structures & Algorithms", status: "Present", time: "09:00 AM" },
    { id: "10", date: "2026-02-13", subject: "Database Management Systems", status: "Absent", time: "11:00 AM" },
];

const statusColors: Record<AttendanceStatus, string> = {
    Present: "bg-emerald-50 text-emerald-600",
    Absent: "bg-red-50 text-red-500",
    Leave: "bg-amber-50 text-amber-600",
};

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function MyAttendancePage() {
    const [filter, setFilter] = useState<"all" | AttendanceStatus>("all");

    const filtered =
        filter === "all"
            ? MOCK_ATTENDANCE_RECORDS
            : MOCK_ATTENDANCE_RECORDS.filter((r) => r.status === filter);

    const presentCount = MOCK_ATTENDANCE_RECORDS.filter((r) => r.status === "Present").length;
    const absentCount = MOCK_ATTENDANCE_RECORDS.filter((r) => r.status === "Absent").length;
    const leaveCount = MOCK_ATTENDANCE_RECORDS.filter((r) => r.status === "Leave").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
                <p className="text-sm text-gray-500">
                    Your complete attendance records for the current semester
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-400">Total Classes</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{MOCK_ATTENDANCE_RECORDS.length}</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
                    <p className="text-xs font-medium text-emerald-600">Present</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">{presentCount}</p>
                </div>
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 shadow-sm">
                    <p className="text-xs font-medium text-red-500">Absent</p>
                    <p className="mt-1 text-2xl font-bold text-red-600">{absentCount}</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
                    <p className="text-xs font-medium text-amber-600">Leave</p>
                    <p className="mt-1 text-2xl font-bold text-amber-700">{leaveCount}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
                {(["all", "Present", "Absent", "Leave"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${filter === f
                                ? "bg-[#1a6fdb] text-white"
                                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        {f === "all" ? "All" : f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Date
                                </th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Subject
                                </th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Time
                                </th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((record) => (
                                <tr
                                    key={record.id}
                                    className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                                >
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <CalendarCheck className="h-4 w-4 text-gray-300" />
                                            <span className="text-sm text-gray-700">
                                                {formatDate(record.date)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                                        {record.subject}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-gray-500">
                                        {record.time}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[record.status]}`}
                                        >
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-12 text-center text-sm text-gray-400"
                                    >
                                        No records found for this filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-700">{filtered.length}</span> records
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            disabled
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a6fdb] text-sm font-medium text-white">
                            1
                        </button>
                        <button
                            disabled
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
