"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { Theme, useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";
import {
    Bell,
    Lock,
    Monitor,
    Moon,
    Sun,
    User,
} from "lucide-react";
import { useState } from "react";

type Tab = "profile" | "appearance" | "notifications" | "account";

const TABS: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "appearance", label: "Appearance", icon: Sun },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "account", label: "Account", icon: Lock },
];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                checked ? "bg-[#1a6fdb]" : "bg-gray-300 dark:bg-gray-600"
            )}
        >
            <div className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                checked ? "left-[22px]" : "left-0.5"
            )} />
        </button>
    );
}

export default function SettingsPage() {
    const { user, role } = useAuth();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        announcements: true,
        forms: true,
    });

    const themeOptions: { key: Theme; label: string; icon: typeof Sun; desc: string }[] = [
        { key: "light", label: "Light", icon: Sun, desc: "Default light theme" },
        { key: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
        { key: "system", label: "System", icon: Monitor, desc: "Matches your device" },
    ];

    return (
        <div className="animate-slide-up space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your account preferences
                </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Sidebar Tabs */}
                <div className="flex flex-row gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-2 lg:w-[220px] lg:flex-col lg:overflow-x-visible dark:border-gray-800 dark:bg-gray-900">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                activeTab === tab.key
                                    ? "bg-[#e8f0fd] text-[#1a6fdb] dark:bg-blue-950/50 dark:text-blue-400"
                                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    {/* ── Profile ── */}
                    {activeTab === "profile" && (
                        <div className="animate-fade-in space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Information</h3>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold",
                                    role === "dean"
                                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                                        : role === "hod"
                                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                                            : role === "coordinator"
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                                                : "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400"
                                )}>
                                    {user?.avatarInitials ?? "??"}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.name ?? "Guest"}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email ?? ""}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                                    <input readOnly value={user?.name ?? ""} className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                                    <input readOnly value={user?.email ?? ""} className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">Department</label>
                                    <input readOnly value={user?.department ?? ""} className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">Role</label>
                                    <input readOnly value={user?.designation ?? role ?? ""} className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">Role</label>
                                    <input readOnly value={role?.toUpperCase() ?? ""} className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Appearance ── */}
                    {activeTab === "appearance" && (
                        <div className="animate-fade-in space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                {themeOptions.map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setTheme(opt.key)}
                                        className={cn(
                                            "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                                            theme === opt.key
                                                ? "border-[#1a6fdb] bg-blue-50/50 dark:bg-blue-950/30"
                                                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-full",
                                            theme === opt.key
                                                ? "bg-[#1a6fdb] text-white"
                                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                        )}>
                                            <opt.icon className="h-5 w-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className={cn(
                                                "text-sm font-semibold",
                                                theme === opt.key ? "text-[#1a6fdb]" : "text-gray-800 dark:text-gray-200"
                                            )}>{opt.label}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Notifications ── */}
                    {activeTab === "notifications" && (
                        <div className="animate-fade-in space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notification Preferences</h3>
                            <div className="space-y-4">
                                {[
                                    { key: "email" as const, label: "Email Notifications", desc: "Receive updates via email" },
                                    { key: "push" as const, label: "Push Notifications", desc: "Browser push notifications" },
                                    { key: "sms" as const, label: "SMS Notifications", desc: "Text message alerts (premium)" },
                                    { key: "announcements" as const, label: "Announcements", desc: "New announcements from faculty" },
                                    { key: "forms" as const, label: "Form Reminders", desc: "Reminders for pending forms" },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                                        </div>
                                        <ToggleSwitch
                                            checked={notifications[item.key]}
                                            onChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Account ── */}
                    {activeTab === "account" && (
                        <div className="animate-fade-in space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account Security</h3>
                            <div className="max-w-md space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">New Password</label>
                                    <input type="password" placeholder="••••••••" className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">Confirm New Password</label>
                                    <input type="password" placeholder="••••••••" className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" />
                                </div>
                                <button className="h-11 rounded-lg bg-[#1a6fdb] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1560c2]">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
