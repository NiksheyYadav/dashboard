"use client";

import { FormField, FormFieldOption, FormFieldType } from "@/lib/types/form";
import { cn } from "@/lib/utils";
import {
    AlignLeft,
    ArrowDown,
    ArrowUp,
    CheckSquare,
    ChevronDown,
    List,
    SlidersHorizontal,
    Trash2,
    Type
} from "lucide-react";

const FIELD_TYPE_OPTIONS: { type: FormFieldType; label: string; icon: typeof Type }[] = [
    { type: "text", label: "Short Answer", icon: Type },
    { type: "textarea", label: "Paragraph", icon: AlignLeft },
    { type: "radio", label: "Multiple Choice", icon: List },
    { type: "checkbox", label: "Checkboxes", icon: CheckSquare },
    { type: "dropdown", label: "Dropdown", icon: ChevronDown },
    { type: "scale", label: "Linear Scale", icon: SlidersHorizontal },
];

interface FormFieldEditorProps {
    field: FormField;
    index: number;
    total: number;
    onChange: (updated: FormField) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

export default function FormFieldEditor({
    field,
    index,
    total,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
}: FormFieldEditorProps) {
    const hasOptions = ["radio", "checkbox", "dropdown"].includes(field.type);

    const addOption = () => {
        const newOpt: FormFieldOption = { id: `opt-${Date.now()}`, label: `Option ${(field.options?.length ?? 0) + 1}` };
        onChange({ ...field, options: [...(field.options ?? []), newOpt] });
    };

    const updateOption = (optId: string, label: string) => {
        onChange({
            ...field,
            options: field.options?.map((o) => (o.id === optId ? { ...o, label } : o)),
        });
    };

    const removeOption = (optId: string) => {
        onChange({ ...field, options: field.options?.filter((o) => o.id !== optId) });
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
                {/* Field number */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-[#1a6fdb] dark:bg-blue-950/30 dark:text-blue-400">
                    {index + 1}
                </div>

                <div className="flex-1 space-y-4">
                    {/* Label + Type */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            value={field.label}
                            onChange={(e) => onChange({ ...field, label: e.target.value })}
                            placeholder="Question label..."
                            className="h-10 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        />
                        <select
                            value={field.type}
                            onChange={(e) => {
                                const newType = e.target.value as FormFieldType;
                                const needsOptions = ["radio", "checkbox", "dropdown"].includes(newType);
                                onChange({
                                    ...field,
                                    type: newType,
                                    options: needsOptions && !field.options?.length
                                        ? [{ id: "opt-1", label: "Option 1" }, { id: "opt-2", label: "Option 2" }]
                                        : field.options,
                                    scaleMin: newType === "scale" ? 1 : undefined,
                                    scaleMax: newType === "scale" ? 5 : undefined,
                                });
                            }}
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] sm:w-[180px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                            {FIELD_TYPE_OPTIONS.map((ft) => (
                                <option key={ft.type} value={ft.type}>{ft.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Options editor for radio/checkbox/dropdown */}
                    {hasOptions && (
                        <div className="space-y-2 pl-0 sm:pl-1">
                            {field.options?.map((opt) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-4 w-4 shrink-0 rounded border border-gray-300 dark:border-gray-600",
                                        field.type === "radio" ? "rounded-full" : ""
                                    )} />
                                    <input
                                        value={opt.label}
                                        onChange={(e) => updateOption(opt.id, e.target.value)}
                                        className="h-9 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    />
                                    <button onClick={() => removeOption(opt.id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={addOption} className="text-sm font-medium text-[#1a6fdb] hover:underline">
                                + Add Option
                            </button>
                        </div>
                    )}

                    {/* Scale range */}
                    {field.type === "scale" && (
                        <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-500">From</label>
                            <input
                                type="number"
                                value={field.scaleMin ?? 1}
                                onChange={(e) => onChange({ ...field, scaleMin: Number(e.target.value) })}
                                className="h-9 w-16 rounded-lg border border-gray-200 px-2 text-center text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            />
                            <label className="text-xs text-gray-500">To</label>
                            <input
                                type="number"
                                value={field.scaleMax ?? 5}
                                onChange={(e) => onChange({ ...field, scaleMax: Number(e.target.value) })}
                                className="h-9 w-16 rounded-lg border border-gray-200 px-2 text-center text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-1">
                    <button disabled={index === 0} onClick={onMoveUp} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800">
                        <ArrowUp className="h-4 w-4" />
                    </button>
                    <button disabled={index === total - 1} onClick={onMoveDown} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800">
                        <ArrowDown className="h-4 w-4" />
                    </button>
                    <button onClick={onDelete} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Required toggle */}
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <span className="text-xs text-gray-500">Required</span>
                <button
                    onClick={() => onChange({ ...field, required: !field.required })}
                    className={cn(
                        "relative h-5 w-9 rounded-full transition-colors",
                        field.required ? "bg-[#1a6fdb]" : "bg-gray-300 dark:bg-gray-600"
                    )}
                >
                    <div className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                        field.required ? "left-[18px]" : "left-0.5"
                    )} />
                </button>
            </div>
        </div>
    );
}
