"use client";

import { useAuth, UserRole } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole>("teacher");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(selectedRole);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6fa]">
            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
                {/* Logo */}
                <div className="mb-6 flex flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1a6fdb]">
                        <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="mt-4 text-xl font-bold text-gray-900">
                        Welcome to EduPulse
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {selectedRole === "teacher"
                            ? "Sign in with your faculty credentials"
                            : "Sign in with your student credentials"}
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="mb-6 flex rounded-lg border border-gray-200 p-1">
                    <button
                        type="button"
                        onClick={() => setSelectedRole("teacher")}
                        className={cn(
                            "flex-1 rounded-md py-2.5 text-sm font-semibold transition-all",
                            selectedRole === "teacher"
                                ? "bg-[#1a6fdb] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Faculty Login
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole("student")}
                        className={cn(
                            "flex-1 rounded-md py-2.5 text-sm font-semibold transition-all",
                            selectedRole === "student"
                                ? "bg-[#1a6fdb] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Student Login
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            {selectedRole === "teacher" ? "Faculty Email" : "Student Email"}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={
                                selectedRole === "teacher"
                                    ? "faculty@sgtuniversity.edu"
                                    : "student@sgtuniversity.edu"
                            }
                            className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none transition-colors focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none transition-colors focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                        />
                    </div>
                    <button
                        type="submit"
                        className="h-11 w-full rounded-lg bg-[#1a6fdb] text-sm font-semibold text-white transition-colors hover:bg-[#1560c2]"
                    >
                        Sign In as {selectedRole === "teacher" ? "Faculty" : "Student"}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-gray-400">
                    SGT University — E Block Student Dashboard
                </p>
            </div>
        </div>
    );
}
