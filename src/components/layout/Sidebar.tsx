"use client";

import { SendAnonymousMessageButton } from "@/components/messages/SendAnonymousMessageButton";
import { useAuth, UserRole } from "@/lib/auth/auth-context";
import { useSidebar } from "@/lib/hooks/useSidebar";
import { cn } from "@/lib/utils";
import { getNavItemsForRole, SYSTEM_NAV_ITEMS } from "@/lib/utils/constants";
import { ChevronLeft, GraduationCap, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
    admin: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
    dean: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    hod: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    coordinator: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    faculty: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
};

const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Admin",
    dean: "Dean",
    hod: "HOD",
    coordinator: "Coordinator",
    faculty: "Faculty",
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user, role, logout } = useAuth();
    const { close } = useSidebar();

    const navItems = role ? getNavItemsForRole(role, user?.coordinatorType) : [];

    return (
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-[220px] flex-col border-r border-[var(--border)] bg-[var(--navy)] text-white">
            {/* Header: Logo + Close button on mobile */}
            <div className="flex items-center justify-between px-5 py-5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-white">SGT University</span>
                        <p className="text-[10px] text-white/75">
                            EduPulse SOET
                        </p>
                    </div>
                </div>
                {/* Close button (mobile only) */}
                <button
                    onClick={close}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Main Menu */}
            <nav className="flex-1 overflow-y-auto px-3 pt-4">
                <ul className="space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={close}
                                    className={cn(
                                         "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors",
                                         isActive
                                            ? "bg-white text-[var(--navy)]"
                                            : "text-white/85 hover:bg-[var(--navy-dark)] hover:text-white"
                                     )}
                                 >
                                    <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-[var(--navy)]" : "text-white/70")} />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <p className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/60">System</p>
                <ul className="space-y-0.5">
                    {SYSTEM_NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={close}
                                    className={cn(
                                        "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-white text-[var(--navy)]"
                                            : "text-white/85 hover:bg-[var(--navy-dark)] hover:text-white"
                                    )}
                                >
                                    <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-[var(--navy)]" : "text-white/70")} />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="px-4 pb-4">
                <SendAnonymousMessageButton />
                <p className="mt-4 text-xs text-white/70">School of Engineering & Technology</p>
                <button className="mt-3 inline-flex items-center gap-1 text-xs text-white/80">
                    <ChevronLeft className="h-3 w-3" />
                    Collapse
                </button>
            </div>

            {/* User Profile */}
            <div className="border-t border-white/15 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold",
                        role ? ROLE_BADGE_COLORS[role] : "bg-gray-100 text-gray-500"
                    )}>
                        {user?.avatarInitials ?? "??"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                            {user?.name ?? "Guest"}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className={cn(
                                "inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                                role ? ROLE_BADGE_COLORS[role] : ""
                            )}>
                                {role ? ROLE_LABELS[role] : "—"}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-[var(--navy-dark)] hover:text-white"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
