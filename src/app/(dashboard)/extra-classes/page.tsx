"use client";

import { useState } from "react";

export default function ExtraClassesPage() {
    const [classType, setClassType] = useState("extra");

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[var(--navy)]">Extra Classes</h1>
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">Extra classes count in student attendance, detention calculation, and teacher course completion.</div>
            <section className="grid gap-3 md:grid-cols-3">
                <article className="soet-card p-3">Pending Backlog Lectures <p className="text-2xl font-bold text-[var(--red)]">5</p></article>
                <article className="soet-card p-3">Extra Classes Scheduled This Month <p className="text-2xl font-bold text-[var(--navy)]">3</p></article>
                <article className="soet-card p-3">Course Completion % <p className="text-2xl font-bold text-[var(--green)]">82%</p></article>
            </section>
            <section className="grid gap-4 xl:grid-cols-[60%_40%]">
                <article className="soet-card space-y-3 p-4">
                    <h2 className="text-lg font-semibold text-[var(--navy)]">Schedule New Extra / Make-Up Class</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        <select className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm"><option>Subject</option></select>
                        <input className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" value="SOET" readOnly />
                        <input className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" value="Semester 4" readOnly />
                        <input className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" value="Section A" readOnly />
                        <input type="date" className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm" />
                        <select className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm"><option>Available Slot</option></select>
                        <div className="md:col-span-2 flex gap-4 text-sm">
                            <label className="flex items-center gap-2"><input type="radio" checked={classType === "extra"} onChange={() => setClassType("extra")} /> Extra Class</label>
                            <label className="flex items-center gap-2"><input type="radio" checked={classType === "makeup"} onChange={() => setClassType("makeup")} /> Make-Up Class</label>
                        </div>
                        <select className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm"><option>Reason</option></select>
                        <select className="rounded-lg border border-[var(--border)] bg-white p-2 text-sm"><option>Topic Covered</option></select>
                    </div>
                    <div className="flex gap-2">
                        <button className="rounded-lg bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white">Schedule Extra Class</button>
                        <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--navy)]">Reset</button>
                    </div>
                </article>
                <article className="soet-card p-4">
                    <h2 className="text-lg font-semibold text-[var(--navy)]">Course Completion Overview</h2>
                    <div className="mt-3 space-y-3 text-sm">
                        <div><p className="mb-1">Regular Classes Conducted: 70% (35)</p><div className="h-2 rounded-full bg-white"><div className="h-2 w-[70%] rounded-full bg-blue-600" /></div></div>
                        <div><p className="mb-1">No Class Conducted: 10% (5)</p><div className="h-2 rounded-full bg-white"><div className="h-2 w-[10%] rounded-full bg-orange-500" /></div></div>
                        <div><p className="mb-1">Extra Classes Added: 20% (10)</p><div className="h-2 rounded-full bg-white"><div className="h-2 w-[20%] rounded-full bg-green-600" /></div></div>
                    </div>
                    <p className="mt-4 text-xs">Total Planned: 50 | Total Conducted (Incl. Extra): 45</p>
                </article>
            </section>
            <section className="soet-card p-4">
                <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-[var(--navy)]">Scheduled Extra Classes</h2><button className="rounded-lg bg-[var(--navy)] px-3 py-1.5 text-xs font-semibold text-white">Mark Attendance</button></div>
                <table className="soet-table w-full text-sm">
                    <thead><tr className="text-left text-slate-500"><th>Date</th><th>Slot</th><th>Subject</th><th>Section</th><th>Reason</th><th>Topic</th><th>Attendance</th><th>Lecture Count</th></tr></thead>
                    <tbody><tr><td className="py-2">2026-05-22</td><td>11:00</td><td>CS402</td><td>A</td><td>Backlog</td><td>Normalization</td><td><span className="status-pill bg-blue-100 text-blue-700">Scheduled</span></td><td><span className="status-pill bg-amber-100 text-amber-700">Pending</span></td></tr></tbody>
                </table>
            </section>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">No Class Conducted lectures do not count until compensated.</div>
        </div>
    );
}
