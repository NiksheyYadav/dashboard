"use client";

import { getAssignedSubjects } from "@/lib/api/soet";
import { useEffect, useMemo, useState } from "react";

type MarkState = Record<string, { status?: "present" | "absent"; remarks?: string }>;

export default function SubjectAttendancePage() {
    const [subjects, setSubjects] = useState<Array<{ id: string; code: string; name: string }>>([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [marks, setMarks] = useState<MarkState>({});
    const [noClass, setNoClass] = useState(false);

    useEffect(() => {
        getAssignedSubjects().then(setSubjects).catch(() => setSubjects([]));
    }, []);

    const mockStudents = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({ id: `st-${i + 1}`, roll: `SOET250${i + 1}`, name: `Student ${i + 1}` })), []);
    const presentCount = Object.values(marks).filter((m) => m.status === "present").length;
    const absentCount = Object.values(marks).filter((m) => m.status === "absent").length;

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-[var(--navy)]">Subject Attendance</h1>
            <section className="soet-card grid gap-3 p-4 md:grid-cols-6">
                <select className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="">Subject*</option>
                    {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} - {subject.name}</option>)}
                </select>
                <input className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" value="SOET" readOnly />
                <input className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" value="Semester 4" readOnly />
                <input className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" value="Section A" readOnly />
                <input type="date" className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
                <select className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm"><option>Lecture Slot*</option><option>09:00 - 09:50</option></select>
            </section>

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">Only your assigned subjects are available for selection.</div>

            <section className="grid gap-4 xl:grid-cols-[60%_40%]">
                <article className="soet-card p-4">
                    <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">Student Attendance</h2>
                    {!noClass ? (
                        <>
                            <table className="soet-table w-full text-sm">
                                <thead><tr className="text-left text-slate-500"><th>Roll No.</th><th>Student Name</th><th>Present</th><th>Absent</th><th>Remarks</th></tr></thead>
                                <tbody>
                                    {mockStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td className="py-2">{student.roll}</td>
                                            <td>{student.name}</td>
                                            <td><input type="radio" name={student.id} checked={marks[student.id]?.status === "present"} onChange={() => setMarks((prev) => ({ ...prev, [student.id]: { ...prev[student.id], status: "present" } }))} /></td>
                                            <td><input type="radio" name={student.id} checked={marks[student.id]?.status === "absent"} onChange={() => setMarks((prev) => ({ ...prev, [student.id]: { ...prev[student.id], status: "absent" } }))} /></td>
                                            <td><input className="w-full rounded border border-[var(--border)] p-1" value={marks[student.id]?.remarks || ""} onChange={(e) => setMarks((prev) => ({ ...prev, [student.id]: { ...prev[student.id], remarks: e.target.value } }))} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <footer className="mt-3 text-sm">Total Students: {mockStudents.length} | <span className="text-green-600">Present: {presentCount}</span> | <span className="text-red-600">Absent: {absentCount}</span> | Not Marked: {mockStudents.length - presentCount - absentCount}</footer>
                        </>
                    ) : <p className="text-sm text-slate-500">Student table hidden because this slot is marked as No Class Conducted.</p>}
                </article>
                <article className="soet-card p-4">
                    <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">Lecture Details</h2>
                    <div className="space-y-2 text-sm">
                        <p>Subject Code: {subjects.find((subject) => subject.id === selectedSubject)?.code ?? "-"}</p>
                        <p>Subject Name: {subjects.find((subject) => subject.id === selectedSubject)?.name ?? "-"}</p>
                        <p>Programme: SOET</p>
                        <p>Semester: 4</p>
                        <p>Section: A</p>
                        <p>Time Slot: 09:00 - 09:50</p>
                        <p>Total Students: {mockStudents.length}</p>
                        <p>Attendance Deadline: 18:00</p>
                        <button className="rounded-lg bg-[var(--navy)] px-3 py-1.5 text-xs font-semibold text-white">Regular Class</button>
                        <label className="mt-2 flex items-center gap-2 rounded-lg bg-amber-100 p-2 text-amber-800"><input type="checkbox" checked={noClass} onChange={(e) => setNoClass(e.target.checked)} /> No Class Conducted</label>
                        <label className="flex items-center gap-2 rounded-lg bg-blue-100 p-2 text-blue-800"><input type="checkbox" /> Arrangement Class</label>
                    </div>
                </article>
            </section>

            <section className="flex flex-wrap gap-3">
                <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--navy)]">Save Draft</button>
                <button className="rounded-lg bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white">Submit Attendance</button>
                <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600">Mark No Class Conducted</button>
            </section>
        </div>
    );
}
