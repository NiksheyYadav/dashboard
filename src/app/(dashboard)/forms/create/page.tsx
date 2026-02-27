"use client";

import FormFieldEditor from "@/components/forms/FormFieldEditor";
import FormPreview from "@/components/forms/FormPreview";
import { FormDefinition, FormField } from "@/lib/types/form";
import { cn } from "@/lib/utils";
import { COURSES, SEMESTERS } from "@/lib/utils/constants";
import { ArrowLeft, Eye, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

let fieldCounter = 0;

export default function CreateFormPage() {
    const router = useRouter();
    const idCounter = useRef(fieldCounter++);
    const [mode, setMode] = useState<"edit" | "preview">("edit");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [targetCourse, setTargetCourse] = useState("all");
    const [targetSemester, setTargetSemester] = useState<number | "all">("all");
    const [deadline, setDeadline] = useState("");
    const [fields, setFields] = useState<FormField[]>([
        { id: `f-${idCounter.current}`, type: "text", label: "", required: false },
    ]);

    const addField = () => {
        setFields([...fields, { id: `f-${++fieldCounter}`, type: "text", label: "", required: false }]);
    };

    const updateField = (index: number, updated: FormField) => {
        const newFields = [...fields];
        newFields[index] = updated;
        setFields(newFields);
    };

    const deleteField = (index: number) => {
        if (fields.length <= 1) return;
        setFields(fields.filter((_, i) => i !== index));
    };

    const moveField = (index: number, direction: "up" | "down") => {
        const newFields = [...fields];
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= newFields.length) return;
        [newFields[index], newFields[target]] = [newFields[target], newFields[index]];
        setFields(newFields);
    };

    const formData: Partial<FormDefinition> = {
        title,
        description,
        fields,
        targetCourse: targetCourse === "all" ? "all" : COURSES.find((c) => c.value === targetCourse)?.label ?? targetCourse,
        targetSemester,
        deadline: deadline || undefined,
    };

    const handlePublish = () => {
        // In a real app, this would POST to API
        alert("Form published! (Mock — data not persisted)");
        router.push("/forms");
    };

    return (
        <div className="animate-slide-up space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/forms" className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Form</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Build a new form for students</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
                        <button
                            onClick={() => setMode("edit")}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                mode === "edit" ? "bg-[#1a6fdb] text-white" : "text-gray-500"
                            )}
                        >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                            onClick={() => setMode("preview")}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                mode === "preview" ? "bg-[#1a6fdb] text-white" : "text-gray-500"
                            )}
                        >
                            <Eye className="h-3.5 w-3.5" /> Preview
                        </button>
                    </div>
                    <button
                        onClick={handlePublish}
                        disabled={!title.trim() || fields.length === 0}
                        className="rounded-lg bg-[#1a6fdb] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1560c2] disabled:opacity-50 active:scale-[0.98]"
                    >
                        Publish Form
                    </button>
                </div>
            </div>

            {mode === "preview" ? (
                <FormPreview form={formData} />
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
                    {/* Form Editor */}
                    <div className="space-y-4">
                        {/* Title & Description */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="mb-1 h-1 w-full rounded-full bg-[#1a6fdb]" />
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Form Title"
                                className="mt-4 w-full border-0 bg-transparent text-xl font-bold text-gray-900 placeholder:text-gray-400 outline-none dark:text-gray-100"
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Form description (optional)"
                                rows={2}
                                className="mt-2 w-full resize-none border-0 bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none dark:text-gray-400"
                            />
                        </div>

                        {/* Fields */}
                        <div className="space-y-3">
                            {fields.map((field, i) => (
                                <FormFieldEditor
                                    key={field.id}
                                    field={field}
                                    index={i}
                                    total={fields.length}
                                    onChange={(updated) => updateField(i, updated)}
                                    onDelete={() => deleteField(i)}
                                    onMoveUp={() => moveField(i, "up")}
                                    onMoveDown={() => moveField(i, "down")}
                                />
                            ))}
                        </div>

                        {/* Add Field */}
                        <button
                            onClick={addField}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-4 text-sm font-medium text-gray-500 transition-all hover:border-[#1a6fdb]/30 hover:bg-blue-50/30 hover:text-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500/30"
                        >
                            <Plus className="h-4 w-4" />
                            Add Question
                        </button>
                    </div>

                    {/* Settings Sidebar */}
                    <div className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Form Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Target Course</label>
                                    <select
                                        value={targetCourse}
                                        onChange={(e) => setTargetCourse(e.target.value)}
                                        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    >
                                        {COURSES.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Target Semester</label>
                                    <select
                                        value={targetSemester}
                                        onChange={(e) => setTargetSemester(e.target.value === "0" ? "all" : Number(e.target.value))}
                                        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    >
                                        {SEMESTERS.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Deadline</label>
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Help */}
                        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tips</h4>
                            <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <li>• Use &ldquo;All Courses&rdquo; to target everyone</li>
                                <li>• Students see forms on their dashboard</li>
                                <li>• Set a deadline to auto-close the form</li>
                                <li>• Preview before publishing</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
