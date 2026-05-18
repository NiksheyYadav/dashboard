"use client";

import { useMemo, useState } from "react";

export default function LeaveArrangementPage() {
    const [reason, setReason] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const affectedCount = useMemo(() => (fromDate && toDate ? 3 : 0), [fromDate, toDate]);

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[var(--navy)]">Leave & Arrangement</h1>
            <section className="grid gap-3 md:grid-cols-3">
                <article className="soet-card p-3">Total Lectures Affected <p className="text-2xl font-bold text-[var(--navy)]">{affectedCount}</p></article>
                <article className="soet-card p-3">Arrangements Accepted <p className="text-2xl font-bold text-[var(--green)]">1</p></article>
                <article className="soet-card p-3">Pending Approval <p className="text-2xl font-bold text-[var(--orange)]">2</p></article>
            </section>

            <section className="grid gap-4 xl:grid-cols-[65%_35%]">
                <article className="soet-card space-y-3 p-4">
                    <h2 className="text-lg font-semibold text-[var(--navy)]">Leave Application</h2>
                    <div className="grid gap-3 md:grid-cols-3">
                        <select className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm"><option>Leave Type</option><option>Casual Leave</option><option>Medical Leave</option></select>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" />
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" />
                    </div>
                    <textarea maxLength={400} value={reason} onChange={(e) => setReason(e.target.value)} className="h-24 w-full rounded-lg border border-[var(--border)] bg-white p-2 text-sm" placeholder="Reason (400 chars)" />
                    <p className="text-xs text-slate-500">{reason.length}/400</p>
                    <p className="text-sm">Affected Lectures: <span className="status-pill bg-blue-100 text-blue-700">{affectedCount}</span></p>
                    <p className="text-xs text-slate-500">Lectures that require arrangement are listed below.</p>
                </article>
                <article className="soet-card p-4">
                    <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">Workflow Progress</h2>
                    <ol className="space-y-3 text-sm">
                        <li className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-[var(--navy)] text-center text-white">1</span> Teacher Submission</li>
                        <li className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-[var(--grey)] text-center text-white">2</span> Arrangement Teacher Acceptance</li>
                        <li className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-[var(--grey)] text-center text-white">3</span> HoD Approval</li>
                    </ol>
                    <div className="mt-4 rounded-lg bg-blue-100 p-3 text-xs text-blue-800">Arrangement class attendance counted for students but not original teacher&apos;s course completion.</div>
                </article>
            </section>

            <section className="soet-card p-4">
                <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">Affected Lectures & Arrangement</h2>
                <table className="soet-table w-full text-sm">
                    <thead><tr className="text-left text-slate-500"><th>Date</th><th>Slot</th><th>Subject</th><th>Section</th><th>Original Teacher</th><th>Available Arrangement Teachers</th><th>Selected Teacher</th><th>Status</th></tr></thead>
                    <tbody><tr><td className="py-2">2026-05-20</td><td>09:00</td><td>CS401</td><td>A</td><td>You</td><td>Dr A, Dr B</td><td>Dr A</td><td><span className="status-pill bg-amber-100 text-amber-700">Pending Acceptance</span></td></tr></tbody>
                </table>
            </section>

            <footer className="flex gap-3">
                <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--navy)]">Save Draft</button>
                <button className="rounded-lg bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white">Submit Leave Request</button>
            </footer>
        </div>
    );
}
