export type AnnouncementPriority = "normal" | "important" | "urgent";

export interface Announcement {
    id: string;
    title: string;
    message: string;
    author: string;
    authorRole: "admin" | "dean" | "hod" | "teacher" | "activity_coordinator";
    targetCourse: string | "all";
    targetSemester: number | "all";
    createdAt: string;
    priority: AnnouncementPriority;
}
