"use client";

import { MOCK_FORMS, MOCK_FORM_RESPONSES } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";
import {
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    Eye,
    Plus,
    Users,
} from "lucide-react";
import Link from "next/link";

export default function FormsPage() {
    const forms = MOCK_FORMS;

    return (
        <div className="animate-slide-up space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forms</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create and manage forms for student feedback and surveys
                    </p>
                </div>
                <Link
                    href="/forms/create"
                    className="flex items-center gap-2 rounded-xl bg-[#1a6fdb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1560c2] active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    Create New Form
                </Link>
            </div>

            {/* Forms Grid */}
            {forms.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-6 py-16 dark:border-gray-800 dark:bg-gray-900">
                    <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No Forms Yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create your first form to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {forms.map((form) => {
                        const responses = MOCK_FORM_RESPONSES.filter((r) => r.formId === form.id);
                        const isExpired = new Date(form.deadline) < new Date();

                        return (
                            <div
                                key={form.id}
                                className="group flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                            >
                                {/* Color bar */}
                                <div className={cn("h-1.5 w-full rounded-t-xl", form.isActive && !isExpired ? "bg-[#1a6fdb]" : "bg-gray-300 dark:bg-gray-600")} />

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            form.isActive && !isExpired
                                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                        )}>
                                            {form.isActive && !isExpired ? "Active" : "Closed"}
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                            {form.targetCourse === "all" ? "All" : form.targetCourse}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        {form.title}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                        {form.description}
                                    </p>

                                    <div className="mt-auto pt-4">
                                        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {responses.length} responses
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ClipboardList className="h-3 w-3" />
                                                {form.fields.length} questions
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CalendarClock className="h-3 w-3" />
                                                {new Date(form.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex border-t border-gray-100 dark:border-gray-800">
                                    <button className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#1a6fdb] dark:hover:bg-gray-800">
                                        <Eye className="h-3.5 w-3.5" /> View Responses
                                    </button>
                                    <div className="w-px bg-gray-100 dark:bg-gray-800" />
                                    <button className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#1a6fdb] dark:hover:bg-gray-800">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> {form.isActive ? "Close" : "Reopen"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
