"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useSidebar } from "@/lib/hooks/useSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isOpen, close } = useSidebar();

    return (
        <div className="min-h-screen bg-[#f4f6fa] dark:bg-gray-950">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
                        onClick={close}
                    />
                    <div className="fixed left-0 top-0 z-50 lg:hidden animate-slide-in-left">
                        <Sidebar />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="lg:ml-[220px]">
                <Topbar />
                <main className="p-4 sm:p-6 animate-fade-in">{children}</main>
            </div>
        </div>
    );
}
