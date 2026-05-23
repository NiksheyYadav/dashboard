"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useSidebar } from "@/lib/hooks/useSidebar";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

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
    // Try exact match first, then prefix match
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    const prefix = Object.keys(PAGE_TITLES).find((key) => pathname.startsWith(key));
    if (prefix) return PAGE_TITLES[prefix];
    return { title: "SOET Attendance & Mentorship Monitoring App", subtitle: "Teacher Dashboard" };
}

export default function Topbar() {
    const { toggle } = useSidebar();
    const { user } = useAuth();
    const pathname = usePathname();
    const pageInfo = getPageInfo(pathname);

    const displayRole = user?.isMentor
        ? "Teacher & Mentor"
        : user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1).replace("_", " ")
            : "";

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
                <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        3
                    </span>
                </button>

                {/* User Profile */}
                <button className="flex items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
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
            </div>
        </header>
    );
}
