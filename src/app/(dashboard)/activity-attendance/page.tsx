"use client";

import { cn } from "@/lib/utils";
import {
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock,
    ClipboardCheck,
    Download,
    Eye,
    FileText,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Upload,
    Users,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useAuth } from "@/lib/auth/auth-context";
import { useEffect } from "react";
import { apiUrl, API_BASE } from "@/lib/api/config";

const MOCK_ACTIVITIES = [
    { id: "1", name: "AI & Machine Learning Workshop", type: "Workshop", date: "10 May 2025", coordinator: "Dr. S. Verma", participants: 45, approved: true, attendanceCredited: true, proofUploaded: true },
    { id: "2", name: "Industrial Visit to Maruti Suzuki", type: "Industrial Visit", date: "08 May 2025", coordinator: "Dr. P. Singh", participants: 30, approved: true, attendanceCredited: true, proofUploaded: true },
    { id: "3", name: "Campus Hackathon 2025", type: "Competition", date: "15 May 2025", coordinator: "Dr. R. Kumar", participants: 60, approved: true, attendanceCredited: false, proofUploaded: false },
    { id: "4", name: "Entrepreneurship Seminar", type: "Seminar", date: "20 May 2025", coordinator: "Prof. A. Gupta", participants: 80, approved: false, attendanceCredited: false, proofUploaded: false },
    { id: "5", name: "Code Sprint Contest", type: "Competition", date: "22 May 2025", coordinator: "Dr. M. Jain", participants: 25, approved: false, attendanceCredited: false, proofUploaded: false },
];

