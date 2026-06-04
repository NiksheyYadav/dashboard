"use client";

import { useEffect, useState } from "react";
import {
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    UserCog,
    Upload,
    ShieldCheck,
    Settings,
    FileBarChart,
    ClipboardList,
    Building2,
    Layers,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Activity,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api/config";
import { EduPulseNexusLoader } from "@/components/ui/loaders";

/* ── Master‑data quick‑config cards ─────────────────────────────── */
const MASTER_DATA = [
    { icon: GraduationCap, label: "Students", desc: "Bulk add / edit student master", href: "/academic-data", color: "blue" },
    { icon: Users,          label: "Faculty",  desc: "Manage faculty & designations",  href: "/academic-data", color: "indigo" },
    { icon: BookOpen,       label: "Subjects", desc: "Subject allocation & credits",   href: "/academic-data", color: "purple" },
    { icon: Calendar,       label: "Timetable",desc: "Slots, rooms & weekly schedule", href: "/academic-data", color: "cyan" },
];

const MAPPINGS = [
    { icon: UserCog,   label: "Mentor ↔ Mentee",   desc: "Assign mentees to mentors",       href: "/academic-data", color: "emerald" },
    { icon: BookOpen,  label: "Teacher ↔ Subject",  desc: "Map faculty to subjects/sections", href: "/academic-data", color: "sky" },
    { icon: Building2, label: "HoD / Dean Mapping",  desc: "Assign department heads & dean",  href: "/settings",      color: "amber" },
];

const RULES_CONFIG = [
    { icon: ShieldCheck,   label: "Attendance Rules",    desc: "Minimum %, locking window, slot rules",     href: "/settings" },
    { icon: AlertCircle,   label: "Detention Threshold", desc: "Warning stages & detention cut-off %",      href: "/settings" },
    { icon: ClipboardList, label: "Leave Types",          desc: "CL, ML, academic duty, comp-off etc.",     href: "/settings" },
    { icon: Layers,        label: "Activity Categories",  desc: "Seminar, workshop, placement, IV etc.",    href: "/settings" },
    { icon: FileBarChart,  label: "Templates",            desc: "Warning letter & parent summary formats",  href: "/settings" },
    { icon: Clock,         label: "Academic Calendar",    desc: "Session dates, exam windows, holidays",    href: "/settings" },
];

const COLOR_MAP: Record<string, { bg: string; text: string; hover: string }> = {
    blue:    { bg: "bg-blue-100",    text: "text-blue-600",    hover: "group-hover:bg-blue-200"    },
    indigo:  { bg: "bg-indigo-100",  text: "text-indigo-600",  hover: "group-hover:bg-indigo-200"  },
    purple:  { bg: "bg-purple-100",  text: "text-purple-600",  hover: "group-hover:bg-purple-200"  },
    cyan:    { bg: "bg-cyan-100",    text: "text-cyan-600",    hover: "group-hover:bg-cyan-200"    },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600", hover: "group-hover:bg-emerald-200" },
    sky:     { bg: "bg-sky-100",     text: "text-sky-600",     hover: "group-hover:bg-sky-200"     },
    amber:   { bg: "bg-amber-100",   text: "text-amber-600",   hover: "group-hover:bg-amber-200"   },
    slate:   { bg: "bg-slate-100",   text: "text-slate-600",   hover: "group-hover:bg-slate-200"   },
};

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem("edupulse_auth_token");
                const res = await fetch(apiUrl("/dashboard/metrics"), {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setMetrics(await res.json());
                else throw new Error();
            } catch {
                setMetrics({
                    total_students: 4500,
                    attendance_rate: 87.5,
                    low_attendance_students: 120,
                    critical_students: 35,
                });
            }
        })();
    }, []);

    if (!metrics) {
        return (
            <div className="flex h-64 items-center justify-center">
                <EduPulseNexusLoader size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Header ─────────────────────────────────────────── */}
            <div>
                <h2 className="text-xl font-bold text-gray-900">Admin Control Panel</h2>
                <p className="text-sm text-gray-500">
                    Configure master data, mappings, rules &amp; system settings
                </p>
            </div>

            {/* ── System Snapshot ─────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stat-card stat-card-blue flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{metrics.total_students}</p>
                    </div>
                </div>
                <div className="stat-card stat-card-green flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Avg Attendance</p>
                        <p className="text-2xl font-bold text-emerald-700">{metrics.attendance_rate}%</p>
                    </div>
                </div>
                <div className="stat-card stat-card-amber flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Warning (&lt;75%)</p>
                        <p className="text-2xl font-bold text-amber-700">{metrics.low_attendance_students}</p>
                    </div>
                </div>
                <div className="stat-card stat-card-red flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <Activity className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Critical Detentions</p>
                        <p className="text-2xl font-bold text-red-700">{metrics.critical_students}</p>
                    </div>
                </div>
            </div>

            {/* ── 1  Master Data ──────────────────────────────────── */}
            <section>
                <div className="soet-card mb-4">
                    <h3 className="soet-card-header">
                        <Upload className="h-4 w-4 text-blue-600" /> Master Data Management
                    </h3>
                    <p className="text-xs text-gray-500 -mt-2">
                        Bulk import and manage students, faculty, subjects &amp; timetable via CSV / Excel
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MASTER_DATA.map((item) => {
                        const c = COLOR_MAP[item.color] ?? COLOR_MAP.slate;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="soet-card group text-left transition-all hover:shadow-md hover:border-blue-200 block"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 transition-colors", c.bg, c.hover)}>
                                        <item.icon className={cn("h-5 w-5", c.text)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-900 leading-tight">{item.label}</h4>
                                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.desc}</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* ── 2  Mappings ─────────────────────────────────────── */}
            <section>
                <div className="soet-card mb-4">
                    <h3 className="soet-card-header">
                        <UserCog className="h-4 w-4 text-emerald-600" /> Mappings &amp; Assignments
                    </h3>
                    <p className="text-xs text-gray-500 -mt-2">
                        Assign mentors, teachers, HoDs &amp; Dean to their respective scope
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MAPPINGS.map((item) => {
                        const c = COLOR_MAP[item.color] ?? COLOR_MAP.slate;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="soet-card group text-left transition-all hover:shadow-md hover:border-blue-200 block"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 transition-colors", c.bg, c.hover)}>
                                        <item.icon className={cn("h-5 w-5", c.text)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-900 leading-tight">{item.label}</h4>
                                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.desc}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors mt-1 flex-shrink-0" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* ── 3  Rules & Configuration ────────────────────────── */}
            <section>
                <div className="soet-card mb-4">
                    <h3 className="soet-card-header">
                        <Settings className="h-4 w-4 text-purple-600" /> Rules &amp; Configuration
                    </h3>
                    <p className="text-xs text-gray-500 -mt-2">
                        Set attendance policies, detention thresholds, leave types, templates &amp; academic calendar
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {RULES_CONFIG.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="soet-card group text-left transition-all hover:shadow-md hover:border-blue-200 block"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors flex-shrink-0">
                                    <item.icon className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 leading-tight">{item.label}</h4>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.desc}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-purple-500 transition-colors mt-1 flex-shrink-0" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── 4  Quick Links ──────────────────────────────────── */}
            <div className="soet-card">
                <h3 className="soet-card-header">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link href="/academic-data" className="p-3 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                        <div>
                            <p className="font-semibold text-sm">Bulk Data Import</p>
                            <p className="text-xs text-gray-500">Upload CSV/Excel for students, faculty, timetable</p>
                        </div>
                        <span className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition-colors">Import</span>
                    </Link>
                    <Link href="/reports" className="p-3 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                        <div>
                            <p className="font-semibold text-sm">Generate Reports</p>
                            <p className="text-xs text-gray-500">System-wide attendance, detention & audit reports</p>
                        </div>
                        <span className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition-colors">Reports</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
