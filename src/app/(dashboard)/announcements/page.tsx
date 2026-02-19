"use client";

import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import { useAuth } from "@/lib/auth/auth-context";
import { MOCK_ANNOUNCEMENTS } from "@/lib/data/mock-data";
import { Announcement, AnnouncementPriority } from "@/lib/types/announcement";
import { COURSES, SEMESTERS } from "@/lib/utils/constants";
import { Megaphone, Plus, X } from "lucide-react";
import { useState } from "react";

export default function AnnouncementsPage() {
    const { user, role } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [newPriority, setNewPriority] = useState<AnnouncementPriority>("normal");
    const [newCourse, setNewCourse] = useState("all");
    const [newSemester, setNewSemester] = useState<number | "all">("all");

    const handleCreate = () => {
        if (!newTitle.trim() || !newMessage.trim()) return;
        const ann: Announcement = {
            id: `ann-${Date.now()}`,
            title: newTitle,
            message: newMessage,
            author: user?.name ?? "Unknown",
            authorRole: role ?? "faculty",
            targetCourse: newCourse,
            targetSemester: newSemester,
            createdAt: new Date().toISOString(),
            priority: newPriority,
        };
        setAnnouncements([ann, ...announcements]);
        setShowCreate(false);
        setNewTitle("");
        setNewMessage("");
        setNewPriority("normal");
        setNewCourse("all");
        setNewSemester("all");
    };

    const handleDelete = (id: string) => {
        setAnnouncements(announcements.filter((a) => a.id !== id));
    };

    return (
        <div className="animate-slide-up space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Announcements</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create and manage announcements for students
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 rounded-xl bg-[#1a6fdb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1560c2] active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    New Announcement
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="animate-scale-in rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Announcement</h3>
                        <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                            <input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Announcement title..."
                                className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Write the announcement message..."
                                rows={4}
                                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                                <select
                                    value={newPriority}
                                    onChange={(e) => setNewPriority(e.target.value as AnnouncementPriority)}
                                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="important">Important</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Target Course</label>
                                <select
                                    value={newCourse}
                                    onChange={(e) => setNewCourse(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                >
                                    <option value="all">All Students</option>
                                    {COURSES.filter((c) => c.value !== "all").map((c) => (
                                        <option key={c.value} value={c.label}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Target Semester</label>
                                <select
                                    value={newSemester}
                                    onChange={(e) => setNewSemester(e.target.value === "all" ? "all" : Number(e.target.value))}
                                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                >
                                    <option value="all">All Semesters</option>
                                    {SEMESTERS.filter((s) => s.value !== 0).map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newTitle.trim() || !newMessage.trim()}
                                className="rounded-lg bg-[#1a6fdb] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1560c2] disabled:opacity-50 active:scale-[0.98]"
                            >
                                Publish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-6 py-16 dark:border-gray-800 dark:bg-gray-900">
                    <Megaphone className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No Announcements Yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create your first announcement above.</p>
                </div>
            ) : (
                <div className="space-y-3 stagger-children">
                    {announcements.map((ann) => (
                        <div key={ann.id} className="animate-slide-up">
                            <AnnouncementCard
                                announcement={ann}
                                showActions
                                onDelete={() => handleDelete(ann.id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
