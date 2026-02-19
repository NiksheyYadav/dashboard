"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { Bell, Plus, Search } from "lucide-react";

export default function Topbar() {
    const { role } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            {/* Search */}
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder={
                        role === "student"
                            ? "Search courses, schedules..."
                            : "Search students, courses or IDs..."
                    }
                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-[#1a6fdb] focus:bg-white focus:ring-2 focus:ring-[#1a6fdb]/10"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700">
                    <Bell className="h-[18px] w-[18px]" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                </button>
                {role === "teacher" && (
                    <Button className="h-10 gap-2 bg-[#1a6fdb] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1560c2]">
                        <Plus className="h-4 w-4" />
                        New Entry
                    </Button>
                )}
            </div>
        </header>
    );
}
