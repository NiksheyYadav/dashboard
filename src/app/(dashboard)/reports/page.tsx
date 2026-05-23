"use client";

import { cn } from "@/lib/utils";
import {
    BarChart3,
    Download,
    FileBarChart,
    FileSpreadsheet,
    FileText,
    Filter,
    Printer,
    TrendingUp,
} from "lucide-react";
import { useState } from "react";

const REPORT_TYPES = [
    { id: "subject-wise", icon: BarChart3, title: "Subject-wise Attendance Report", description: "Attendance percentage broken down by subject for each student/section", format: "Excel / PDF" },
    { id: "student-wise", icon: FileText, title: "Student-wise Consolidated Report", description: "Overall attendance across all subjects for each student with risk status", format: "Excel / PDF" },
    { id: "mentor-wise", icon: FileBarChart, title: "Mentor-wise Mentee Summary", description: "Mentor dashboard showing all mentees with attendance trends and interventions", format: "Excel / PDF" },
    { id: "leave-summary", icon: FileSpreadsheet, title: "Leave & Arrangement Summary", description: "Faculty leave records with arrangement acceptance rates and class coverage", format: "Excel" },
    { id: "extra-classes", icon: TrendingUp, title: "Extra/Make-up Classes Report", description: "Detailed log of all extra classes conducted with attendance and syllabus coverage", format: "Excel / PDF" },
    { id: "detention-risk", icon: FileText, title: "Detention Risk Report", description: "Students below threshold with warning stage, counselling notes, and parent contact history", format: "Excel / PDF" },
    { id: "activity-attendance", icon: BarChart3, title: "Activity Attendance Report", description: "All activities with participant lists, approval status, and attendance credit impact", format: "Excel" },
    { id: "course-completion", icon: TrendingUp, title: "Course Completion Status", description: "Teacher-wise planned vs conducted lectures including extra/make-up classes", format: "Excel" },
];

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [programme, setProgramme] = useState("All");
    const [semester, setSemester] = useState("All");
    const [section, setSection] = useState("All");

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="soet-card">
                <h3 className="soet-card-header"><Filter className="h-4 w-4 text-blue-600" /> Report Filters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Programme</label>
                        <select value={programme} onChange={(e) => setProgramme(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-400">
                            <option value="All">All Programmes</option>
                            <option value="btech-cse">B.Tech CSE</option>
                            <option value="btech-me">B.Tech ME</option>
                            <option value="bca">BCA</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Semester</label>
                        <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-400">
                            <option value="All">All Semesters</option>
                            {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Section</label>
                        <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-400">
                            <option value="All">All Sections</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Date Range</label>
                        <input type="date" className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-400" />
                    </div>
                </div>
            </div>

            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {REPORT_TYPES.map((report) => (
                    <button
                        key={report.id}
                        onClick={() => setSelectedReport(report.id)}
                        className={cn(
                            "soet-card text-left transition-all hover:shadow-md hover:border-blue-200 group",
                            selectedReport === report.id && "border-blue-400 ring-2 ring-blue-100"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                <report.icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 leading-tight">{report.title}</h4>
                                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{report.description}</p>
                                <p className="mt-2 text-[10px] font-medium text-gray-400">{report.format}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Generate Actions */}
            {selectedReport && (
                <div className="soet-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                {REPORT_TYPES.find((r) => r.id === selectedReport)?.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Filters: {programme} / {semester} / {section}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Printer className="h-4 w-4" /> Print
                            </button>
                            <button 
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem("edupulse_auth_token");
                                        let rtype = "attendance_summary";
                                        if (selectedReport === "leave-summary") rtype = "leave_summary";
                                        else if (selectedReport === "detention-risk") rtype = "low_attendance";
                                        else if (selectedReport === "mentor-wise") rtype = "mentor_report";

                                        const res = await fetch("http://localhost:8000/api/v1/reports/export", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                            body: JSON.stringify({ report_type: rtype })
                                        });
                                        if (!res.ok) throw new Error("Export failed");
                                        const blob = await res.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `${rtype}_export.csv`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        alert("Failed to export report.");
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-300 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                                <FileSpreadsheet className="h-4 w-4" /> Export CSV
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a56db] text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
                                <Download className="h-4 w-4" /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
