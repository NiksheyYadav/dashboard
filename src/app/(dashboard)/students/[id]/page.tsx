"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api/client";
import { Student } from "@/lib/types/student";
import { getInitials } from "@/lib/utils/formatters";
import {
    ArrowLeft,
    Calendar,
    ChevronRight,
    GraduationCap,
    Loader2,
    Mail,
    Phone,
    User,
} from "lucide-react";

// Avatar color palette (same as directory)
const avatarColors = [
    "bg-orange-100 text-orange-600",
    "bg-amber-100 text-amber-600",
    "bg-emerald-100 text-emerald-600",
    "bg-sky-100 text-sky-600",
    "bg-purple-100 text-purple-600",
    "bg-rose-100 text-rose-600",
    "bg-cyan-100 text-cyan-600",
    "bg-indigo-100 text-indigo-600",
];

function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getSemesterLabel(sem: number): string {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = sem % 100;
    const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
    return `${sem}${suffix} Semester`;
}

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await apiGet<Student>(`/students/${studentId}`);
                setStudent(res);
            } catch {
                setError("Student not found");
            } finally {
                setLoading(false);
            }
        };
        void fetchStudent();
    }, [studentId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#1a6fdb]" />
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="space-y-4 text-center py-20">
                <p className="text-gray-500">{error || "Student not found"}</p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm text-[#1a6fdb] hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Students
                </button>
            </div>
        );
    }

    const attendanceColor =
        student.attendancePercent >= 85
            ? "text-emerald-600 bg-emerald-50"
            : student.attendancePercent >= 75
                ? "text-amber-600 bg-amber-50"
                : "text-red-500 bg-red-50";

    const cvStatusColor =
        student.cvStatus === "UPLOADED"
            ? "text-emerald-600 bg-emerald-50 border-emerald-200"
            : student.cvStatus === "PENDING"
                ? "text-amber-600 bg-amber-50 border-amber-200"
                : "text-red-500 bg-red-50 border-red-200";

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Link href="/students" className="hover:text-gray-600 transition-colors">
                    Students
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-gray-700">{student.name}</span>
            </div>

            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>

            {/* Profile Header Card */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ${getAvatarColor(student.name)}`}>
                        {getInitials(student.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {student.name}
                            </h1>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${student.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                                {student.status}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {student.rollNo} · {student.course}
                        </p>

                        {/* Contact row */}
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {student.email && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                    {student.email}
                                </span>
                            )}
                            {student.phone && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                                    {student.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Department */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                            <GraduationCap className="h-5 w-5 text-[#1a6fdb]" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Department</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{student.department}</p>
                        </div>
                    </div>
                </div>

                {/* Semester */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/30">
                            <Calendar className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Semester</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{getSemesterLabel(student.semester)}</p>
                        </div>
                    </div>
                </div>

                {/* Attendance */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${attendanceColor.split(" ").slice(1).join(" ")}`}>
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Attendance</p>
                            <p className={`text-sm font-bold ${attendanceColor.split(" ")[0]}`}>
                                {student.attendancePercent}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* CV Status */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cvStatusColor.split(" ").slice(1, 2).join(" ")}`}>
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">CV Status</p>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cvStatusColor}`}>
                                {student.cvStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Joined Date */}
            {student.joinedDate && (
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                            <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Joined Date</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {new Date(student.joinedDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
