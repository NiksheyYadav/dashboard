"use client";

import { FormDefinition } from "@/lib/types/form";
import {
    AlignLeft,
    CheckSquare,
    ChevronDown,
    List,
    SlidersHorizontal,
    Type,
} from "lucide-react";

interface FormPreviewProps {
    form: Partial<FormDefinition>;
}

export default function FormPreview({ form }: FormPreviewProps) {
    const getFieldIcon = (type: string) => {
        switch (type) {
            case "text": return <Type className="h-4 w-4" />;
            case "textarea": return <AlignLeft className="h-4 w-4" />;
            case "radio": return <List className="h-4 w-4" />;
            case "checkbox": return <CheckSquare className="h-4 w-4" />;
            case "dropdown": return <ChevronDown className="h-4 w-4" />;
            case "scale": return <SlidersHorizontal className="h-4 w-4" />;
            default: return null;
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {/* Header */}
            <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                <div className="mb-1 h-1 w-full rounded-full bg-[#1a6fdb]" />
                <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">
                    {form.title || "Untitled Form"}
                </h2>
                {form.description && (
                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{form.description}</p>
                )}
                {form.deadline && (
                    <p className="mt-2 text-xs text-red-500">
                        Deadline: {new Date(form.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                )}
            </div>

            {/* Fields */}
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {(form.fields ?? []).map((field, i) => (
                    <div key={field.id} className="p-6">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="text-gray-400">{getFieldIcon(field.type)}</span>
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {field.label || `Question ${i + 1}`}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </label>
                        </div>

                        {/* Render preview input */}
                        {field.type === "text" && (
                            <input
                                disabled
                                placeholder="Short answer text"
                                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                            />
                        )}
                        {field.type === "textarea" && (
                            <textarea
                                disabled
                                placeholder="Long answer text"
                                rows={3}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                            />
                        )}
                        {field.type === "radio" && field.options?.map((opt) => (
                            <label key={opt.id} className="mb-2 flex items-center gap-2.5">
                                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                            </label>
                        ))}
                        {field.type === "checkbox" && field.options?.map((opt) => (
                            <label key={opt.id} className="mb-2 flex items-center gap-2.5">
                                <div className="h-4 w-4 rounded border-2 border-gray-300" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                            </label>
                        ))}
                        {field.type === "dropdown" && (
                            <select disabled className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800">
                                <option>Select...</option>
                                {field.options?.map((opt) => (
                                    <option key={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        )}
                        {field.type === "scale" && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{field.scaleMin ?? 1}</span>
                                {Array.from({ length: (field.scaleMax ?? 5) - (field.scaleMin ?? 1) + 1 }, (_, i) => (field.scaleMin ?? 1) + i).map((n) => (
                                    <button
                                        key={n}
                                        disabled
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400"
                                    >
                                        {n}
                                    </button>
                                ))}
                                <span className="text-xs text-gray-500">{field.scaleMax ?? 5}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Submit */}
            <div className="border-t border-gray-100 p-6 dark:border-gray-800">
                <button disabled className="rounded-lg bg-[#1a6fdb] px-6 py-2.5 text-sm font-semibold text-white opacity-60">
                    Submit
                </button>
            </div>
        </div>
    );
}
