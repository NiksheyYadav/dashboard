"use client";

import { cn } from "@/lib/utils";
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Clock,
    Download,
    Filter,
    Save,
    Search,
    Users,
    XCircle,
} from "lucide-react";
import { useState } from "react";

const SUBJECTS_LIST = [
    { code: "CS301", name: "Data Structures", section: "CSE-IT 2A", scheduled: 45, conducted: 38, remaining: 7 },
    { code: "CS302", name: "AI Basics", section: "CSE-IT 3B", scheduled: 40, conducted: 35, remaining: 5 },
    { code: "ME401", name: "Manufacturing Processes", section: "ME 4A", scheduled: 42, conducted: 36, remaining: 6 },
];

const MOCK_STUDENTS = [
    { rollNo: "22CS101", name: "Ananya Verma", present: 35, absent: 3, percent: 92, status: "present" as const },
    { rollNo: "22CS104", name: "Rohit Kumar", present: 26, absent: 12, percent: 68, status: "present" as const },
    { rollNo: "22CS107", name: "Priya Singh", present: 22, absent: 16, percent: 58, status: "absent" as const },
    { rollNo: "22CS110", name: "Vivek Yadav", present: 34, absent: 4, percent: 89, status: "present" as const },
    { rollNo: "22CS113", name: "Karan Mehta", present: 18, absent: 20, percent: 47, status: "absent" as const },
    { rollNo: "22CS116", name: "Neha Gupta", present: 30, absent: 8, percent: 79, status: "present" as const },
    { rollNo: "22CS119", name: "Arjun Patel", present: 25, absent: 13, percent: 66, status: "present" as const },
    { rollNo: "22CS122", name: "Simran Kaur", present: 14, absent: 24, percent: 37, status: "absent" as const },
];

type AttendanceStatus = "present" | "absent" | "no_class_conducted";

