"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { apiUrl, API_BASE } from "@/lib/api/config";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    Eye,
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
    const { user, token } = useAuth();
    const [mentees, setMentees] = useState<any[]>(MOCK_MENTEES);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"All" | RiskLevel>("All");
    const [selectedMenteeSubjects, setSelectedMenteeSubjects] = useState<any>(null); // For drill-down
    const [selectedMentee, setSelectedMentee] = useState<typeof MOCK_MENTEES[0] | null>(MOCK_MENTEES[0]);
    const [isActionSuccess, setIsActionSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchMentees = async () => {
            if (!token) return;
            try {
                const res = await fetch(apiUrl("/mentor/mentees"), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const formatted = data.map((m: any) => ({
                            id: m.id,
                            name: m.name,
                            rollNo: m.roll_no,
                            batch: m.batch || "Assigned",
                            subjects: { "Data Structures": 85, "Mathematics": 78 }, // Mock subjects
                            overall: 82, // Mock overall
                            risk: "Safe" as const
                        }));
                        setMentees(formatted);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch mentees:", err);
            }
            setMentees(MOCK_MENTEES); // Fallback
        };
        fetchMentees();
    }, [token]);

    const handleAction = async (endpoint: string, payload: any, successMessage: string) => {
        if (!selectedMentee) return;
        try {
            const token = localStorage.getItem("edupulse_auth_token");
            const res = await fetch(`${API_BASE}/mentor/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ student_id: selectedMentee.id, ...payload })
            });
            if (!res.ok) throw new Error(`API returned ${res.status}`);
            setIsActionSuccess(successMessage);
            setTimeout(() => setIsActionSuccess(null), 3000);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredMentees = mentees.filter((m) => {
        if (activeFilter !== "All" && m.risk !== activeFilter) return false;
        if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) && !m.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: mentees.length,
        safe: mentees.filter((m) => m.risk === "Safe").length,
        warning: mentees.filter((m) => m.risk === "Warning").length,
        critical: mentees.filter((m) => m.risk === "Critical").length,
    };

    const subjectHeaders = mentees.length > 0 && mentees[0].subjects ? Object.keys(mentees[0].subjects) : [];

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
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedMenteeSubjects(mentee); }}
                                                className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                                title="View detailed attendance"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel - Student Detail */}
                {selectedMentee && (
                    <div className="hidden xl:block w-[300px] space-y-4">
                        <div className="soet-card text-center">
                            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                                {selectedMentee.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <h3 className="mt-3 text-lg font-bold text-gray-900">{selectedMentee.name}</h3>
                            <RiskBadge risk={selectedMentee.risk} />
                            <p className="mt-2 text-xs text-gray-500">{selectedMentee.rollNo} • {selectedMentee.batch}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mentorship Actions Bar */}
            <div className="soet-card">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Mentorship Actions</h3>
                    {isActionSuccess && <span className="text-xs font-semibold text-emerald-600">{isActionSuccess}</span>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <button 
                        onClick={() => {
                            if (!selectedMentee) { 
                                setIsActionSuccess("Select a mentee first.");
                                setTimeout(() => setIsActionSuccess(null), 3000);
                            } else {
                                setSelectedMenteeSubjects(selectedMentee);
                            }
                        }}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/50"
                    >
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
                    <button 
                        onClick={() => handleAction("warning-letter", { stage: "advisory", reason: "Attendance below 65% threshold" }, "Warning letter initiated!")}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-red-300 hover:bg-red-50/50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100"><AlertTriangle className="h-4 w-4 text-red-600" /></div>
                        <div><p className="text-sm font-semibold text-gray-900">Warning Letter</p><p className="text-xs text-gray-500">Initiate formal warning</p></div>
                    </button>
                    <button 
                        onClick={async () => {
                            if (!selectedMentee) { 
                                setIsActionSuccess("Select a mentee first.");
                                setTimeout(() => setIsActionSuccess(null), 3000);
                                return; 
                            }
                            try {
                                const token = localStorage.getItem("edupulse_auth_token");
                                const res = await fetch(apiUrl("/reports/export"), {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                    body: JSON.stringify({ report_type: "mentor_report" })
                                });
                                if (!res.ok) throw new Error("Export failed");
                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `parent_summary_${selectedMentee.rollNo}.csv`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                setIsActionSuccess("Report Generated Successfully");
                                setTimeout(() => setIsActionSuccess(null), 3000);
                            } catch { 
                                setIsActionSuccess("Failed to generate parent summary.");
                                setTimeout(() => setIsActionSuccess(null), 3000);
                            }
                        }}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100"><FileText className="h-4 w-4 text-indigo-600" /></div>
                        <div><p className="text-sm font-semibold text-gray-900">Parent Summary Report</p><p className="text-xs text-gray-500">Generate parent-facing PDF</p></div>
                    </button>
                </div>
            </div>

            {/* Detailed Attendance Dialog */}
            <Dialog open={!!selectedMenteeSubjects} onOpenChange={(open) => !open && setSelectedMenteeSubjects(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detailed Attendance</DialogTitle>
                        <DialogDescription>{selectedMenteeSubjects?.name}'s subject-wise attendance breakdown.</DialogDescription>
                    </DialogHeader>
                    {selectedMenteeSubjects && (
                        <div className="space-y-4 text-sm mt-4">
                            <div className="space-y-2">
                                {Object.entries(selectedMenteeSubjects.subjects).map(([s, v]) => (
                                    <div key={s} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                        <span className="text-gray-600 font-medium">{s}</span>
                                        <span className={cn(
                                            "font-bold",
                                            (v as number) >= 75 ? "text-emerald-600" : (v as number) >= 50 ? "text-amber-600" : "text-red-600"
                                        )}>{v as number}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 flex justify-between items-center bg-gray-50 p-3 rounded-lg mt-4">
                                <span className="font-semibold text-gray-900">Overall Attendance</span>
                                <span className="font-bold text-lg text-gray-900">{selectedMenteeSubjects.overall}%</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
