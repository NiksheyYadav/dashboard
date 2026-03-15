"use client";

import FileDropZone from "@/components/attendance/FileDropZone";
import FileQueueItem from "@/components/attendance/FileQueueItem";
import ValidationInfoCard from "@/components/attendance/ValidationInfoCard";
import RequireRole from "@/components/providers/RequireRole";
import { Button } from "@/components/ui/button";
import { UploadedFile } from "@/lib/types/attendance-upload";
import {
    AlertCircle,
    ChevronRight,
    Download,
    FileText,
    ListChecks,
    ShieldCheck,
    Upload,
} from "lucide-react";
import { useCallback, useState } from "react";

let fileIdCounter = 0;

export default function AttendancePage() {
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
        <RequireRole allowedRoles={["dean", "hod", "coordinator"]}>
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
        </RequireRole>
    );
}
