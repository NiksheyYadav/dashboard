"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    FileText,
    Filter,
    MessageSquare,
    MoreHorizontal,
    Phone,
    Search,
    ShieldAlert,
    Users,
    XCircle,
} from "lucide-react";
import { useState } from "react";

// Demo data matching the mockup exactly
const MOCK_MENTEES = [
    { id: "1", name: "Ananya Verma", rollNo: "22CS101", batch: "CSE-IT 2A", subjects: { "Data Structures": 92, "AI Basics": 88, "Mathematics": 76, "Communication Skills": 85 }, overall: 85, risk: "Safe" as const },
    { id: "2", name: "Rohit Kumar", rollNo: "22CS104", batch: "CSE-IT 2A", subjects: { "Data Structures": 68, "AI Basics": 72, "Mathematics": 63, "Communication Skills": 69 }, overall: 68, risk: "Warning" as const },
    { id: "3", name: "Priya Singh", rollNo: "22CS107", batch: "CSE-IT 2B", subjects: { "Data Structures": 58, "AI Basics": 61, "Mathematics": 45, "Communication Skills": 55 }, overall: 55, risk: "Warning" as const },
    { id: "4", name: "Vivek Yadav", rollNo: "22CS110", batch: "CSE-IT 2A", subjects: { "Data Structures": 90, "AI Basics": 93, "Mathematics": 85, "Communication Skills": 88 }, overall: 89, risk: "Safe" as const },
    { id: "5", name: "Karan Mehta", rollNo: "22CS113", batch: "CSE-IT 2B", subjects: { "Data Structures": 46, "AI Basics": 52, "Mathematics": 38, "Communication Skills": 50 }, overall: 47, risk: "Critical" as const },
    { id: "6", name: "Neha Gupta", rollNo: "22CS116", batch: "CSE-IT 2B", subjects: { "Data Structures": 78, "AI Basics": 81, "Mathematics": 70, "Communication Skills": 76 }, overall: 76, risk: "Safe" as const },
    { id: "7", name: "Arjun Patel", rollNo: "22CS119", batch: "CSE-IT 2A", subjects: { "Data Structures": 64, "AI Basics": 66, "Mathematics": 59, "Communication Skills": 60 }, overall: 62, risk: "Warning" as const },
    { id: "8", name: "Simran Kaur", rollNo: "22CS122", batch: "CSE-IT 2B", subjects: { "Data Structures": 34, "AI Basics": 41, "Mathematics": 29, "Communication Skills": 38 }, overall: 36, risk: "Critical" as const },
    { id: "9", name: "Mayank Jain", rollNo: "22CS125", batch: "CSE-IT 2A", subjects: { "Data Structures": 0, "AI Basics": 57, "Mathematics": 0, "Communication Skills": 63 }, overall: 0, risk: "Pending" as const },
];

type RiskLevel = "Safe" | "Warning" | "Critical" | "Pending";
const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
    Safe: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
    Warning: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle },
    Critical: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
    Pending: { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", icon: ShieldAlert },
};

function AttendanceBadge({ value }: { value: number }) {
    if (value === 0) return <span className="text-sm text-gray-400">—</span>;
    const color = value >= 75 ? "text-emerald-700 bg-emerald-50" : value >= 50 ? "text-amber-700 bg-amber-50" : "text-red-700 bg-red-50";
    return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", color)}>{value}%</span>;
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
    const config = RISK_CONFIG[risk];
    return (
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border", config.bg, config.color, config.border)}>
            {risk}
        </span>
    );
}

