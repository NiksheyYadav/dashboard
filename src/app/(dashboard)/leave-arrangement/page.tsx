"use client";

import { cn } from "@/lib/utils";
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    Save,
    Send,
    X,
} from "lucide-react";
import { useState } from "react";

const MOCK_AFFECTED_LECTURES = [
    { date: "12 May 2025\n(Mon)", slot: "09:00 AM –\n10:00 AM", subject: "Data Structures", section: "CSE-IT 2A", originalTeacher: "Dr. A. Sharma\n(You)", availableTeachers: ["Dr. S. Verma", "Dr. P. Singh", "Dr. M. Jain"], selectedTeacher: "Dr. P. Singh", status: "Pending Acceptance" },
    { date: "12 May 2025\n(Mon)", slot: "10:15 AM –\n11:15 AM", subject: "AI Basics", section: "CSE-IT 3B", originalTeacher: "Dr. A. Sharma\n(You)", availableTeachers: ["Dr. R. Kumar", "Dr. N. Gupta", "Dr. K. Mehta"], selectedTeacher: "Dr. N. Gupta", status: "Accepted" },
    { date: "13 May 2025\n(Tue)", slot: "02:00 PM –\n03:00 PM", subject: "Manufacturing\nProcesses", section: "ME 4A", originalTeacher: "Dr. A. Sharma\n(You)", availableTeachers: ["Dr. V. Yadav", "Dr. P. Singh", "Dr. A. Bansal"], selectedTeacher: "Dr. V. Yadav", status: "Pending Approval" },
    { date: "13 May 2025\n(Tue)", slot: "03:15 PM –\n04:15 PM", subject: "Data Structures", section: "CSE-IT 2A", originalTeacher: "Dr. A. Sharma\n(You)", availableTeachers: ["Dr. S. Verma", "Dr. M. Jain", "Dr. R. Kumar"], selectedTeacher: "Dr. S. Verma", status: "Rejected" },
    { date: "14 May 2025\n(Wed)", slot: "09:00 AM –\n10:00 AM", subject: "AI Basics", section: "CSE-IT 3B", originalTeacher: "Dr. A. Sharma\n(You)", availableTeachers: ["Dr. N. Gupta", "Dr. K. Mehta", "Dr. A. Bansal"], selectedTeacher: "Dr. K. Mehta", status: "Pending Acceptance" },
];

const STATUS_STYLES: Record<string, string> = {
    "Pending Acceptance": "bg-amber-50 text-amber-700 border-amber-200",
    "Accepted": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Pending Approval": "bg-blue-50 text-blue-700 border-blue-200",
    "Rejected": "bg-red-50 text-red-700 border-red-200",
};

