"use client";

import { getMentorMentees } from "@/lib/api/soet";
import { useEffect, useMemo, useState } from "react";

export default function MenteeMonitorPage() {
    const [mentees, setMentees] = useState<Array<{ id: string; name: string; roll_no: string; overall_percentage: number; risk_status: string }>>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        getMentorMentees().then(setMentees).catch(() => setMentees([]));
    }, []);

    const total = mentees.length || 1;
    const safe = mentees.filter((m) => m.overall_percentage >= 75).length;
    const warning = mentees.filter((m) => m.overall_percentage >= 50 && m.overall_percentage < 75).length;
    const critical = mentees.filter((m) => m.overall_percentage < 50).length;
    const selected = useMemo(() => mentees.find((m) => m.id === selectedId) ?? mentees[0], [mentees, selectedId]);

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[var(--navy)]">Mentee Monitor</h1>
            <section className="grid gap-3 md:grid-cols-4">
                <article className="soet-card p-3">Total Assigned Mentees <p className="text-2xl font-bold text-[var(--accent-blue)]">{mentees.length}</p></article>
                <article className="soet-card p-3">Safe ≥75% <p className="text-2xl font-bold text-[var(--green)]">{safe} ({Math.round((safe / total) * 100)}%)</p></article>
                <article className="soet-card p-3">Warning 50–74% <p className="text-2xl font-bold text-[var(--amber)]">{warning} ({Math.round((warning / total) * 100)}%)</p></article>
                <article className="soet-card p-3">Critical &lt;50% <p className="text-2xl font-bold text-[var(--red)]">{critical} ({Math.round((critical / total) * 100)}%)</p></article>
            </section>
            <section className="grid gap-4 xl:grid-cols-[65%_35%]">
                <article className="soet-card p-4">
                    <table className="soet-table w-full text-sm">
                        <thead><tr className="text-left text-slate-500"><th>Student Name</th><th>Roll No.</th><th>Batch</th><th>Overall %</th><th>Risk</th></tr></thead>
                        <tbody>{mentees.map((m) => <tr key={m.id} onClick={() => setSelectedId(m.id)} className="cursor-pointer"><td className="py-2">{m.name}</td><td>{m.roll_no}</td><td>2025</td><td>{m.overall_percentage}%</td><td><span className={`status-pill ${m.risk_status === "Safe" ? "bg-green-100 text-green-700" : m.risk_status === "Warning" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{m.risk_status}</span></td></tr>)}</tbody>
                    </table>
                </article>
                <article className="soet-card p-4">
                    <h2 className="text-lg font-semibold text-[var(--navy)]">Student Detail</h2>
                    {selected ? <div className="mt-3 space-y-2 text-sm"><p className="font-semibold">{selected.name}</p><p>Roll No: {selected.roll_no}</p><p>Email: {selected.roll_no.toLowerCase()}@sgtu.edu</p><p>Phone: 9999999999</p><p>Attendance Trend: Feb–Jun</p><p className="text-xs text-[var(--accent-blue)]">View All →</p></div> : <p className="text-sm text-slate-500">Select a student row to inspect details.</p>}
                </article>
            </section>
            <section className="soet-card flex flex-wrap gap-2 p-3">
                {["View Details", "Add Counselling Note", "Request Attendance Regularization", "Parent Contact Log"].map((action) => <button key={action} className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--navy)]">{action}</button>)}
            </section>
        </div>
    );
}
