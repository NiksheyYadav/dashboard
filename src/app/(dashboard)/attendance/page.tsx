"use client";

import FileDropZone from "@/components/attendance/FileDropZone";
import FileQueueItem from "@/components/attendance/FileQueueItem";
import ValidationInfoCard from "@/components/attendance/ValidationInfoCard";
import DistributionDonut from "@/components/dashboard/DistributionDonut";
import StatCard from "@/components/dashboard/StatCard";
import WeeklyTrendChart from "@/components/dashboard/WeeklyTrendChart";
import RequireRole from "@/components/providers/RequireRole";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/api/analytics";
import { getDistribution, getWeeklyTrend } from "@/lib/api/attendance";

import { useAuth } from "@/lib/auth/auth-context";
import { DashboardStats, DistributionData, WeeklyTrendData } from "@/lib/types/attendance";
import { UploadedFile } from "@/lib/types/attendance-upload";
import {
    AlertCircle,
    AlertTriangle,
    CalendarCheck,
    ChevronRight,
    Download,
    FileText,
    ListChecks,
    ShieldCheck,
    Upload,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

let fileIdCounter = 0;

/* ─── Department-wise attendance by period (static until backend is built) ─── */
type TimePeriod = "daily" | "weekly" | "monthly";

const DEPT_ATTENDANCE: Record<TimePeriod, { department: string; attendance: number }[]> = {
    daily: [
        { department: "CSE", attendance: 82.1 },
        { department: "ECE", attendance: 74.5 },
        { department: "ME", attendance: 65.3 },
        { department: "Civil", attendance: 71.8 },
        { department: "EE", attendance: 68.2 },
        { department: "IT", attendance: 79.4 },
    ],
    weekly: [
        { department: "CSE", attendance: 78.5 },
        { department: "ECE", attendance: 72.3 },
        { department: "ME", attendance: 68.9 },
        { department: "Civil", attendance: 74.1 },
        { department: "EE", attendance: 70.6 },
        { department: "IT", attendance: 76.2 },
    ],
    monthly: [
        { department: "CSE", attendance: 76.0 },
        { department: "ECE", attendance: 70.8 },
        { department: "ME", attendance: 66.5 },
        { department: "Civil", attendance: 72.9 },
        { department: "EE", attendance: 69.1 },
        { department: "IT", attendance: 74.7 },
    ],
};

const PERIOD_LABELS: { key: TimePeriod; label: string }[] = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
];

/* ─── Top Performers vs Defaulters (static) ─── */
const PERFORMERS_DATA = [
    { name: "Aarav Sharma", top: 94, defaulter: 0 },
    { name: "Priya Patel", top: 91, defaulter: 0 },
    { name: "Rohan Mehta", top: 89, defaulter: 0 },
    { name: "Sneha Gupta", top: 88, defaulter: 0 },
    { name: "Arjun Singh", top: 87, defaulter: 0 },
    { name: "Rahul Verma", top: 0, defaulter: 52 },
    { name: "Kiran Shah", top: 0, defaulter: 55 },
    { name: "Amit Yadav", top: 0, defaulter: 58 },
    { name: "Pooja Nair", top: 0, defaulter: 61 },
    { name: "Vikram Joshi", top: 0, defaulter: 63 },
];

/* ─── Month-wise semester attendance trend (static) ─── */
const MONTHLY_TREND_DATA = [
    { month: "Aug", attendance: 78 },
    { month: "Sep", attendance: 82 },
    { month: "Oct", attendance: 75 },
    { month: "Nov", attendance: 80 },
    { month: "Dec", attendance: 85 },
    { month: "Jan", attendance: 88 },
];

/* ─── Course-wise attendance breakdown (static) ─── */
const COURSE_ATTENDANCE = [
    { course: "B.Tech CS Sem 4", subject: "Data Structures", faculty: "Dr. Mehta", students: 45, avg: 82, status: "good" as const },
    { course: "B.Tech CS Sem 4", subject: "DBMS", faculty: "Dr. Sharma", students: 45, avg: 71, status: "low" as const },
    { course: "B.Tech CS Sem 6", subject: "ML", faculty: "Dr. Patel", students: 38, avg: 88, status: "good" as const },
    { course: "B.Tech CS Sem 6", subject: "CN", faculty: "Dr. Gupta", students: 38, avg: 68, status: "critical" as const },
    { course: "B.Tech CS Sem 2", subject: "Maths", faculty: "Dr. Singh", students: 52, avg: 79, status: "good" as const },
    { course: "B.Tech CS Sem 2", subject: "Physics", faculty: "Dr. Kumar", students: 52, avg: 74, status: "low" as const },
];

