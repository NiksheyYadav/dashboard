"use client";

import FileDropZone from "@/components/attendance/FileDropZone";
import FileQueueItem from "@/components/attendance/FileQueueItem";
import ValidationInfoCard from "@/components/attendance/ValidationInfoCard";
import RequireRole from "@/components/providers/RequireRole";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { UploadedFile } from "@/lib/types/attendance-upload";
import {
    AlertCircle,
    ChevronRight,
    Download,
    FileText,
    ListChecks,
    ShieldCheck,
    Upload,
    Users,
    BookOpen,
    Filter,
} from "lucide-react";
import { useCallback, useState } from "react";

let fileIdCounter = 0;

/* ─── Mock data for Dean's read-only view ─── */
const MOCK_ATTENDANCE = [
    { name: "Aarav Sharma", rollNo: "CS20210042", course: "B.Tech CS", totalLectures: 30, attended: 27, percentage: 90 },
    { name: "Priya Patel", rollNo: "CS20210088", course: "B.Tech CS", totalLectures: 30, attended: 24, percentage: 80 },
    { name: "Rohan Verma", rollNo: "CS20210105", course: "B.Tech CS", totalLectures: 30, attended: 20, percentage: 67 },
    { name: "Sneha Gupta", rollNo: "CS20210113", course: "B.Tech CS", totalLectures: 30, attended: 29, percentage: 97 },
];

const COURSE_OPTIONS = ["All Courses", "B.Tech CS"];
const SEMESTER_OPTIONS = ["All Semesters", "Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];

/* ─── Dean's read-only attendance overview ─── */
function DeanAttendanceView() {
    const [courseFilter, setCourseFilter] = useState("All Courses");
    const [semesterFilter, setSemesterFilter] = useState("All Semesters");

    const data = MOCK_ATTENDANCE;

    return (
        <div className="space-y-6">
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
                    View attendance records uploaded by coordinators and HODs across the CSE department.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Students</p>
                        <p className="text-lg font-bold text-gray-900">{data.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Avg. Attendance</p>
                        <p className="text-lg font-bold text-gray-900">
                            {data.length > 0 ? Math.round(data.reduce((s, r) => s + r.percentage, 0) / data.length) : 0}%
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Below 75%</p>
                        <p className="text-lg font-bold text-gray-900">
                            {data.filter((r) => r.percentage < 75).length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Filters:</span>
                </div>
                <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                    {COURSE_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                    {SEMESTER_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
                    <Users className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">No attendance records uploaded yet</p>
                    <p className="mt-1 text-xs text-gray-400">Records will appear here once coordinators upload attendance data.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80">
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Student Name</th>
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Roll No.</th>
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Course</th>
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">Total Lectures</th>
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">Attended</th>
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.map((row) => (
                                <tr key={row.rollNo} className="transition-colors hover:bg-blue-50/30">
                                    <td className="px-5 py-3.5 font-medium text-gray-900">{row.name}</td>
                                    <td className="px-5 py-3.5 text-gray-600">{row.rollNo}</td>
                                    <td className="px-5 py-3.5 text-gray-600">{row.course}</td>
                                    <td className="px-5 py-3.5 text-center text-gray-600">{row.totalLectures}</td>
                                    <td className="px-5 py-3.5 text-center text-gray-600">{row.attended}</td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                row.percentage >= 75
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {row.percentage}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
