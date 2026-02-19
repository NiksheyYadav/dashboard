"use client";

import { useAuth, UserRole } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    BookOpen,
    Briefcase,
    CalendarCheck,
    Crown,
    FileText,
    GraduationCap,
    Shield,
    UserCog
} from "lucide-react";
import { useState } from "react";

const FEATURES = [
    { icon: CalendarCheck, label: "Attendance Tracking", desc: "Real-time attendance analytics" },
    { icon: FileText, label: "CV Management", desc: "Upload and verify student resumes" },
    { icon: BarChart3, label: "Smart Analytics", desc: "Comprehensive performance insights" },
    { icon: Shield, label: "Role-Based Access", desc: "Dean, HOD, Coordinator, Faculty" },
];

const ROLE_OPTIONS: { key: UserRole; label: string; icon: typeof Crown }[] = [
    { key: "dean", label: "Dean", icon: Crown },
    { key: "hod", label: "HOD", icon: Briefcase },
    { key: "coordinator", label: "Coordinator", icon: UserCog },
    { key: "faculty", label: "Faculty", icon: BookOpen },
];

const DEMO_ACCOUNTS: { role: UserRole; name: string; subtitle: string; icon: typeof Crown; iconBg: string }[] = [
    { role: "dean", name: "Prof. Rajesh Gupta", subtitle: "Dean — Faculty of Engineering", icon: Crown, iconBg: "bg-amber-50 dark:bg-amber-900/30" },
    { role: "hod", name: "Dr. Priya Mehta", subtitle: "HOD — B.Tech CS", icon: Briefcase, iconBg: "bg-blue-50 dark:bg-blue-900/30" },
    { role: "coordinator", name: "Dr. Amit Sharma", subtitle: "Coordinator — B.Tech CS", icon: UserCog, iconBg: "bg-emerald-50 dark:bg-emerald-900/30" },
    { role: "faculty", name: "Dr. Robert Chen", subtitle: "Faculty — B.Tech CS", icon: BookOpen, iconBg: "bg-rose-50 dark:bg-rose-900/30" },
];

const ROLE_ICON_COLORS: Record<UserRole, string> = {
    dean: "text-amber-500",
    hod: "text-blue-500",
    coordinator: "text-emerald-500",
    faculty: "text-rose-500",
};

export default function LoginPage() {
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole>("faculty");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(selectedRole);
    };

    return (
        <div className="flex min-h-screen bg-[#f4f6fa]">
            {/* ── Left Hero Panel ── */}
            <div className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col lg:justify-between">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f4c96] via-[#1a6fdb] to-[#3b82f6]" />

                {/* Floating decorative shapes */}
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 animate-float" />
                <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5 animate-float" style={{ animationDelay: "2s" }} />
                <div className="absolute right-20 bottom-32 h-32 w-32 rounded-full bg-white/5 animate-float" style={{ animationDelay: "4s" }} />
                <div className="absolute left-32 top-48 h-20 w-20 rounded-full bg-white/10 animate-float" style={{ animationDelay: "1s" }} />

                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: "32px 32px",
                }} />

                {/* Content */}
                <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-20">
                    {/* Logo */}
                    <div className="mb-8 flex items-center gap-3 animate-slide-up">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm animate-pulse-glow">
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-white">EduPulse</span>
                            <p className="text-xs text-blue-200">SGT University</p>
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl animate-slide-up" style={{ animationDelay: "100ms" }}>
                        E-Block
                        <br />
                        Administration
                        <br />
                        <span className="text-blue-200">Dashboard</span>
                    </h1>
                    <p className="mt-4 max-w-md text-base text-blue-100/80 animate-slide-up" style={{ animationDelay: "200ms" }}>
                        Streamline attendance, analytics, and student management
                        — designed for Dean, HOD, Coordinators & Faculty.
                    </p>

                    {/* Feature Grid */}
                    <div className="mt-10 grid grid-cols-2 gap-4 stagger-children">
                        {FEATURES.map((f) => (
                            <div
                                key={f.label}
                                className="flex items-start gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 animate-slide-up"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                                    <f.icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{f.label}</p>
                                    <p className="text-xs text-blue-200/70">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom tag */}
                <div className="relative z-10 px-12 pb-8 xl:px-20">
                    <p className="text-xs text-blue-200/50">
                        © 2026 SGT University — E Block Administration
                    </p>
                </div>
            </div>

            {/* ── Right Login Form ── */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-12 lg:px-16">
                {/* Mobile logo */}
                <div className="mb-8 flex flex-col items-center lg:hidden animate-slide-up">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1a6fdb]">
                        <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-gray-900">EduPulse</h2>
                    <p className="text-xs text-gray-400">E-Block Administration</p>
                </div>

                <div className="w-full max-w-[420px] animate-scale-in">
                    {/* Heading */}
                    <div className="mb-6 hidden lg:block">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Sign in with your {ROLE_OPTIONS.find((r) => r.key === selectedRole)?.label} credentials
                        </p>
                    </div>

                    {/* Role Toggle — 4 tabs */}
                    <div className="mb-6 grid grid-cols-4 rounded-xl border border-gray-200 bg-gray-50 p-1">
                        {ROLE_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                type="button"
                                onClick={() => setSelectedRole(opt.key)}
                                className={cn(
                                    "flex flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-semibold transition-all",
                                    selectedRole === opt.key
                                        ? "bg-[#1a6fdb] text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <opt.icon className="h-4 w-4" />
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={`${selectedRole}@sgtuniversity.edu`}
                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition-all focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                            />
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <button type="button" className="text-xs font-medium text-[#1a6fdb] hover:underline">
                                    Forgot password?
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition-all focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                            />
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-[#1a6fdb] focus:ring-[#1a6fdb]" />
                            <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
                        </div>

                        <button
                            type="submit"
                            className="h-11 w-full rounded-xl bg-[#1a6fdb] text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1560c2] hover:shadow-lg active:scale-[0.98]"
                        >
                            Sign In as {ROLE_OPTIONS.find((r) => r.key === selectedRole)?.label}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-400">Demo Accounts</span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* Quick login — 4 demo accounts */}
                    <div className="space-y-2">
                        {DEMO_ACCOUNTS.map((account) => (
                            <button
                                key={account.role}
                                type="button"
                                onClick={() => { setSelectedRole(account.role); login(account.role); }}
                                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition-all hover:border-[#1a6fdb]/30 hover:bg-blue-50/30 active:scale-[0.98]"
                            >
                                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", account.iconBg)}>
                                    <account.icon className={cn("h-4 w-4", ROLE_ICON_COLORS[account.role])} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{account.name}</p>
                                    <p className="text-xs text-gray-400">{account.subtitle}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <p className="mt-8 text-center text-xs text-gray-400">
                        SGT University — E Block Student Dashboard
                    </p>
                </div>
            </div>
        </div>
    );
}