/* ─── Dean's graph-based attendance overview ─── */
function DeanAttendanceView() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendData[]>([]);
    const [distribution, setDistribution] = useState<DistributionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

    useEffect(() => {
        async function loadData() {
            try {
                const [s, wt, dist] = await Promise.all([
                    getDashboardStats(),
                    getWeeklyTrend().catch(() => [] as WeeklyTrendData[]),
                    getDistribution().catch(() => null),
                ]);
                setStats(s);
                setWeeklyTrend(wt);
                setDistribution(dist);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !stats) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#1a6fdb]" />
            </div>
        );
    }

    return (
        <div className="animate-slide-up space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <span>Attendance</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-gray-700">Overview</span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Attendance Overview — CSE Department
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    High-level attendance insights across the CSE department. Data is updated live from the system.
                </p>
            </div>

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
                <StatCard
                    icon={<FileText className="h-5 w-5 text-[#7c3aed]" />}
                    iconBg="bg-purple-50 dark:bg-purple-950/30"
                    label="CVs Uploaded"
                    value={stats.cvsUploaded.toLocaleString()}
                    subtitle={stats.cvsUploadedLabel}
                />
            </div>

            {/* Charts Row — Weekly Trend + Distribution */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <WeeklyTrendChart data={weeklyTrend} />
                {distribution && <DistributionDonut data={distribution} />}
            </div>

            {/* Department-wise Attendance Bar Chart */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                {/* Header row: title + period tabs + date picker */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Department-wise Attendance
                    </h3>
                    <div className="flex items-center gap-3">
                        {/* Period tabs */}
                        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                            {PERIOD_LABELS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setTimePeriod(key)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                                        timePeriod === key
                                            ? "bg-white text-[#1a6fdb] shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {/* Date picker */}
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                </div>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart
                            data={DEPT_ATTENDANCE[timePeriod]}
                            margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
                        >
                            <XAxis
                                dataKey="department"
                                tick={{ fontSize: 12, fill: "#374151" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => `${v}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    fontSize: "12px",
                                }}
                                formatter={(value: number | string | undefined) => [`${value ?? 0}%`, "Avg Attendance"]}
                            />
                            <Bar
                                dataKey="attendance"
                                fill="#1a6fdb"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─── Top Performers vs Defaulters ─── */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                    Top Performers vs Defaulters
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart
                            data={PERFORMERS_DATA}
                            margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
                        >
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "#374151" }}
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                                angle={-25}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => `${v}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    fontSize: "12px",
                                }}
                                formatter={(value: number | string | undefined, name?: string) => [
                                    `${value ?? 0}%`,
                                    name === "top" ? "Top Performer" : "Defaulter",
                                ]}
                            />
                            <ReferenceLine
                                y={75}
                                stroke="#dc2626"
                                strokeDasharray="6 4"
                                label={{ value: "75% min", position: "right", fontSize: 11, fill: "#dc2626" }}
                            />
                            <Bar dataKey="top" fill="#059669" radius={[6, 6, 0, 0]} barSize={32} name="top" />
                            <Bar dataKey="defaulter" fill="#dc2626" radius={[6, 6, 0, 0]} barSize={32} name="defaulter" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─── Semester Attendance Trend (Month-wise) ─── */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                    Semester Attendance Trend (Month-wise)
                </h3>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart
                            data={MONTHLY_TREND_DATA}
                            margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
                        >
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: "#374151" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => `${v}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    fontSize: "12px",
                                }}
                                formatter={(value: number | string | undefined) => [`${value ?? 0}%`, "Attendance"]}
                            />
                            <ReferenceLine
                                y={75}
                                stroke="#dc2626"
                                strokeDasharray="6 4"
                                label={{ value: "75% min", position: "right", fontSize: 11, fill: "#dc2626" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="attendance"
                                stroke="#1a6fdb"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#1a6fdb", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, fill: "#1a6fdb", strokeWidth: 2, stroke: "#fff" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─── Course-wise Attendance Breakdown ─── */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                    Course-wise Attendance Breakdown
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <th className="whitespace-nowrap px-4 py-3">Course</th>
                                <th className="whitespace-nowrap px-4 py-3">Subject</th>
                                <th className="whitespace-nowrap px-4 py-3">Faculty</th>
                                <th className="whitespace-nowrap px-4 py-3 text-center">Students</th>
                                <th className="whitespace-nowrap px-4 py-3 text-center">Avg Attendance</th>
                                <th className="whitespace-nowrap px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {COURSE_ATTENDANCE.map((row, i) => {
                                const badge =
                                    row.status === "good"
                                        ? { label: "✅ Good", bg: "bg-emerald-50", text: "text-emerald-700" }
                                        : row.status === "low"
                                          ? { label: "⚠️ Low", bg: "bg-amber-50", text: "text-amber-700" }
                                          : { label: "🔴 Critical", bg: "bg-red-50", text: "text-red-700" };
                                return (
                                    <tr key={i} className="transition-colors hover:bg-gray-50/60">
                                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">{row.course}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{row.subject}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{row.faculty}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-center text-gray-600">{row.students}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-gray-800">{row.avg}%</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-center">
                                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ─── HOD / Coordinator upload view (unchanged) ─── */
function UploadAttendanceView() {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    const handleFilesSelected = useCallback((newFiles: File[]) => {
        const uploadFiles: UploadedFile[] = newFiles.map((f) => ({
            id: String(++fileIdCounter),
            name: f.name,
            size: f.size,
            status: "queued" as const,
            progress: 100,
        }));
        setFiles((prev) => [...prev, ...uploadFiles]);
    }, []);

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const handleUploadAndProcess = () => {
        // TODO: Call bulk upload API when backend endpoint is ready
        setFiles((prev) =>
            prev.map((f) => ({ ...f, status: "done" as const }))
        );
    };

    const handleDownloadSample = () => {
        const lectureHeaders = Array.from({ length: 30 }, (_, i) => `Lecture ${i + 1}`);
        const headers = ["Name", "Roll No.", ...lectureHeaders];
        const sampleRow1 = ["Aarav Sharma", "CS20210042", ...Array(30).fill("")];
        const sampleRow2 = ["Priya Patel", "CS20210088", ...Array(30).fill("")];
        const csvContent = [headers.join(","), sampleRow1.join(","), sampleRow2.join(",")].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "attendance_template.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <span>Attendance</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-gray-700">Bulk Upload</span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Bulk Attendance Upload
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    Update student attendance records in bulk by uploading a CSV file.
                    Our system will automatically process the records and link them to the
                    respective courses.
                </p>
            </div>

            {/* Info Banner */}
            <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">
                            Need the correct format?
                        </p>
                        <p className="text-xs text-gray-500">
                            Download our sample CSV template — columns: Name, Roll No.,
                            and Lecture 1 through Lecture 30.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleDownloadSample}
                    className="shrink-0 gap-2 bg-[#1a6fdb] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1560c2]"
                >
                    <Download className="h-4 w-4" />
                    Download Sample CSV
                </Button>
            </div>

            {/* Drop Zone */}
            <FileDropZone
                onFilesSelected={handleFilesSelected}
                accept=".csv"
                maxSizeMB={10}
            />

            {/* File Queue */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        File Queue
                    </h3>
                    {files.map((file) => (
                        <FileQueueItem
                            key={file.id}
                            file={file}
                            onRemove={removeFile}
                        />
                    ))}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setFiles([])}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUploadAndProcess}
                            className="gap-2 bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
                        >
                            <Upload className="h-4 w-4" />
                            Upload and Process
                        </Button>
                    </div>
                </div>
            )}

            {/* Validation Info Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ValidationInfoCard
                    icon={ListChecks}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                    title="Column Headers"
                    description="Ensure headers match: Name, Roll No., Lecture 1 through Lecture 30."
                />
                <ValidationInfoCard
                    icon={AlertCircle}
                    iconColor="text-amber-500"
                    iconBg="bg-amber-50"
                    title="Duplicate Check"
                    description="Duplicate entries for the same student on the same day will be flagged for review."
                />
                <ValidationInfoCard
                    icon={ShieldCheck}
                    iconColor="text-emerald-500"
                    iconBg="bg-emerald-50"
                    title="Data Integrity"
                    description="All Student IDs must exist in the system prior to bulk attendance upload."
                />
            </div>
        </div>
    );
}

/* ─── Main page — role gate ─── */
export default function AttendancePage() {
    const { role } = useAuth();

    return (
        <RequireRole allowedRoles={["dean", "hod", "coordinator"]}>
            {role === "dean" ? <DeanAttendanceView /> : <UploadAttendanceView />}
        </RequireRole>
    );
}
