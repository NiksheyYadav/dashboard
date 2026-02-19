"use client";

import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    CloudUpload,
    Download,
    Eye,
    FileText,
    Trash2,
    Upload,
} from "lucide-react";
import { useRef, useState } from "react";

type CVState = "none" | "uploaded" | "rejected";

export default function MyCVPage() {
    const [cvState, setCvState] = useState<CVState>("uploaded");
    const [fileName, setFileName] = useState("Alex_Johnson_Resume_2026.pdf");
    const [uploadDate, setUploadDate] = useState("Feb 15, 2026");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        setFileName(file.name);
        setUploadDate(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
        setCvState("uploaded");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My CV</h1>
                <p className="text-sm text-gray-500">
                    Upload and manage your resume for placement records
                </p>
            </div>

            {/* Status Card */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Current Status
                        </p>
                        {cvState === "uploaded" && (
                            <div className="mt-1 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="text-lg font-semibold text-emerald-600">
                                    CV Uploaded
                                </span>
                            </div>
                        )}
                        {cvState === "rejected" && (
                            <div className="mt-1 flex items-center gap-2">
                                <span className="text-lg font-semibold text-red-500">
                                    CV Rejected — Please re-upload
                                </span>
                            </div>
                        )}
                        {cvState === "none" && (
                            <div className="mt-1 flex items-center gap-2">
                                <span className="text-lg font-semibold text-amber-500">
                                    No CV Uploaded
                                </span>
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={() => inputRef.current?.click()}
                        className="gap-2 bg-[#1a6fdb] text-white hover:bg-[#1560c2]"
                    >
                        <Upload className="h-4 w-4" />
                        {cvState === "none" ? "Upload CV" : "Re-upload CV"}
                    </Button>
                </div>
            </div>

            {/* Current CV */}
            {cvState !== "none" && (
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Current File
                    </h3>
                    <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
                            <FileText className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {fileName}
                            </p>
                            <p className="text-xs text-gray-400">
                                Uploaded on {uploadDate}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 hover:text-[#1a6fdb]">
                                <Eye className="h-4 w-4" />
                            </button>
                            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 hover:text-[#1a6fdb]">
                                <Download className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setCvState("none");
                                    setFileName("");
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Area */}
            <div
                onClick={() => inputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 px-6 py-12 transition-colors hover:border-[#1a6fdb]/30 hover:bg-blue-50/20"
            >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    <CloudUpload className="h-7 w-7 text-gray-500" />
                </div>
                <p className="mt-4 text-base font-semibold text-gray-800">
                    {cvState === "none"
                        ? "Upload your CV"
                        : "Upload a new version"}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                    PDF files only (Max 5MB)
                </p>
                <span className="mt-3 text-sm font-semibold text-[#1a6fdb]">
                    Select File from Computer
                </span>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                    handleFileUpload(e.target.files);
                    e.target.value = "";
                }}
            />

            {/* Guidelines */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                <h4 className="text-sm font-semibold text-gray-800">
                    CV Guidelines
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-gray-600">
                    <li>• File must be in PDF format</li>
                    <li>• Maximum file size: 5 MB</li>
                    <li>• Include your full name, roll number, and contact details</li>
                    <li>• Keep the CV updated before placement season</li>
                    <li>• Rejected CVs must be corrected and re-uploaded</li>
                </ul>
            </div>
        </div>
    );
}