export default function ActivityAttendancePage() {
    const { user, token } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [activities, setActivities] = useState<any[]>(MOCK_ACTIVITIES);
    const [selectedViewActivity, setSelectedViewActivity] = useState<any>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivities = async () => {
            if (!token) return;
            try {
                const res = await fetch(apiUrl("/activities"), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.items && data.items.length > 0) {
                        const formatted = data.items.map((a: any) => ({
                            id: a.id,
                            name: a.name,
                            type: a.activity_type,
                            date: a.date,
                            coordinator: a.creator_id,
                            participants: 40, // Mock
                            approved: a.status === "approved",
                            attendanceCredited: a.status === "completed",
                            proofUploaded: false
                        }));
                        setActivities(formatted);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch activities:", err);
            }
            setActivities(MOCK_ACTIVITIES);
        };
        fetchActivities();
    }, [token]);

    const filteredActivities = activities.filter((a) => {
        if (typeFilter !== "All" && a.type !== typeFilter) return false;
        if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: activities.length,
        approved: activities.filter((a) => a.approved).length,
        credited: activities.filter((a) => a.attendanceCredited).length,
        pending: activities.filter((a) => !a.approved).length,
    };

    const approveActivity = async (id: string, isApproved: boolean) => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/activities/${id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ action: isApproved ? 'accept' : 'reject' })
            });
            if (res.ok) {
                setActivities(prev => prev.map(a => a.id === id ? { ...a, approved: isApproved } : a));
                if (!isApproved) {
                    setActivities(prev => prev.filter(a => a.id !== id));
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const createActivity = async () => {
        try {
            const token = localStorage.getItem("edupulse_auth_token");
            const res = await fetch(apiUrl("/activities"), {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    name: "New Activity",
                    activity_type: "Workshop",
                    date: new Date().toISOString().split("T")[0],
                    description: "Activity created from dashboard"
                })
            });
            if (!res.ok) throw new Error("API failed");
            const newAct = await res.json();
            setActivities(prev => [{
                id: newAct.id || Math.random().toString(),
                name: "New Activity",
                type: "Workshop",
                date: new Date().toLocaleDateString(),
                coordinator: "You",
                participants: 0,
                approved: false,
                attendanceCredited: false,
                proofUploaded: false
            }, ...prev]);
        } catch (error) {
            console.error(error);
            setActionMessage("Failed to create activity.");
            setTimeout(() => setActionMessage(null), 3000);
        }
    };

    const creditAttendance = async (activityId: string) => {
        try {
            const token = localStorage.getItem("edupulse_auth_token");
            const res = await fetch(`${API_BASE}/activities/${activityId}/credit`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("API failed");
            setActivities(prev => prev.map(a => a.id === activityId ? { ...a, attendanceCredited: true } : a));
        } catch (error) {
            console.error(error);
            setActionMessage("Failed to credit attendance.");
            setTimeout(() => setActionMessage(null), 3000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stat-card stat-card-blue">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><ClipboardCheck className="h-5 w-5 text-blue-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Total Activities</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card stat-card-green">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">HoD Approved</p>
                            <p className="text-2xl font-bold text-emerald-700">{stats.approved}</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card stat-card-amber">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100"><Users className="h-5 w-5 text-violet-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Attendance Credited</p>
                            <p className="text-2xl font-bold text-violet-700">{stats.credited}</p>
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

            {/* Info Banner */}
            <div className="rounded-lg bg-violet-50 border border-violet-200 p-4">
                <p className="text-sm text-violet-800">
                    <strong>📋 Activity Attendance Rule:</strong> Activity attendance (workshops, seminars, industrial visits, etc.) requires <strong>HoD approval</strong> and <strong>proof of participation</strong> before attendance can be credited to student records.
                </p>
            </div>

            {/* Activities Table */}
            <div className="soet-card">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" placeholder="Search activities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[280px] h-9 rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-400" />
                        </div>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none">
                            <option value="All">All Types</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Seminar">Seminar</option>
                            <option value="Industrial Visit">Industrial Visit</option>
                            <option value="Competition">Competition</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        {actionMessage && <span className="text-sm font-medium text-red-600 animate-pulse">{actionMessage}</span>}
                        <button onClick={createActivity} className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1a56db] text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus className="h-4 w-4" /> Add Activity
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Activity Name</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Type</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Date</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Coordinator</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Participants</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">HoD Approval</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Proof</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Attendance</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActivities.map((activity) => (
                                <tr key={activity.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="py-3 px-3">
                                        <span className="font-medium text-gray-900">{activity.name}</span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                                            {activity.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-gray-700">{activity.date}</td>
                                    <td className="py-3 px-3 text-gray-700">{activity.coordinator}</td>
                                    <td className="py-3 px-3 text-center font-semibold text-gray-900">{activity.participants}</td>
                                    <td className="py-3 px-3 text-center">
                                        {activity.approved ? (
                                            <span className="badge-safe">Approved</span>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="badge-warning">Pending</span>
                                                {(user?.role === "hod" || user?.role === "dean") && (
                                                    <div className="flex gap-1 mt-1">
                                                        <button onClick={() => approveActivity(activity.id, true)} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded hover:bg-emerald-200">Approve</button>
                                                        <button onClick={() => approveActivity(activity.id, false)} className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded hover:bg-red-200">Reject</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        {activity.proofUploaded ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><FileText className="h-3 w-3" /> Uploaded</span>
                                        ) : (
                                            <button onClick={() => setActivities(prev => prev.map(a => a.id === activity.id ? { ...a, proofUploaded: true } : a))} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"><Upload className="h-3 w-3" /> Upload</button>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        {activity.attendanceCredited ? (
                                            <span className="badge-safe">Credited</span>
                                        ) : activity.approved ? (
                                            <button onClick={() => creditAttendance(activity.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Credit Now</button>
                                        ) : (
                                            <span className="badge-pending">Not Yet</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => setSelectedViewActivity(activity)} className="p-1 rounded hover:bg-gray-100">
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            </button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-1 rounded hover:bg-gray-100">
                                                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {}}>Edit Activity</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {}}>Add Participants</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {}} className="text-red-600 focus:bg-red-50 focus:text-red-700">Delete Activity</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Activity Details Dialog */}
            <Dialog open={!!selectedViewActivity} onOpenChange={(open) => !open && setSelectedViewActivity(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activity Details</DialogTitle>
                        <DialogDescription>View comprehensive details for this activity.</DialogDescription>
                    </DialogHeader>
                    {selectedViewActivity && (
                        <div className="space-y-4 text-sm mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-gray-500 block text-xs">Name</span><span className="font-medium text-gray-900">{selectedViewActivity.name}</span></div>
                                <div><span className="text-gray-500 block text-xs">Type</span><span className="font-medium text-gray-900">{selectedViewActivity.type}</span></div>
                                <div><span className="text-gray-500 block text-xs">Date</span><span className="font-medium text-gray-900">{selectedViewActivity.date}</span></div>
                                <div><span className="text-gray-500 block text-xs">Coordinator</span><span className="font-medium text-gray-900">{selectedViewActivity.coordinator}</span></div>
                                <div><span className="text-gray-500 block text-xs">Participants</span><span className="font-medium text-gray-900">{selectedViewActivity.participants}</span></div>
                                <div><span className="text-gray-500 block text-xs">Approved</span><span className="font-medium text-gray-900">{selectedViewActivity.approved ? "Yes" : "No"}</span></div>
                                <div><span className="text-gray-500 block text-xs">Attendance Credited</span><span className="font-medium text-gray-900">{selectedViewActivity.attendanceCredited ? "Yes" : "No"}</span></div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
