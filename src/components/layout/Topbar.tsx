"use client";

import { apiGet } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useSidebar } from "@/lib/hooks/useSidebar";

export default function Topbar() {
    const { toggle } = useSidebar();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Array<{ id: string; message: string; read: boolean }>>([]);

    useEffect(() => {
        apiGet<Array<{ id: string; message: string; read: boolean }>>("/notifications?unread=true")
            .then((items) => setNotifications(items))
            .catch(() => setNotifications([]));
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
                <button onClick={toggle} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-slate-500 lg:hidden">
                    <Menu className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-[var(--navy)]">EduPulse — SOET</h1>
                    <p className="text-xs text-slate-500">Attendance, Mentorship & Detention Monitoring</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="group relative">
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-slate-600">
                        <Bell className="h-5 w-5" />
                        {notifications.length > 0 && <span className="absolute right-1 top-1 rounded-full bg-[var(--red)] px-1 text-[10px] text-white">{notifications.length}</span>}
                    </button>
                    <div className="invisible absolute right-0 top-12 z-50 w-72 rounded-xl border border-[var(--border)] bg-white p-3 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                        <p className="mb-2 text-xs font-semibold text-[var(--navy)]">Notifications</p>
                        {notifications.slice(0, 5).map((item) => <p key={item.id} className="mb-1 rounded-md bg-[var(--surface)] p-2 text-xs text-slate-700">{item.message}</p>)}
                        {notifications.length === 0 && <p className="text-xs text-slate-500">No unread notifications</p>}
                        <button className="mt-2 text-xs font-semibold text-[var(--accent-blue)]">View All →</button>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-2 py-1.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-bold text-[var(--navy)]">{user?.avatarInitials ?? "U"}</div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--navy)]">{user?.name ?? "User"}</p>
                        <p className="text-xs text-slate-500">{user?.designation ?? "Faculty"} ▾</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
