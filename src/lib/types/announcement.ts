export type AnnouncementPriority = "normal" | "important" | "urgent";

export interface Announcement {
    id: string;
    title: string;
    message: string;
    author: string;
    authorRole: "dean" | "hod" | "coordinator" | "faculty";
    targetCourse: string | "all";
    targetSemester: number | "all";
    createdAt: string;
    priority: AnnouncementPriority;
}
