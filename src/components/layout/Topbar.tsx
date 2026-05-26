"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useSidebar } from "@/lib/hooks/useSidebar";
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api/config";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": { title: "Dashboard", subtitle: "Overview and quick actions" },
    "/subject-attendance": { title: "Subject Attendance", subtitle: "Mark and manage class attendance" },
    "/mentee-monitor": { title: "Mentee Monitor", subtitle: "Only assigned mentees are visible" },
    "/leave-arrangement": { title: "Leave & Class Arrangement", subtitle: "Apply leave and arrange replacement classes" },
    "/extra-classes": { title: "Extra Classes / Make-Up Classes", subtitle: "Schedule extra classes for course completion" },
    "/activity-attendance": { title: "Activity Attendance", subtitle: "Manage academic activity participation" },
    "/reports": { title: "Reports", subtitle: "Generate and export reports" },
    "/settings": { title: "Settings", subtitle: "System configuration and preferences" },
    "/students": { title: "Students", subtitle: "Student directory and management" },
    "/academic-data": { title: "Academic Data Management", subtitle: "Import and manage academic structure" },
};

function getPageInfo(pathname: string) {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    const prefix = Object.keys(PAGE_TITLES).find((key) => pathname.startsWith(key));
    if (prefix) return PAGE_TITLES[prefix];
    return { title: "SOET Attendance & Mentorship Monitoring App", subtitle: "Teacher Dashboard" };
}

interface NotifItem {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export default function Topbar() {
    const { toggle } = useSidebar();
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const pageInfo = getPageInfo(pathname);

    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotifItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const displayRole = user?.isMentor
        ? "Teacher & Mentor"
        : user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1).replace("_", " ")
            : "";

    // Fetch unread count
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const token = localStorage.getItem("edupulse_auth_token");
                const res = await fetch(apiUrl("/notifications/count"), {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.unread_count || 0);
                }
            } catch {
                // Backend not running; show mock count
                setUnreadCount(3);
            }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem("edupulse_auth_token");
            const res = await fetch(apiUrl("/notifications"), {
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch {
            // Mock notifications for demo
            setNotifications([
                { id: "1", title: "Leave Request Approved", message: "Your leave request for May 20-22 has been approved by HoD.", is_read: false, created_at: new Date().toISOString() },
                { id: "2", title: "Arrangement Request", message: "Dr. P. Singh has requested you to take their AI Basics class on May 18.", is_read: false, created_at: new Date().toISOString() },
                { id: "3", title: "Low Attendance Alert", message: "Mentee Karan Mehta (22CS113) attendance dropped below 50%.", is_read: false, created_at: new Date().toISOString() },
            ]);
        }
    }, []);

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem("edupulse_auth_token");
            await fetch(apiUrl("/notifications/read"), {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
            });
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch {
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        }
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
                {/* Hamburger (mobile only) */}
                <button
                    onClick={toggle}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Page Title */}
                <div className="hidden sm:block">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {pageInfo.title}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pageInfo.subtitle}
                    </p>
                </div>
            </div>

            {/* Right side: Notifications + User */}
            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => {
                            setNotifOpen(!notifOpen);
                            if (!notifOpen) fetchNotifications();
                        }}
                        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
                                <button onClick={markAllRead} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                                    Mark all read
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-gray-400">No notifications</div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 ${
                                                !n.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                                            }`}
                                        >
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a56db] text-xs font-semibold text-white">
                            {user?.avatarInitials ?? "??"}
                        </div>
                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {user?.name ?? "Guest"}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {displayRole}
                            </p>
                        </div>
                        <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                            <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name ?? "Guest"}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email ?? ""}</p>
                            </div>
                            <div className="py-1">
                                <button
                                    onClick={() => { setProfileOpen(false); router.push("/settings"); }}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <Settings className="h-4 w-4" /> Settings
                                </button>
                                <button
                                    onClick={() => { setProfileOpen(false); router.push("/settings"); }}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <User className="h-4 w-4" /> Profile
                                </button>
                            </div>
                            <div className="border-t border-gray-100 py-1 dark:border-gray-800">
                                <button
                                    onClick={() => { setProfileOpen(false); logout(); }}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="h-4 w-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
