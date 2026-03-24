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
import { apiGet } from "@/lib/api/client";
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
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

let fileIdCounter = 0;

/* ─── Top Performer type & fetcher ─── */
interface TopPerformer {
    name: string;
    attendance: number;
}

async function getTopPerformers(): Promise<TopPerformer[]> {
    return apiGet<TopPerformer[]>("/attendance/top");
}

/* ─── Dean's graph-based attendance overview ─── */
function DeanAttendanceView() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendData[]>([]);
    const [distribution, setDistribution] = useState<DistributionData | null>(null);
    const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [s, wt, dist, tp] = await Promise.all([
                    getDashboardStats(),
                    getWeeklyTrend().catch(() => [] as WeeklyTrendData[]),
                    getDistribution().catch(() => null),
                    getTopPerformers().catch(() => [] as TopPerformer[]),
                ]);
                setStats(s);
                setWeeklyTrend(wt);
                setDistribution(dist);
                setTopPerformers(tp);
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

            {/* Top Performers Bar Chart */}
            {topPerformers.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">
                        Top Attendance — Students
                    </h3>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart
                                data={topPerformers}
                                layout="vertical"
                                margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                            >
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => `${v}%`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: "#374151" }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={120}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "1px solid #e5e7eb",
                                        fontSize: "12px",
                                    }}
                                    formatter={(value: number | string | undefined) => [`${value ?? 0}%`, "Attendance"]}
                                />
                                <Bar
                                    dataKey="attendance"
                                    fill="#1a6fdb"
                                    radius={[0, 6, 6, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
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
