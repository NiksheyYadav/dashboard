"use client";

import { useAuth, UserRole } from "@/lib/auth/auth-context";
import { ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";

interface RequireRoleProps {
    allowedRoles: UserRole[];
    children: React.ReactNode;
}

export default function RequireRole({ allowedRoles, children }: RequireRoleProps) {
    const { user, role, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#1a6fdb]" />
            </div>
        );
    }

    if (!user || !role || !allowedRoles.includes(role)) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4 animate-fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
                    <ShieldX className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Access Denied
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        You don&apos;t have permission to access this page.
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        Required role: <span className="font-semibold capitalize">{allowedRoles.join(", ")}</span>
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-2 rounded-lg bg-[#1a6fdb] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
