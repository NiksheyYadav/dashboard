"use client";

import { useEffect, useState } from "react";
import { Users, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DeanDashboard() {
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        // Fetch metrics
        setMetrics({
            attendance_rate: 85.2,
            total_students: 4500,
            low_attendance_students: 120,
            critical_students: 35,
            pending_actions: 12
        });
    }, []);

    if (!metrics) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Dean Dashboard</h2>
                <p className="text-sm text-gray-500">Faculty overview and high-level metrics</p>
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
                        <p className="text-xs font-medium text-gray-500">Critical Detentions</p>
                        <p className="text-2xl font-bold text-red-700">{metrics.critical_students}</p>
                    </div>
                </div>
            </div>

            <div className="soet-card">
                <h3 className="soet-card-header">Dean Action Items</h3>
                <div className="space-y-3">
                    <div className="p-3 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50">
                        <div>
                            <p className="font-semibold text-sm">Review Warning Letters</p>
                            <p className="text-xs text-gray-500">12 students pending final warning letter generation.</p>
                        </div>
                        <Link href="/warning-letters" className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg inline-block">Review</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
