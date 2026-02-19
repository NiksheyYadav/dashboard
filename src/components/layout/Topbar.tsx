"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useSidebar } from "@/lib/hooks/useSidebar";
import { useTheme } from "@/lib/theme/theme-context";
import { Bell, Menu, Moon, Plus, Search, Sun } from "lucide-react";

export default function Topbar() {
    const { role } = useAuth();
    const { toggle } = useSidebar();
    const { resolvedTheme, setTheme, theme } = useTheme();

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
                {/* Hamburger (mobile only) */}
                <button
                    onClick={toggle}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 lg:hidden dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Search */}
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students, courses or IDs..."
                        className="h-10 w-[240px] rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-[#1a6fdb] focus:bg-white focus:ring-2 focus:ring-[#1a6fdb]/10 md:w-[320px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
                    />
                </div>
                {/* Mobile search icon */}
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 sm:hidden dark:border-gray-700 dark:text-gray-400">
                    <Search className="h-[18px] w-[18px]" />
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Theme toggle */}
                <button
                    onClick={cycleTheme}
                    title={`Theme: ${theme}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    {resolvedTheme === "dark" ? (
                        <Moon className="h-[18px] w-[18px]" />
                    ) : (
                        <Sun className="h-[18px] w-[18px]" />
                    )}
                </button>

                {/* Notifications */}
                <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
                    <Bell className="h-[18px] w-[18px]" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* New Entry */}
                <Button className="hidden h-10 gap-2 bg-[#1a6fdb] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1560c2] sm:flex">
                    <Plus className="h-4 w-4" />
                    New Entry
                </Button>
            </div>
        </header>
    );
}
