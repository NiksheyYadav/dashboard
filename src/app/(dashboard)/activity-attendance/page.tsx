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

const MOCK_ACTIVITIES = [
    { id: "1", name: "AI & Machine Learning Workshop", type: "Workshop", date: "10 May 2025", coordinator: "Dr. S. Verma", participants: 45, approved: true, attendanceCredited: true, proofUploaded: true },
    { id: "2", name: "Industrial Visit to Maruti Suzuki", type: "Industrial Visit", date: "08 May 2025", coordinator: "Dr. P. Singh", participants: 30, approved: true, attendanceCredited: true, proofUploaded: true },
    { id: "3", name: "Campus Hackathon 2025", type: "Competition", date: "15 May 2025", coordinator: "Dr. R. Kumar", participants: 60, approved: true, attendanceCredited: false, proofUploaded: false },
    { id: "4", name: "Entrepreneurship Seminar", type: "Seminar", date: "20 May 2025", coordinator: "Prof. A. Gupta", participants: 80, approved: false, attendanceCredited: false, proofUploaded: false },
    { id: "5", name: "Code Sprint Contest", type: "Competition", date: "22 May 2025", coordinator: "Dr. M. Jain", participants: 25, approved: false, attendanceCredited: false, proofUploaded: false },
];

export default function ActivityAttendancePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    const filteredActivities = MOCK_ACTIVITIES.filter((a) => {
        if (typeFilter !== "All" && a.type !== typeFilter) return false;
        if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: MOCK_ACTIVITIES.length,
        approved: MOCK_ACTIVITIES.filter((a) => a.approved).length,
        credited: MOCK_ACTIVITIES.filter((a) => a.attendanceCredited).length,
        pending: MOCK_ACTIVITIES.filter((a) => !a.approved).length,
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
                    <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1a56db] text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="h-4 w-4" /> Add Activity
                    </button>
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
                                            <span className="badge-warning">Pending</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        {activity.proofUploaded ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><FileText className="h-3 w-3" /> Uploaded</span>
                                        ) : (
                                            <button className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"><Upload className="h-3 w-3" /> Upload</button>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        {activity.attendanceCredited ? (
                                            <span className="badge-safe">Credited</span>
                                        ) : (
                                            <span className="badge-pending">Not Yet</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button className="p-1 rounded hover:bg-gray-100"><Eye className="h-4 w-4 text-gray-400" /></button>
                                            <button className="p-1 rounded hover:bg-gray-100"><MoreHorizontal className="h-4 w-4 text-gray-400" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
