"use client";

import AddStudentDialog from "@/components/students/AddStudentDialog";
import StatusBadge from "@/components/students/StatusBadge";
import StudentDirectoryFilters from "@/components/students/StudentDirectoryFilters";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api/client";
import { Student } from "@/lib/types/student";
import { getInitials } from "@/lib/utils/formatters";
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Plus,
    Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const ITEMS_PER_PAGE = 5;

interface PaginatedResponse {
    data: Student[];
    total: number;
    page: number;
    limit: number;
}

// Avatar color palette
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
    return `${sem}${suffix} Sem`;
}

export default function StudentsPage() {
    // Filters
    const [courseFilter, setCourseFilter] = useState("all");
    const [semesterFilter, setSemesterFilter] = useState(0);
    const [academicYearFilter, setAcademicYearFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    // Data
    const [students, setStudents] = useState<Student[]>([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(ITEMS_PER_PAGE),
            });
            if (courseFilter !== "all") params.set("course", courseFilter);
            if (semesterFilter > 0) params.set("semester", String(semesterFilter));
            if (searchQuery) params.set("search", searchQuery);

            const res = await apiGet<PaginatedResponse>(`/students?${params.toString()}`);
            setStudents(res.data);
            setTotalStudents(res.total);
        } catch {
            // Fallback: keep whatever we have
        } finally {
            setLoading(false);
        }
    }, [currentPage, courseFilter, semesterFilter, searchQuery]);

    useEffect(() => {
        void fetchStudents();
    }, [fetchStudents]);

    const totalPages = Math.max(1, Math.ceil(totalStudents / ITEMS_PER_PAGE));
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalStudents);

    const clearFilters = () => {
        setCourseFilter("all");
        setSemesterFilter(0);
        setAcademicYearFilter("all");
        setSearchQuery("");
        setCurrentPage(1);
    };

    // Pagination page numbers
    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        pages.push(1);
        if (currentPage > 3) pages.push("...");
        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        ) {
            if (!pages.includes(i)) pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("...");
        if (totalPages > 1) pages.push(totalPages);
        return pages;
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Student Directory
                </h1>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by name or roll number..."
                            className="h-10 w-[280px] rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                        />
                    </div>

                    {/* Add New Student */}
                    <Button
                        onClick={() => setAddDialogOpen(true)}
                        className="gap-2 bg-[#1a6fdb] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1560c2]"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Student
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <StudentDirectoryFilters
                course={courseFilter}
                semester={semesterFilter}
                academicYear={academicYearFilter}
                onCourseChange={(v) => {
                    setCourseFilter(v);
                    setCurrentPage(1);
                }}
                onSemesterChange={(v) => {
                    setSemesterFilter(v);
                    setCurrentPage(1);
                }}
                onAcademicYearChange={(v) => {
                    setAcademicYearFilter(v);
                    setCurrentPage(1);
                }}
                onClearAll={clearFilters}
            />

            {/* Table */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Student Profile
                                </th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Roll Number
                                </th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Department
                                </th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Semester
                                </th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Attendance
                                </th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    CV Status
                                </th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1a6fdb]" />
                                        <p className="mt-2 text-sm text-gray-400">Loading students…</p>
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-12 text-center text-sm text-gray-400"
                                    >
                                        No students match your filters.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                                    >
                                        {/* Student Profile */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(student.name)}`}
                                                >
                                                    {getInitials(student.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {student.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {student.course}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Roll Number */}
                                        <td className="px-5 py-4 text-sm font-medium text-gray-700">
                                            {student.rollNo}
                                        </td>

                                        {/* Department */}
                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {student.department}
                                        </td>

                                        {/* Semester */}
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                                                {getSemesterLabel(student.semester)}
                                            </span>
                                        </td>

                                        {/* Attendance */}
                                        <td className="px-5 py-4">
                                            <span className={`text-sm font-semibold ${student.attendancePercent >= 85 ? "text-emerald-600" : student.attendancePercent >= 75 ? "text-amber-600" : "text-red-500"}`}>
                                                {student.attendancePercent}%
                                            </span>
                                        </td>

                                        {/* CV Status */}
                                        <td className="px-5 py-4">
                                            <StatusBadge status={student.cvStatus} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <button className="flex items-center gap-1.5 rounded-lg border border-[#1a6fdb] px-3 py-1.5 text-xs font-semibold text-[#1a6fdb] transition-colors hover:bg-[#1a6fdb] hover:text-white">
                                                <Eye className="h-3.5 w-3.5" />
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-medium text-[#1a6fdb]">
                            {totalStudents > 0 ? startItem : 0} to {endItem}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-700">
                            {totalStudents} students
                        </span>
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {getPageNumbers().map((page, idx) =>
                            page === "..." ? (
                                <span
                                    key={`dots-${idx}`}
                                    className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                        ? "bg-[#1a6fdb] text-white"
                                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        )}

                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage >= totalPages}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Student Dialog */}
            <AddStudentDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onStudentAdded={fetchStudents}
            />
        </div>
    );
}
