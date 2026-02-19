"use client";

import { FormDefinition } from "@/lib/types/form";
import { cn } from "@/lib/utils";
import { CalendarClock, CheckCircle } from "lucide-react";
import { useState } from "react";

interface FormFillProps {
    form: FormDefinition;
    onSubmit: (answers: Record<string, string | string[]>) => void;
    onCancel: () => void;
}

export default function FormFill({ form, onSubmit, onCancel }: FormFillProps) {
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [submitted, setSubmitted] = useState(false);

    const setAnswer = (fieldId: string, value: string | string[]) => {
        setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    };

    const toggleCheckbox = (fieldId: string, optionId: string) => {
        const current = (answers[fieldId] as string[]) ?? [];
        if (current.includes(optionId)) {
            setAnswer(fieldId, current.filter((v) => v !== optionId));
        } else {
            setAnswer(fieldId, [...current, optionId]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        onSubmit(answers);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">Response Submitted!</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Your response to &quot;{form.title}&quot; has been recorded.
                </p>
                <button
                    onClick={onCancel}
                    className="mt-6 rounded-lg bg-[#1a6fdb] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1560c2]"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {/* Header */}
            <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                <div className="mb-1 h-1 w-full rounded-full bg-[#1a6fdb]" />
                <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">{form.title}</h2>
                {form.description && (
                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{form.description}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <CalendarClock className="h-3 w-3" />
                    Deadline: {new Date(form.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
            </div>

            {/* Fields */}
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {form.fields.map((field, i) => (
                    <div key={field.id} className="p-6">
                        <label className="mb-3 block text-sm font-medium text-gray-900 dark:text-gray-100">
                            {field.label || `Question ${i + 1}`}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </label>

                        {field.type === "text" && (
                            <input
                                value={(answers[field.id] as string) ?? ""}
                                onChange={(e) => setAnswer(field.id, e.target.value)}
                                required={field.required}
                                placeholder="Your answer"
                                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            />
                        )}

                        {field.type === "textarea" && (
                            <textarea
                                value={(answers[field.id] as string) ?? ""}
                                onChange={(e) => setAnswer(field.id, e.target.value)}
                                required={field.required}
                                placeholder="Your answer"
                                rows={4}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            />
                        )}

                        {field.type === "radio" && field.options?.map((opt) => (
                            <label key={opt.id} className="mb-2.5 flex cursor-pointer items-center gap-2.5">
                                <input
                                    type="radio"
                                    name={field.id}
                                    value={opt.id}
                                    checked={answers[field.id] === opt.id}
                                    onChange={() => setAnswer(field.id, opt.id)}
                                    required={field.required}
                                    className="h-4 w-4 text-[#1a6fdb] focus:ring-[#1a6fdb]"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                            </label>
                        ))}

                        {field.type === "checkbox" && field.options?.map((opt) => (
                            <label key={opt.id} className="mb-2.5 flex cursor-pointer items-center gap-2.5">
                                <input
                                    type="checkbox"
                                    checked={((answers[field.id] as string[]) ?? []).includes(opt.id)}
                                    onChange={() => toggleCheckbox(field.id, opt.id)}
                                    className="h-4 w-4 rounded text-[#1a6fdb] focus:ring-[#1a6fdb]"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                            </label>
                        ))}

                        {field.type === "dropdown" && (
                            <select
                                value={(answers[field.id] as string) ?? ""}
                                onChange={(e) => setAnswer(field.id, e.target.value)}
                                required={field.required}
                                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                                <option value="">Select...</option>
                                {field.options?.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        )}

                        {field.type === "scale" && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{field.scaleMin ?? 1}</span>
                                {Array.from(
                                    { length: (field.scaleMax ?? 5) - (field.scaleMin ?? 1) + 1 },
                                    (_, i) => (field.scaleMin ?? 1) + i
                                ).map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setAnswer(field.id, String(n))}
                                        className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-all",
                                            answers[field.id] === String(n)
                                                ? "border-[#1a6fdb] bg-[#1a6fdb] text-white"
                                                : "border-gray-200 text-gray-600 hover:border-[#1a6fdb]/50 dark:border-gray-700 dark:text-gray-400"
                                        )}
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

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-gray-100 p-6 dark:border-gray-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-lg bg-[#1a6fdb] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1560c2] active:scale-[0.98]"
                >
                    Submit
                </button>
            </div>
        </form>
    );
}
