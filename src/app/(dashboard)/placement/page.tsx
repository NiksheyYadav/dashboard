"use client";

import { useState, useRef, useCallback } from "react";
import {
    Award,
    Banknote,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Download,
    FileSpreadsheet,
    Loader2,
    Percent,
    Plus,
    Upload,
    Users,
    X,
    AlertCircle,
    FileUp,
} from "lucide-react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    downloadPlacementTemplate,
    uploadPlacementData,
} from "@/lib/api/placement-upload";
import type { PlacementUploadResponse } from "@/lib/types/placement-upload";

// Mock data components can go here

const TREND_DATA = [
    { name: "Jan", lastYear: 120, thisYear: 140 },
    { name: "Feb", lastYear: 130, thisYear: 160 },
    { name: "Mar", lastYear: 170, thisYear: 190 },
    { name: "Apr", lastYear: 190, thisYear: 240 },
    { name: "May", lastYear: 220, thisYear: 210 },
    { name: "Jun", lastYear: 240, thisYear: 280 },
];

type UploadState = "idle" | "uploading" | "success" | "error";

export default function PlacementDashboard() {
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [uploadResult, setUploadResult] = useState<PlacementUploadResponse | null>(null);
    const [uploadError, setUploadError] = useState<string>("");
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        const ext = file.name.toLowerCase();
        if (!ext.endsWith(".csv") && !ext.endsWith(".xlsx")) {
            setUploadError("Only .csv and .xlsx files are supported");
            setUploadState("error");
            return;
        }
        setSelectedFile(file);
        setUploadError("");
        setUploadState("idle");
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploadState("uploading");
        setUploadError("");

        try {
            const result = await uploadPlacementData(selectedFile);
            setUploadResult(result);
            setUploadState("success");
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Upload failed");
            setUploadState("error");
        }
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setUploadState("idle");
        setUploadResult(null);
        setUploadError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const closeDialog = () => {
        setShowUploadDialog(false);
        resetUpload();
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Placement Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Overview of recruitment activities and statistics</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Academic Year 2023-24</span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>

                    <button className="flex items-center gap-2 bg-[#1a6fdb] hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm">
                        <Plus className="h-4 w-4" />
                        <span>New Job Posting</span>
                    </button>
                </div>
            </div>

            {/* ===== Data Upload Section ===== */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-blue-950/30 rounded-xl p-6 border border-blue-100 dark:border-blue-900/50 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm">
                            <FileSpreadsheet className="h-5 w-5 text-[#1a6fdb]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Placement Data Upload</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Upload student placement records in the standardized template format
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={downloadPlacementTemplate}
                            id="download-template-btn"
                            className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow group"
                        >
                            <Download className="h-4 w-4 text-gray-400 group-hover:text-[#1a6fdb] transition-colors" />
                            <span>Template</span>
                        </button>
                        <button
                            onClick={() => setShowUploadDialog(true)}
                            id="upload-data-btn"
                            className="flex items-center gap-2 bg-[#1a6fdb] hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                        >
                            <Upload className="h-4 w-4" />
                            <span>Upload Data</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== Upload Dialog Modal ===== */}
            {showUploadDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeDialog}
                    />
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg mx-4 overflow-hidden animate-fade-in">
                        {/* Dialog header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                                    <FileUp className="h-4 w-4 text-[#1a6fdb]" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">Upload Placement Data</h3>
                            </div>
                            <button
                                onClick={closeDialog}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Dialog body */}
                        <div className="px-6 py-5">
                            {uploadState === "success" && uploadResult ? (
                                /* Success state */
                                <div className="text-center py-4">
                                    <div className="mx-auto w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Upload Successful!</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Your placement data has been processed.</p>
                                    <div className="grid grid-cols-3 gap-3 mb-5">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-100 dark:border-emerald-800/50">
                                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{uploadResult.processed}</p>
                                            <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide mt-1">Processed</p>
                                        </div>
                                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-100 dark:border-orange-800/50">
                                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{uploadResult.skipped}</p>
                                            <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide mt-1">Skipped</p>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-100 dark:border-red-800/50">
                                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{uploadResult.errors.length}</p>
                                            <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wide mt-1">Errors</p>
                                        </div>
                                    </div>
                                    {uploadResult.errors.length > 0 && (
                                        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-100 dark:border-red-800/50 mb-4 text-left max-h-32 overflow-y-auto">
                                            {uploadResult.errors.map((err, i) => (
                                                <p key={i} className="text-xs text-red-600 dark:text-red-400 mb-1">
                                                    Row {err.row}: {err.message}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={closeDialog}
                                        className="w-full bg-[#1a6fdb] hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                /* Upload area */
                                <>
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver
                                            ? "border-[#1a6fdb] bg-blue-50/80 dark:bg-blue-900/20"
                                            : selectedFile
                                                ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/10"
                                                : "border-gray-200 dark:border-gray-700 hover:border-[#1a6fdb] hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.xlsx"
                                            className="hidden"
                                            id="placement-file-input"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFile(file);
                                            }}
                                        />
                                        {selectedFile ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                                                    <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedFile.name}</p>
                                                <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                                                    className="text-xs text-red-500 hover:text-red-600 font-medium mt-1"
                                                >
                                                    Remove file
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                                                    <Upload className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    Drop your file here or <span className="text-[#1a6fdb] font-semibold">browse</span>
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">Supports .csv and .xlsx files</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Error state */}
                                    {uploadState === "error" && uploadError && (
                                        <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg px-3 py-2.5">
                                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                            <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="mt-4 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-3 py-2.5 border border-blue-100 dark:border-blue-800/30">
                                        <FileSpreadsheet className="h-4 w-4 text-[#1a6fdb] flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Use the <button onClick={(e) => { e.stopPropagation(); downloadPlacementTemplate(); }} className="text-[#1a6fdb] font-semibold hover:underline">Template</button> to ensure your data is in the correct format with all required columns.
                                        </p>
                                    </div>

                                    {/* Upload button */}
                                    <div className="mt-5 flex gap-3">
                                        <button
                                            onClick={closeDialog}
                                            className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpload}
                                            disabled={!selectedFile || uploadState === "uploading"}
                                            id="submit-upload-btn"
                                            className="flex-1 flex items-center justify-center gap-2 bg-[#1a6fdb] hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                                        >
                                            {uploadState === "uploading" ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4" />
                                                    <span>Upload</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Eligible */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Eligible</p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">1,240</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Final Year Students</p>
                    </div>
                </div>

                {/* Students Placed */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students Placed</p>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">1,054</h3>
                        </div>
                        <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                            +12% from last month
                        </p>
                    </div>
                </div>

                {/* Placement % */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Placement %</p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                            <Percent className="h-4 w-4 text-blue-500" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">85%</h3>
                        <div className="mt-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Avg & Highest Package Combined Card style from image */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Package</p>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-md">
                                <Banknote className="h-3.5 w-3.5 text-amber-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">$8.5 LPA</h3>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">Core & Tech Average</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Highest Package</p>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-1.5 rounded-md">
                                <Award className="h-3.5 w-3.5 text-purple-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">$45 LPA</h3>
                            <p className="text-[10px] text-purple-500 font-medium mt-1 leading-tight">Secured by IT Dept</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Placements by Dept */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm lg:col-span-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Placements by Dept</h3>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Computer Science</span>
                                <span className="text-gray-500 dark:text-gray-400">342</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-[#1a6fdb] h-2 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Information Tech</span>
                                <span className="text-gray-500 dark:text-gray-400">280</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-[#1a6fdb] h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Electronics</span>
                                <span className="text-gray-500 dark:text-gray-400">190</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-[#7ca9f0] h-2 rounded-full" style={{ width: '50%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Mechanical</span>
                                <span className="text-gray-500 dark:text-gray-400">145</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-[#a8c7f5] h-2 rounded-full" style={{ width: '35%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Civil</span>
                                <span className="text-gray-500 dark:text-gray-400">97</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-[#d4e4fa] h-2 rounded-full" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recruitment Trend Bar Chart Placeholder */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Recruitment Trend (6 Months)</h3>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#1a6fdb]"></div>
                                <span className="text-gray-500 dark:text-gray-400">2024</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                <span className="text-gray-500 dark:text-gray-400">2023</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-[220px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={TREND_DATA} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickLine={false}
                                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(26, 111, 219, 0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="thisYear" fill="#1a6fdb" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Upcoming Campus Drives */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Upcoming Campus Drives</h3>
                        <a href="#" className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</a>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-4 font-medium">Company</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Package</th>
                                    <th className="px-6 py-4 font-medium text-right">Eligibility</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {/* Drive 1 */}
                                <tr>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 flex flex-shrink-0 items-center justify-center p-1.5 border border-gray-100 dark:border-gray-700">
                                                <div className="w-full h-full bg-[#4285F4] rounded-sm"></div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">Google</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600 dark:text-gray-300">Oct 12, 2024</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$32 LPA</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            8.5+ CGPA
                                        </span>
                                    </td>
                                </tr>
                                {/* Drive 2 */}
                                <tr>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 flex flex-shrink-0 items-center justify-center p-1.5 border border-gray-100 dark:border-gray-700">
                                                <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                                                    <div className="bg-[#F25022] rounded-tl-sm"></div>
                                                    <div className="bg-[#7FBA00] rounded-tr-sm"></div>
                                                    <div className="bg-[#00A4EF] rounded-bl-sm"></div>
                                                    <div className="bg-[#FFB900] rounded-br-sm"></div>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">Microsoft</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600 dark:text-gray-300">Oct 15, 2024</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$28 LPA</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            8.0+ CGPA
                                        </span>
                                    </td>
                                </tr>
                                {/* Drive 3 */}
                                <tr>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 flex flex-shrink-0 items-center justify-center p-1.5 border border-gray-100 dark:border-gray-700">
                                                <div className="w-full text-[10px] font-bold text-center leading-tight">Acc.</div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">Accenture</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600 dark:text-gray-300">Oct 20, 2024</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$6.5 LPA</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            7.0+ CGPA
                                        </span>
                                    </td>
                                </tr>
                                {/* Drive 4 */}
                                <tr>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 flex flex-shrink-0 items-center justify-center p-1 border border-gray-100 dark:border-gray-700">
                                                <div className="w-full h-3 flex justify-center overflow-hidden">
                                                    <div className="w-full text-[10px] font-bold text-center text-[#FF9900] leading-none">az</div>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">Amazon</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600 dark:text-gray-300">Oct 25, 2024</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$24 LPA</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            7.5+ CGPA
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Success Stories */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Success Stories</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-filter"><path d="M3 6h18" /><path d="M7 12h10" /><path d="M10 18h4" /></svg>
                            <span>Recently Hired</span>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Story 1 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-200/50 dark:bg-blue-800/50 flex items-center justify-center">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus`} alt="Avatar" className="h-8 w-8 rounded-full" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Marcus J. Thorne</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">CS-2024-0421 â€¢ CGPA 9.2</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">NVIDIA</p>
                                <p className="text-xs text-emerald-500 font-medium mt-0.5">$42.5 LPA</p>
                            </div>
                        </div>

                        {/* Story 2 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`} alt="Avatar" className="h-12 w-12 rounded-full absolute top-1" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Sarah Al-Zayed</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">IT-2024-0118 â€¢ CGPA 8.8</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Atlassian</p>
                                <p className="text-xs text-emerald-500 font-medium mt-0.5">$34.0 LPA</p>
                            </div>
                        </div>

                        {/* Story 3 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan`} alt="Avatar" className="h-10 w-10 rounded-full absolute top-0.5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Rohan Deshmukh</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">ME-2024-0056 â€¢ CGPA 8.4</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Tesla</p>
                                <p className="text-xs text-emerald-500 font-medium mt-0.5">$28.2 LPA</p>
                            </div>
                        </div>

                        {/* Story 4 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-900 dark:bg-black relative overflow-hidden flex items-center justify-center">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&baseColor=ffffff`} alt="Avatar" className="h-10 w-10 rounded-full absolute top-0.5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Elena Gilbert</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">EC-2024-0922 â€¢ CGPA 9.0</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Intel</p>
                                <p className="text-xs text-emerald-500 font-medium mt-0.5">$22.0 LPA</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Placement Funnel Status Cards below */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Placement Funnel Status</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/50">
                        <p className="text-[10px] font-bold text-[#1a6fdb] dark:text-blue-400 uppercase tracking-wide">Placed</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">1,054</p>
                    </div>

                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100/50 dark:border-blue-800/30">
                        <p className="text-[10px] font-bold text-[#3b93fa] dark:text-blue-400 uppercase tracking-wide">In-process</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">128</p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800/50">
                        <p className="text-[10px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wide">Not Interested</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">42</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700/50">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Awaiting Eligibility</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">16</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
