"use client";

import { API_BASE_URL } from "@/lib/api/client";
import { ArrowLeft, KeySquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                // Return generic message even on failure to prevent email enumeration,
                // but if the backend explicitly threw a bad request, show it.
                throw new Error(data?.detail || "Something went wrong.");
            }

            setStatus("success");
            setMessage(data?.detail || "If your email is registered, you will receive a password reset link shortly.");
        } catch (error) {
            setStatus("error");
            setMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
        }
    };

    return (
        <div className="flex w-full flex-col">
            <div className="mb-8">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <KeySquare className="h-6 w-6 text-[#1a6fdb]" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Forgot password?
                </h1>
                <p className="mt-2 text-sm text-gray-500 sm:text-base">
                    No worries, we&apos;ll send you reset instructions.
                </p>
            </div>

            {status === "success" ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-sm font-medium text-emerald-800">{message}</p>
                    <div className="mt-6">
                        <Link
                            href="/login"
                            className="flex w-full items-center justify-center rounded-xl bg-[#1a6fdb] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1560c2]"
                        >
                            Return to log in
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition-all focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                            disabled={status === "loading"}
                        />
                    </div>

                    {status === "error" && (
                        <p className="text-sm font-medium text-red-500">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading" || !email}
                        className="flex w-full items-center justify-center rounded-xl bg-[#1a6fdb] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1560c2] hover:shadow-md hover:shadow-[#1a6fdb]/20 disabled:pointer-events-none disabled:opacity-70"
                    >
                        {status === "loading" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            "Reset password"
                        )}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to log in
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}
