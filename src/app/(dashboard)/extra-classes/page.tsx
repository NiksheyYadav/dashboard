"use client";

import { cn } from "@/lib/utils";
import {
    BookOpen,
    CalendarPlus,
    CheckCircle2,
    ChevronRight,
    Clock,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Users,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { useAuth } from "@/lib/auth/auth-context";
import { useEffect } from "react";

const MOCK_EXTRA_CLASSES = [
    { id: "mock-1", date: "15 May 2025", day: "Thu", time: "05:00 PM – 06:00 PM", subject: "Data Structures", section: "CSE-IT 2A", type: "Extra", reason: "Pending syllabus on Graph Theory", topicCovered: "BFS, DFS, Shortest Path", room: "LT-201", status: "Conducted", attendance: "42/45" },
    { id: "mock-2", date: "16 May 2025", day: "Fri", time: "04:00 PM – 05:00 PM", subject: "AI Basics", section: "CSE-IT 3B", type: "Make-up", reason: "Missed due to faculty leave on 12 May", topicCovered: "Neural Network Basics", room: "LT-105", status: "Scheduled", attendance: "—" },
    { id: "mock-3", date: "17 May 2025", day: "Sat", time: "10:00 AM – 11:00 AM", subject: "Manufacturing Processes", section: "ME 4A", type: "Extra", reason: "Additional practice for viva preparation", topicCovered: "Casting, Welding Review", room: "LT-302", status: "Pending Approval", attendance: "—" },
    { id: "mock-4", date: "18 May 2025", day: "Sun", time: "09:00 AM – 10:00 AM", subject: "Data Structures", section: "CSE-IT 2A", type: "Make-up", reason: "Arrangement class was not conducted on 13 May", topicCovered: "Heap, Priority Queue", room: "LT-201", status: "Rejected", attendance: "—" },
    { id: "mock-5", date: "20 May 2025", day: "Tue", time: "05:00 PM – 06:00 PM", subject: "AI Basics", section: "CSE-IT 3B", type: "Extra", reason: "Industry guest lecture preparation", topicCovered: "Introduction to NLP", room: "Seminar Hall", status: "Scheduled", attendance: "—" },
];

const STATUS_STYLES: Record<string, string> = {
    "Conducted": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Scheduled": "bg-blue-50 text-blue-700 border-blue-200",
    "Pending Approval": "bg-amber-50 text-amber-700 border-amber-200",
    "Rejected": "bg-red-50 text-red-700 border-red-200",
};

const TYPE_STYLES: Record<string, string> = {
    "Extra": "bg-violet-50 text-violet-700 border-violet-200",
    "Make-up": "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export default function ExtraClassesPage() {
    const { user, token } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classes, setClasses] = useState<any[]>(MOCK_EXTRA_CLASSES);
    const [selectedViewClass, setSelectedViewClass] = useState<any>(null);

    const filteredClasses = classes.filter((c) => {
        if (statusFilter !== "All" && c.status !== statusFilter) return false;
        if (searchQuery && !c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) && !c.section?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: classes.length,
        conducted: classes.filter((c) => c.status === "Conducted").length,
        scheduled: classes.filter((c) => c.status === "Scheduled").length,
        pending: classes.filter((c) => c.status === "Pending Approval").length,
    };

    const approveClass = async (id: string, isApproved: boolean) => {
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:8000/api/v1/leaves/extra-class/${id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ action: isApproved ? 'accept' : 'reject' })
            });
            if (res.ok) {
                setClasses(prev => prev.map(c => c.id === id ? { ...c, status: isApproved ? 'Scheduled' : 'Rejected' } : c));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stat-card stat-card-blue">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><CalendarPlus className="h-5 w-5 text-blue-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Total Extra/Make-Up Classes</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-green">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Conducted</p>
                            <p className="text-2xl font-bold text-emerald-700">{stats.conducted}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-amber">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><Clock className="h-5 w-5 text-blue-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Scheduled</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.scheduled}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-red">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100"><Clock className="h-5 w-5 text-amber-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Pending Approval</p>
                            <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Rule Info */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-800">
                    <strong>📝 Key Rule:</strong> Extra/Make-up classes count for both student attendance and teacher&apos;s planned lecture count. Only the <strong>original subject teacher</strong> can schedule and record attendance.
                </p>
            </div>

            {/* Table */}
            <div className="soet-card">
                {/* Search and Controls */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by subject or section..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-[280px] h-9 rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-400"
                            />
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none">
                            <option value="All">All Status</option>
                            <option value="Conducted">Conducted</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                            <Filter className="h-3.5 w-3.5" /> Filters
                        </button>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1a56db] text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="h-4 w-4" /> Schedule Extra Class
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Date</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Time</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Subject</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Section</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Type</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Room</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Topic Covered</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Attendance</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Status</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasses.map((cls) => (
                                <tr key={cls.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="py-3 px-3">
                                        <div className="text-sm font-medium text-gray-900">{cls.date}</div>
                                        <div className="text-xs text-gray-400">{cls.day}</div>
                                    </td>
                                    <td className="py-3 px-3 text-xs text-gray-700">{cls.time}</td>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium text-gray-900">{cls.subject}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-gray-700">{cls.section}</td>
                                    <td className="py-3 px-3 text-center">
                                        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border", TYPE_STYLES[cls.type] || "")}>
                                            {cls.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-gray-700">{cls.room}</td>
                                    <td className="py-3 px-3 text-xs text-gray-600 max-w-[200px] truncate">{cls.topicCovered}</td>
                                    <td className="py-3 px-3 text-center">
                                        <span className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-900">
                                            <Users className="h-3.5 w-3.5 text-gray-400" /> {cls.attendance}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border", STATUS_STYLES[cls.status] || "")}>
                                            {cls.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {cls.status === "Scheduled" && (
                                                <button 
                                                    onClick={() => setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, status: "Conducted" } : c))}
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium mr-2"
                                                >
                                                    Mark Attendance
                                                </button>
                                            )}
                                            {cls.status === "Pending Approval" && (user?.role === "hod" || user?.role === "dean") && (
                                                <>
                                                    <button onClick={() => approveClass(cls.id, true)} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded hover:bg-emerald-200">Approve</button>
                                                    <button onClick={() => approveClass(cls.id, false)} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200">Reject</button>
                                                </>
                                            )}
                                            {cls.status === "Conducted" && (
                                                <button 
                                                    onClick={() => setSelectedViewClass(cls)}
                                                    className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700" 
                                                    title="View Details"
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                    <span>Showing 1 to {filteredClasses.length} of {filteredClasses.length} classes</span>
                    <div className="flex gap-1">
                        <button className="h-7 w-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">&lt;</button>
                        <button className="h-7 w-7 rounded bg-blue-600 text-white flex items-center justify-center font-semibold">1</button>
                        <button className="h-7 w-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">&gt;</button>
                    </div>
                </div>
            </div>

            {/* Modal for Scheduling */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Schedule Extra / Make-up Class</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">Subject *</label>
                                    <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none"><option>Select Subject</option></select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">Type *</label>
                                    <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none"><option>Extra</option><option>Make-up</option></select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">Date *</label>
                                    <input type="date" className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">Time *</label>
                                    <div className="flex gap-2">
                                        <input type="time" className="w-full h-9 rounded-lg border border-gray-200 px-2 text-sm outline-none" />
                                        <span className="self-center">-</span>
                                        <input type="time" className="w-full h-9 rounded-lg border border-gray-200 px-2 text-sm outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Reason *</label>
                                <textarea rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none resize-none" placeholder="Reason for scheduling..." />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Topic Covered *</label>
                                <input type="text" className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none" placeholder="What will be taught?" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Room / Venue *</label>
                                <input type="text" className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none" placeholder="e.g. LT-201" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100 px-6 pb-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button onClick={() => { 
                                setClasses(prev => [{
                                    id: `mock-${Date.now()}`,
                                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                                    day: new Date().toLocaleDateString('en-GB', { weekday: 'short' }),
                                    time: "09:00 AM - 10:00 AM",
                                    subject: "New Class",
                                    section: "New Section",
                                    type: "Extra",
                                    reason: "Additional Class",
                                    topicCovered: "TBD",
                                    room: "TBD",
                                    status: "Pending Approval",
                                    attendance: "—"
                                }, ...prev]);
                                setIsModalOpen(false); 
                            }} className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700">Submit Request</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Class Details Dialog */}
            <Dialog open={!!selectedViewClass} onOpenChange={(open) => !open && setSelectedViewClass(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Extra Class Details</DialogTitle>
                        <DialogDescription>Information about the requested session.</DialogDescription>
                    </DialogHeader>
                    {selectedViewClass && (
                        <div className="space-y-4 text-sm mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-gray-500 block text-xs">Subject</span><span className="font-medium text-gray-900">{selectedViewClass.subject}</span></div>
                                <div><span className="text-gray-500 block text-xs">Section</span><span className="font-medium text-gray-900">{selectedViewClass.section}</span></div>
                                <div><span className="text-gray-500 block text-xs">Date</span><span className="font-medium text-gray-900">{selectedViewClass.date} ({selectedViewClass.day})</span></div>
                                <div><span className="text-gray-500 block text-xs">Time</span><span className="font-medium text-gray-900">{selectedViewClass.time}</span></div>
                                <div><span className="text-gray-500 block text-xs">Type</span><span className="font-medium text-gray-900">{selectedViewClass.type}</span></div>
                                <div><span className="text-gray-500 block text-xs">Room</span><span className="font-medium text-gray-900">{selectedViewClass.room}</span></div>
                                <div><span className="text-gray-500 block text-xs">Reason</span><span className="font-medium text-gray-900">{selectedViewClass.reason}</span></div>
                                <div><span className="text-gray-500 block text-xs">Topic Covered</span><span className="font-medium text-gray-900">{selectedViewClass.topicCovered}</span></div>
                                <div><span className="text-gray-500 block text-xs">Status</span><span className="font-medium text-gray-900">{selectedViewClass.status}</span></div>
                                <div><span className="text-gray-500 block text-xs">Attendance</span><span className="font-medium text-gray-900">{selectedViewClass.attendance}</span></div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
