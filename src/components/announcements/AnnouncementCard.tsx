import { Announcement, AnnouncementPriority } from "@/lib/types/announcement";
import { cn } from "@/lib/utils";
import { Calendar, Megaphone } from "lucide-react";

const priorityStyles: Record<AnnouncementPriority, { bar: string; badge: string; badgeText: string }> = {
    urgent: { bar: "bg-red-500", badge: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400", badgeText: "Urgent" },
    important: { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", badgeText: "Important" },
    normal: { bar: "bg-blue-500", badge: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", badgeText: "Info" },
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

interface AnnouncementCardProps {
    announcement: Announcement;
    onEdit?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
}

export default function AnnouncementCard({ announcement, onEdit, onDelete, showActions = false }: AnnouncementCardProps) {
    const style = priorityStyles[announcement.priority];

    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            {/* Priority color bar */}
            <div className={cn("absolute left-0 top-0 h-full w-1", style.bar)} />

            <div className="p-5 pl-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", style.badge)}>
                                {style.badgeText}
                            </span>
                            {announcement.targetCourse !== "all" && (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                    {announcement.targetCourse}
                                    {announcement.targetSemester !== "all" && ` · Sem ${announcement.targetSemester}`}
                                </span>
                            )}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {announcement.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                            {announcement.message}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                                <Megaphone className="h-3 w-3" />
                                {announcement.author}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(announcement.createdAt)}
                            </span>
                        </div>
                    </div>
                    {showActions && (
                        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button onClick={onEdit} className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#1a6fdb] hover:bg-blue-50 dark:hover:bg-blue-950/30">
                                Edit
                            </button>
                            <button onClick={onDelete} className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
