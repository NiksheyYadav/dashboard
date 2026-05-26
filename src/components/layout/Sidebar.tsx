"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useSidebar } from "@/lib/hooks/useSidebar";
import { cn } from "@/lib/utils";
import { getNavItemsForRole, SYSTEM_NAV_ITEMS, type UserRole } from "@/lib/utils/constants";
import { ChevronLeft, LogOut, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Admin",
    dean: "Dean",
    hod: "Head of Department",
    teacher: "Teacher",
    activity_coordinator: "Activity Coordinator",
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user, role, logout } = useAuth();
    const { isOpen, close } = useSidebar();

    const navItems = role ? getNavItemsForRole(role as UserRole) : [];
    const displayRole = user?.isMentor && role === "teacher"
        ? "Teacher & Mentor"
        : role ? ROLE_LABELS[role as UserRole] : "—";

    return (
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-gradient-to-b from-[#0a1628] to-[#0d1f3c]">
            {/* Header: SGT University Logo */}
            <div className="flex items-center justify-between px-5 py-5">
                <div className="flex items-center gap-3">
                    <Image
                        src="/images/sgt-logo-wide.png"
                        alt="SGT University"
                        width={180}
                        height={50}
                        className="h-12 w-auto object-contain rounded"
                        priority
                    />
                </div>
                {/* Close button (mobile only) */}
                <button
                    onClick={close}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 lg:hidden"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Divider */}
            <div className="mx-5 border-t border-white/10" />

            {/* Main Menu */}
            <nav className="flex-1 overflow-y-auto px-3 pt-5">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={close}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-[#1a56db] text-white shadow-lg shadow-blue-900/30"
                                            : "text-gray-300 hover:bg-white/8 hover:text-white"
                                    )}
                                >
                                    <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive ? "text-white" : "text-gray-400")} />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* System */}
                <div className="mx-3 mt-6 border-t border-white/10" />
                <ul className="mt-3 space-y-1">
                    {SYSTEM_NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={close}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-[#1a56db] text-white shadow-lg shadow-blue-900/30"
                                            : "text-gray-300 hover:bg-white/8 hover:text-white"
                                    )}
                                >
                                    <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive ? "text-white" : "text-gray-400")} />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* SOET Branding */}
            <div className="px-5 py-3">
                <div className="rounded-lg bg-white/5 px-3 py-3 text-center">
                    <p className="text-sm font-bold text-white">SOET</p>
                    <p className="text-[10px] text-gray-400">School of Engineering</p>
                    <p className="text-[10px] text-gray-400">& Technology</p>
                </div>
            </div>

            {/* Collapse Toggle */}
            <div className="flex justify-center pb-2">
                <button className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                    <ChevronLeft className="h-4 w-4" />
                </button>
            </div>

            {/* User Profile */}
            <div className="border-t border-white/10 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a56db] text-xs font-semibold text-white">
                        {user?.avatarInitials ?? "??"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                            {user?.name ?? "Guest"}
                        </p>
                        <p className="text-[10px] font-medium text-amber-400/80">
                            {displayRole}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
