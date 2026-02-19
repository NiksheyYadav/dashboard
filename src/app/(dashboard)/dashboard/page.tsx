"use client";

import StudentDashboard from "@/components/dashboard/StudentDashboard";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardPage() {
    const { role, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#1a6fdb]" />
            </div>
        );
    }

    if (role === "student") {
        return <StudentDashboard />;
    }

    return <TeacherDashboard />;
}
