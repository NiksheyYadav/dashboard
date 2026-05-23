"use client";

import { useEffect, useState } from "react";
import { Users, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function HodDashboard() {
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        // Fetch metrics
        setMetrics({
            attendance_rate: 82.5,
            total_students: 1240,
            low_attendance_students: 45,
            critical_students: 12,
            pending_actions: 5
        });
    }, []);

    if (!metrics) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">HoD Dashboard</h2>
                <p className="text-sm text-gray-500">Department overview and action items</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stat-card stat-card-blue flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><Users className="h-5 w-5 text-blue-600" /></div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{metrics.total_students}</p>
                    </div>
                </div>
                <div className="stat-card stat-card-green flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Avg Attendance</p>
                        <p className="text-2xl font-bold text-emerald-700">{metrics.attendance_rate}%</p>
                    </div>
                </div>
                <div className="stat-card stat-card-amber flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Warning (&lt;75%)</p>
                        <p className="text-2xl font-bold text-amber-700">{metrics.low_attendance_students}</p>
                    </div>
                </div>
                <div className="stat-card stat-card-red flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100"><ShieldAlert className="h-5 w-5 text-red-600" /></div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Critical Actions</p>
                        <p className="text-2xl font-bold text-red-700">{metrics.pending_actions}</p>
                    </div>
                </div>
            </div>

            <div className="soet-card">
                <h3 className="soet-card-header">Pending Action Items</h3>
                <div className="space-y-3">
                    <div className="p-3 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50">
                        <div>
                            <p className="font-semibold text-sm">Leave Request - Dr. Sharma</p>
                            <p className="text-xs text-gray-500">Needs approval for 2 days casual leave.</p>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg">Review</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