export default function LeaveArrangementPage() {
    const [leaveType, setLeaveType] = useState("Casual Leave");
    const [fromDate, setFromDate] = useState("2025-05-12");
    const [toDate, setToDate] = useState("2025-05-14");
    const [reason, setReason] = useState("Attending a faculty development program.");

    const submitLeave = async () => {
        try {
            const token = localStorage.getItem("edupulse_auth_token");
            const res = await fetch("http://localhost:8000/api/v1/leaves/request", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    leave_type: leaveType,
                    from_date: fromDate,
                    to_date: toDate,
                    reason: reason,
                    arrangements: [
                        { slot_id: "00000000-0000-0000-0000-000000000000", arrangement_teacher_id: "00000000-0000-0000-0000-000000000000", subject_id: "00000000-0000-0000-0000-000000000000", section_id: "00000000-0000-0000-0000-000000000000", date: fromDate }
                    ]
                })
            });
            if (!res.ok) throw new Error("API failed");
            alert("Leave request submitted successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to submit leave request.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Leave & Class Arrangement</h2>
                    <p className="text-sm text-gray-500">Apply leave and arrange replacement classes</p>
                </div>
                {/* Summary Stats */}
                <div className="flex gap-4">
                    <div className="stat-card stat-card-blue text-center px-6">
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarDays className="h-5 w-5 text-blue-500" />
                            <span className="text-2xl font-bold text-gray-900">12</span>
                        </div>
                        <p className="text-xs text-gray-500">Total Lectures<br />Affected</p>
                    </div>
                    <div className="stat-card stat-card-green text-center px-6">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <span className="text-2xl font-bold text-gray-900">07</span>
                        </div>
                        <p className="text-xs text-gray-500">Arrangements<br />Accepted</p>
                    </div>
                    <div className="stat-card stat-card-amber text-center px-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-5 w-5 text-amber-500" />
                            <span className="text-2xl font-bold text-gray-900">05</span>
                        </div>
                        <p className="text-xs text-gray-500">Pending<br />Approval</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leave Application Form */}
                <div className="soet-card">
                    <h3 className="soet-card-header"><CalendarDays className="h-4 w-4 text-blue-600" /> 1. Leave Application</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Leave Type *</label>
                                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-400">
                                    <option>Casual Leave</option>
                                    <option>Medical Leave</option>
                                    <option>Duty Leave</option>
                                    <option>Earned Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">From Date *</label>
                                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">To Date *</label>
                                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-400" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Reason *</label>
                            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
                            <p className="text-right text-xs text-gray-400 mt-1">{reason.length}/400</p>
                        </div>
                        <div className="text-xs text-gray-500">Affected Lectures <span className="badge-safe ml-2">12 Lectures</span></div>
                        <p className="text-xs text-gray-400">Lectures that require arrangement are listed below.</p>
                    </div>
                </div>

                {/* Workflow Progress */}
                <div className="soet-card">
                    <h3 className="soet-card-header">Workflow Progress</h3>
                    <div className="flex items-center justify-center gap-0 py-8">
                        <div className="flex flex-col items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">1</div>
                            <p className="mt-2 text-xs font-medium text-gray-700 text-center">Teacher<br />Submission</p>
                        </div>
                        <div className="h-0.5 w-20 bg-blue-600 mt-[-20px]" />
                        <div className="flex flex-col items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold text-sm">2</div>
                            <p className="mt-2 text-xs font-medium text-gray-500 text-center">Arrangement<br />Teacher Acceptance</p>
                        </div>
                        <div className="h-0.5 w-20 bg-gray-200 mt-[-20px]" />
                        <div className="flex flex-col items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold text-sm">3</div>
                            <p className="mt-2 text-xs font-medium text-gray-500 text-center">HoD<br />Approval</p>
                        </div>
                    </div>
                    {/* Info note */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700">
                            <strong>Note:</strong> Arrangement class attendance will be counted for students&apos; attendance and detention, but it will not be counted for the original teacher&apos;s course completion.
                        </p>
                    </div>
                </div>
            </div>

            {/* Affected Lectures Table */}
            <div className="soet-card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="soet-card-header mb-0"><FileText className="h-4 w-4 text-blue-600" /> 2. Affected Lectures & Arrangement</h3>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pending Acceptance</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Accepted</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Rejected</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Date</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Slot</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Subject</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Section</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Original Teacher</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Available Arrangement Teachers</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Selected Teacher</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_AFFECTED_LECTURES.map((lecture, i) => (
                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="py-3 px-3 text-xs text-gray-700 whitespace-pre-line">{lecture.date}</td>
                                    <td className="py-3 px-3 text-xs text-gray-700 whitespace-pre-line">{lecture.slot}</td>
                                    <td className="py-3 px-3 text-sm font-medium text-gray-900 whitespace-pre-line">{lecture.subject}</td>
                                    <td className="py-3 px-3 text-sm text-gray-700">{lecture.section}</td>
                                    <td className="py-3 px-3 text-xs text-gray-700 whitespace-pre-line">{lecture.originalTeacher}</td>
                                    <td className="py-3 px-3">
                                        <div className="flex flex-wrap gap-1">
                                            {lecture.availableTeachers.map((t) => (
                                                <span key={t} className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                                                    {t} <X className="h-3 w-3 cursor-pointer hover:text-red-500" />
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-sm font-medium text-gray-900">{lecture.selectedTeacher}</td>
                                    <td className="py-3 px-3 text-center">
                                        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border", STATUS_STYLES[lecture.status] || "")}>
                                            {lecture.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-blue-300 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
                        <Save className="h-4 w-4" /> Save Draft
                    </button>
                    <button onClick={submitLeave} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1a56db] text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
                        <Send className="h-4 w-4" /> Submit Leave Request
                    </button>
                </div>
            </div>
        </div>
    );
}