export default function MenteeMonitorPage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"All" | RiskLevel>("All");
    const [selectedMentee, setSelectedMentee] = useState<typeof MOCK_MENTEES[0] | null>(MOCK_MENTEES[0]);

    const handleAction = async (endpoint: string, payload: any, successMessage: string) => {
        if (!selectedMentee) return alert("Select a mentee first");
        try {
            const token = localStorage.getItem("edupulse_auth_token");
            const res = await fetch(`http://localhost:8000/api/v1/mentor/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ student_id: selectedMentee.id, ...payload })
            });
            if (!res.ok) throw new Error(`API returned ${res.status}`);
            alert(successMessage);
        } catch (error) {
            console.error(error);
            alert("Action failed. Check console.");
        }
    };

    const filteredMentees = MOCK_MENTEES.filter((m) => {
        if (activeFilter !== "All" && m.risk !== activeFilter) return false;
        if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) && !m.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: MOCK_MENTEES.length,
        safe: MOCK_MENTEES.filter((m) => m.risk === "Safe").length,
        warning: MOCK_MENTEES.filter((m) => m.risk === "Warning").length,
        critical: MOCK_MENTEES.filter((m) => m.risk === "Critical").length,
    };

    const subjectHeaders = Object.keys(MOCK_MENTEES[0].subjects);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stat-card stat-card-blue">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><Users className="h-5 w-5 text-blue-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Total Assigned Mentees</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                    <button className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">View All <ChevronRight className="h-3 w-3" /></button>
                </div>

                <div className="stat-card stat-card-green">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Safe (≥ 75%)</p>
                            <p className="text-2xl font-bold text-emerald-700">{stats.safe}</p>
                            <p className="text-xs text-gray-400">{((stats.safe / stats.total) * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-amber">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Warning (50% - 74%)</p>
                            <p className="text-2xl font-bold text-amber-700">{stats.warning}</p>
                            <p className="text-xs text-gray-400">{((stats.warning / stats.total) * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-red">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100"><XCircle className="h-5 w-5 text-red-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Critical (&lt; 50%)</p>
                            <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
                            <p className="text-xs text-gray-400">{((stats.critical / stats.total) * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Table Section */}
                <div className="flex-1 soet-card">
                    {/* Search and Filters */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by student name or roll no."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div className="flex gap-1">
                            {(["All", "Safe", "Warning", "Critical"] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                                        activeFilter === filter
                                            ? filter === "All" ? "bg-blue-600 text-white border-blue-600"
                                                : filter === "Safe" ? "bg-emerald-600 text-white border-emerald-600"
                                                    : filter === "Warning" ? "bg-amber-500 text-white border-amber-500"
                                                        : "bg-red-600 text-white border-red-600"
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
                            <Filter className="h-3.5 w-3.5" /> Filters
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Name</th>
                                    <th className="text-left py-2.5 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Roll No.</th>
                                    <th className="text-left py-2.5 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Batch</th>
                                    {subjectHeaders.map((s) => (
                                        <th key={s} className="text-center py-2.5 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{s}</th>
                                    ))}
                                    <th className="text-center py-2.5 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Overall %</th>
                                    <th className="text-center py-2.5 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk Status</th>
                                    <th className="text-center py-2.5 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMentees.map((mentee) => (
                                    <tr
                                        key={mentee.id}
                                        onClick={() => setSelectedMentee(mentee)}
                                        className={cn(
                                            "border-b border-gray-50 cursor-pointer transition-colors hover:bg-blue-50/50",
                                            selectedMentee?.id === mentee.id && "bg-blue-50"
                                        )}
                                    >
                                        <td className="py-2.5 px-3">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full flex-shrink-0",
                                                    mentee.risk === "Safe" ? "bg-emerald-500" :
                                                        mentee.risk === "Warning" ? "bg-amber-500" :
                                                            mentee.risk === "Critical" ? "bg-red-500" : "bg-gray-400"
                                                )} />
                                                <span className="font-medium text-gray-900">{mentee.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-2 text-gray-600">{mentee.rollNo}</td>
                                        <td className="py-2.5 px-2 text-gray-600">{mentee.batch}</td>
                                        {subjectHeaders.map((s) => (
                                            <td key={s} className="py-2.5 px-2 text-center">
                                                <AttendanceBadge value={mentee.subjects[s as keyof typeof mentee.subjects]} />
                                            </td>
                                        ))}
                                        <td className="py-2.5 px-2 text-center font-semibold text-gray-900">{mentee.overall || "—"}%</td>
                                        <td className="py-2.5 px-2 text-center"><RiskBadge risk={mentee.risk} /></td>
                                        <td className="py-2.5 px-2 text-center">
                                            <button className="p-1 rounded hover:bg-gray-100"><MoreHorizontal className="h-4 w-4 text-gray-400" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                        <span>Showing 1 to {filteredMentees.length} of {filteredMentees.length} mentees</span>
                        <div className="flex gap-1">
                            <button className="h-7 w-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">&lt;</button>
                            <button className="h-7 w-7 rounded bg-blue-600 text-white flex items-center justify-center font-semibold">1</button>
                            <button className="h-7 w-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">&gt;</button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                        <span className="font-medium">Legend (Attendance %):</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> ≥ 75% Safe</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> 50% - 74% Warning</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> &lt; 50% Critical</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400" /> — Pending Approval</span>
                    </div>
                </div>

                {/* Right Panel - Student Detail */}
                {selectedMentee && (
                    <div className="hidden xl:block w-[300px] space-y-4">
                        {/* Student Profile Card */}
                        <div className="soet-card text-center">
                            <button className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                                <XCircle className="h-4 w-4" />
                            </button>
                            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                                {selectedMentee.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <h3 className="mt-3 text-lg font-bold text-gray-900">{selectedMentee.name}</h3>
                            <RiskBadge risk={selectedMentee.risk} />
                            <p className="mt-2 text-xs text-gray-500">{selectedMentee.rollNo} • {selectedMentee.batch}</p>
                            <p className="text-xs text-gray-400">{selectedMentee.name.toLowerCase().replace(" ", ".")}@sgtuniversity.ac.in</p>
                            <p className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-400">
                                <Phone className="h-3 w-3" /> 98765 43210
                            </p>
                        </div>

                        {/* Overall Attendance Donut */}
                        <div className="soet-card">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Overall Attendance</h4>
                            <div className="flex items-center justify-center">
                                <div className="relative h-28 w-28">
                                    <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                        <circle
                                            cx="18" cy="18" r="14" fill="none"
                                            stroke={selectedMentee.overall >= 75 ? "#059669" : selectedMentee.overall >= 50 ? "#d97706" : "#dc2626"}
                                            strokeWidth="3"
                                            strokeDasharray={`${(selectedMentee.overall / 100) * 88} 88`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-900">{selectedMentee.overall}%</span>
                                        <span className="text-[10px] text-gray-400">{selectedMentee.risk}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Safe <span className="ml-auto font-semibold">{stats.safe}</span></div>
                                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Warning <span className="ml-auto font-semibold">{stats.warning}</span></div>
                                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical <span className="ml-auto font-semibold">{stats.critical}</span></div>
                                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-400" /> Pending <span className="ml-auto font-semibold">0</span></div>
                            </div>
                        </div>

                        {/* Pending Approvals */}
                        <div className="soet-card">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Pending Approvals (2)</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">AI Basics - Apr 15, 2025</span>
                                    <span className="badge-warning">Pending</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">ME-4A (Extra Class) - Apr 22, 2025</span>
                                    <span className="badge-warning">Pending</span>
                                </div>
                            </div>
                            <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                View All <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mentorship Actions Bar */}
            <div className="soet-card">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">⚙️</span>
                    <h3 className="text-base font-bold text-gray-900">Mentorship Actions</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/50">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100"><FileText className="h-4 w-4 text-blue-600" /></div>
                        <div><p className="text-sm font-semibold text-gray-900">View Details</p><p className="text-xs text-gray-500">Detailed attendance & performance</p></div>
                    </button>
                    <button 
                        onClick={() => handleAction("counselling", { note: "Discussed low attendance" }, "Counselling note saved!")}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100"><MessageSquare className="h-4 w-4 text-emerald-600" /></div>
                        <div><p className="text-sm font-semibold text-gray-900">Add Counselling Note</p><p className="text-xs text-gray-500">Record discussion & guidance</p></div>
                    </button>
                    <button 
                        onClick={() => handleAction("regularization", { reason_category: "medical", date: "2025-05-23" }, "Regularization requested!")}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100"><ShieldAlert className="h-4 w-4 text-amber-600" /></div>
                        <div><p className="text-sm font-semibold text-gray-900">Request Regularization</p><p className="text-xs text-gray-500">Raise request for attendance update</p></div>
                    </button>
                    <button 
                        onClick={() => handleAction("parent-communication", { communication_type: "phone", summary: "Called father regarding absence" }, "Communication logged!")}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-purple-300 hover:bg-purple-50/50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100"><Phone className="h-4 w-4 text-purple-600" /></div>
                        <div><p className="text-sm font-semibold text-gray-900">Parent Contact Log</p><p className="text-xs text-gray-500">Log parent communication</p></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
