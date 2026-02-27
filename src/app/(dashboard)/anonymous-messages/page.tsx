"use client";

import RequireRole from "@/components/providers/RequireRole";
import { API_BASE_URL } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { format } from "date-fns";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, MessageSquare, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

interface AnonymousMessage {
    id: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function AnonymousMessagesPage() {
    return (
        <RequireRole allowedRoles={["dean", "hod"]}>
            <AnonymousMessagesContent />
        </RequireRole>
    );
}

function AnonymousMessagesContent() {
    const { role } = useAuth();
    const [messages, setMessages] = useState<AnonymousMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState("");
    const limit = 10;

    useEffect(() => {
        let mounted = true;

        async function fetchMessages() {
            try {
                setIsLoading(true);
                setError("");
                const res = await fetch(
                    `${API_BASE_URL}/messages/anonymous?page=${page}&limit=${limit}`
                );
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.detail || "Failed to load anonymous messages");
                }

                if (mounted) {
                    setMessages(data.data);
                    setTotal(data.total);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : "An error occurred");
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        fetchMessages();

        return () => {
            mounted = false;
        };
    }, [page]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
                        Anonymous Messages
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Secure, untraceable feedback and concerns submitted by the faculty.
                    </p>
                </div>
                {role === "dean" && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 dark:border-indigo-900/30 dark:bg-indigo-900/20 dark:text-indigo-300">
                        <ShieldAlert className="h-4 w-4" />
                        Dean Access Only
                    </div>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-800 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                        <h3 className="font-semibold">Error loading messages</h3>
                        <p className="mt-1 text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {/* Table / List */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
                                <th className="whitespace-nowrap px-6 py-4 font-medium">Message Content</th>
                                <th className="whitespace-nowrap px-6 py-4 font-medium w-48">Date Received</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={2} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center gap-3 text-gray-500">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Loading messages...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : messages.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                                                <MessageSquare className="h-6 w-6" />
                                            </div>
                                            <p className="font-medium">No messages yet</p>
                                            <p className="mt-1 text-sm">Your feedback inbox is currently empty.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                messages.map((msg) => (
                                    <tr
                                        key={msg.id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="max-w-3xl whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                                                {msg.message}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 align-top">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {format(new Date(msg.createdAt), "MMM d, yyyy")}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {format(new Date(msg.createdAt), "h:mm a")}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-800">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-medium text-gray-900 dark:text-gray-100">{messages.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
                        <span className="font-medium text-gray-900 dark:text-gray-100">{Math.min(page * limit, total)}</span> of{" "}
                        <span className="font-medium text-gray-900 dark:text-gray-100">{total}</span> messages
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || isLoading}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
