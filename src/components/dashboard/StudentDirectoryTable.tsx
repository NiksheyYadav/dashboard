"use client";

import CVStatusBadge from "@/components/students/CVStatusBadge";
import { Button } from "@/components/ui/button";
import { PaginatedResponse } from "@/lib/types/api";
import { Student } from "@/lib/types/student";
import { getInitials } from "@/lib/utils/formatters";
import {
    ChevronLeft,
    ChevronRight,
    CloudUpload,
    Download,
    Eye,
    Upload,
} from "lucide-react";
import { useState } from "react";

interface StudentDirectoryTableProps {
    initialData: PaginatedResponse<Student>;
}

export default function StudentDirectoryTable({
    initialData,
}: StudentDirectoryTableProps) {
    const [data] = useState(initialData);
    const [currentPage, setCurrentPage] = useState(data.page);
    const totalPages = Math.ceil(data.total / data.limit);
    const startItem = (currentPage - 1) * data.limit + 1;
    const endItem = Math.min(currentPage * data.limit, data.total);

    // Avatar colors based on name hash
    const avatarColors = [
        "bg-blue-100 text-blue-600",
        "bg-emerald-100 text-emerald-600",
        "bg-purple-100 text-purple-600",
        "bg-amber-100 text-amber-600",
        "bg-rose-100 text-rose-600",
        "bg-cyan-100 text-cyan-600",
    ];

    function getAvatarColor(name: string) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return avatarColors[Math.abs(hash) % avatarColors.length];
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-gray-900">
                        Student Directory
                    </h3>
                    <select className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-[#1a6fdb]">
                        <option>All Courses</option>
                        <option>B.Tech CS</option>
                        <option>B.Tech IT</option>
                        <option>B.Tech ECE</option>
                    </select>
                    <span className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600">
                        Semester 4
                    </span>
                </div>
                <Button className="gap-2 bg-[#1a6fdb] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1560c2]">
                    <Download className="h-4 w-4" />
                    Download Report
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                Student Name
                            </th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                Roll No.
                            </th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                Course
                            </th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                CV Status
                            </th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map((student) => (
                            <tr
                                key={student.id}
                                className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                            >
                                {/* Name + Avatar */}
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(student.name)}`}
                                        >
                                            {getInitials(student.name)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {student.name}
                                        </span>
                                    </div>
                                </td>
                                {/* Roll No */}
                                <td className="px-5 py-3.5 text-sm text-gray-600">
                                    {student.rollNo}
                                </td>
                                {/* Course */}
                                <td className="px-5 py-3.5 text-sm text-gray-600">
                                    {student.course}
                                </td>
                                {/* CV Status */}
                                <td className="px-5 py-3.5">
                                    <CVStatusBadge status={student.cvStatus} />
                                </td>
                                {/* Actions */}
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-1 text-sm font-medium text-[#1a6fdb] hover:underline">
                                            <Eye className="h-3.5 w-3.5" />
                                            View Profile
                                        </button>
                                        {student.cvStatus === "UPLOADED" && (
                                            <CloudUpload className="h-4 w-4 text-gray-400" />
                                        )}
                                        {student.cvStatus === "PENDING" && (
                                            <button className="flex items-center gap-1 rounded-md bg-[#1a6fdb] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1560c2]">
                                                <Upload className="h-3 w-3" />
                                                Upload CV
                                            </button>
                                        )}
                                        {student.cvStatus === "REJECTED" && (
                                            <button className="flex items-center gap-1 rounded-md bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600">
                                                <Upload className="h-3 w-3" />
                                                Re-upload
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3">
                <p className="text-sm text-gray-500">
                    Showing {startItem} to {endItem} of{" "}
                    <span className="font-medium text-gray-700">
                        {data.total.toLocaleString()}
                    </span>{" "}
                    students
                </p>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(
                        (page) => (
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
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
