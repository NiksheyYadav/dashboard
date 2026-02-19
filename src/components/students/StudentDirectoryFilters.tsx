"use client";

import { ACADEMIC_YEARS, COURSES, SEMESTERS } from "@/lib/utils/constants";
import { X } from "lucide-react";

interface StudentDirectoryFiltersProps {
    course: string;
    semester: number;
    academicYear: string;
    onCourseChange: (value: string) => void;
    onSemesterChange: (value: number) => void;
    onAcademicYearChange: (value: string) => void;
    onClearAll: () => void;
}

export default function StudentDirectoryFilters({
    course,
    semester,
    academicYear,
    onCourseChange,
    onSemesterChange,
    onAcademicYearChange,
    onClearAll,
}: StudentDirectoryFiltersProps) {
    const hasFilters = course !== "all" || semester !== 0 || academicYear !== "all";

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Filters:</span>

            {/* Course */}
            <select
                value={course}
                onChange={(e) => onCourseChange(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
            >
                {COURSES.map((c) => (
                    <option key={c.value} value={c.value}>
                        Course: {c.label}
                    </option>
                ))}
            </select>

            {/* Semester */}
            <select
                value={semester}
                onChange={(e) => onSemesterChange(Number(e.target.value))}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
            >
                {SEMESTERS.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                ))}
            </select>

            {/* Academic Year */}
            <select
                value={academicYear}
                onChange={(e) => onAcademicYearChange(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
            >
                {ACADEMIC_YEARS.map((y) => (
                    <option key={y.value} value={y.value}>
                        {y.label}
                    </option>
                ))}
            </select>

            {/* Clear All */}
            {hasFilters && (
                <button
                    onClick={onClearAll}
                    className="flex items-center gap-1 text-sm font-medium text-[#1a6fdb] hover:underline"
                >
                    <X className="h-3.5 w-3.5" />
                    Clear All
                </button>
            )}
        </div>
    );
}
