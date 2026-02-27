"use client";

import RequireRole from "@/components/providers/RequireRole";
import { API_BASE_URL } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Loader2, Trash2, UserCog } from "lucide-react";
import { useEffect, useState } from "react";

interface UserResponse {
    id: string;
    email: string;
    status: string;
    department: string | null;
    created_at: string;
}

function parseRoleFromEmail(email: string): string {
    const value = email.toLowerCase();
    if (value.includes("admin")) return "System Administrator";
    if (value.includes("dean")) return "Dean";
    if (value.includes("hod")) return "Head of Department";
    if (value.includes("coord")) return "Coordinator";
    return "Faculty";
}

function StaffContent() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError("");
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("edupulse_auth_token")}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.detail || "Failed to load users");
            }
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to completely remove ${email}? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeletingId(id);
            const res = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("edupulse_auth_token")}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.detail || "Failed to delete user");
            }

            // Remove from state without re-fetching
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete user");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <UserCog className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    Staff Management
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage system administrators, deans, HODs, coordinators, and faculty members.
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50/50 text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Derived Role</th>
                                <th className="px-6 py-4 font-medium">Department</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Joined Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                        <p className="mt-2 text-sm">Loading users...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No staff accounts found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/50"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                            {user.email}
                                            {currentUser?.id === user.id && (
                                                <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30">
                                                    You
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {parseRoleFromEmail(user.email)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {user.department || <span className="text-gray-400 italic">None</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${user.status === "ACTIVE"
                                                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                : "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400"
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(user.id, user.email)}
                                                disabled={deletingId === user.id || currentUser?.id === user.id}
                                                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors dark:hover:bg-red-950/50 dark:hover:text-red-500"
                                                title={currentUser?.id === user.id ? "Cannot delete yourself" : "Delete User"}
                                            >
                                                {deletingId === user.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function StaffPage() {
    return (
        <RequireRole allowedRoles={["admin"]}>
            <StaffContent />
        </RequireRole>
    );
}
