"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { STUDENT_NAV_ITEMS, SYSTEM_NAV_ITEMS, TEACHER_NAV_ITEMS } from "@/lib/utils/constants";
import { GraduationCap, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, role, logout } = useAuth();

    const navItems = role === "student" ? STUDENT_NAV_ITEMS : TEACHER_NAV_ITEMS;

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-gray-200 bg-white">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a6fdb]">
                    <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                    <span className="text-lg font-bold text-gray-900">EduPulse</span>
                    <p className="text-[10px] text-gray-400">
                        {role === "student" ? "Student Portal" : "College Admin"}
                    </p>
                </div>
            </div>

            {/* Main Menu */}
            <nav className="flex-1 px-3 pt-4">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Main Menu
                </p>
                <ul className="space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-[#e8f0fd] text-[#1a6fdb]"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-[#1a6fdb]" : "text-gray-400")} />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* System */}
                <p className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    System
                </p>
                <ul className="space-y-0.5">
                    {SYSTEM_NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-[#e8f0fd] text-[#1a6fdb]"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-[#1a6fdb]" : "text-gray-400")} />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile */}
            <div className="border-t border-gray-200 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold",
                        role === "student"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-rose-100 text-rose-600"
                    )}>
                        {user?.avatarInitials ?? "??"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                            {user?.name ?? "Guest"}
                        </p>
                        <p className="truncate text-xs text-gray-500 uppercase">
                            {role === "student" ? "Student" : (user?.department ?? "")}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
