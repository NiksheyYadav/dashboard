"use client";

const departments = ["CS&E", "ECE", "ME", "EE", "CE", "Applied Sci & Humanities"];

export default function MonitoringPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[var(--navy)]">HoD / Dean Monitoring Dashboard</h1>
            <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                {[
                    "Overall Attendance %",
                    "Students Below 75%",
                    "Pending Approvals",
                    "Faculty Compliance %",
                    "Arrangement Classes",
                    "Extra Classes",
                ].map((item, i) => (
                    <article key={item} className="soet-card p-3"><p className="text-xs text-slate-500">{item}</p><p className="text-2xl font-bold text-[var(--navy)]">{i === 0 ? "78.6%" : 12 - i}</p></article>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <article className="soet-card p-4">
                    <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">Department / Programme Summary</h2>
                    <table className="soet-table w-full text-sm">
                        <thead><tr className="text-left text-slate-500"><th>Department</th><th>Students</th><th>Avg Attendance</th><th>Below 75%</th><th>Pending Cases</th></tr></thead>
                        <tbody>{departments.map((dept, index) => <tr key={dept}><td className="py-2">{dept}</td><td>{120 - index * 6}</td><td>{82 - index * 2}%</td><td className="text-red-600">{15 + index} ({10 + index}%)</td><td>{3 + index}</td></tr>)}</tbody>
                    </table>
                </article>
                <article className="soet-card p-4">
                    <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">Pending Approvals</h2>
                    <table className="soet-table w-full text-sm">
                        <thead><tr className="text-left text-slate-500"><th>Type</th><th>Details</th><th>Requested By</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody><tr><td className="py-2">Regularization</td><td>CS402 - Student #12</td><td>Mentor A</td><td>2026-05-18</td><td><span className="status-pill bg-orange-100 text-orange-700">Pending</span></td><td><button className="rounded bg-[var(--navy)] px-2 py-1 text-xs text-white">Review</button></td></tr></tbody>
                    </table>
                </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <article className="soet-card p-4"><h3 className="mb-2 font-semibold text-[var(--navy)]">Department-wise Attendance Comparison</h3>{departments.map((dept, i) => <div key={dept} className="mb-2"><div className="mb-1 flex justify-between text-xs"><span>{dept}</span><span>{80 - i * 3}%</span></div><div className="h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-[var(--navy)]" style={{ width: `${80 - i * 3}%` }} /></div></div>)}</article>
                <article className="soet-card p-4"><h3 className="mb-2 font-semibold text-[var(--navy)]">Detention Risk List (Below 75%)</h3><p className="text-sm text-slate-600">Name | Programme | Overall % | Major Shortage | Mentor | Status</p><p className="mt-2 text-xs text-[var(--accent-blue)]">View All →</p></article>
                <article className="soet-card p-4"><h3 className="mb-2 font-semibold text-[var(--navy)]">Faculty Compliance</h3><p className="text-sm text-slate-600">Teacher Name | Attendance Completion % | Leave Requests | Not Conducted | Extra Classes</p></article>
            </section>
            <p className="text-xs text-slate-500">Arrangement attendance counts for students; extra classes count for both students and course completion.</p>
        </div>
    );
}
