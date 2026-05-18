"use client";

import { getAssignedSubjects, getMentorMentees, getTeacherDashboard } from "@/lib/api/soet";
import { BookOpen, CalendarCheck, ClipboardCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const statConfig = [
    { key: "todays_classes", label: "Today's Classes", icon: CalendarCheck },
    { key: "pending_attendance", label: "Pending Attendance", icon: ClipboardCheck },
    { key: "assigned_subjects", label: "Assigned Subjects", icon: BookOpen },
    { key: "assigned_mentees", label: "Assigned Mentees", icon: Users },
] as const;

export default function DashboardPage() {
    const [stats, setStats] = useState<{ todays_classes: number; pending_attendance: number; assigned_subjects: number; assigned_mentees: number }>();
    const [subjects, setSubjects] = useState<Array<{ id: string; code: string; name: string }>>([]);
    const [mentees, setMentees] = useState<Array<{ id: string; name: string; overall_percentage: number; risk_status: string }>>([]);

    useEffect(() => {
        void Promise.all([getTeacherDashboard(), getAssignedSubjects(), getMentorMentees()])
            .then(([dashboard, assignedSubjects, mentorMentees]) => {
                setStats(dashboard);
                setSubjects(assignedSubjects);
                setMentees(mentorMentees);
            })
            .catch(() => undefined);
    }, []);

    const completionData = useMemo(() => subjects.map((subject, index) => ({ ...subject, completion: Math.max(30, 90 - index * 8) })), [subjects]);

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-[var(--navy)]">SOET Teacher Dashboard</h1>
                <p className="text-sm text-slate-500">Attendance, mentorship and compliance overview</p>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statConfig.map((item) => (
                    <article key={item.key} className="soet-card p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <item.icon className="h-5 w-5 text-[var(--navy)]" />
                            <span className="text-xs font-semibold text-[var(--accent-blue)]">Mark Now →</span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--navy)]">{stats?.[item.key] ?? 0}</p>
                        <p className="text-sm text-slate-600">{item.label}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[60%_40%]">
                <article className="soet-card p-4">
                    <h2 className="mb-2 text-lg font-semibold text-[var(--navy)]">Assigned Subjects</h2>
                    <p className="mb-3 text-xs text-slate-500">Only your assigned subjects are shown.</p>
                    <table className="soet-table w-full text-sm">
                        <thead><tr className="text-left text-slate-500"><th>Subject</th><th>Section</th><th>Semester</th><th>Program</th></tr></thead>
                        <tbody>{subjects.map((s, i) => <tr key={s.id}><td className="py-2">{s.name}</td><td>{`Sec ${String.fromCharCode(65 + (i % 4))}`}</td><td>{4 + (i % 2) * 2}</td><td>SOET</td></tr>)}</tbody>
                    </table>
                </article>
                <article className="soet-card p-4">
                    <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">Today&apos;s Schedule</h2>
                    <table className="soet-table w-full text-sm">
                        <thead><tr className="text-left text-slate-500"><th>Time</th><th>Subject</th><th>Section</th><th>Status</th></tr></thead>
                        <tbody>{subjects.slice(0, 5).map((s, i) => <tr key={s.id}><td className="py-2">{`${9 + i}:00`}</td><td>{s.code}</td><td>{`A${i + 1}`}</td><td><span className={`status-pill ${i < 2 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{i < 2 ? "Completed" : "Upcoming"}</span></td></tr>)}</tbody>
                    </table>
                </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <article className="soet-card p-4">
                    <h3 className="mb-3 text-lg font-semibold text-[var(--navy)]">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm font-medium">
                        {["Mark Attendance", "View Mentees", "Apply Leave", "Schedule Extra Class"].map((action) => (
                            <button key={action} className="rounded-lg border border-[var(--border)] bg-white p-3 text-left transition hover:scale-[1.02]">{action}</button>
                        ))}
                    </div>
                </article>
                <article className="soet-card p-4">
                    <h3 className="mb-3 text-lg font-semibold text-[var(--navy)]">Mentee Alerts</h3>
                    <table className="soet-table w-full text-sm">
                        <thead><tr className="text-left text-slate-500"><th>Name</th><th>Overall %</th><th>Risk</th></tr></thead>
                        <tbody>{mentees.slice(0, 5).map((m) => <tr key={m.id}><td className="py-2">{m.name}</td><td>{m.overall_percentage}%</td><td><span className={`status-pill ${m.risk_status === "Safe" ? "bg-green-100 text-green-700" : m.risk_status === "Warning" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{m.risk_status}</span></td></tr>)}</tbody>
                    </table>
                </article>
                <article className="soet-card p-4">
                    <h3 className="mb-3 text-lg font-semibold text-[var(--navy)]">Subject-wise Course Completion</h3>
                    <div className="space-y-3">{completionData.map((item) => <div key={item.id}><div className="mb-1 flex justify-between text-xs"><span>{item.code}</span><span>{item.completion}%</span></div><div className="h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-[var(--navy)]" style={{ width: `${item.completion}%` }} /></div></div>)}</div>
                </article>
            </section>
        </div>
    );
}
