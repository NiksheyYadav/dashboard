"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/api/client";
import { COURSES, SEMESTERS } from "@/lib/utils/constants";
import { useState } from "react";

interface AddStudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStudentAdded?: () => void;
}

export default function AddStudentDialog({
    open,
    onOpenChange,
    onStudentAdded,
}: AddStudentDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        rollNo: "",
        course: "B.Tech CS",
        semester: 1,
        email: "",
        phone: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]:
                e.target.name === "semester" ? Number(e.target.value) : e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("edupulse_auth_token");
            const res = await fetch(`${API_BASE_URL}/students`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.detail || "Failed to add student");
            }

            onOpenChange(false);
            setFormData({
                name: "",
                rollNo: "",
                course: "B.Tech CS",
                semester: 1,
                email: "",
                phone: "",
            });
            onStudentAdded?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                        Fill in the student details below. All fields marked with * are
                        required.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Name */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Full Name *
                        </label>
                        <input
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Aarav Sharma"
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                        />
                    </div>

                    {/* Roll Number */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Roll Number *
                        </label>
                        <input
                            name="rollNo"
                            required
                            value={formData.rollNo}
                            onChange={handleChange}
                            placeholder="e.g. SGT/BC/2023/0001"
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                        />
                    </div>

                    {/* Course + Semester */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Course *
                            </label>
                            <select
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                            >
                                {COURSES.filter((c) => c.value !== "all").map((c) => (
                                    <option key={c.value} value={c.label}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Semester *
                            </label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                            >
                                {SEMESTERS.filter((s) => s.value !== 0).map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="e.g. aarav.sharma@sgtuniversity.edu"
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Phone
                        </label>
                        <input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="e.g. +91 98765 43210"
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#1a6fdb] text-white hover:bg-[#1560c2]"
                        >
                            {isSubmitting ? "Adding..." : "Add Student"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