export default function SubjectAttendancePage() {
    const [selectedSubject, setSelectedSubject] = useState(0);
    const [selectedDate, setSelectedDate] = useState("2025-05-23");
    const [selectedSlot, setSelectedSlot] = useState("1");
    const [markAllStatus, setMarkAllStatus] = useState<AttendanceStatus | "">("");
    const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>(
        Object.fromEntries(MOCK_STUDENTS.map((s) => [s.rollNo, s.status]))
    );

    const subject = SUBJECTS_LIST[selectedSubject];
    const presentCount = Object.values(studentStatuses).filter((s) => s === "present").length;
    const absentCount = Object.values(studentStatuses).filter((s) => s === "absent").length;
    const totalStudents = MOCK_STUDENTS.length;

    const toggleStatus = (rollNo: string) => {
        setStudentStatuses((prev) => ({
            ...prev,
            [rollNo]: prev[rollNo] === "present" ? "absent" : "present",
        }));
    };

    const markAll = (status: AttendanceStatus) => {
        setStudentStatuses(Object.fromEntries(MOCK_STUDENTS.map((s) => [s.rollNo, status])));
    };

    const submitAttendance = async () => {
        const payload = {
            subject_id: "00000000-0000-0000-0000-000000000000", // mock UUID
            date: selectedDate,
            slot_id: null,
            class_type: "regular",
            records: MOCK_STUDENTS.map(s => ({
                student_id: "00000000-0000-0000-0000-000000000000", // mock UUID
                status: studentStatuses[s.rollNo]
            }))
        };

        try {
            const token = localStorage.getItem("edupulse_auth_token");
            const res = await fetch("http://localhost:8000/api/v1/attendance/mark", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to mark attendance");
            alert("Attendance submitted successfully!");
        } catch (error) {
            console.error(error);
            alert("Error submitting attendance. Check console.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header: Select Subject, Date, Slot */}
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Subject *</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(parseInt(e.target.value))}
                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-400"
                    >
                        {SUBJECTS_LIST.map((s, i) => (
                            <option key={i} value={i}>{s.code} — {s.name} ({s.section})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Date *</label>
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Slot *</label>
                    <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-400">
                        <option value="1">Slot 1 (09:00 - 10:00)</option>
                        <option value="2">Slot 2 (10:15 - 11:15)</option>
                        <option value="3">Slot 3 (11:30 - 12:30)</option>
                        <option value="4">Slot 4 (02:00 - 03:00)</option>
                        <option value="5">Slot 5 (03:15 - 04:15)</option>
                    </select>
                </div>
            </div>

            {/* Subject Info Card + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="soet-card lg:col-span-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{subject.name}</h3>
                            <p className="text-xs text-gray-500">{subject.code} • {subject.section}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-gray-50 p-2">
                            <p className="text-lg font-bold text-gray-900">{subject.scheduled}</p>
                            <p className="text-[10px] text-gray-500">Planned</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-2">
                            <p className="text-lg font-bold text-emerald-700">{subject.conducted}</p>
                            <p className="text-[10px] text-gray-500">Conducted</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-2">
                            <p className="text-lg font-bold text-amber-700">{subject.remaining}</p>
                            <p className="text-[10px] text-gray-500">Remaining</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 lg:col-span-2">
                    <div className="stat-card stat-card-blue flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><Users className="h-5 w-5 text-blue-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                        </div>
                    </div>
                    <div className="stat-card stat-card-green flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Present Today</p>
                            <p className="text-2xl font-bold text-emerald-700">{presentCount}</p>
                        </div>
                    </div>
                    <div className="stat-card stat-card-red flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100"><XCircle className="h-5 w-5 text-red-600" /></div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Absent Today</p>
                            <p className="text-2xl font-bold text-red-700">{absentCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Marking Table */}
            <div className="soet-card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="soet-card-header mb-0"><Calendar className="h-4 w-4 text-blue-600" /> Mark Attendance — {selectedDate}</h3>
                    <div className="flex items-center gap-3">
                        <button onClick={() => markAll("present")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark All Present
                        </button>
                        <button onClick={() => markAll("absent")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors">
                            <XCircle className="h-3.5 w-3.5" /> Mark All Absent
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
                            <Download className="h-3.5 w-3.5" /> Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 w-10">#</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Roll No.</th>
                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Student Name</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Present (Total)</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Absent (Total)</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Attendance %</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">Today&apos;s Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_STUDENTS.map((student, i) => {
                                const status = studentStatuses[student.rollNo];
                                return (
                                    <tr key={student.rollNo} className={cn("border-b border-gray-50 transition-colors", status === "absent" && "bg-red-50/30")}>
                                        <td className="py-2.5 px-3 text-xs text-gray-400">{i + 1}</td>
                                        <td className="py-2.5 px-3 font-mono text-xs text-gray-700">{student.rollNo}</td>
                                        <td className="py-2.5 px-3">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    student.percent >= 75 ? "bg-emerald-500" : student.percent >= 50 ? "bg-amber-500" : "bg-red-500"
                                                )} />
                                                <span className="font-medium text-gray-900">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold">{student.present}</td>
                                        <td className="py-2.5 px-3 text-center text-red-700 font-semibold">{student.absent}</td>
                                        <td className="py-2.5 px-3 text-center">
                                            <span className={cn(
                                                "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
                                                student.percent >= 75 ? "text-emerald-700 bg-emerald-50" :
                                                    student.percent >= 50 ? "text-amber-700 bg-amber-50" :
                                                        "text-red-700 bg-red-50"
                                            )}>
                                                {student.percent}%
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <button
                                                onClick={() => toggleStatus(student.rollNo)}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                                                    status === "present"
                                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                                )}
                                            >
                                                {status === "present" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                                {status === "present" ? "Present" : "Absent"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {presentCount} Present</span>
                        <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-red-500" /> {absentCount} Absent</span>
                        <span className="text-gray-400">({((presentCount / totalStudents) * 100).toFixed(0)}% attendance rate)</span>
                    </div>
                    <button 
                        onClick={submitAttendance}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1a56db] text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Save className="h-4 w-4" /> Submit Attendance
                    </button>
                </div>
            </div>
        </div>
    );
}
