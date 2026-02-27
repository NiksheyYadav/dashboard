"use client";

import { API_BASE_URL } from "@/lib/api/client";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing reset token. Please request a new password reset.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setStatus("error");
            setMessage("Password must be at least 8 characters long.");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: password }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.detail || "Failed to reset password. The link might have expired.");
            }

            setStatus("success");
            setMessage("Password has been successfully reset. You can now log in with your new password.");

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);

        } catch (error) {
            setStatus("error");
            setMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
        }
    };

    return (
        <div className="flex w-full flex-col">
            <div className="mb-8">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <LockKeyhole className="h-6 w-6 text-[#1a6fdb]" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Set new password
                </h1>
                <p className="mt-2 text-sm text-gray-500 sm:text-base">
                    Your new password must be different from previously used passwords.
                </p>
            </div>

            {status === "success" ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/10 origin-left animate-progress" style={{ animationDuration: "3s" }} />
                    <p className="text-sm font-medium text-emerald-800 relative z-10">{message}</p>
                    <div className="mt-6 relative z-10">
                        <Link
                            href="/login"
                            className="flex w-full items-center justify-center rounded-xl bg-[#1a6fdb] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1560c2]"
                        >
                            Return to log in
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                            New password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm outline-none transition-all focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                                disabled={status === "loading" || !token}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                                disabled={status === "loading" || !token}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Confirm new password
                        </label>
                        <input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition-all focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                            disabled={status === "loading" || !token}
                        />
                    </div>

                    {status === "error" && (
                        <p className="text-sm font-medium text-red-500">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading" || !token || !password || !confirmPassword}
                        className="flex w-full mt-2 items-center justify-center rounded-xl bg-[#1a6fdb] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1560c2] hover:shadow-md hover:shadow-[#1a6fdb]/20 disabled:pointer-events-none disabled:opacity-70"
                    >
                        {status === "loading" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            "Reset password"
                        )}
                    </button>

                    <div className="text-center pt-2">
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
            <style jsx global>{`
                @keyframes progress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
                .animate-progress {
                    animation: progress linear forwards;
                }
            `}</style>
        </div>
    );
}
