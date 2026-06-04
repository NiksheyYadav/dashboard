"use client";

import AdminDashboard from "@/components/dashboard/AdminDashboard";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import HodDashboard from "@/components/dashboard/HodDashboard";
import DeanDashboard from "@/components/dashboard/DeanDashboard";
import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#1a6fdb]" />
            </div>
        );
    }

    if (!user) return null;

    if (user.roles?.includes("admin")) return <AdminDashboard />;
    if (user.roles?.includes("dean")) return <DeanDashboard />;
    if (user.roles?.includes("hod")) return <HodDashboard />;
    return <TeacherDashboard />;
}
